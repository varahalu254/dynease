const RestaurantRegistry = require('../models/platform/RestaurantRegistry');
const TenantDatabaseManager = require('../services/TenantDatabaseManager');

/**
 * Middleware to resolve the tenant database based on the subdomain
 * and attach it to req.tenantDb.
 */
module.exports = async (req, res, next) => {
  try {
    let subdomain = req.headers['x-tenant-subdomain'] || null;
    const hostname = req.hostname; // e.g., spicegarden.dynease.in

    if (!subdomain) {
      // Ignore admin and public domain
      if (hostname.includes('admin') || hostname === process.env.BASE_DOMAIN || hostname.includes('www')) {
        return next(); // Proceed without tenant DB attached
      }

      // Extract subdomain
      if (hostname.includes(process.env.BASE_DOMAIN || 'dynease.in')) {
        subdomain = hostname.split('.')[0];
      } else if (hostname.includes('localhost')) {
        subdomain = hostname.split('.')[0];
      }
    }

    if (!subdomain || subdomain === 'localhost' || subdomain === '127' || subdomain === 'admin') {
      return next();
    }

    // Lookup in registry
    const registry = await RestaurantRegistry.findOne({ subdomain, status: 'ACTIVE' });
    if (!registry) {
      return res.status(404).json({ success: false, message: 'Restaurant not found or not active.' });
    }

    // Get database connection
    const tenantDb = await TenantDatabaseManager.getConnection(registry.databaseName);
    
    // Attach to request
    req.tenantDb = tenantDb;
    req.tenantRegistry = registry;

    next();
  } catch (error) {
    console.error('[TenantResolver] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to resolve tenant database' });
  }
};
