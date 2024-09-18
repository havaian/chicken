const buyerActivityModel = require("../buyer/activity/model");
const courierActivityModel = require("../courier/activity/model");

const { logger, readLog } = require("../utils/logging");

exports.getDeliveryById = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const buyerActivity = await buyerActivityModel.findOne({ 'accepted._id': deliveryId });
    const courierActivity = await courierActivityModel.findOne({ 'delivered_to._id': deliveryId });
    if (!buyerActivity && courierActivity) {
      return res.status(404).json({ message: "❌ Delivery not found" });
    }
    const buyerDelivery = buyerActivity.accepted.find(d => d._id.toString() === deliveryId);
    const courierDelivery = courierActivity.delivered_to.find(d => d._id.toString() === deliveryId);
    res.status(200).json({ buyerActivity: buyerDelivery, courierActivity: courierDelivery });
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateDeliveryById = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const buyerActivity = await buyerActivityModel.findOne({ 'accepted._id': deliveryId });
    const courierActivity = await courierActivityModel.findOne({ 'delivered_to._id': deliveryId });
    if (!buyerActivity && courierActivity) {
      return res.status(404).json({ message: "❌ Delivery not found" });
    }
    const buyerDeliveryIndex = buyerActivity.accepted.findIndex(d => d._id.toString() === deliveryId);
    if (buyerDeliveryIndex === -1) {
      return res.status(404).json({ message: "❌ Delivery not found" });
    }
    const courierDeliveryIndex = courierActivity.delivered_to.findIndex(d => d._id.toString() === deliveryId);
    if (courierDeliveryIndex === -1) {
      return res.status(404).json({ message: "❌ Delivery not found" });
    }
    Object.assign(buyerActivity.accepted[buyerDeliveryIndex], req.body.buyerActivity);
    Object.assign(courierActivity.delivered_to[courierDeliveryIndex], req.body.courierActivity);
    await buyerActivity.save();
    await courierActivity.save();
    res.status(200).json({ message: "✅ Both activities successfully updated!" });
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: error.message });
  }
};