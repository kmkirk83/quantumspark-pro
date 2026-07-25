const OpenAI = require("openai");
const Stripe = require("stripe");

const PORT = Number(process.env.PORT || 5000);
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_12345",
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_67890",
};

let openaiClient;
let stripeClient;

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

function getStripeWebhookSecret() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return process.env.STRIPE_WEBHOOK_SECRET;
}

module.exports = {
  FRONTEND_BASE_URL,
  PORT,
  PRICE_IDS,
  getJwtSecret,
  getOpenAIClient,
  getStripeClient,
  getStripeWebhookSecret,
};
