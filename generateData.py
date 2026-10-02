import pandas as pd
import numpy as np
from faker import Faker
import os


fake = Faker('en_IN')


np.random.seed(42)
Faker.seed(42)

os.makedirs("data/raw", exist_ok=True)


# =========================================================
# 1. CUSTOMERS
# =========================================================

N_CUSTOMERS = 10_000

customers = []

for i in range(1, N_CUSTOMERS + 1):

    customer = {
        "customer_id": f"CUST{i:06d}",
        "name": fake.name(),
        "age": np.random.randint(18, 70),
        "gender": np.random.choice(
            ["Male", "Female", "Other"],
            p=[0.48, 0.48, 0.04]
        ),
        "city": np.random.choice([
            "Chennai",
            "Bengaluru",
            "Mumbai",
            "Delhi",
            "Hyderabad",
            "Pune",
            "Kolkata",
            "Indore",
            "Jaipur",
            "Ahmedabad"
        ]),
        "customer_type": np.random.choice(
            ["New", "Regular", "Premium"],
            p=[0.25, 0.60, 0.15]
        ),
        "signup_date": fake.date_between(
            start_date="-4y",
            end_date="today"
        )
    }

    customers.append(customer)


customers_df = pd.DataFrame(customers)

customers_df.to_csv(
    "data/raw/customers.csv",
    index=False
)

print("Customer dataset generated successfully!")
print(f"Rows: {customers_df.shape[0]}")
print(f"Columns: {customers_df.shape[1]}")


# =========================================================
# 2. ORDERS
# =========================================================

N_ORDERS = 50_000

cities = [
    "Chennai",
    "Bengaluru",
    "Mumbai",
    "Delhi",
    "Hyderabad",
    "Pune",
    "Kolkata",
    "Indore",
    "Jaipur",
    "Ahmedabad"
]

product_categories = [
    "Electronics",
    "Clothing",
    "Grocery",
    "Furniture",
    "Books",
    "Beauty",
    "Sports",
    "Home Appliances"
]


# ---------------------------------------------------------
# Generate customer IDs
# ---------------------------------------------------------

customer_ids = np.random.choice(
    customers_df["customer_id"].values,
    size=N_ORDERS
)


# ---------------------------------------------------------
# Customer ID -> Customer City
# ---------------------------------------------------------

customer_city_map = (
    customers_df
    .set_index("customer_id")["city"]
    .to_dict()
)

destination_cities = np.array([
    customer_city_map[cid]
    for cid in customer_ids
])


# ---------------------------------------------------------
# Source city
# ---------------------------------------------------------

source_cities = np.random.choice(
    cities,
    size=N_ORDERS
)


# ---------------------------------------------------------
# Product category
# ---------------------------------------------------------

product_categories_generated = np.random.choice(
    product_categories,
    size=N_ORDERS
)


# ---------------------------------------------------------
# Product weight
# ---------------------------------------------------------

product_weight = np.random.lognormal(
    mean=0.3,
    sigma=0.9,
    size=N_ORDERS
)

product_weight = np.round(
    np.clip(product_weight, 0.1, 50),
    2
)


# ---------------------------------------------------------
# Order value
# ---------------------------------------------------------

order_value = np.random.lognormal(
    mean=7.5,
    sigma=1.0,
    size=N_ORDERS
)

order_value = np.round(
    np.clip(order_value, 100, 100000),
    2
)


# ---------------------------------------------------------
# Distance
# ---------------------------------------------------------

same_city = (
    source_cities == destination_cities
)

distance = np.empty(N_ORDERS)

distance[same_city] = np.random.uniform(
    2,
    30,
    size=same_city.sum()
)

distance[~same_city] = np.random.uniform(
    50,
    1800,
    size=(~same_city).sum()
)

distance = np.round(distance, 2)


# ---------------------------------------------------------
# Promised delivery hours
# ---------------------------------------------------------

promised_hours = np.empty(N_ORDERS)

mask_1 = distance < 50
mask_2 = (distance >= 50) & (distance < 300)
mask_3 = (distance >= 300) & (distance < 800)
mask_4 = (distance >= 800) & (distance < 1500)
mask_5 = distance >= 1500


promised_hours[mask_1] = np.random.uniform(
    6,
    12,
    size=mask_1.sum()
)

promised_hours[mask_2] = np.random.uniform(
    12,
    24,
    size=mask_2.sum()
)

promised_hours[mask_3] = np.random.uniform(
    24,
    48,
    size=mask_3.sum()
)

promised_hours[mask_4] = np.random.uniform(
    36,
    72,
    size=mask_4.sum()
)

promised_hours[mask_5] = np.random.uniform(
    48,
    96,
    size=mask_5.sum()
)

promised_hours = np.round(
    promised_hours,
    2
)


# ---------------------------------------------------------
# Dates
# ---------------------------------------------------------

order_dates = pd.to_datetime(
    np.random.randint(
        pd.Timestamp("2024-01-01").value // 10**9,
        pd.Timestamp("2026-08-27").value // 10**9,
        size=N_ORDERS
    ),
    unit="s"
).date


# ---------------------------------------------------------
# Times
# ---------------------------------------------------------

order_times = pd.to_datetime(
    np.random.randint(
        0,
        24 * 60 * 60,
        size=N_ORDERS
    ),
    unit="s"
).time


# ---------------------------------------------------------
# Create DataFrame directly
# ---------------------------------------------------------

orders_df = pd.DataFrame({

    "order_id": [
        f"ORD{i:06d}"
        for i in range(1, N_ORDERS + 1)
    ],

    "customer_id": customer_ids,

    "order_date": order_dates,

    "order_time": order_times,

    "source_city": source_cities,

    "destination_city": destination_cities,

    "product_category":
        product_categories_generated,

    "product_weight_kg":
        product_weight,

    "order_value":
        order_value,

    "distance_km":
        distance,

    "promised_delivery_hours":
        promised_hours
})


# ---------------------------------------------------------
# Save
# ---------------------------------------------------------

orders_df.to_csv(
    "data/raw/orders.csv",
    index=False
)


# ---------------------------------------------------------
# Validation
# ---------------------------------------------------------

print("\nOrder dataset generated successfully!")

print("Shape:")
print(orders_df.shape)

print("\nFirst 5 rows:")
print(orders_df.head())

print("\nMissing values:")
print(orders_df.isnull().sum())

print("\nDuplicate order IDs:")
print(
    orders_df["order_id"].duplicated().sum()
)

print("\nNumerical summary:")
print(
    orders_df[
        [
            "product_weight_kg",
            "order_value",
            "distance_km",
            "promised_delivery_hours"
        ]
    ].describe()
)



# Delivery Partners Generation
# =========================================================
# 3. DELIVERY PARTNERS
# =========================================================

N_PARTNERS = 500

partners = []

partner_cities = [
    "Chennai",
    "Bengaluru",
    "Mumbai",
    "Delhi",
    "Hyderabad",
    "Pune",
    "Kolkata",
    "Indore",
    "Jaipur",
    "Ahmedabad"
]

vehicle_types = [
    "Bike",
    "Van",
    "Truck",
    "EV"
]

for i in range(1, N_PARTNERS + 1):

    # -----------------------------------------------------
    # Experience
    # -----------------------------------------------------

    experience = np.random.exponential(scale=4)

    experience = round(
        np.clip(experience, 0, 15),
        1
    )


    # -----------------------------------------------------
    # Vehicle
    # -----------------------------------------------------

    vehicle_type = np.random.choice(
        vehicle_types,
        p=[0.60, 0.20, 0.08, 0.12]
    )


    # -----------------------------------------------------
    # Rating
    # Mostly decent ratings
    # -----------------------------------------------------

    rating = np.random.normal(
        loc=4.2,
        scale=0.45
    )

    rating = round(
        np.clip(rating, 1, 5),
        2
    )


    # -----------------------------------------------------
    # Completed deliveries
    # Related to experience
    # -----------------------------------------------------

    base_deliveries = experience * np.random.uniform(
        700,
        1300
    )

    completed_deliveries = int(
        np.clip(
            base_deliveries + np.random.normal(0, 500),
            0,
            20000
        )
    )


    # -----------------------------------------------------
    # Partner city
    # -----------------------------------------------------

    partner_city = np.random.choice(
        partner_cities,
        p=[
            0.14,  # Chennai
            0.14,  # Bengaluru
            0.13,  # Mumbai
            0.12,  # Delhi
            0.11,  # Hyderabad
            0.10,  # Pune
            0.08,  # Kolkata
            0.07,  # Indore
            0.06,  # Jaipur
            0.05   # Ahmedabad
        ]
    )


    # -----------------------------------------------------
    # Create partner
    # -----------------------------------------------------

    partner = {

        "partner_id": f"PART{i:04d}",

        "partner_name": fake.name(),

        "partner_experience_years": experience,

        "vehicle_type": vehicle_type,

        "rating": rating,

        "completed_deliveries": completed_deliveries,

        "partner_city": partner_city
    }


    partners.append(partner)


# ---------------------------------------------------------
# Convert to DataFrame
# ---------------------------------------------------------

partners_df = pd.DataFrame(partners)


# ---------------------------------------------------------
# Save
# ---------------------------------------------------------

partners_df.to_csv(
    "data/raw/delivery_partners.csv",
    index=False
)


# ---------------------------------------------------------
# Validation
# ---------------------------------------------------------

print("\nDelivery partners dataset generated successfully!")

print("Shape:")
print(partners_df.shape)

print("\nFirst 5 rows:")
print(partners_df.head())

print("\nData types:")
print(partners_df.dtypes)

print("\nMissing values:")
print(partners_df.isnull().sum())

print("\nDuplicate partner IDs:")
print(partners_df["partner_id"].duplicated().sum())

print("\nVehicle distribution:")
print(partners_df["vehicle_type"].value_counts())

print("\nPartner city distribution:")
print(partners_df["partner_city"].value_counts())

print("\nNumerical summary:")
print(
    partners_df[
        [
            "partner_experience_years",
            "rating",
            "completed_deliveries"
        ]
    ].describe()
)


# Warehouse

# =========================================================
# 4. WAREHOUSES
# =========================================================

N_WAREHOUSES = 50

warehouses = []

warehouse_types = [
    "Fulfillment Center",
    "Sorting Hub",
    "Distribution Center"
]

warehouse_type_probability = [
    0.30,
    0.35,
    0.35
]

for i in range(1, N_WAREHOUSES + 1):

    # -----------------------------------------------------
    # City
    # -----------------------------------------------------

    city = np.random.choice(
        partner_cities
    )

    # -----------------------------------------------------
    # Warehouse type
    # -----------------------------------------------------

    warehouse_type = np.random.choice(
        warehouse_types,
        p=warehouse_type_probability
    )

    # -----------------------------------------------------
    # Capacity
    # -----------------------------------------------------

    if warehouse_type == "Fulfillment Center":

        capacity_units = np.random.randint(
            20000,
            100000
        )

    elif warehouse_type == "Sorting Hub":

        capacity_units = np.random.randint(
            10000,
            60000
        )

    else:

        capacity_units = np.random.randint(
            5000,
            40000
        )

    # -----------------------------------------------------
    # Staff count
    # -----------------------------------------------------

    staff_count = int(
        capacity_units / np.random.uniform(
            250,
            450
        )
    )

    staff_count = max(
        staff_count,
        10
    )

    # -----------------------------------------------------
    # Operating hours
    # -----------------------------------------------------

    if warehouse_type == "Fulfillment Center":

        operating_hours = np.random.choice(
            [16, 20, 24],
            p=[0.25, 0.35, 0.40]
        )

    elif warehouse_type == "Sorting Hub":

        operating_hours = np.random.choice(
            [12, 16, 20, 24],
            p=[0.15, 0.30, 0.35, 0.20]
        )

    else:

        operating_hours = np.random.choice(
            [8, 12, 16],
            p=[0.25, 0.50, 0.25]
        )

    # -----------------------------------------------------
    # Warehouse
    # -----------------------------------------------------

    warehouse = {

        "warehouse_id": f"WH{i:04d}",

        "warehouse_name": f"{city} Warehouse {i:02d}",

        "city": city,

        "warehouse_type": warehouse_type,

        "capacity_units": capacity_units,

        "staff_count": staff_count,

        "operating_hours": operating_hours
    }

    warehouses.append(warehouse)


# ---------------------------------------------------------
# Convert to DataFrame
# ---------------------------------------------------------

warehouses_df = pd.DataFrame(
    warehouses
)


# ---------------------------------------------------------
# Save
# ---------------------------------------------------------

warehouses_df.to_csv(
    "data/raw/warehouses.csv",
    index=False
)


# ---------------------------------------------------------
# Validation
# ---------------------------------------------------------

print("\nWarehouse dataset generated successfully!")

print("Shape:")
print(warehouses_df.shape)

print("\nFirst 5 rows:")
print(warehouses_df.head())

print("\nMissing values:")
print(warehouses_df.isnull().sum())

print("\nDuplicate warehouse IDs:")
print(
    warehouses_df["warehouse_id"].duplicated().sum()
)

print("\nWarehouse types:")
print(
    warehouses_df["warehouse_type"].value_counts()
)

print("\nWarehouse cities:")
print(
    warehouses_df["city"].value_counts()
)

print("\nNumerical summary:")
print(
    warehouses_df[
        [
            "capacity_units",
            "staff_count",
            "operating_hours"
        ]
    ].describe()
)



# Relationsip

# =========================================================
# 5. CONNECT ORDERS WITH WAREHOUSES & DELIVERY PARTNERS
# =========================================================

# ---------------------------------------------------------
# Warehouse lookup
# city -> list of warehouse IDs
# ---------------------------------------------------------

warehouse_city_map = (
    warehouses_df
    .groupby("city")["warehouse_id"]
    .apply(list)
    .to_dict()
)


# ---------------------------------------------------------
# Partner lookup
# city -> list of partner IDs
# ---------------------------------------------------------

partner_city_map = (
    partners_df
    .groupby("partner_city")["partner_id"]
    .apply(list)
    .to_dict()
)


# ---------------------------------------------------------
# Assign warehouse and delivery partner to every order
# ---------------------------------------------------------

warehouse_ids = []
partner_ids = []


for _, order in orders_df.iterrows():

    source_city = order["source_city"]

    # -----------------------------------------------------
    # Find warehouses in source city
    # -----------------------------------------------------

    available_warehouses = warehouse_city_map.get(
        source_city,
        []
    )

    if available_warehouses:

        warehouse_id = np.random.choice(
            available_warehouses
        )

    else:

        warehouse_id = np.random.choice(
            warehouses_df["warehouse_id"].tolist()
        )


    # -----------------------------------------------------
    # Find delivery partners in warehouse city
    # -----------------------------------------------------

    warehouse_city = warehouses_df.loc[
        warehouses_df["warehouse_id"] == warehouse_id,
        "city"
    ].iloc[0]


    available_partners = partner_city_map.get(
        warehouse_city,
        []
    )

    if available_partners:

        partner_id = np.random.choice(
            available_partners
        )

    else:

        partner_id = np.random.choice(
            partners_df["partner_id"].tolist()
        )


    warehouse_ids.append(warehouse_id)
    partner_ids.append(partner_id)


# ---------------------------------------------------------
# Add columns to orders
# ---------------------------------------------------------

orders_df["warehouse_id"] = warehouse_ids

orders_df["partner_id"] = partner_ids


# ---------------------------------------------------------
# Save updated orders
# ---------------------------------------------------------

orders_df.to_csv(
    "data/raw/orders.csv",
    index=False
)


# =========================================================
# VALIDATION
# =========================================================

print("\nOrders connected with warehouses and partners!")

print("\nUpdated shape:")
print(orders_df.shape)


print("\nFirst 5 orders:")
print(
    orders_df[
        [
            "order_id",
            "customer_id",
            "source_city",
            "warehouse_id",
            "partner_id"
        ]
    ].head()
)


print("\nMissing values:")
print(
    orders_df[
        [
            "warehouse_id",
            "partner_id"
        ]
    ].isnull().sum()
)


print("\nUnique warehouses used:")
print(
    orders_df["warehouse_id"].nunique()
)


print("\nUnique partners used:")
print(
    orders_df["partner_id"].nunique()
)


print("\nWarehouse distribution:")
print(
    orders_df["warehouse_id"].value_counts().head(10)
)


print("\nPartner distribution:")
print(
    orders_df["partner_id"].value_counts().head(10)
)


# =========================================================
# 6. DELIVERY EVENTS
# =========================================================

delivery_events = []

N_EVENTS = len(orders_df)

# ---------------------------------------------------------
# Partner information lookup
# ---------------------------------------------------------

partner_info = (
    partners_df
    .set_index("partner_id")
    .to_dict("index")
)


# ---------------------------------------------------------
# Generate delivery event for every order
# ---------------------------------------------------------

for _, order in orders_df.iterrows():

    order_id = order["order_id"]

    partner_id = order["partner_id"]

    promised_hours = order["promised_delivery_hours"]

    distance = order["distance_km"]

    weight = order["product_weight_kg"]


    # -----------------------------------------------------
    # Get partner information
    # -----------------------------------------------------

    partner = partner_info[partner_id]

    partner_rating = partner["rating"]

    partner_experience = partner[
        "partner_experience_years"
    ]


    # -----------------------------------------------------
    # Delivery attempts
    # -----------------------------------------------------

    # Normally 1 attempt
    # Difficult deliveries can require more attempts

    attempt_probability = 0.05

    if distance > 1000:
        attempt_probability += 0.08

    if weight > 10:
        attempt_probability += 0.05

    if partner_rating < 3.5:
        attempt_probability += 0.07


    random_value = np.random.random()


    if random_value < attempt_probability:

        delivery_attempts = np.random.choice(
            [2, 3],
            p=[0.8, 0.2]
        )

    else:

        delivery_attempts = 1


    # -----------------------------------------------------
    # Delay probability
    # -----------------------------------------------------

    delay_probability = 0.10


    # Long distance
    if distance > 500:
        delay_probability += 0.10

    if distance > 1000:
        delay_probability += 0.10


    # Heavy package
    if weight > 5:
        delay_probability += 0.05

    if weight > 15:
        delay_probability += 0.08


    # Partner experience
    if partner_experience < 1:
        delay_probability += 0.08

    elif partner_experience > 8:
        delay_probability -= 0.04


    # Partner rating
    if partner_rating < 3.5:
        delay_probability += 0.10

    elif partner_rating > 4.7:
        delay_probability -= 0.03


    # More attempts = higher chance of delay
    if delivery_attempts >= 2:
        delay_probability += 0.12


    # Keep probability realistic
    delay_probability = np.clip(
        delay_probability,
        0.02,
        0.80
    )


    # -----------------------------------------------------
    # Decide whether delivery is delayed
    # -----------------------------------------------------

    is_delayed = (
        np.random.random()
        < delay_probability
    )


    # -----------------------------------------------------
    # Actual delivery hours
    # -----------------------------------------------------

    # -----------------------------------------------------
    # Actual delivery hours
    # -----------------------------------------------------
    
    if is_delayed:
    
        # Late deliveries should exceed promised time
        delay_hours = np.random.uniform(2, 36)
    
        actual_delivery_hours = (
            promised_hours + delay_hours
        )
    
        delivery_status = np.random.choice(
            ["Delayed", "Late"],
            p=[0.7, 0.3]
        )
    
    else:
    
        # On-time deliveries should normally arrive
        # before or very close to promised time
    
        variation = np.random.uniform(
            -8,
            0.5
        )
    
        actual_delivery_hours = (
            promised_hours + variation
        )
    
        delivery_status = "Delivered"
    
    
    actual_delivery_hours = round(
        max(actual_delivery_hours, 1),
        2
    )


    # -----------------------------------------------------
    # Delay reason
    # -----------------------------------------------------

    if delivery_status in ["Delayed", "Late"]:

        delay_reason = np.random.choice(
            [
                "Traffic",
                "Weather",
                "Warehouse Delay",
                "High Order Volume",
                "Vehicle Issue",
                "Address Issue",
                "Customer Unavailable",
                "Operational Delay"
            ]
        )

    else:

        delay_reason = "None"


    # -----------------------------------------------------
    # Customer rating
    # -----------------------------------------------------

    if delivery_status in ["Delayed", "Late"]:

        customer_rating = np.random.normal(
            3.2,
            0.8
        )

    else:

        customer_rating = np.random.normal(
            4.3,
            0.5
        )


    customer_rating = round(
        np.clip(
            customer_rating,
            1,
            5
        ),
        1
    )


    # -----------------------------------------------------
    # Create event
    # -----------------------------------------------------

    event = {

        "event_id": f"EVT{len(delivery_events) + 1:06d}",

        "order_id": order_id,

        "partner_id": partner_id,

        "pickup_time": order["order_time"],

        "actual_delivery_hours":
            actual_delivery_hours,

        "delivery_status":
            delivery_status,

        "delay_reason":
            delay_reason,

        "delivery_attempts":
            delivery_attempts,

        "customer_rating":
            customer_rating
    }


    delivery_events.append(event)


# ---------------------------------------------------------
# Convert to DataFrame
# ---------------------------------------------------------

delivery_events_df = pd.DataFrame(
    delivery_events
)


# ---------------------------------------------------------
# Save
# ---------------------------------------------------------

delivery_events_df.to_csv(
    "data/raw/delivery_events.csv",
    index=False
)


# =========================================================
# VALIDATION
# =========================================================

print("\nDelivery events dataset generated!")

print("\nShape:")
print(delivery_events_df.shape)

print("\nFirst 5 rows:")
print(delivery_events_df.head())

print("\nMissing values:")
print(delivery_events_df.isnull().sum())

print("\nDuplicate event IDs:")
print(
    delivery_events_df[
        "event_id"
    ].duplicated().sum()
)

print("\nDelivery status:")
print(
    delivery_events_df[
        "delivery_status"
    ].value_counts()
)

print("\nDelay reasons:")
print(
    delivery_events_df[
        "delay_reason"
    ].value_counts()
)

print("\nDelivery attempts:")
print(
    delivery_events_df[
        "delivery_attempts"
    ].value_counts()
)

print("\nNumerical summary:")
print(
    delivery_events_df[
        [
            "actual_delivery_hours",
            "delivery_attempts",
            "customer_rating"
        ]
    ].describe()
)



# =========================================================
# 7. CREATE MASTER DATASET
# =========================================================

print("\nCreating master dataset...")


# ---------------------------------------------------------
# Merge orders with customers
# ---------------------------------------------------------

master_df = orders_df.merge(
    customers_df,
    on="customer_id",
    how="left",
    suffixes=("", "_customer")
)


# ---------------------------------------------------------
# Merge with delivery partners
# ---------------------------------------------------------

master_df = master_df.merge(
    partners_df,
    on="partner_id",
    how="left"
)


# ---------------------------------------------------------
# Merge with warehouses
# ---------------------------------------------------------

master_df = master_df.merge(
    warehouses_df,
    on="warehouse_id",
    how="left"
)


# ---------------------------------------------------------
# Merge with delivery events
# ---------------------------------------------------------

master_df = master_df.merge(
    delivery_events_df,
    on=["order_id", "partner_id"],
    how="left"
)


# ---------------------------------------------------------
# Create processed directory
# ---------------------------------------------------------

os.makedirs(
    "data/processed",
    exist_ok=True
)


# ---------------------------------------------------------
# Save clean master dataset
# ---------------------------------------------------------

master_df.to_csv(
    "data/processed/master_delivery_data_clean.csv",
    index=False
)


# =========================================================
# VALIDATION
# =========================================================

print("\nMaster dataset created successfully!")

print("\nShape:")
print(master_df.shape)

print("\nColumns:")
print(master_df.columns.tolist())

print("\nMissing values:")
print(
    master_df.isnull().sum()
)

print("\nDuplicate rows:")
print(
    master_df.duplicated().sum()
)

print("\nFirst 5 rows:")
print(
    master_df.head()
)