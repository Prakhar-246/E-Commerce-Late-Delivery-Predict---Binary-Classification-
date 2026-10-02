import pandas as pd
import numpy as np
import os

# =========================================================
# 1. CREATE OUTPUT DIRECTORY
# =========================================================

os.makedirs("data/messy", exist_ok=True)


# =========================================================
# 2. LOAD MASTER DATASET
# =========================================================

master_df = pd.read_csv(
    "data/processed/master_delivery_data_clean.csv"
)

print("Original shape:")
print(master_df.shape)


# =========================================================
# 3. CREATE COPY
# =========================================================

messy_df = master_df.copy()


# =========================================================
# 4. RANDOM SEED
# =========================================================

np.random.seed(42)


# =========================================================
# 5. MISSING VALUES
# =========================================================

missing_columns = [
    "age",
    "gender",
    "order_value",
    "product_weight_kg",
    "partner_experience_years",
    "rating",
    "warehouse_type"
]

for column in missing_columns:

    n_missing = int(
        len(messy_df) * 0.03
    )

    indexes = np.random.choice(
        messy_df.index,
        size=n_missing,
        replace=False
    )

    messy_df.loc[indexes, column] = np.nan


# =========================================================
# 6. DUPLICATE ROWS
# =========================================================

duplicate_sample = messy_df.sample(
    n=500,
    random_state=42
)

messy_df = pd.concat(
    [messy_df, duplicate_sample],
    ignore_index=True
)


# =========================================================
# 7. INCONSISTENT CITY VALUES
# =========================================================

city_changes = {
    "Delhi": "delhi",
    "Mumbai": "MUMBAI",
    "Chennai": " chennai",
    "Bengaluru": "BENGALURU ",
    "Hyderabad": "hyderabad",
    "Pune": " pune"
}

for original, messy_value in city_changes.items():

    mask = (
        messy_df["city_x"] == original
    )

    indexes = messy_df[mask].sample(
        frac=0.10,
        random_state=42
    ).index

    messy_df.loc[
        indexes,
        "city_x"
    ] = messy_value


# =========================================================
# 8. INCONSISTENT GENDER
# =========================================================

gender_changes = {
    "Male": "male",
    "Female": "FEMALE",
    "Other": " other"
}

for original, messy_value in gender_changes.items():

    mask = (
        messy_df["gender"] == original
    )

    indexes = messy_df[mask].sample(
        frac=0.10,
        random_state=42
    ).index

    messy_df.loc[
        indexes,
        "gender"
    ] = messy_value


# =========================================================
# 9. INVALID AGE VALUES
# =========================================================

age_indexes = np.random.choice(
    messy_df.index,
    size=100,
    replace=False
)

messy_df.loc[
    age_indexes[:50],
    "age"
] = -5

messy_df.loc[
    age_indexes[50:],
    "age"
] = 150


# =========================================================
# 10. INVALID RATINGS
# =========================================================

rating_indexes = np.random.choice(
    messy_df.index,
    size=100,
    replace=False
)

messy_df.loc[
    rating_indexes[:50],
    "rating"
] = 0

messy_df.loc[
    rating_indexes[50:],
    "rating"
] = 7


# =========================================================
# 11. OUTLIERS
# =========================================================

outlier_indexes = np.random.choice(
    messy_df.index,
    size=100,
    replace=False
)

messy_df.loc[
    outlier_indexes,
    "order_value"
] *= 20


# =========================================================
# 12. EXTRA WHITESPACE
# =========================================================

for column in [
    "product_category",
    "vehicle_type",
    "warehouse_type"
]:

    indexes = messy_df.sample(
        frac=0.05,
        random_state=42
    ).index

    messy_df.loc[
        indexes,
        column
    ] = (
        messy_df.loc[indexes, column]
        .astype(str)
        .str.strip()
        .apply(lambda x: f" {x} ")
    )


# =========================================================
# 13. SAVE MESSY DATA
# =========================================================

messy_df.to_csv(
    "data/messy/master_messy.csv",
    index=False
)


# =========================================================
# 14. BASIC VALIDATION
# =========================================================

print("\nMessy dataset created!")

print("Shape:")
print(messy_df.shape)

print("\nMissing values:")
print(
    messy_df.isnull().sum()
)

print("\nDuplicate rows:")
print(
    messy_df.duplicated().sum()
)

print("\nSaved to:")
print(
    "data/messy/master_messy.csv"
)