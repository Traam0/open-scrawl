# clean_utils.py
"""
Reusable data cleaning utilities
Save this file in your backend directory alongside other utility files
"""

import pandas as pd
import numpy as np
from typing import Optional, List, Union

def remove_rows_with_nulls(df: pd.DataFrame, columns: Union[List[str], str] = 'all') -> pd.DataFrame:
    """
    Remove rows containing null values.
    
    Args:
        df: DataFrame to clean
        columns: Column name, list of columns, or 'all'
        
    Returns:
        Cleaned DataFrame
    """
    before_rows = len(df)
    
    if columns == 'all':
        df = df.dropna()
    else:
        subset = [columns] if isinstance(columns, str) else columns
        df = df.dropna(subset=subset)
    
    removed_rows = before_rows - len(df)
    print(f"  Removed {removed_rows} rows with null values")
    
    return df


def remove_columns_with_nulls(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove columns containing any null values.
    
    Args:
        df: DataFrame to clean
        
    Returns:
        Cleaned DataFrame
    """
    before_cols = len(df.columns)
    df = df.dropna(axis=1, how='any')
    removed_cols = before_cols - len(df.columns)
    print(f"  Removed {removed_cols} columns with null values")
    
    return df


def fill_nulls_with_mean(df: pd.DataFrame, columns: Union[List[str], str] = 'all') -> pd.DataFrame:
    """
    Fill null values with column mean (numeric columns only).
    
    Args:
        df: DataFrame to clean
        columns: Column name, list of columns, or 'all'
        
    Returns:
        Cleaned DataFrame
    """
    target_cols = df.columns if columns == 'all' else ([columns] if isinstance(columns, str) else columns)
    
    for col in target_cols:
        if col in df.columns and df[col].dtype in ['int64', 'float64']:
            mean_val = df[col].mean()
            nulls = df[col].isnull().sum()
            if nulls > 0:
                df[col].fillna(mean_val, inplace=True)
                print(f"  {col}: Filled {nulls} nulls with mean ({mean_val:.2f})")
    
    return df


def fill_nulls_with_median(df: pd.DataFrame, columns: Union[List[str], str] = 'all') -> pd.DataFrame:
    """
    Fill null values with column median (numeric columns only).
    
    Args:
        df: DataFrame to clean
        columns: Column name, list of columns, or 'all'
        
    Returns:
        Cleaned DataFrame
    """
    target_cols = df.columns if columns == 'all' else ([columns] if isinstance(columns, str) else columns)
    
    for col in target_cols:
        if col in df.columns and df[col].dtype in ['int64', 'float64']:
            median_val = df[col].median()
            nulls = df[col].isnull().sum()
            if nulls > 0:
                df[col].fillna(median_val, inplace=True)
                print(f"  {col}: Filled {nulls} nulls with median ({median_val:.2f})")
    
    return df


def fill_nulls_with_mode(df: pd.DataFrame, columns: Union[List[str], str] = 'all') -> pd.DataFrame:
    """
    Fill null values with column mode (most frequent value).
    
    Args:
        df: DataFrame to clean
        columns: Column name, list of columns, or 'all'
        
    Returns:
        Cleaned DataFrame
    """
    target_cols = df.columns if columns == 'all' else ([columns] if isinstance(columns, str) else columns)
    
    for col in target_cols:
        if col in df.columns:
            mode_result = df[col].mode()
            if not mode_result.empty:
                mode_val = mode_result[0]
                nulls = df[col].isnull().sum()
                if nulls > 0:
                    df[col].fillna(mode_val, inplace=True)
                    print(f"  {col}: Filled {nulls} nulls with mode ({mode_val})")
    
    return df


def fill_nulls_with_zero(df: pd.DataFrame, columns: Union[List[str], str] = 'all') -> pd.DataFrame:
    """
    Fill null values with zero.
    
    Args:
        df: DataFrame to clean
        columns: Column name, list of columns, or 'all'
        
    Returns:
        Cleaned DataFrame
    """
    target_cols = df.columns if columns == 'all' else ([columns] if isinstance(columns, str) else columns)
    
    for col in target_cols:
        if col in df.columns:
            nulls = df[col].isnull().sum()
            if nulls > 0:
                df[col].fillna(0, inplace=True)
                print(f"  {col}: Filled {nulls} nulls with zero")
    
    return df


def fill_nulls_with_custom(df: pd.DataFrame, value: any, columns: Union[List[str], str] = 'all') -> pd.DataFrame:
    """
    Fill null values with a custom value.
    
    Args:
        df: DataFrame to clean
        value: Custom value to fill with
        columns: Column name, list of columns, or 'all'
        
    Returns:
        Cleaned DataFrame
    """
    target_cols = df.columns if columns == 'all' else ([columns] if isinstance(columns, str) else columns)
    
    print(f"  Custom fill value: '{value}'")
    for col in target_cols:
        if col in df.columns:
            nulls = df[col].isnull().sum()
            if nulls > 0:
                df[col].fillna(value, inplace=True)
                print(f"  {col}: Filled {nulls} nulls with '{value}'")
    
    return df


def normalize_min_max_0_1(df: pd.DataFrame, columns: Union[List[str], str] = 'all') -> pd.DataFrame:
    """
    Normalize numeric columns to [0, 1] range using Min-Max scaling.
    
    Args:
        df: DataFrame to normalize
        columns: Column name, list of columns, or 'all' for all numeric columns
        
    Returns:
        Normalized DataFrame
    """
    if columns == 'all':
        target_cols = df.select_dtypes(include=['int64', 'float64']).columns
    else:
        target_cols = [columns] if isinstance(columns, str) else columns
    
    for col in target_cols:
        if col in df.columns and df[col].dtype in ['int64', 'float64']:
            min_val = df[col].min()
            max_val = df[col].max()
            if max_val != min_val:
                df[col] = (df[col] - min_val) / (max_val - min_val)
                print(f"  {col}: Normalized to [0, 1]")
    
    return df


def normalize_min_max_neg1_1(df: pd.DataFrame, columns: Union[List[str], str] = 'all') -> pd.DataFrame:
    """
    Normalize numeric columns to [-1, 1] range using Min-Max scaling.
    
    Args:
        df: DataFrame to normalize
        columns: Column name, list of columns, or 'all' for all numeric columns
        
    Returns:
        Normalized DataFrame
    """
    if columns == 'all':
        target_cols = df.select_dtypes(include=['int64', 'float64']).columns
    else:
        target_cols = [columns] if isinstance(columns, str) else columns
    
    for col in target_cols:
        if col in df.columns and df[col].dtype in ['int64', 'float64']:
            min_val = df[col].min()
            max_val = df[col].max()
            if max_val != min_val:
                df[col] = 2 * (df[col] - min_val) / (max_val - min_val) - 1
                print(f"  {col}: Normalized to [-1, 1]")
    
    return df


def normalize_z_score(df: pd.DataFrame, columns: Union[List[str], str] = 'all') -> pd.DataFrame:
    """
    Normalize numeric columns using Z-Score standardization (mean=0, std=1).
    
    Args:
        df: DataFrame to normalize
        columns: Column name, list of columns, or 'all' for all numeric columns
        
    Returns:
        Normalized DataFrame
    """
    if columns == 'all':
        target_cols = df.select_dtypes(include=['int64', 'float64']).columns
    else:
        target_cols = [columns] if isinstance(columns, str) else columns
    
    for col in target_cols:
        if col in df.columns and df[col].dtype in ['int64', 'float64']:
            mean_val = df[col].mean()
            std_val = df[col].std()
            if std_val != 0:
                df[col] = (df[col] - mean_val) / std_val
                print(f"  {col}: Standardized (mean=0, std=1)")
    
    return df


def trim_whitespaces(df: pd.DataFrame) -> pd.DataFrame:
    """
    Trim leading and trailing whitespaces from string columns.
    
    Args:
        df: DataFrame to clean
        
    Returns:
        Cleaned DataFrame
    """
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].astype(str).str.strip()
            print(f"  {col}: Trimmed whitespaces")
    
    return df


def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove duplicate rows from DataFrame.
    
    Args:
        df: DataFrame to clean
        
    Returns:
        Cleaned DataFrame
    """
    before_rows = len(df)
    df = df.drop_duplicates()
    removed_dups = before_rows - len(df)
    print(f"  Removed {removed_dups} duplicate rows")
    
    return df


def print_statistics(df: pd.DataFrame, title: str = "Data Statistics"):
    """
    Print DataFrame statistics.
    
    Args:
        df: DataFrame to analyze
        title: Title for the statistics section
    """
    print(f"\n📊 {title}:")
    print(f"  Total rows: {len(df)}")
    print(f"  Total columns: {len(df.columns)}")
    print(f"  Total cells: {df.size}")
    print(f"  Missing values: {df.isnull().sum().sum()}")
    print(f"  Duplicate rows: {df.duplicated().sum()}")