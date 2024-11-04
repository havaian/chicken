const DeliveryService = require('./deliveryService');
const { logger } = require("../utils/logging");

exports.getDeliveryById = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const result = await DeliveryService.getDeliveryById(deliveryId);
    res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    res.status(404).json({ message: `❌ ${error.message}` });
  }
};

exports.updateDeliveryById = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const result = await DeliveryService.updateDeliveryById(deliveryId, req.body);
    res.status(200).json({ message: `✅ ${result.message}` });
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: `❌ ${error.message}` });
  }
};