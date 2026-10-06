const path = require('path');
const envFile = process.env.NODE_ENV === 'production' ? '../.env.production' : '../.env';
require('dotenv').config({ path: path.resolve(__dirname, envFile) });

const TenantDatabaseManager = require('./src/services/TenantDatabaseManager');
const RestaurantRegistry = require('./src/models/platform/RestaurantRegistry');

const menuItemsInput = [
  "Paneer Tikka", "Gobi 65",
  "Chicken 65", "Chicken Lollipop",
  "Tomato Soup", "Veg Manchow Soup",
  "Chicken Manchow Soup", "Chicken Hot & Sour Soup",
  "Paneer Butter Masala", "Kadai Vegetable",
  "Butter Chicken", "Chicken Tikka Masala",
  "Veg Dum Biryani", "Paneer Biryani",
  "Chicken Dum Biryani", "Mutton Biryani",
  "Jeera Rice", "Veg Pulao",
  "Butter Naan", "Garlic Naan",
  "Veg Hakka Noodles", "Chicken Fried Rice",
  "Veg Spring Rolls", "Chilli Chicken",
  "Veg Manchurian", "Chicken Manchurian",
  "Garden Fresh Salad", "Russian Salad",
  "Veg Club Sandwich", "Chicken Burger",
  "Margherita Pizza", "Chicken Tikka Pizza",
  "French Fries", "Chicken Nuggets",
  "Masala Dosa", "Idli Sambar",
  "Egg Bhurji", "Masala Omelette",
  "Fish Fry", "Prawn Masala",
  "Tandoori Chicken", "Chicken Seekh Kebab",
  "Veg Meal Combo", "Chicken Biryani Combo",
  "Gulab Jamun", "Chocolate Brownie",
  "Coca-Cola", "Fresh Lime Soda",
  "Masala Tea", "Cappuccino",
  "Fresh Watermelon Juice", "Virgin Mojito",
  "Chocolate Milkshake", "Strawberry Milkshake",
  "Mini Cheese Pizza", "Kids Veg Noodles"
];

// Simple mapping logic based on keywords
function determineCategory(name) {
  name = name.toLowerCase();
  if (name.includes('biryani')) {
    return name.includes('veg') || name.includes('paneer') ? "Veg Biryani" : "Non-Veg Biryani";
  }
  if (name.includes('rice') || name.includes('pulao')) return "Rice & Pulao";
  if (name.includes('naan') || name.includes('roti') || name.includes('bread')) return "Indian Breads";
  if (name.includes('noodle') || name.includes('fried rice')) return "Noodles & Fried Rice";
  if (name.includes('roll') || name.includes('chilli chicken') || name.includes('65') || name.includes('lollipop') || name.includes('tikka')) {
    if (name.includes('pizza') || name.includes('masala')) {} // handle later
    else return name.includes('chicken') ? "Chinese Starters" : "Veg Starters";
  }
  if (name.includes('manchurian')) return "Chinese Main Course";
  if (name.includes('salad')) return "Salads";
  if (name.includes('sandwich') || name.includes('burger')) return "Sandwiches & Burgers";
  if (name.includes('pizza')) return "Pizza";
  if (name.includes('fries') || name.includes('nugget')) return "Fast Food";
  if (name.includes('dosa') || name.includes('idli')) return "Breakfast";
  if (name.includes('egg') || name.includes('omelette')) return "Egg Specials";
  if (name.includes('fish') || name.includes('prawn') || name.includes('seafood')) return "Seafood";
  if (name.includes('tandoori') || name.includes('kebab')) return "Tandoori & Kebabs";
  if (name.includes('combo') || name.includes('meal')) return "Combos & Meals";
  if (name.includes('jamun') || name.includes('brownie') || name.includes('dessert')) return "Desserts";
  if (name.includes('tea') || name.includes('cappuccino') || name.includes('coffee')) return "Tea & Coffee";
  if (name.includes('juice') || name.includes('mojito') || name.includes('soda') || name.includes('cola')) return "Fresh Juices & Mocktails";
  if (name.includes('milkshake')) return "Milkshakes";
  if (name.includes('kids') || name.includes('mini')) return "Kids Menu";
  if (name.includes('soup')) return name.includes('chicken') ? "Non-Veg Soups" : "Veg Soups";
  if (name.includes('masala') || name.includes('butter chicken') || name.includes('kadai')) return name.includes('chicken') || name.includes('mutton') ? "Non-Veg Curries" : "Veg Curries";
  
  return "Chef's Specials"; // fallback
}

async function seedMenu() {
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to platform database.");

    const registry = await RestaurantRegistry.findOne({ subdomain: 'chandrikafamilyrestaurant' });
    if (!registry) {
      console.log("Tenant not found.");
      process.exit(1);
    }

    const tenantDb = await TenantDatabaseManager.getConnection(registry.databaseName);
    const MenuItem = tenantDb.model('MenuItem');

    for (const name of menuItemsInput) {
      const category = determineCategory(name);
      
      const existing = await MenuItem.findOne({ restaurantId: registry.restaurantId, name });
      if (!existing) {
        await MenuItem.create({
          restaurantId: registry.restaurantId,
          name,
          description: `Delicious ${name} prepared with the finest ingredients.`,
          price: Math.floor(Math.random() * (400 - 100 + 1) + 100), // Random price between 100 and 400
          category: category,
          isAvailable: true,
          dietaryPreference: name.toLowerCase().includes('chicken') || name.toLowerCase().includes('mutton') || name.toLowerCase().includes('fish') || name.toLowerCase().includes('prawn') ? 'NON_VEG' : name.toLowerCase().includes('egg') ? 'EGG' : 'VEG',
          preparationTime: 15
        });
        console.log(`Seeded: ${name} in ${category}`);
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

seedMenu();
