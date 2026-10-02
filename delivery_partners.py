from faker import Faker

# Initialize Faker with the Indian English locale
fake = Faker('en_IN')

# Generate a random Indian name
print(fake.name())

# Generate specific name parts
print(fake.first_name())
print(fake.last_name())