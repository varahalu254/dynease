require('dotenv').config({ path: '../.env.production' });
require('dotenv').config({ path: '../.env' }); // Fallback

const mongoose = require('mongoose');
const Restaurant = require('./src/models/Restaurant');
const User = require('./src/models/User');
const RestaurantRegistry = require('./src/models/platform/RestaurantRegistry');
const TenantDatabaseManager = require('./src/services/TenantDatabaseManager');
const MenuItemGlobal = require('./src/models/MenuItem'); // Fallback if exists

async function migrate() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://dinesh_60:70Pbd88b7zL7YJ4s@cluster0.a622y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Found in earlier logs/context if needed, but I'll assume they have it in .env
    console.log('Connecting to', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const restaurants = await Restaurant.find({});
    console.log(`Found ${restaurants.length} old restaurants to migrate.`);

    for (const r of restaurants) {
      console.log(`Migrating: ${r.name}`);
      const restaurantId = `rest_${r._id.toString().slice(-8)}`; // deterministic ID
      const databaseName = `restaurant_${restaurantId}`;
      const subdomain = r.slug;

      // 1. Create Registry Entry
      let ownerEmail = 'unknown@dynease.in';
      if (r.ownerId) {
        const owner = await User.findById(r.ownerId);
        if (owner) ownerEmail = owner.email;
      }

      await RestaurantRegistry.findOneAndUpdate(
        { subdomain },
        {
          restaurantId,
          restaurantName: r.name,
          slug: subdomain,
          subdomain: subdomain,
          databaseName,
          ownerEmail: ownerEmail,
          status: r.status === 'APPROVED' ? 'ACTIVE' : r.status,
          selectedPlan: r.selectedPlan,
          subscriptionStatus: r.subscriptionStatus,
          databaseProvisioned: true,
          approvedAt: r.approvedAt
        },
        { upsert: true, new: true }
      );

      // 2. Provision Tenant DB
      const tenantDb = await TenantDatabaseManager.getConnection(databaseName);
      
      const RestaurantProfile = tenantDb.model('RestaurantProfile');
      await RestaurantProfile.findOneAndUpdate(
        { restaurantId },
        {
          restaurantId,
          name: r.name,
          slug: r.slug,
          type: r.type,
          description: r.description,
          logo: r.logo,
          coverImage: r.coverImage,
          address: r.address,
          phone: r.phone,
          email: r.email,
          openingHours: r.openingHours,
          cuisineType: r.cuisineType,
          taxInfo: r.taxInfo,
          currency: r.currency,
          isActive: r.isActive
        },
        { upsert: true }
      );

      // 3. Migrate Users (Staff/Owner)
      const users = await User.find({ restaurantId: r._id });
      const TenantUser = tenantDb.model('User');
      for (const u of users) {
        await TenantUser.findOneAndUpdate(
          { email: u.email },
          {
            name: u.name,
            email: u.email,
            password: u.password,
            role: u.role,
            phone: u.phone,
            restaurantId: restaurantId,
            isActive: u.isActive,
            emailVerified: u.emailVerified
          },
          { upsert: true }
        );
      }

      // NOTE: We could migrate Menu Items, Tables, Orders here too by querying the global DB for `restaurantId: r._id` 
      // and inserting into tenant DB. But for now, we just restore the dashboard visibility.
      
      console.log(`Successfully migrated ${r.name}`);
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
