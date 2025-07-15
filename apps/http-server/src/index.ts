import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { Authrouter } from "./routes/auth";
import { Userrouter } from "./routes/user";
import PostRouter from "./routes/post";
import BlogRouter from "./routes/blog";
import Message_Router from "./routes/message";

// Load env variables
dotenv.config();
const PORT = 9000;
const app = express();


// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());


// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

// Apply message rate limiter
const MessageRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 10 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many messages sent from this IP, please try again later.',
  },
});



app.use(limiter);

// Routes
app.use("/api/auth", Authrouter);
app.use("/api/user", Userrouter);
app.use("/api/post", PostRouter);
app.use("/api/blog", BlogRouter);
app.use("/api",MessageRateLimiter,Message_Router);

// Server start
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
