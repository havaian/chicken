const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const excelController = require('./controller');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route for Excel file upload and processing
router.post('/extract', upload.single('file'), excelController.extractData.bind(excelController));

module.exports = router;