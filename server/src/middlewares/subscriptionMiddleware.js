const RestaurantRegistry = require('../models/platform/RestaurantRegistry');

exports.checkSubscription = async (req, res, next) => {
  try {
    let registry = req.tenantRegistry;
    
    // If tenantResolver didn't attach it, check slug in params
    if (!registry) {
      const slug = req.params.slug;
      if (slug) {
        registry = await RestaurantRegistry.findOne({ slug });
      }
    }

    if (!registry) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const now = new Date();
    
    // Check if the subscription end date has passed
    if (registry.subscriptionEndDate && new Date(registry.subscriptionEndDate) < now) {
      // Update status if needed (though cron should handle this)
      if (registry.subscriptionStatus !== 'EXPIRED') {
        registry.subscriptionStatus = 'EXPIRED';
        await registry.save();
      }
      return res.status(403).json({ 
        success: false, 
        code: 'SUBSCRIPTION_EXPIRED',
        message: 'The subscription for this restaurant has expired. Ordering is currently disabled.'
      });
    }

    if (registry.subscriptionStatus === 'SUSPENDED' || registry.status === 'SUSPENDED') {
      return res.status(403).json({ 
        success: false, 
        code: 'SUBSCRIPTION_SUSPENDED',
        message: 'This restaurant account is currently suspended.'
      });
    }

    if (registry.subscriptionStatus === 'PENDING' || registry.status === 'PENDING_APPROVAL') {
      return res.status(403).json({ 
        success: false, 
        code: 'SUBSCRIPTION_PENDING',
        message: 'This restaurant account is pending approval.'
      });
    }

    req.subscriptionStatus = registry.subscriptionStatus;
    next();
  } catch (error) {
    console.error('[Subscription Middleware] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while verifying subscription.' });
  }
};
