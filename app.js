import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import transactionRoutes from "./Routers/Transactions.js";
import userRoutes from "./Routers/userRouter.js";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./controllers/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "config", "config.env") });
const app = express();

const port = process.env.PORT || 5000;


const allowedOrigins = [
  "https://main.d1sj7cd70hlter.amplifyapp.com",
  "https://expense-tracker-app-three-beryl.vercel.app",
  // add more origins as needed
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Origin not allowed'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

// Router
app.use("/api/v1", transactionRoutes);
app.use("/api/auth", userRoutes);

// Health check route to debug "Network Error"
app.get("/api/ping", (req, res) => {
  res.status(200).json({ success: true, message: "Server is reachable" });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Global Error Handler (Must be defined after all routes)
app.use(errorHandler);

// Ensure DB is connected before starting the server
connectDB().then(() => {
  const server = app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: Port ${port} is already in use. Please close the other process or use a different PORT in your .env file.`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
    }
  });
}).catch(err => {
  console.error('Failed to connect to database. Server not started.', err);
});
