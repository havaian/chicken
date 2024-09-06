const express = require("express");
const bodyParser = require("body-parser");
const buyerRoutes = require("./buyer/routes");
const courierRoutes = require("./courier/routes");
const warehouseRoutes = require("./warehouse/routes");
const importerRoutes = require("./importer/routes");
// const adminRoutes = require("./admin/routes");
const { logger, readLog } = require("./utils/logging");

const app = express();
app.use(bodyParser.json());

const morgan = require("morgan");
const cookieParser = require("cookie-parser");

require("dotenv").config();
require("./db");

const cors = require("cors");
var corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

// Create a stream object with a "write" function that `morgan` can use
const log4jsStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Set up `morgan` to use `log4js` stream
app.use(morgan("dev", { stream: log4jsStream }));

// Import the necessary modules
const crypto = require('crypto');

// Middleware to capture and log request and response details
app.use((req, res, next) => {
  // Only apply this middleware if the request is not GET /
  if (!(req.method === 'GET' && req.path === '/')) {
    let isAuthenticated = false;

    // Function to generate hash
    const generateHash = (login, password) => {
      return crypto.createHash('sha256').update(`${login}:${password}`).digest('hex');
    };

    // Check for the auth header
    const authHash = req.headers['x-auth-hash'];
    const expectedHash = generateHash(process.env.API_LOGIN, process.env.API_PASSWORD);

    if (authHash === expectedHash) {
      isAuthenticated = true;
    } else {
      // If x-auth-hash is not present or invalid, check for basic auth
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const user = auth[0];
        const pass = auth[1];

        if (user === process.env.API_LOGIN && pass === process.env.API_PASSWORD) {
          isAuthenticated = true;
        }
      }
    }

    if (!isAuthenticated) {
      res.status(401).json({ error: "Unauthorized: Access denied." });
      return;
    }

    // Middleware to log request and response details
    const originalSend = res.send;

    res.send = function (data) {
      res.locals.body = data;
      originalSend.call(this, data);
    };

    res.on('finish', () => {
      if (!req.url.includes('all')) {
        logger.info(`Request Headers: ${JSON.stringify(req.headers)}`);
        logger.info(`Request Body: ${JSON.stringify(req.body)}`);
        logger.info(`Response Data: ${res.locals.body}`);
      }
    });
  }

  next();
});

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({
    chicken_back: "It's working! 🙌",
  });
});

app.get("/logging", (req, res) => {
  try {
    const result = readLog();
    res.set("Content-Type", "text/plain");
    return res.send(result);
  } catch(e) {
    return res.sendStatus(500);
  }
});

// Use routes
app.use("/buyer", buyerRoutes);
app.use("/courier", courierRoutes);
app.use("/warehouse", warehouseRoutes);
app.use("/importer", importerRoutes);
// app.use("/admin", adminRoutes);
app.use(require("./routes"));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`${PORT} ✅`);
});
