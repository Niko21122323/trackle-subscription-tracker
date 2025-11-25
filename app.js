import express from "express";
import path from "path";
import { PORT } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import workflowRouter from "./routes/workflow.routes.js";
import connectToDatabase from "./database/mongobd.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import authorize from "./middlewares/auth.middleware.js";

const app = express();

// Body + Cookie parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Arcjet only for API endpoints
app.use("/api", arcjetMiddleware);

// API Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/workflows", workflowRouter);

// Serve static files
app.use(express.static("public"));

// HTML Routes
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "pages", "login.html"));
});

app.get("/signup.html", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "pages", "signup.html"));
});

// 🔐 Protected dashboard
app.get("/dashboard.html", authorize, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "pages", "dashboard.html"));
});

// Public home page
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// Error handler
app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(`Subscription tracker is running on http://localhost:${PORT}`);
  await connectToDatabase();
});

export default app;
