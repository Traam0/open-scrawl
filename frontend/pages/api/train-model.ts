// pages/api/train-model.ts
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import type { NextApiRequest, NextApiResponse } from "next";

const execAsync = promisify(exec);

type MLConfig = {
  targetVariable: string;
  featureColumns: string[];
  modelType: "decision_tree" | "random_forest";
  balancingTechnique: "smote" | "class_weights" | "both";
  testSize: number;
  randomState: number;
};

type Data =
  | {
      message?: string;
      result?: any;
      script?: string;
      executionTime?: number;
    }
  | { error: string };

function generateMLScript(config: MLConfig): string {
  const {
    targetVariable,
    featureColumns,
    modelType,
    balancingTechnique,
    testSize,
    randomState,
  } = config;

  const modelImport =
    modelType === "decision_tree"
      ? "from sklearn.tree import DecisionTreeClassifier"
      : "from sklearn.ensemble import RandomForestClassifier";

  const modelClass =
    modelType === "decision_tree"
      ? "DecisionTreeClassifier"
      : "RandomForestClassifier";

  const balancingCode =
    balancingTechnique === "smote" || balancingTechnique === "both"
      ? `
        # Apply SMOTE for oversampling minority class
        print("\\nApplying SMOTE...")
        smote = SMOTE(random_state=${randomState})
        X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
        print(f"  Original training set: {X_train.shape[0]} samples")
        print(f"  Balanced training set: {X_train_balanced.shape[0]} samples")
    
        # Train balanced model with SMOTE
        print("\\nTraining model with SMOTE...")
        model_balanced_smote = ${modelClass}(random_state=${randomState})
        model_balanced_smote.fit(X_train_balanced, y_train_balanced)
        y_pred_balanced_smote = model_balanced_smote.predict(X_test)
    
        metrics_balanced_smote = calculate_metrics(y_test, y_pred_balanced_smote, le)
        print_metrics("SMOTE-Balanced Model", metrics_balanced_smote)
`
      : "";

  const classWeightsCode =
    balancingTechnique === "class_weights" || balancingTechnique === "both"
      ? `
    # Train model with class weights
        print("\\nTraining model with class weights...")
        model_balanced_weights = ${modelClass}(class_weight='balanced', random_state=${randomState})
        model_balanced_weights.fit(X_train, y_train)
        y_pred_balanced_weights = model_balanced_weights.predict(X_test)
        
        metrics_balanced_weights = calculate_metrics(y_test, y_pred_balanced_weights, le)
        print_metrics("Class-Weighted Model", metrics_balanced_weights)
`
      : "";

  const script = `"""
Machine Learning Model Training Script
Classification with Imbalance Handling

Configuration:
- Target Variable: ${targetVariable}
- Features: ${featureColumns.join(", ")}
- Model Type: ${modelType.replace("_", " ").toUpperCase()}
- Balancing: ${balancingTechnique.toUpperCase()}
- Test Size: ${testSize * 100}%
"""

import pandas as pd
import numpy as np
import json
import sys
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
${modelImport}
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
from imblearn.over_sampling import SMOTE
import warnings
warnings.filterwarnings('ignore')


def detect_imbalance(y, target_name):
    """
    Detect class imbalance in target variable.
    """
    print("=" * 80)
    print("📊 CLASS IMBALANCE DETECTION")
    print("=" * 80)
    
    class_counts = pd.Series(y).value_counts()
    class_percentages = pd.Series(y).value_counts(normalize=True) * 100
    
    print(f"\\nTarget Variable: {target_name}")
    print(f"Total samples: {len(y)}")
    print(f"Number of classes: {len(class_counts)}")
    print()
    
    imbalance_detected = False
    imbalance_ratio = class_counts.max() / class_counts.min()
    
    print("Class Distribution:")
    for cls, count in class_counts.items():
        percentage = class_percentages[cls]
        print(f"  Class '{cls}': {count} samples ({percentage:.2f}%)")
        
        if percentage < 10:
            imbalance_detected = True
    
    print(f"\\nImbalance Ratio: {imbalance_ratio:.2f}:1")
    
    if imbalance_ratio > 3:
        print("⚠️  SIGNIFICANT IMBALANCE DETECTED!")
        print("   Recommendation: Apply balancing techniques")
    elif imbalance_ratio > 1.5:
        print("⚠️  MODERATE IMBALANCE DETECTED")
        print("   Recommendation: Consider balancing techniques")
    else:
        print("✓ Classes are relatively balanced")
    
    return {
        'imbalance_detected': imbalance_detected,
        'imbalance_ratio': float(imbalance_ratio),
        'class_distribution': {str(k): int(v) for k, v in class_counts.items()},
        'class_percentages': {str(k): float(v) for k, v in class_percentages.items()}
    }


def calculate_metrics(y_true, y_pred, label_encoder):
    """
    Calculate all evaluation metrics.
    """
    # Convert back to original labels for readability
    y_true_labels = label_encoder.inverse_transform(y_true)
    y_pred_labels = label_encoder.inverse_transform(y_pred)
    
    # Calculate metrics
    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_true, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_true, y_pred, average='weighted', zero_division=0)
    
    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    
    # Per-class metrics
    report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)
    
    return {
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'confusion_matrix': cm.tolist(),
        'classification_report': report
    }


def print_metrics(model_name, metrics):
    """
    Print metrics in a formatted way.
    """
    print(f"\\n{'='*60}")
    print(f"📈 {model_name} - Evaluation Metrics")
    print(f"{'='*60}")
    print(f"  Accuracy:  {metrics['accuracy']:.4f}")
    print(f"  Precision: {metrics['precision']:.4f}")
    print(f"  Recall:    {metrics['recall']:.4f}")
    print(f"  F1-Score:  {metrics['f1_score']:.4f}")
    print()
    print("Confusion Matrix:")
    cm = np.array(metrics['confusion_matrix'])
    print(cm)


def train_models(input_file: str, output_file: str, config: dict):
    """
    Main training function.
    """
    start_time = datetime.now()
    
    print("=" * 80)
    print("🤖 MACHINE LEARNING MODEL TRAINING")
    print("=" * 80)
    print(f"📂 Input: {input_file}")
    print(f"📂 Output: {output_file}")
    print()
    
    try:
        # Load data
        print("Loading dataset...")
        df = pd.read_csv(input_file)
        print(f"✓ Loaded {len(df)} samples with {len(df.columns)} columns")
        
        # Prepare features and target
        target_col = config['target']
        feature_cols = config['features']
        
        print(f"\\nTarget variable: {target_col}")
        print(f"Feature columns: {', '.join(feature_cols)}")
        
        # Remove rows with missing target
        df = df[df[target_col].notna()]
        print(f"\\nSamples after removing null targets: {len(df)}")
        
        # Encode target variable
        le = LabelEncoder()
        y = le.fit_transform(df[target_col].astype(str))
        
        # Detect imbalance
        imbalance_info = detect_imbalance(y, target_col)
        
        # Prepare features
        X = df[feature_cols].copy()
        
        # Encode categorical features
        print("\\n" + "=" * 80)
        print("🔄 ENCODING CATEGORICAL VARIABLES")
        print("=" * 80)
        
        encoders = {}
        for col in X.columns:
            if X[col].dtype == 'object' or X[col].dtype.name == 'category':
                print(f"  Encoding '{col}'...")
                le_feat = LabelEncoder()
                X[col] = X[col].fillna('missing')
                X[col] = le_feat.fit_transform(X[col].astype(str))
                encoders[col] = le_feat
        
        # Fill remaining NaN with 0
        X = X.fillna(0)
        
        print(f"\\n✓ Feature matrix shape: {X.shape}")
        
        # Split data
        print("\\n" + "=" * 80)
        print("📊 TRAIN-TEST SPLIT")
        print("=" * 80)
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=${testSize}, random_state=${randomState}, stratify=y
        )
        
        print(f"  Training set: {X_train.shape[0]} samples")
        print(f"  Test set: {X_test.shape[0]} samples")
        
        # Train baseline model
        print("\\n" + "=" * 80)
        print("🎯 TRAINING BASELINE MODEL (No Balancing)")
        print("=" * 80)
        
        model_baseline = ${modelClass}(random_state=${randomState})
        model_baseline.fit(X_train, y_train)
        y_pred_baseline = model_baseline.predict(X_test)
        
        metrics_baseline = calculate_metrics(y_test, y_pred_baseline, le)
        print_metrics("Baseline Model", metrics_baseline)
        
        # Train balanced models
        print("\\n" + "=" * 80)
        print("⚖️  TRAINING BALANCED MODELS")
        print("=" * 80)
${balancingCode}${classWeightsCode}
        
        # Prepare results
        results = {
            'configuration': config,
            'dataset_info': {
                'total_samples': int(len(df)),
                'train_samples': int(len(X_train)),
                'test_samples': int(len(X_test)),
                'n_features': int(X.shape[1]),
                'feature_names': feature_cols,
                'target_classes': le.classes_.tolist()
            },
            'imbalance_analysis': imbalance_info,
            'models': {
                'baseline': {
                    'model_type': '${modelType}',
                    'balancing': 'none',
                    'metrics': metrics_baseline
                }
            },
            'training_date': datetime.now().isoformat()
        }
        
        # Add balanced model results
${
  balancingTechnique === "smote" || balancingTechnique === "both"
    ? `
        results['models']['smote_balanced'] = {
            'model_type': '${modelType}',
            'balancing': 'SMOTE',
            'metrics': metrics_balanced_smote
        }`
    : ""
}
${
  balancingTechnique === "class_weights" || balancingTechnique === "both"
    ? `
        results['models']['class_weighted'] = {
            'model_type': '${modelType}',
            'balancing': 'Class Weights',
            'metrics': metrics_balanced_weights
        }`
    : ""
}
        
        # Save results
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # Summary
        print("\\n" + "=" * 80)
        print("📊 TRAINING SUMMARY")
        print("=" * 80)
        
        print("\\nModel Comparison (F1-Score):")
        print(f"  Baseline: {metrics_baseline['f1_score']:.4f}")
${
  balancingTechnique === "smote" || balancingTechnique === "both"
    ? `        print(f"  SMOTE:    {metrics_balanced_smote['f1_score']:.4f}")`
    : ""
}
${
  balancingTechnique === "class_weights" || balancingTechnique === "both"
    ? `        print(f"  Weighted: {metrics_balanced_weights['f1_score']:.4f}")`
    : ""
}
        
        # Execution time
        end_time = datetime.now()
        execution_time = (end_time - start_time).total_seconds()
        
        print(f"\\n⏱️  Total execution time: {execution_time:.2f} seconds")
        print(f"📁 Results saved to: {output_file}")
        print("=" * 80)
        
    except Exception as e:
        print(f"\\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    INPUT_FILE = "clean_data.csv"
    OUTPUT_FILE = "model_results.json"
    
    CONFIG = {
        'target': '${targetVariable}',
        'features': ${JSON.stringify(featureColumns)},
        'model_type': '${modelType}',
        'balancing': '${balancingTechnique}',
        'test_size': ${testSize},
        'random_state': ${randomState}
    }
    
    train_models(INPUT_FILE, OUTPUT_FILE, CONFIG)
`;

  return script;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | any>,
) {
  const dir = path.resolve(process.cwd(), "..", "generated");

  // GET: Return existing model results 
  if (req.method === "GET") {
    try {
      const resultPath = path.join(dir, "model_results.json");

      if (!fs.existsSync(resultPath)) {
        return res.status(404).json({
          error: "No model results found. Please train a model first.",
        });
      }

      const resultData = fs.readFileSync(resultPath, "utf-8");
      const result = JSON.parse(resultData);

      return res.status(200).json({ result });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message || "Failed to read model results",
      });
    }
  }

  // POST: Generate and run ML script
  if (req.method === "POST") {
    const startTime = Date.now();

    try {
      const config = req.body as MLConfig;
      console.log()

      // Validation
      if (
        !config.targetVariable ||
        !config.featureColumns ||
        config.featureColumns.length === 0
      ) {
        return res.status(400).json({
          error: "Target variable and at least one feature column are required",
        });
      }

      // Check if cleaned data exists
      const inputPath = path.join(dir, "clean_data.csv");
      if (!fs.existsSync(inputPath)) {
        return res.status(404).json({
          error: "clean_data.csv not found. Please clean data first.",
        });
      }

      // Generate ML script
      const script = generateMLScript(config);

      // Save script
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const scriptPath = path.join(dir, "train_model.py");
      fs.writeFileSync(scriptPath, script, { encoding: "utf-8" });

      // Execute the ML script
      console.log("Training ML model...");
      const { stdout, stderr } = await execAsync(
        `cd "${dir}" && python train_model.py`,
      );

      if (stdout) console.log("Script output:", stdout);
      if (stderr) console.error("Script errors:", stderr);

      // Check if output file was created
      const outputPath = path.join(dir, "model_results.json");
      if (!fs.existsSync(outputPath)) {
        return res.status(500).json({
          error: "Training script executed but results file was not created",
          details: { stdout, stderr },
        });
      }

      // Read results
      const resultData = fs.readFileSync(outputPath, "utf-8");
      const result = JSON.parse(resultData);

      const executionTime = (Date.now() - startTime) / 1000;

      return res.status(200).json({
        message: "Model training completed successfully",
        result,
        script,
        executionTime,
      });
    } catch (err: any) {
      console.error("Error in ML training API:", err);
      return res.status(500).json({
        error: err.message || "Failed to train model",
        details: err.toString(),
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
