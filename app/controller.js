const Courier = require("./courier/model");
const Warehouse = require("./warehouse/model");
const { logger, readLog } = require("./utils/logs");

// Function to standardize phone number
const standardizePhoneNumber = (phoneNumber) => {
  return phoneNumber.replace(/\D/g, "").replace(/^998/, "").replace(/^9/, "");
};

// Function to find a record with a specific phone number
exports.findRecordByPhone = async (phoneNumber) => {
  try {
    const standardizedPhoneNumber = standardizePhoneNumber(phoneNumber);

    // Search in Courier collection
    const courierRecord = await Courier.findOne({
      phone_num: new RegExp(standardizedPhoneNumber + "$"),
    });
    if (courierRecord) {
      return { ...courierRecord.toObject(), userType: "courier" };
    }

    // Search in Warehouse collection if not found in Courier
    const warehouseRecord = await Warehouse.findOne({
      phone_num: { $elemMatch: { $regex: new RegExp(standardizedPhoneNumber + "$") } },
    });
    if (warehouseRecord) {
      return { ...warehouseRecord.toObject(), userType: "warehouse" };
    }

    return null; // Return null if not found in both collections
  } catch (error) {
    logger.info("Error finding record:", error);
    return null;
  }
};
