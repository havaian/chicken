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

// Middleware to capture and log request and response details
app.use((req, res, next) => {
  const allowedHost = ["http://141.98.153.217:5173/"];  


  // Check if the Host header matches the allowed host
  if (req.headers.host !== "127.0.0.1:16004" && req.headers.host !== "141.98.153.217:16004" && req.headers.host !== "back:16004" && !allowedHost.includes(req.headers.referer)) {
    res.status(403).json({ error: "Forbidden: Access is denied." });
    return;
  }

  // Middleware to log request and response details
  const originalSend = res.send;

  res.send = function (data) {
    res.locals.body = data;
    originalSend.call(this, data);
  };

  res.on('finish', () => {
    logger.info(`Request Headers: ${JSON.stringify(req.headers)}`);
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
    logger.info(`Response Data: ${res.locals.body}`);
  });

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
