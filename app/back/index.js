const express = require("express");
const bodyParser = require("body-parser");
const buyerRoutes = require("./buyer/routes");
const courierRoutes = require("./courier/routes");
const warehouseRoutes = require("./warehouse/routes");

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

// set up route logger tools
app.use(morgan("dev"));
app.use((req, res, next) => {
  console.log(Date(Date.now()));
  console.log(req.headers.origin || req.connection.remoteAddress);
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

// Use routes
app.use("/buyer", buyerRoutes);
app.use("/courier", courierRoutes);
app.use("/warehouse", warehouseRoutes);
app.use(require("./routes"));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`${PORT} ✅`);
});
