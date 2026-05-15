// File: server/index.js
require("dotenv").config();

const http              = require("http");
const app               = require("./app");
const connectDB         = require("./config/db");
const { initSocket }    = require("./services/socketService");

const PORT = process.env.PORT || 5000;

async function start() {
  // 1. Connect to MongoDB first
  await connectDB();

  // 2. Create HTTP server and attach Socket.io
  const server = http.createServer(app);
  initSocket(server);

  // 3. Start listening
  server.listen(PORT, () => {
    console.log("\n========================================");
    console.log(`  ✈️  TravelBuddy API is running!`);
    console.log(`  🌐  http://localhost:${PORT}`);
    console.log(`  📡  ENV: ${process.env.NODE_ENV || "development"}`);
    console.log("========================================\n");
  });

  // Graceful shutdown
  process.on("SIGTERM", () => server.close(() => process.exit(0)));
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled rejection:", err.message);
    server.close(() => process.exit(1));
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
