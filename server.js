import app from "./src/app.js";

import connectDB from "./src/config/db.js";

import { env } from "./src/config/env.js";



connectDB();


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// app.listen(env.PORT, () => {

//   console.log(`🚀 Server running on port ${env.PORT}`);

// });
