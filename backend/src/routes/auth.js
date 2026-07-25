const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { getJwtSecret } = require("../config");
const { createUser, findUserByUsername } = require("../users");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (findUserByUsername(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = createUser({ username, password: hashedPassword });

  return res.status(201).json({
    message: "User registered successfully",
    user: {
      id: newUser.id,
      username: newUser.username,
      subscriptionTier: newUser.subscriptionTier,
    },
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = findUserByUsername(username);

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  try {
    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        subscriptionTier: user.subscriptionTier,
      },
      getJwtSecret(),
      { expiresIn: "1h" }
    );

    return res.json({ accessToken });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
