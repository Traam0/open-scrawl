// pages/api/visualize-data.ts
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import type { NextApiRequest, NextApiResponse } from "next";

type ColumnInfo = {
  name: string;
  type: "numeric" | "categorical" | "datetime";
  uniqueValues: number;
  nullCount: number;
  sampleValues: any[];
};

type NumericStats = {
  min: number;
  max: number;
  mean: number;
  median: number;
  std: number;
  q1: number;
  q3: number;
};

type FrequencyData = {
  value: string;
  count: number;
  percentage: number;
};

type Data =
  | {
      columns: ColumnInfo[];
      numericColumns: string[];
      categoricalColumns: string[];
      totalRows: number;
      summary: {
        [key: string]: NumericStats | FrequencyData[];
      };
      rawData: any[];
    }
  | { error: string };

function detectColumnType(
  values: any[]
): "numeric" | "categorical" | "datetime" {
  const nonNullValues = values.filter(
    (v) => v !== null && v !== undefined && v !== ""
  );

  if (nonNullValues.length === 0) return "categorical";

  // Check if numeric
  const numericCount = nonNullValues.filter((v) => !isNaN(Number(v))).length;
  if (numericCount / nonNullValues.length > 0.8) return "numeric";

  // Check if datetime
  const dateCount = nonNullValues.filter((v) => {
    const date = new Date(v);
    return !isNaN(date.getTime());
  }).length;
  if (dateCount / nonNullValues.length > 0.8) return "datetime";

  return "categorical";
}

function calculateNumericStats(values: number[]): NumericStats {
  const sorted = [...values].sort((a, b) => a - b);
  const len = sorted.length;

  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / len;

  const median =
    len % 2 === 0
      ? (sorted[len / 2 - 1] + sorted[len / 2]) / 2
      : sorted[Math.floor(len / 2)];

  const variance =
    values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / len;
  const std = Math.sqrt(variance);

  const q1Index = Math.floor(len * 0.25);
  const q3Index = Math.floor(len * 0.75);

  return {
    min: sorted[0],
    max: sorted[len - 1],
    mean: parseFloat(mean.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    std: parseFloat(std.toFixed(2)),
    q1: sorted[q1Index],
    q3: sorted[q3Index],
  };
}

function calculateFrequency(values: any[]): FrequencyData[] {
  const frequency: { [key: string]: number } = {};
  const total = values.length;

  values.forEach((val) => {
    const key = String(val);
    frequency[key] = (frequency[key] || 0) + 1;
  });

  return Object.entries(frequency)
    .map(([value, count]) => ({
      value,
      count,
      percentage: parseFloat(((count / total) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Top 20 most frequent
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { source = "cleaned" } = req.query;
    const dir = path.resolve(process.cwd(), "..", "generated");

    // Determine which file to read
    const filename = source === "raw" ? "scraped_data.csv" : "clean_data.csv";
    const csvPath = path.resolve(dir, filename);

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        error: `${filename} not found. Please run ${
          source === "raw" ? "scraper" : "data cleaning"
        } first.`,
      });
    }

    const results: any[] = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        if (results.length === 0) {
          return res.status(404).json({ error: "CSV file is empty" });
        }

        const columnNames = Object.keys(results[0]);
        const columns: ColumnInfo[] = [];
        const numericColumns: string[] = [];
        const categoricalColumns: string[] = [];
        const summary: { [key: string]: NumericStats | FrequencyData[] } = {};

        // Analyze each column
        columnNames.forEach((colName) => {
          const values = results.map((row) => row[colName]);
          const nonNullValues = values.filter(
            (v) => v !== null && v !== undefined && v !== ""
          );
          const nullCount = values.length - nonNullValues.length;

          const type = detectColumnType(values);
          const uniqueValues = new Set(nonNullValues).size;
          const sampleValues = [...new Set(nonNullValues)].slice(0, 5);

          columns.push({
            name: colName,
            type,
            uniqueValues,
            nullCount,
            sampleValues,
          });

          // Calculate statistics based on type
          if (type === "numeric") {
            numericColumns.push(colName);
            const numericValues = nonNullValues
              .map((v) => parseFloat(v))
              .filter((v) => !isNaN(v));

            if (numericValues.length > 0) {
              summary[colName] = calculateNumericStats(numericValues);
            }
          } else if (type === "categorical") {
            categoricalColumns.push(colName);
            summary[colName] = calculateFrequency(nonNullValues);
          }
        });

        res.status(200).json({
          columns,
          numericColumns,
          categoricalColumns,
          totalRows: results.length,
          summary,
          rawData: results.slice(0, 100), // Send first 100 rows for charts
        });
      })
      .on("error", (err) => {
        res.status(500).json({ error: err.message });
      });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
