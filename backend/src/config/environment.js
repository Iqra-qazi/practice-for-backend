const requiredServerVariables = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "CLIENT_URL",
  "CRON_SECRET",
  "ADMIN_SEED_EMAIL",
  "ADMIN_SEED_PASSWORD",
  "SMS_API_KEY",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
];

export function validateServerEnvironment(env = process.env) {
  const missing = requiredServerVariables.filter(
    (name) => typeof env[name] !== "string" || !env[name].trim(),
  );

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}.`);
  }

  return env;
}

export { requiredServerVariables };
