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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectGroup,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MLTrainingPage() {
  const [config, setConfig] = useState({
    targetVariable: "",
    featureColumns: [] as string[],
    modelType: "decision_tree" as "decision_tree" | "random_forest",
    balancingTechnique: "smote" as "smote" | "class_weights" | "both",
    testSize: 0.2,
    randomState: 42,
  });

  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(
    new Set(),
  );
  const [isTraining, setIsTraining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadColumns();
    loadExistingResults();
  }, []);

  const loadColumns = async () => {
    try {
      const response = await fetch("/api/visualize?source=cleaned");
      if (response.ok) {
        const data = await response.json();
        setAvailableColumns(data.columns.map((c: any) => c.name));
      }
    } catch (err) {
      console.error("Failed to load columns:", err);
    }
  };

  const loadExistingResults = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/train-model");
      if (response.ok) {
        const data = await response.json();
        setResult(data.result);
      }
    } catch (err) {
      // No existing results
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeature = (column: string) => {
    const newSet = new Set(selectedFeatures);
    if (newSet.has(column)) {
      newSet.delete(column);
    } else {
      newSet.add(column);
    }
    setSelectedFeatures(newSet);
    setConfig({ ...config, featureColumns: Array.from(newSet) });
  };

  const handleTrain = async () => {
    if (!config.targetVariable || config.featureColumns.length === 0) {
      setError("Please select target variable and at least one feature");
      return;
    }

    if (config.featureColumns.includes(config.targetVariable)) {
      setError("Target variable cannot be a feature");
      return;
    }

    setIsTraining(true);
    setError("");

    try {
      const response = await fetch("/api/train-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to train model");
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsTraining(false);
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 0.8) return "text-green-600";
    if (value >= 0.6) return "text-blue-600";
    if (value >= 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <Layout>
        <SiteHeader title="Model" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SiteHeader title="Model" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Brain className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">ML Model Training</h1>
                <p className="text-sm text-muted-foreground">
                  Classification with imbalance handling
                </p>
              </div>
            </div>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Model Configuration</CardTitle>
                <CardDescription>
                  Configure your classification model and features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Target Variable */}
                <Field>
                  <FieldLabel htmlFor="target">Target Variable</FieldLabel>
                  <Select
                    value={config.targetVariable}
                    onValueChange={(e) =>
                      setConfig({ ...config, targetVariable: e })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target variable..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {availableColumns.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    The column you want to predict (e.g., contract_type,
                    experience_level)
                  </p>
                </Field>

                {/* Feature Selection */}
                <div>
                  <FieldLabel>Feature Columns</FieldLabel>
                  <div className="mt-2 max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                    {availableColumns
                      .filter((col) => col !== config.targetVariable)
                      .map((col) => (
                        <label
                          key={col}
                          className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFeatures.has(col)}
                            onChange={() => toggleFeature(col)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{col}</span>
                        </label>
                      ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {selectedFeatures.size} feature(s)
                  </p>
                </div>

                {/* Model Type */}
                <Field>
                  <FieldLabel htmlFor="model">Model Type</FieldLabel>
                  <Select
                    value={config.modelType}
                    onValueChange={(e) =>
                      setConfig({
                        ...config,
                        modelType: e as "decision_tree" | "random_forest",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="decision_tree">
                        Decision Tree
                      </SelectItem>
                      <SelectItem value="random_forest">
                        Random Forest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {/* Balancing Technique */}
                <Field>
                  <FieldLabel htmlFor="balancing">
                    Balancing Technique
                  </FieldLabel>
                  <select
                    id="balancing"
                    value={config.balancingTechnique}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        balancingTechnique: e.target.value as
                          | "smote"
                          | "class_weights"
                          | "both",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="smote">SMOTE (Oversampling)</option>
                    <option value="class_weights">Class Weights</option>
                    <option value="both">Both (SMOTE + Class Weights)</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Technique to handle class imbalance
                  </p>
                </Field>

                <Field>
                  <FieldLabel htmlFor="testsize">Test Set Size</FieldLabel>
                  <Input
                    id="testsize"
                    type="number"
                    min="0.1"
                    max="0.5"
                    step="0.05"
                    value={config.testSize}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        testSize: parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Proportion of dataset to use for testing (0.1 - 0.5)
                  </p>
                </Field>

                <Button
                  onClick={handleTrain}
                  disabled={
                    isTraining ||
                    !config.targetVariable ||
                    config.featureColumns.length === 0
                  }
                  className="w-full"
                  size="lg"
                >
                  {isTraining ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Training Model...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Train Model
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <>
                {/* Dataset Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dataset Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Samples
                        </p>
                        <p className="text-2xl font-bold">
                          {result.dataset_info.total_samples}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Training Set
                        </p>
                        <p className="text-2xl font-bold">
                          {result.dataset_info.train_samples}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Test Set
                        </p>
                        <p className="text-2xl font-bold">
                          {result.dataset_info.test_samples}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Features
                        </p>
                        <p className="text-2xl font-bold">
                          {result.dataset_info.n_features}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col lg:flex-row gap-3  justify-between">
                  {/* Imbalance Analysis */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {result.imbalance_analysis.imbalance_detected ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        Class Imbalance Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-accent  text-accent-foreground  rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Imbalance Ratio
                          </p>
                          <p className="text-3xl font-bold">
                            {result.imbalance_analysis.imbalance_ratio.toFixed(
                              2,
                            )}
                            :1
                          </p>
                        </div>
                        {result.imbalance_analysis.imbalance_ratio > 3 && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-yellow-600">
                              ⚠️ Significant Imbalance
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Balancing recommended
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-3">
                          Class Distribution:
                        </p>
                        <div className="space-y-2">
                          {Object.entries(
                            result.imbalance_analysis.class_distribution,
                          ).map(([cls, count]: [string, any]) => {
                            const percentage =
                              result.imbalance_analysis.class_percentages[cls];
                            return (
                              <div key={cls} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">{cls}</span>
                                  <span className="text-muted-foreground">
                                    {count} samples ({percentage.toFixed(2)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Model Comparison */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle>Model Performance Comparison</CardTitle>
                      <CardDescription>
                        Evaluation metrics for baseline and balanced models
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b">
                              <TableHead className="font-medium">
                                Model
                              </TableHead>
                              <TableHead className="font-medium">
                                Accuracy
                              </TableHead>
                              <TableHead className="font-medium">
                                Precision
                              </TableHead>
                              <TableHead className="font-medium">
                                Recall
                              </TableHead>
                              <TableHead className="font-medium">
                                F1-Score
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(result.models).map(
                              ([name, model]: [string, any]) => (
                                <TableRow key={name}>
                                  <TableCell className="font-medium">
                                    {name === "baseline"
                                      ? "Baseline (No Balancing)"
                                      : name === "smote_balanced"
                                        ? "SMOTE Balanced"
                                        : "Class Weighted"}
                                  </TableCell>
                                  <TableCell
                                    className={`px-4 py-3 text-center font-mono ${getMetricColor(model.metrics.accuracy)}`}
                                  >
                                    {model.metrics.accuracy.toFixed(4)}
                                  </TableCell>
                                  <TableCell
                                    className={`px-4 py-3 text-center font-mono ${getMetricColor(model.metrics.precision)}`}
                                  >
                                    {model.metrics.precision.toFixed(4)}
                                  </TableCell>
                                  <TableCell
                                    className={`px-4 py-3 text-center font-mono ${getMetricColor(model.metrics.recall)}`}
                                  >
                                    {model.metrics.recall.toFixed(4)}
                                  </TableCell>
                                  <TableCell
                                    className={`px-4 py-3 text-center font-mono font-bold ${getMetricColor(model.metrics.f1_score)}`}
                                  >
                                    {model.metrics.f1_score.toFixed(4)}
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="mt-4 p-3 bg-accent text-accent-foreground rounded-lg text-sm">
                        <p>
                          💡 <strong>Note:</strong> F1-Score is the harmonic
                          mean of precision and recall, providing a balanced
                          measure especially useful for imbalanced datasets.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Confusion Matrices */}
                <div className="grid grid-cols-1 lg:grid-cols-2  gap-4">
                  {Object.entries(result.models).map(
                    ([name, model]: [string, any]) => (
                      <Card key={name}>
                        <CardHeader>
                          <CardTitle>
                            Confusion Matrix -{" "}
                            {name === "baseline"
                              ? "Baseline"
                              : name === "smote_balanced"
                                ? "SMOTE"
                                : "Class Weighted"}
                          </CardTitle>
                          <CardDescription>
                            Actual vs Predicted class distribution
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="border-collapse">
                              <thead>
                                <tr>
                                  <th className="border p-2 bg-accent"></th>
                                  {result.dataset_info.target_classes.map(
                                    (cls: string) => (
                                      <th
                                        key={cls}
                                        className="border p-2 bg-accent text-sm"
                                      >
                                        Pred: {cls}
                                      </th>
                                    ),
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {model.metrics.confusion_matrix.map(
                                  (row: number[], i: number) => (
                                    <tr key={i}>
                                      <th className="border p-2 bg-accent text-sm">
                                        Actual:{" "}
                                        {result.dataset_info.target_classes[i]}
                                      </th>
                                      {row.map((cell, j) => (
                                        <td
                                          key={j}
                                          className={`border p-2 text-center font-mono ${
                                            i === j
                                              ? "bg-chart-2/60 font-bold"
                                              : "bg-chart-"
                                          }`}
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
                {/* Best Model Recommendation */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const models = Object.entries(result.models).map(
                        ([name, model]: [string, any]) => ({
                          name,
                          f1: model.metrics.f1_score,
                        }),
                      );
                      const best = models.reduce((a, b) =>
                        a.f1 > b.f1 ? a : b,
                      );

                      return (
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-green-800">
                            Best performing model:{" "}
                            <strong>
                              {best.name === "baseline"
                                ? "Baseline"
                                : best.name === "smote_balanced"
                                  ? "SMOTE Balanced"
                                  : "Class Weighted"}
                            </strong>
                          </p>
                          <p className="text-sm text-green-700">
                            F1-Score: {best.f1.toFixed(4)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {best.name !== "baseline"
                              ? "✓ Balancing techniques improved model performance!"
                              : "⚠️ Baseline model performed best. Dataset may not have significant imbalance."}
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
