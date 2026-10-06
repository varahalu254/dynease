const crypto = require('crypto');
const RestaurantRegistry = require('../models/platform/RestaurantRegistry');
const TenantDatabaseManager = require('./TenantDatabaseManager');

class RestaurantProvisioningService {
  
  /**
   * Generates an immutable, URL-safe restaurant ID
   */
  generateRestaurantId() {
    return `rest_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Determines the database name from the restaurant subdomain
   */
  getDatabaseName(subdomain) {
    // Replace any remaining non-alphanumeric characters with underscores
    const safeSubdomain = subdomain.replace(/[^a-z0-9]/g, '_');
    return `dynease_${safeSubdomain}`;
  }

  /**
   * Main idempotent workflow to provision a new restaurant from a registration
   */
  async provisionRestaurant(registration) {
    console.log(`[Provisioning] Starting provisioning for ${registration.restaurantName}`);
    
    // Check if registry already exists (Idempotency)
    let registry = await RestaurantRegistry.findOne({ subdomain: registration.subdomain });
    
    let restaurantId;
    let databaseName;

    if (registry) {
      if (registry.databaseProvisioned) {
        console.log(`[Provisioning] Database already provisioned for ${registration.subdomain}`);
        return registry;
      }
      restaurantId = registry.restaurantId;
      databaseName = registry.databaseName;
      registry.status = 'PROVISIONING';
      await registry.save();
    } else {
      restaurantId = this.generateRestaurantId();
      databaseName = this.getDatabaseName(registration.subdomain);
      
      // Create Registry Record
      registry = new RestaurantRegistry({
        restaurantId,
        restaurantName: registration.restaurantName,
        slug: registration.subdomain, // Using subdomain as slug for simplicity
        subdomain: registration.subdomain,
        databaseName,
        ownerEmail: registration.ownerEmail || `${registration.subdomain}@temp.com`,
        ownerName: registration.ownerName,
        ownerPhone: registration.ownerPhone,
        status: 'PROVISIONING',
        selectedPlan: registration.selectedPlan,
        subscriptionStatus: 'TRIAL',
        approvedAt: new Date()
      });
      await registry.save();
    }

    try {
      // Create Database & Collections
      const tenantDb = await TenantDatabaseManager.getConnection(databaseName);
      
      // Get models for this tenant
      const User = tenantDb.model('User');
      const RestaurantProfile = tenantDb.model('RestaurantProfile');

      // Create Restaurant Profile (upsert for idempotency)
      await RestaurantProfile.findOneAndUpdate(
        { restaurantId },
        {
          restaurantId,
          name: registration.restaurantName,
          slug: registration.subdomain,
          type: registration.restaurantType || 'Restaurant',
          phone: registration.ownerPhone,
          isActive: true
        },
        { upsert: true, new: true }
      );

      // Create Owner Account (upsert for idempotency)
      // Since we don't have the original plaintext password, we assume ownerPassword is encrypted.
      // Wait, the registration model stores it temporarily.
      await User.findOneAndUpdate(
        { email: registry.ownerEmail },
        {
          name: registration.ownerName || 'Restaurant Owner',
          email: registry.ownerEmail,
          password: registration.ownerPassword, // Already hashed from registration
          role: 'RESTAURANT_OWNER',
          phone: registration.ownerPhone,
          restaurantId,
          isActive: true,
          emailVerified: true
        },
        { upsert: true, new: true }
      );

      // Create Owner Account in Global Platform DB (so they exist in 'users' collection)
      const GlobalUser = require('../models/User');
      await GlobalUser.findOneAndUpdate(
        { email: registry.ownerEmail },
        {
          name: registration.ownerName || 'Restaurant Owner',
          email: registry.ownerEmail,
          password: registration.ownerPassword, // Already hashed
          role: 'RESTAURANT_OWNER',
          phone: registration.ownerPhone,
          isActive: true,
          emailVerified: true
        },
        { upsert: true, new: true }
      );

      // Mark Provisioning Complete
      registry.databaseProvisioned = true;
      registry.databaseProvisionedAt = new Date();
      registry.status = 'ACTIVE';
      await registry.save();

      console.log(`[Provisioning] Successfully provisioned ${registration.restaurantName}`);
      return registry;
    } catch (err) {
      console.error(`[Provisioning] Failed for ${registration.subdomain}:`, err);
      registry.status = 'PROVISIONING_FAILED';
      await registry.save();
      throw err;
    }
  }
}

module.exports = new RestaurantProvisioningService();
