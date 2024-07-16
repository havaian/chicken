const express = require("express");
const router = express.Router();
const { findRecordByPhone } = require("./controller"); // Adjust path as per your project structure
const { logger, readLog } = require("./utils/logging");

// Route to find record by phone number
router.get("/find-by-phone/:phoneNumber", async (req, res) => {
  const { phoneNumber } = req.params;

  try {
    const record = await findRecordByPhone(phoneNumber);

    if (!record) {
      return res.status(404).json({ message: "❌ Record not found" });
    }

    res.status(200).json(record);
  } catch (error) {
    logger.info(error);
    res.status(500).json({ message: "❌ Internal server error" });
  }
});

module.exports = router;
