const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const morgan    = require("morgan");

const authRoutes    = require("./routes/authRoutes");
const userRoutes    = require("./routes/userRoutes");
const tripRoutes    = require("./routes/tripRoutes");
const matchRoutes   = require("./routes/matchRoutes");
const chatRoutes    = require("./routes/chatRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware");

const app = express();

app.use(helmet({
  contentSecurityPolicy:     false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy:   false,
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));
app.options("*", cors());

app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth",     authRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/trips",    tripRoutes);
app.use("/api/matches",  matchRoutes);
app.use("/api/chats",    chatRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/health", (_req, res) =>
  res.json({ status: "OK", port: process.env.PORT || 5002 })
);

app.use(notFound);
app.use(errorHandler);

module.exports = app;