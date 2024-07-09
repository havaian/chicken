const mongoose = require("mongoose");
const { logger, readLog } = require("./utils/logs");

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    logger.info("DB ✅");
  })
  .catch((error) => {
    logger.info("❌ Error connecting to the database:", error);
  });
