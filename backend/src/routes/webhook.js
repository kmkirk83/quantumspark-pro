const express = require("express");

const { getStripeClient, getStripeWebhookSecret } = require("../config");
const { updateUserTier } = require("../users");

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      req.body,
      signature,
      getStripeWebhookSecret()
    );
  } catch (error) {
    console.error(`Webhook Error: ${error.message}`);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = Number.parseInt(session.metadata.userId, 10);
      const newTier = session.metadata.tier;
      const user = updateUserTier(userId, newTier);

      if (user) {
        console.log(`User ${userId} updated to ${newTier} tier.`);
      } else {
        console.error(`User ${userId} not found for subscription update.`);
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return res.send();
});

module.exports = router;
