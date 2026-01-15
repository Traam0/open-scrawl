// pages/api/clean-data.ts
import fs from "fs";
import path from "path";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import type { NextApiRequest, NextApiResponse } from "next";
import { CleanRequestBodySchema } from "@/lib/@types/clean.request";

const execAsync = promisify(exec);

type CleanOptions = {
  targetColumn: string;
  nhs:
    | "rows"
    | "columns"
    | "mean"
    | "median"
    | "mode"
    | "zero"
    | "custom"
    | "none";
  normalization: "mix_max_0_1" | "mix_max_-1_1" | "z_score_standard";
  customValue?: string;
  trimWhiteSpaces: boolean;
  removeDupRows: boolean;
  enableNormalization: boolean;
};

type Data =
  | {
      message: string;
      script: string;
      outputPath: string;
      cleanedRows: number;
      executionTime: number;
    }
  | { error: string; [key: string]: any };

function generateCleaningScript(options: CleanOptions): string {
  const {
    targetColumn,
    nhs,
    normalization,
    customValue,
    trimWhiteSpaces,
    removeDupRows,
    enableNormalization,
  } = options;

  // Determine target column parameter
  const targetColParam = targetColumn === "all" ? "'all'" : `'${targetColumn}'`;

  // Generate cleaning operations list
  const operations: string[] = [];

  // Trim whitespaces
  if (trimWhiteSpaces) {
    operations.push(`
        # Trim whitespaces
        print("\\nTrimming whitespaces...")
        df = trim_whitespaces(df)`);
  }

  // Remove duplicates
  if (removeDupRows) {
    operations.push(`
        # Remove duplicate rows
        print("\\nRemoving duplicate rows...")
        df = remove_duplicates(df)`);
  }

  // Null handling strategy
  if (nhs !== "none") {
    const nhsMapping = {
      rows: `remove_rows_with_nulls(df, ${targetColParam})`,
      columns: `remove_columns_with_nulls(df)`,
      mean: `fill_nulls_with_mean(df, ${targetColParam})`,
      median: `fill_nulls_with_median(df, ${targetColParam})`,
      mode: `fill_nulls_with_mode(df, ${targetColParam})`,
      zero: `fill_nulls_with_zero(df, ${targetColParam})`,
      custom: `fill_nulls_with_custom(df, "${
        customValue || "N/A"
      }", ${targetColParam})`,
    };

    operations.push(`
        # Handle null values (${nhs})
        print("\\nHandling null values using strategy: ${nhs}")
        df = ${nhsMapping[nhs]}`);
  }

  // Normalization
  if (enableNormalization) {
    const normMapping = {
      mix_max_0_1: `normalize_min_max_0_1(df, ${targetColParam})`,
      "mix_max_-1_1": `normalize_min_max_neg1_1(df, ${targetColParam})`,
      z_score_standard: `normalize_z_score(df, ${targetColParam})`,
    };

    operations.push(`
        #Normalize data (${normalization})
        print("\\nNormalizing data using: ${normalization}")
        df = ${normMapping[normalization]}`);
  }

  const script = `"""
Data Cleaning Script
Generated automatically

Configuration:
- Target Column: ${targetColumn}
- Null Handling Strategy: ${nhs}
- Normalization: ${enableNormalization ? normalization : "disabled"}
- Trim Whitespaces: ${trimWhiteSpaces}
- Remove Duplicates: ${removeDupRows}
"""

import pandas as pd
import sys
from datetime import datetime
from clean_utils import (
    remove_rows_with_nulls,
    remove_columns_with_nulls,
    fill_nulls_with_mean,
    fill_nulls_with_median,
    fill_nulls_with_mode,
    fill_nulls_with_zero,
    fill_nulls_with_custom,
    normalize_min_max_0_1,
    normalize_min_max_neg1_1,
    normalize_z_score,
    trim_whitespaces,
    remove_duplicates,
    print_statistics,
)


def clean_data(input_file: str, output_file: str):
    """
    Cleans the data according to the specified configuration.
    
    Args:
        input_file: Path to input CSV file
        output_file: Path to output CSV file
    """
    start_time = datetime.now()
    
    try:
        print("=" * 70)
        print("🧹 Data Cleaning Script - Starting")
        print("=" * 70)
        print(f"📂 Input file: {input_file}")
        print(f"📂 Output file: {output_file}")
        print()
        
        # Load data
        print("Loading data...")
        df = pd.read_csv(input_file)
        print(f"✓ Loaded {len(df)} rows, {len(df.columns)} columns")
        print(f"  Columns: {', '.join(df.columns)}")
        
        # Display initial statistics
        print_statistics(df, "Initial Data Statistics")
          #${operations.join("\n\t\t")}
        
        # Save cleaned data
        print("\\n💾 Saving cleaned data...")
        df.to_csv(output_file, index=False)
        
        # Display final statistics
        print_statistics(df, "Final Data Statistics")
        
        # Execution time
        end_time = datetime.now()
        execution_time = (end_time - start_time).total_seconds()
        
        print("\\n" + "=" * 70)
        print(f"✅ Data cleaning completed successfully!")
        print(f"⏱️  Execution time: {execution_time:.2f} seconds")
        print(f"📁 Cleaned data saved to: {output_file}")
        print("=" * 70)
        
        return len(df), execution_time
        
    except FileNotFoundError:
        print(f"\\n❌ Error: Input file '{input_file}' not found")
        sys.exit(1)
    except pd.errors.EmptyDataError:
        print(f"\\n❌ Error: Input file is empty")
        sys.exit(1)
    except Exception as e:
        print(f"\\n❌ An error occurred: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    INPUT_FILE = "scraped_data.csv"
    OUTPUT_FILE = "clean_data.csv"
    
    clean_data(INPUT_FILE, OUTPUT_FILE)
`;

  return script;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const startTime = Date.now();
  const dir = path.resolve(process.cwd(), "..", "generated");

  try {
    const {
      success,
      error,
      data: options,
    } = CleanRequestBodySchema.safeParse(JSON.parse(req.body));

    if (!success) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }

    // Generate the cleaning script
    const script = generateCleaningScript(options);

    // Save script to backend directory
    // const dir = path.resolve(process.cwd(), "..", "generated");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const scriptPath = path.join(dir, "clean_data.py");
    fs.writeFileSync(scriptPath, script, { encoding: "utf-8" });

    // Check if input file exists
    const inputPath = path.join(dir, "scraped_data.csv");
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({
        error:
          "Input file 'scraped_data.csv' not found. Please run scraper first.",
      });
    }

    const pythonScriptPath = path.join(dir, "clean_data.py");
    if (!fs.existsSync(pythonScriptPath)) res.redirect("/");
    const venvPath = path.join(dir, ".venv", "Scripts", "python.exe"); // For macOS/Linux
    const python = spawn(venvPath, [pythonScriptPath], {
      cwd: dir,
    });

    python.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    python.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    python.on("close", (code) => {
      // You don't need the output, just send a success message or handle failure
      if (code !== 0) {
        res.status(500).json({ error: "Python script execution failed" });
      } else {
        res.redirect("/raw-data");
      }
    });

    // Check if output file was created
    // const outputPath = path.join(dir, "clean_data.csv");
    // if (!fs.existsSync(outputPath)) {
    //   return res.status(500).json({
    //     error: "Cleaning script executed but output file was not created",
    //     details: { stdout, stderr },
    //   });
    // }

    // // Read output file to get row count
    // const outputContent = fs.readFileSync(outputPath, "utf-8");
    // const lines = outputContent.trim().split("\n");
    // const cleanedRows = lines.length - 1; // Subtract header row

    // const executionTime = (Date.now() - startTime) / 1000;

    // res.status(200).json({
    //   message: "Data cleaned successfully",
    //   script,
    //   outputPath,
    //   cleanedRows,
    //   executionTime,
    // });
  } catch (err: any) {
    console.error("Error in clean-data API:", err);
    res.status(500).json({
      error: err.message || "Failed to clean data",
      details: err.toString(),
    });
  }
}
