import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());

app.use(cors());
app.use(express.json());

app.use("/api", routes);

// Global Error Handler
app.use(errorMiddleware);

export default app;