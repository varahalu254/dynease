const path = require('path');
const envFile = process.env.NODE_ENV === 'production' ? '../.env.production' : '../.env';
require('dotenv').config({ path: path.resolve(__dirname, envFile) });

const TenantDatabaseManager = require('./src/services/TenantDatabaseManager');
const RestaurantRegistry = require('./src/models/platform/RestaurantRegistry');

const categoriesToSeed = [
  "Non-Veg Biryani",
  "Rice & Pulao",
  "Indian Breads",
  "Noodles & Fried Rice",
  "Chinese Starters",
  "Chinese Main Course",
  "Salads",
  "Sandwiches & Burgers",
  "Pizza",
  "Fast Food",
  "Breakfast",
  "Egg Specials",
  "Seafood",
  "Tandoori & Kebabs",
  "Combos & Meals",
  "Desserts",
  "Beverages",
  "Tea & Coffee",
  "Fresh Juices & Mocktails",
  "Milkshakes",
  "Kids Menu",
  "Vegan Specials",
  "Chef's Specials"
];

async function seedCategories() {
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to platform database.");

    const registry = await RestaurantRegistry.findOne({ subdomain: 'chandrikafamilyrestaurant' });
    if (!registry) {
      console.log("Tenant not found.");
      process.exit(1);
    }

    console.log("Found tenant:", registry.databaseName, "with ID:", registry.restaurantId);

    const tenantDb = await TenantDatabaseManager.getConnection(registry.databaseName);
    const Category = tenantDb.model('Category');

    for (let i = 0; i < categoriesToSeed.length; i++) {
      const name = categoriesToSeed[i];
      const existing = await Category.findOne({ restaurantId: registry.restaurantId, name });
      if (!existing) {
        await Category.create({
          restaurantId: registry.restaurantId,
          name,
          displayOrder: i + 10 // Start ordering after existing ones
        });
        console.log(`Seeded: ${name}`);
      } else {
        console.log(`Skipped (already exists): ${name}`);
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedCategories();
