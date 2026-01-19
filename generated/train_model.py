"""
Machine Learning Model Training Script
Classification with Imbalance Handling

Configuration:
- Target Variable: contract_type
- Features: job_sector, job_title
- Model Type: DECISION TREE
- Balancing: BOTH
- Test Size: 20%
"""

import pandas as pd
import numpy as np
import json
import sys
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier
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
    print("CLASS IMBALANCE DETECTION")
    print("=" * 80)
    
    class_counts = pd.Series(y).value_counts()
    class_percentages = pd.Series(y).value_counts(normalize=True) * 100
    
    print(f"\nTarget Variable: {target_name}")
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
    
    print(f"\nImbalance Ratio: {imbalance_ratio:.2f}:1")
    
    if imbalance_ratio > 3:
        print("SIGNIFICANT IMBALANCE DETECTED!")
        print("   Recommendation: Apply balancing techniques")
    elif imbalance_ratio > 1.5:
        print("MODERATE IMBALANCE DETECTED")
        print("   Recommendation: Consider balancing techniques")
    else:
        print("Classes are relatively balanced")
    
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
    y_true_labels = label_encoder.inverse_transform(y_true)
    y_pred_labels = label_encoder.inverse_transform(y_pred)
    
    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_true, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_true, y_pred, average='weighted', zero_division=0)
    

    cm = confusion_matrix(y_true, y_pred)
    
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
    print(f"\n{'='*60}")
    print(f" {model_name} - Evaluation Metrics")
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
        
    try:
        print("Loading dataset...")
        df = pd.read_csv(input_file)
        
        target_col = config['target']
        feature_cols = config['features']
        
        
        df = df[df[target_col].notna()]
        
        le = LabelEncoder()
        y = le.fit_transform(df[target_col].astype(str))
        
        imbalance_info = detect_imbalance(y, target_col)
        
        X = df[feature_cols].copy()
        
        encoders = {}
        for col in X.columns:
            if X[col].dtype == 'object' or X[col].dtype.name == 'category':
                print(f"  Encoding '{col}'...")
                le_feat = LabelEncoder()
                X[col] = X[col].fillna('missing')
                X[col] = le_feat.fit_transform(X[col].astype(str))
                encoders[col] = le_feat
        
        X = X.fillna(0)
        
        print(f"\n Feature matrix shape: {X.shape}")
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"  Training set: {X_train.shape[0]} samples")
        print(f"  Test set: {X_test.shape[0]} samples")
                
        model_baseline = DecisionTreeClassifier(random_state=42)
        model_baseline.fit(X_train, y_train)
        y_pred_baseline = model_baseline.predict(X_test)
        
        metrics_baseline = calculate_metrics(y_test, y_pred_baseline, le)
        print_metrics("Baseline Model", metrics_baseline)
        

        # Apply SMOTE for oversampling minority class
        print("\nApplying SMOTE...")
        smote = SMOTE(random_state=42)
        X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
        print(f"  Original training set: {X_train.shape[0]} samples")
        print(f"  Balanced training set: {X_train_balanced.shape[0]} samples")
    
        # Train balanced model with SMOTE
        print("\nTraining model with SMOTE...")
        model_balanced_smote = DecisionTreeClassifier(random_state=42)
        model_balanced_smote.fit(X_train_balanced, y_train_balanced)
        y_pred_balanced_smote = model_balanced_smote.predict(X_test)
    
        metrics_balanced_smote = calculate_metrics(y_test, y_pred_balanced_smote, le)
        print_metrics("SMOTE-Balanced Model", metrics_balanced_smote)

    # Train model with class weights
        print("\nTraining model with class weights...")
        model_balanced_weights = DecisionTreeClassifier(class_weight='balanced', random_state=42)
        model_balanced_weights.fit(X_train, y_train)
        y_pred_balanced_weights = model_balanced_weights.predict(X_test)
        
        metrics_balanced_weights = calculate_metrics(y_test, y_pred_balanced_weights, le)
        print_metrics("Class-Weighted Model", metrics_balanced_weights)

        
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
                    'model_type': 'decision_tree',
                    'balancing': 'none',
                    'metrics': metrics_baseline
                }
            },
            'training_date': datetime.now().isoformat()
        }        

        results['models']['smote_balanced'] = {
            'model_type': 'decision_tree',
            'balancing': 'SMOTE',
            'metrics': metrics_balanced_smote
        }

        results['models']['class_weighted'] = {
            'model_type': 'decision_tree',
            'balancing': 'Class Weights',
            'metrics': metrics_balanced_weights
        }
        
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print("\nModel Comparison (F1-Score):")
        print(f"  Baseline: {metrics_baseline['f1_score']:.4f}")
        print(f"  SMOTE:    {metrics_balanced_smote['f1_score']:.4f}")
        print(f"  Weighted: {metrics_balanced_weights['f1_score']:.4f}")
        
        # Execution time
        end_time = datetime.now()
        execution_time = (end_time - start_time).total_seconds()
        
        print(f"\n⏱Total execution time: {execution_time:.2f} seconds")
        print(f"Results saved to: {output_file}")
        print("=" * 80)
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    INPUT_FILE = "clean_data.csv"
    OUTPUT_FILE = "model_results.json"
    
    CONFIG = {
        'target': 'contract_type',
        'features': ["job_sector","job_title"],
        'model_type': 'decision_tree',
        'balancing': 'both',
        'test_size': 0.2,
        'random_state': 42
    }
    
    train_models(INPUT_FILE, OUTPUT_FILE, CONFIG)
