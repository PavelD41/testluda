const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");
const app = express();
const port = 3000;
require("dotenv").config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// In-memory storage for demo purposes
const users = new Map();
const games = new Map();
const payments = new Map();

app.use(express.json());
app.use(cors());

// Handle pre-checkout queries
bot.on("pre_checkout_query", (query) => {
  bot.answerPreCheckoutQuery(query.id, true).catch(() => {
    console.error("answerPreCheckoutQuery failed");
  });
});

// Handle successful payments
bot.on("message", (msg) => {
  if (msg.successful_payment) {
    const userId = msg.from.id;
    const payment = {
      chargeId: msg.successful_payment.telegram_payment_charge_id,
      amount: msg.successful_payment.total_amount,
      currency: msg.successful_payment.currency,
      timestamp: new Date().toISOString()
    };
    
    payments.set(userId, payment);
    
    // Add funds to user balance
    const user = users.get(userId) || { balance: 0, bets: [] };
    user.balance += msg.successful_payment.total_amount / 100; // Convert from stars
    users.set(userId, user);
    
    bot.sendMessage(msg.chat.id, `✅ Payment successful! Your balance is now ${user.balance.toFixed(2)} TON`);
  }
});

// Handle /balance command
bot.onText(/\/balance/, (msg) => {
  const userId = msg.from.id;
  const user = users.get(userId) || { balance: 0 };
  bot.sendMessage(msg.chat.id, `Your balance: ${user.balance.toFixed(2)} TON`);
});

// Handle /status command
bot.onText(/\/status/, (msg) => {
  const userId = msg.from.id;
  const message = payments.has(userId)
    ? "You have made payments"
    : "You have not made any payments yet";
  bot.sendMessage(msg.chat.id, message);
});

// Create invoice link for top-up
app.post("/api/createInvoiceLink", async (req, res) => {
  const { amount, description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, error: "Invalid amount." });
  }

  try {
    const title = `Top-up ${amount} TON`;
    const payload = `topup_${Date.now()}_${req.body.userId || 'anonymous'}`;
    const providerToken = process.env.TELEGRAM_TOKEN;
    const currency = "XTR";
    const prices = [{ label: `${amount} TON`, amount: amount * 100 }]; // Convert to stars

    const invoiceLink = await bot.createInvoiceLink(
      title,
      description || `Top-up balance with ${amount} TON`,
      payload,
      providerToken,
      currency,
      prices
    );

    res.json({ success: true, invoiceLink });
  } catch (error) {
    console.error("Error creating invoice link:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user balance
app.get("/api/balance/:userId", (req, res) => {
  const { userId } = req.params;
  const user = users.get(userId) || { balance: 0 };
  res.json({ success: true, balance: user.balance });
});

// Update user balance (for game winnings)
app.post("/api/balance/:userId", (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;
  
  const user = users.get(userId) || { balance: 0, bets: [] };
  user.balance += amount;
  users.set(userId, user);
  
  res.json({ success: true, balance: user.balance });
});

// Save game data
app.post("/api/game", (req, res) => {
  const { gameId, bets, winner } = req.body;
  games.set(gameId, { bets, winner, timestamp: new Date().toISOString() });
  res.json({ success: true });
});

// Get game history
app.get("/api/games/:userId", (req, res) => {
  const { userId } = req.params;
  const userGames = Array.from(games.values()).filter(game => 
    game.bets.some(bet => bet.userId === userId)
  );
  res.json({ success: true, games: userGames });
});

bot.startPolling();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
