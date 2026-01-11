import fs from "fs";
import path from "path";
import csv from "csv-parser";

import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";

type Data =
  | {
      [key: string]: any;
    }
  | { error: string; [key: string]: any };
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const dir = path.resolve(process.cwd(), "..", "generated");

    const pythonScriptPath = path.join(dir, "scraper.py");
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
