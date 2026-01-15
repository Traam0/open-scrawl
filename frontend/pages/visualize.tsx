import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Loader2,
  AlertCircle,
  TrendingUp,
  Database,
} from "lucide-react";

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

type VisualizationData = {
  columns: ColumnInfo[];
  numericColumns: string[];
  categoricalColumns: string[];
  totalRows: number;
  summary: {
    [key: string]: NumericStats | FrequencyData[];
  };
  rawData: any[];
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B9D",
  "#C084FC",
  "#34D399",
];

export default function VisualizationPage() {
  const [data, setData] = useState<VisualizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataSource, setDataSource] = useState<"raw" | "cleaned">("cleaned");
  const [selectedColumn, setSelectedColumn] = useState<string>("");

  const fetchData = async (source: "raw" | "cleaned") => {
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(`/api/visualize?source=${source}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data");
      }

      setData(result);
      if (result.numericColumns.length > 0) {
        setSelectedColumn(result.numericColumns[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dataSource);
  }, [dataSource]);

  if (isLoading) {
    return (
      <Layout>
        <SiteHeader title="Visualization" />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Loading visualization data...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <SiteHeader title="Visualization" />
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Error Loading Data
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => fetchData(dataSource)}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return null;
  }

  const selectedColumnData = data.columns.find(
    (col) => col.name === selectedColumn
  );
  const selectedSummary = data.summary[selectedColumn];

  return (
    <Layout>
      <SiteHeader title="Visualization" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Header with Data Source Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BarChart3 className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Data Visualization</h1>
                  <p className="text-sm text-muted-foreground">
                    Interactive charts and statistics
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={dataSource === "raw" ? "default" : "outline"}
                  onClick={() => setDataSource("raw")}
                  size="sm"
                >
                  Raw Data
                </Button>
                <Button
                  variant={dataSource === "cleaned" ? "default" : "outline"}
                  onClick={() => setDataSource("cleaned")}
                  size="sm"
                >
                  Cleaned Data
                </Button>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Rows
                  </CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.totalRows.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Columns
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.columns.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Numeric Columns
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.numericColumns.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Categorical Columns
                  </CardTitle>
                  <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.categoricalColumns.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Column Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Select Column to Visualize</CardTitle>
                <CardDescription>
                  Choose a column to see detailed statistics and charts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select a column...</option>
                  {data.numericColumns.length > 0 && (
                    <optgroup label="Numeric Columns">
                      {data.numericColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {data.categoricalColumns.length > 0 && (
                    <optgroup label="Categorical Columns">
                      {data.categoricalColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </CardContent>
            </Card>

            {/* Column Statistics and Visualization */}
            {selectedColumn && selectedColumnData && (
              <>
                {/* Statistics Card for Numeric Columns */}
                {selectedColumnData.type === "numeric" &&
                  selectedSummary &&
                  !Array.isArray(selectedSummary) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{selectedColumn} - Statistics</CardTitle>
                        <CardDescription>
                          Descriptive statistics for numeric data
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Mean
                            </p>
                            <p className="text-2xl font-bold">
                              {selectedSummary.mean}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Median
                            </p>
                            <p className="text-2xl font-bold">
                              {selectedSummary.median}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Std Dev
                            </p>
                            <p className="text-2xl font-bold">
                              {selectedSummary.std}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Range
                            </p>
                            <p className="text-2xl font-bold">
                              {selectedSummary.min} - {selectedSummary.max}
                            </p>
                          </div>
                        </div>

                        {/* Box Plot Data */}
                        <div className="mt-6">
                          <h4 className="text-sm font-medium mb-2">
                            Distribution Summary
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Minimum:</span>
                              <span className="font-mono">
                                {selectedSummary.min}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Q1 (25%):</span>
                              <span className="font-mono">
                                {selectedSummary.q1}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Median (50%):</span>
                              <span className="font-mono">
                                {selectedSummary.median}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Q3 (75%):</span>
                              <span className="font-mono">
                                {selectedSummary.q3}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Maximum:</span>
                              <span className="font-mono">
                                {selectedSummary.max}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Distribution Chart for Numeric Columns */}
                {selectedColumnData.type === "numeric" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedColumn} - Distribution</CardTitle>
                      <CardDescription>
                        Line chart showing data distribution
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={data.rawData.map((row, idx) => ({
                            index: idx + 1,
                            value: parseFloat(row[selectedColumn]) || 0,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="index"
                            label={{
                              value: "Row Number",
                              position: "insideBottom",
                              offset: -5,
                            }}
                          />
                          <YAxis
                            label={{
                              value: selectedColumn,
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#8884d8"
                            name={selectedColumn}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Frequency Chart for Categorical Columns */}
                {selectedColumnData.type === "categorical" &&
                  Array.isArray(selectedSummary) && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            {selectedColumn} - Frequency Distribution
                          </CardTitle>
                          <CardDescription>
                            Bar chart showing value frequencies
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={selectedSummary.slice(0, 10)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="value"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                              />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="count" fill="#8884d8" name="Count">
                                {selectedSummary
                                  .slice(0, 10)
                                  .map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>{selectedColumn} - Proportion</CardTitle>
                          <CardDescription>
                            Pie chart showing value proportions
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={selectedSummary.slice(0, 8)}
                                dataKey="count"
                                nameKey="value"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={(entry) =>
                                  `${entry.value}: ${entry.percentage}%`
                                }
                              >
                                {selectedSummary
                                  .slice(0, 8)
                                  .map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>{selectedColumn} - Top Values</CardTitle>
                          <CardDescription>
                            Most frequent values with percentages
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedSummary.slice(0, 10).map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm font-medium">
                                  {item.value}
                                </span>
                                <div className="flex items-center gap-4">
                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${item.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-muted-foreground w-16 text-right">
                                    {item.count} ({item.percentage}%)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
              </>
            )}

            {/* All Columns Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Column Overview</CardTitle>
                <CardDescription>
                  Summary of all columns in the dataset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Column Name
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Unique Values
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Null Count
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Sample Values
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.columns.map((col, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-2 text-sm font-medium">
                            {col.name}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                col.type === "numeric"
                                  ? "bg-blue-100 text-blue-800"
                                  : col.type === "categorical"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {col.type}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {col.uniqueValues}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <span
                              className={
                                col.nullCount > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            >
                              {col.nullCount}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-muted-foreground">
                            {col.sampleValues.slice(0, 3).join(", ")}
                            {col.sampleValues.length > 3 && "..."}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
