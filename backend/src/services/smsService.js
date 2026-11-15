const { randomUUID } = require("node:crypto");

const API_URL = "https://api.instsms.com/send-sms";

const normalizeContact = (phone) => {
  let contact = String(phone || "").replace(/\D/g, "");
  if (contact.startsWith("0") && contact.length === 10) {
    contact = `94${contact.slice(1)}`;
  } else if (contact.length === 9) {
    contact = `94${contact}`;
  }
  return contact;
};

const sendSMS = async (to, message) => {
  const userId = process.env.INSTSMS_USER_ID;
  const apiKey = process.env.INSTSMS_API_KEY;
  const senderId = process.env.INSTSMS_SENDER_ID || "INSTSMSDEMO";
  const contact = normalizeContact(to);

  if (!userId || !apiKey) {
    const error = "INSTSMS_USER_ID and INSTSMS_API_KEY must be configured";
    console.error(`SMS failed: ${error}`);
    return { success: false, error };
  }

  if (!contact) {
    const error = "A valid SMS recipient phone number is required";
    console.error(`SMS failed: ${error}`);
    return { success: false, error };
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        user_id: userId,
        api_key: apiKey,
        sender_id: senderId,
        contact,
        message,
      }),
    });

    const responseText = await response.text();
    let responseBody;
    if (responseText) {
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = null;
      }
    }

    if (!response.ok || responseBody?.success === false) {
      const error =
        responseBody?.message ||
        responseBody?.error ||
        `InstSMS request failed with status ${response.status}`;
      console.error(`SMS failed to ${contact}: ${error}`);
      return { success: false, error };
    }

    console.log(`SMS sent to ${contact}`);
    return { success: true };
  } catch (error) {
    console.error(`SMS failed to ${contact}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendSMS;
