const mongoose = require("mongoose");

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("DB ✅");
  })
  .catch((error) => {
    console.error("❌ Error connecting to the database:", error);
  });
