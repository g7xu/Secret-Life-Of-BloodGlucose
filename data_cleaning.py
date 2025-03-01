# this file will take data in the "data" folder and clean it up
# the resulting data will be stored in the "cleaned_data" folder and uploaded to google drive
import os

import numpy as np
import pandas as pd


def clean_geo_data(gemographic_data: pd.DataFrame):
    # rename the some of the column name
    gemographic_data.rename(
        columns={"subject": "PID", "Self-identify ": "Self-identifid-Race"},
        inplace=True,
    )

    # aggregre the starting GLU by taking the average of three
    gemographic_data["Starting GLU"] = gemographic_data[
        [
            "#1 Contour Fingerstick GLU",
            " #2 Contour Fingerstick GLU",
            "#3 Contour Fingerstick GLU",
        ]
    ].mean(axis=1)
    gemographic_data.drop(
        [
            "#1 Contour Fingerstick GLU",
            " #2 Contour Fingerstick GLU",
            "#3 Contour Fingerstick GLU",
            "Time (t)",
            "Time (t).1",
            "Time (t).2",
        ],
        axis=1,
        inplace=True,
    )

    return gemographic_data


def clean_gut_health_data(gut_health_data: pd.DataFrame):
    # rename the some of the column name
    gut_health_data.rename(
        columns={"subject": "PID"},
        inplace=True,
    )

    return gut_health_data


def clean_CGMarcros(folder_path: str):
    CGMacros = []
    for subdir, _, files in os.walk(folder_path):
        for file in files:
            if file.endswith(".csv") and "CGMacros-" in subdir:
                file_path = os.path.join(subdir, file)
                df = pd.read_csv(file_path)
                df.drop(columns=["Image path"])
                df.name = file
                CGMacros.append(df)
    return CGMacros


if __name__ == "__main__":
    # read data
    gemographic_data = pd.read_csv("data/CGMacros/bio.csv")
    gut_health_data = pd.read_csv("data/CGMacros/bio.csv")

    # cleaning the data
    cleaned_geo_data = clean_geo_data(gemographic_data)
    cleaned_gut_health_data = clean_gut_health_data(gut_health_data)
    cleaned_CGMarcros = clean_CGMarcros("data/CGMacros")

    if not os.path.exists("cleaned_data"):
        os.makedirs("cleaned_data")

    cleaned_geo_data.to_csv("cleaned_data/bio.csv", index=False)
    cleaned_gut_health_data.to_csv("cleaned_data/gut_health.csv", index=False)

    for df in cleaned_CGMarcros:
        df.to_csv(f"cleaned_data/{df.name}", index=False)

    print("Data cleaning is done")
