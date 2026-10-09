const cron = require('node-cron');
const RestaurantRegistry = require('../models/platform/RestaurantRegistry');
const whatsapp = require('../utils/whatsapp'); // Assuming whatsapp is available for sending messages

// Run every day at midnight (UTC)
const initSubscriptionJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[SubscriptionJob] Running daily subscription check...');
    try {
      const now = new Date();
      // Fetch all non-cancelled, non-suspended restaurants
      const registries = await RestaurantRegistry.find({
        status: { $nin: ['SUSPENDED', 'REJECTED'] },
        subscriptionStatus: { $nin: ['CANCELLED'] }
      });

      for (const registry of registries) {
        if (!registry.subscriptionEndDate) continue;

        const endDate = new Date(registry.subscriptionEndDate);
        const diffMs = endDate - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        
        let needsSave = false;

        // Ensure remindersSent object exists
        if (!registry.remindersSent) {
          registry.remindersSent = { sevenDay: false, threeDay: false, oneDay: false, expired: false };
          needsSave = true;
        }

        // Expired
        if (diffDays <= 0) {
          if (registry.subscriptionStatus !== 'EXPIRED') {
            registry.subscriptionStatus = 'EXPIRED';
            needsSave = true;
          }
          if (!registry.remindersSent.expired) {
            await sendReminder(registry, 'EXPIRED', diffDays);
            registry.remindersSent.expired = true;
            needsSave = true;
          }
        } 
        // 1 Day Reminder
        else if (diffDays === 1 && !registry.remindersSent.oneDay) {
          await sendReminder(registry, '1_DAY', diffDays);
          registry.remindersSent.oneDay = true;
          needsSave = true;
        } 
        // 3 Day Reminder
        else if (diffDays <= 3 && diffDays > 1 && !registry.remindersSent.threeDay) {
          await sendReminder(registry, '3_DAYS', diffDays);
          registry.remindersSent.threeDay = true;
          needsSave = true;
        } 
        // 7 Day Reminder
        else if (diffDays <= 7 && diffDays > 3 && !registry.remindersSent.sevenDay) {
          await sendReminder(registry, '7_DAYS', diffDays);
          registry.remindersSent.sevenDay = true;
          needsSave = true;
        }

        if (needsSave) {
          await registry.save();
        }
      }
      console.log('[SubscriptionJob] Daily check complete.');
    } catch (error) {
      console.error('[SubscriptionJob] Error during job execution:', error);
    }
  });
};

const sendReminder = async (registry, type, days) => {
  if (!registry.ownerPhone) return;

  let message = '';
  switch (type) {
    case '7_DAYS':
      message = `Hello from Dynease. Your ${registry.selectedPlan} subscription for ${registry.restaurantName} will expire in 7 days. Please login to your dashboard to renew.`;
      break;
    case '3_DAYS':
      message = `URGENT: Your Dynease subscription for ${registry.restaurantName} expires in ${days} days. Renew soon to avoid interruption of orders!`;
      break;
    case '1_DAY':
      message = `FINAL NOTICE: Your Dynease subscription for ${registry.restaurantName} expires TOMORROW. Please renew immediately to keep your online menu active.`;
      break;
    case 'EXPIRED':
      message = `Your Dynease subscription for ${registry.restaurantName} has EXPIRED. Online ordering has been disabled. Login to renew and reactivate your services.`;
      break;
  }

  try {
    if (message) {
      await whatsapp.sendTextMessage(registry.ownerPhone, message);
      console.log(`[SubscriptionJob] Sent ${type} reminder to ${registry.restaurantName}`);
    }
  } catch (error) {
    console.error(`[SubscriptionJob] Failed to send ${type} reminder to ${registry.restaurantName}:`, error.message);
  }
};

module.exports = { initSubscriptionJobs };
