const Courier = require("./courier/model");
const Warehouse = require("./warehouse/model");

// Function to find a record with a specific phone number
exports.findRecordByPhone = async (phoneNumber) => {
  try {
    // Search in Courier collection
    const courierRecord = await Courier.findOne({ phone_num: phoneNumber });
    if (courierRecord) {
      return { ...courierRecord.toObject(), userType: "courier" };
    }

    // Search in Warehouse collection if not found in Courier
    const warehouseRecord = await Warehouse.findOne({ phone_num: phoneNumber });
    if (warehouseRecord) {
      return { ...warehouseRecord.toObject(), userType: "warehouse" };
    }

    return null; // Return null if not found in both collections
  } catch (error) {
    console.error("Error finding record:", error);
    return null;
  }
};
