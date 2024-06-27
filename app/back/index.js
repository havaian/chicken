const express = require('express');
const bodyParser = require('body-parser');
const buyerRoutes = require('./buyer/routes');
const courierRoutes = require('./courier/routes');
const warehouseRoutes = require('./warehouse/routes');

const app = express();
app.use(bodyParser.json());

// Use routes
app.use('/buyer', buyerRoutes);
app.use('/couriers', courierRoutes);
app.use('/warehouse', warehouseRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
