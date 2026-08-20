// SMS Service – uses Twilio if credentials exist, otherwise mock
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID || null;
const authToken = process.env.TWILIO_AUTH_TOKEN || null;
const fromPhone = process.env.TWILIO_PHONE_NUMBER || null;

let client = null;
if (accountSid && authToken && fromPhone) {
  client = twilio(accountSid, authToken);
}

const sendSMS = async (to, message) => {
  if (client) {
    try {
      await client.messages.create({
        body: message,
        from: fromPhone,
        to: to,
      });
      console.log(`✅ SMS sent to ${to}`);
      return { success: true };
    } catch (err) {
      console.error(`❌ SMS failed to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    // Mock mode – log to console
    console.log(`📱 [MOCK] SMS to ${to}: ${message}`);
    return { success: true, mock: true };
  }
};

module.exports = sendSMS;
