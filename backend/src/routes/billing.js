const express = require("express");

const { FRONTEND_BASE_URL, PRICE_IDS, getStripeClient } = require("../config");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  const { tier } = req.body;
  const userId = req.user.id;
  const priceId = PRICE_IDS[tier];

  if (!priceId) {
    return res.status(400).json({ error: "Invalid subscription tier" });
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${FRONTEND_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_BASE_URL}/cancel`,
      metadata: {
        userId: String(userId),
        tier,
      },
    });

    return res.json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
