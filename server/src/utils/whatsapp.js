/**
 * WhatsApp integration utility using SwiftProject WhatsApp Gateway
 */


const WHATSAPP_URL = process.env.WHATSAPP_URL || 'https://wg.swiftproject.in/api/send';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

/**
 * Format and sanitize phone numbers (removes '+', spaces, hyphens).
 * @param {string} phone
 * @returns {string}
 */
const sanitizePhone = (phone) => {
  let clean = phone.replace(/[\s+\-()]/g, '');
  if (clean.length === 10) {
    clean = '91' + clean;
  }
  return clean;
};

/**
 * Core function to send requests to WhatsApp API
 * @param {Object} payload 
 */
const sendToWhatsAppAPI = async (payload) => {
  if (!WHATSAPP_TOKEN) {
    console.warn('WHATSAPP_TOKEN is not set. Skipping WhatsApp message.');
    return null;
  }

  try {
    const response = await fetch(WHATSAPP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 429) {
        const { code, retryAfter, dailyLimit, usedToday } = data;
        if (code === 'RATE_LIMIT_EXCEEDED') {
          throw new Error(`WhatsApp API rate limit exceeded. Retry after ${retryAfter}s.`);
        } else if (code === 'DAILY_LIMIT_EXCEEDED') {
          throw new Error(`WhatsApp API daily limit reached (${usedToday}/${dailyLimit}).`);
        }
      }
      throw new Error(`WhatsApp API error: ${JSON.stringify(data)}`);
    }

    if (data.quota) {
      console.log(`WhatsApp Quota remaining today: ${data.quota.dailyRemaining}`);
    }
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.message);
    throw new Error('Failed to send WhatsApp message');
  }
};

/**
 * Send a simple text message.
 * @param {string} phone 
 * @param {string} text 
 */
exports.sendTextMessage = async (phone, text) => {
  const payload = {
    phone: sanitizePhone(phone),
    message: text
  };
  return sendToWhatsAppAPI(payload);
};

/**
 * Send an image with optional caption.
 * @param {string} phone 
 * @param {string} imageUrl 
 * @param {string} [caption] 
 */
exports.sendImage = async (phone, imageUrl, caption = '') => {
  const payload = {
    phone: sanitizePhone(phone),
    attachment: {
      url: imageUrl,
      contentType: 'image/jpeg'
    },
    message: caption
  };
  return sendToWhatsAppAPI(payload);
};
