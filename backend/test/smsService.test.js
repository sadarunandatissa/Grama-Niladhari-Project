const assert = require("node:assert/strict");
const { test } = require("node:test");
const sendSMS = require("../src/services/smsService");

const preserveSMSConfig = (t) => {
  const originalConfig = {
    INSTSMS_USER_ID: process.env.INSTSMS_USER_ID,
    INSTSMS_API_KEY: process.env.INSTSMS_API_KEY,
    INSTSMS_SENDER_ID: process.env.INSTSMS_SENDER_ID,
  };
  const originalFetch = global.fetch;

  t.after(() => {
    for (const [key, value] of Object.entries(originalConfig)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    global.fetch = originalFetch;
  });
};

test("sends SMS through InstSMS with normalized contact and configured credentials", async (t) => {
  preserveSMSConfig(t);
  process.env.INSTSMS_USER_ID = "test-user";
  process.env.INSTSMS_API_KEY = "test-key";
  delete process.env.INSTSMS_SENDER_ID;

  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true }),
    };
  };

  assert.deepEqual(await sendSMS("0771234567", "Test message"), {
    success: true,
  });
  assert.equal(request.url, "https://api.instsms.com/send-sms");
  assert.match(
    request.options.headers["Idempotency-Key"],
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  );
  assert.deepEqual(JSON.parse(request.options.body), {
    user_id: "test-user",
    api_key: "test-key",
    sender_id: "INSTSMSDEMO",
    contact: "94771234567",
    message: "Test message",
  });
});

test("reports provider and configuration failures instead of treating them as sent", async (t) => {
  preserveSMSConfig(t);
  process.env.INSTSMS_USER_ID = "test-user";
  process.env.INSTSMS_API_KEY = "test-key";

  global.fetch = async () => ({
    ok: false,
    status: 401,
    text: async () => JSON.stringify({ message: "Unauthorized" }),
  });
  assert.equal((await sendSMS("0771234567", "Test message")).success, false);

  delete process.env.INSTSMS_API_KEY;
  global.fetch = async () => {
    assert.fail("InstSMS must not be called without credentials");
  };
  assert.equal((await sendSMS("0771234567", "Test message")).success, false);
});
