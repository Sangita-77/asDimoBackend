import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { rateLimit } from "./middlewares/rateLimit.middleware.js";

const app = express();

app.use(helmet());

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.use("/api", routes);

app.use("/uploads", express.static("uploads"));

// Global Error Handler
app.use(errorMiddleware);

export default app;