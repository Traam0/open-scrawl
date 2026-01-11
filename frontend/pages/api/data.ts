// pages/api/scraped-data.ts
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import type { NextApiRequest, NextApiResponse } from "next";

type ColumnStats = {
  columnName: string;
  missingCount: number;
  missingPercentage: number;
};

type Data =
  | {
      data: any[];
      pagination: {
        page: number;
        pageSize: number;
        totalRows: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
      statistics: {
        totalRows: number;
        totalColumns: number;
        totalMissingValues: number;
        completenessRate: number;
        columnStats: ColumnStats[];
      };
    }
  | { error: string; [key: string]: any };

function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

function calculateStatistics(allData: any[]): {
  totalMissingValues: number;
  completenessRate: number;
  columnStats: ColumnStats[];
} {
  if (allData.length === 0) {
    return {
      totalMissingValues: 0,
      completenessRate: 100,
      columnStats: [],
    };
  }

  const columns = Object.keys(allData[0]);
  const totalCells = allData.length * columns.length;
  let totalMissing = 0;

  const columnStats: ColumnStats[] = columns.map((column) => {
    const missingCount = allData.filter((row) => isEmpty(row[column])).length;
    totalMissing += missingCount;

    return {
      columnName: column,
      missingCount,
      missingPercentage: parseFloat(
        ((missingCount / allData.length) * 100).toFixed(2)
      ),
    };
  });

  const completenessRate = parseFloat(
    (((totalCells - totalMissing) / totalCells) * 100).toFixed(2)
  );

  return {
    totalMissingValues: totalMissing,
    completenessRate,
    columnStats,
  };
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const dir = path.resolve(process.cwd(), "..", "generated");
    const csvPath = path.resolve(dir, "scraped_data.csv");

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: "No CSV file found" });
    }

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 12;

    if (page < 1) {
      return res.status(400).json({ error: "Page must be >= 1" });
    }

    if (pageSize < 1 || pageSize > 100) {
      return res.status(400).json({
        error: "Page size must be between 1 and 100",
      });
    }

    const results: any[] = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const totalRows = results.length;
        const totalPages = Math.ceil(totalRows / pageSize);

        // Validate page number
        if (page > totalPages && totalRows > 0) {
          return res.status(400).json({
            error: `Page ${page} does not exist. Total pages: ${totalPages}`,
          });
        }

        // Calculate pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = results.slice(startIndex, endIndex);

        // Calculate statistics
        const stats = calculateStatistics(results);

        res.status(200).json({
          data: paginatedData,
          pagination: {
            page,
            pageSize,
            totalRows,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
          statistics: {
            totalRows,
            totalColumns:
              results.length > 0 ? Object.keys(results[0]).length : 0,
            totalMissingValues: stats.totalMissingValues,
            completenessRate: stats.completenessRate,
            columnStats: stats.columnStats,
          },
        });
      })
      .on("error", (err) => {
        res.status(500).json({ error: err.message });
      });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
