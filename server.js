import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { env } from "./src/config/env.js";

connectDB();

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
});