const buyerActivityModel = require("../buyer/activity/model");
const courierActivityModel = require("../courier/activity/model");
const { logger } = require("../utils/logging");

class DeliveryService {
  static async getDeliveryById(deliveryId) {
    try {
      const buyerActivity = await buyerActivityModel.findOne({ 'accepted._id': deliveryId });
      const courierActivity = await courierActivityModel.findOne({ 'delivered_to._id': deliveryId });
      
      if (!buyerActivity && !courierActivity) {
        throw new Error("Delivery not found");
      }

      const buyerDelivery = buyerActivity ? buyerActivity.accepted.find(d => d._id.toString() === deliveryId) : null;
      const courierDelivery = courierActivity ? courierActivity.delivered_to.find(d => d._id.toString() === deliveryId) : null;

      return { buyerActivity: buyerDelivery, courierActivity: courierDelivery };
    } catch (error) {
      logger.error(`Error in getDeliveryById: ${error.message}`);
      throw error;
    }
  }

  static async updateDeliveryById(deliveryId, updateData) {
    try {
      const buyerActivity = await buyerActivityModel.findOne({ 'accepted._id': deliveryId });
      const courierActivity = await courierActivityModel.findOne({ 'delivered_to._id': deliveryId });
      
      if (!buyerActivity && !courierActivity) {
        throw new Error("Delivery not found");
      }

      if (buyerActivity) {
        const buyerDeliveryIndex = buyerActivity.accepted.findIndex(d => d._id.toString() === deliveryId);
        if (buyerDeliveryIndex !== -1) {
          Object.assign(buyerActivity.accepted[buyerDeliveryIndex], updateData.buyerActivity);
          await buyerActivity.save();
        }
      }

      if (courierActivity) {
        const courierDeliveryIndex = courierActivity.delivered_to.findIndex(d => d._id.toString() === deliveryId);
        if (courierDeliveryIndex !== -1) {
          Object.assign(courierActivity.delivered_to[courierDeliveryIndex], updateData.courierActivity);
          await courierActivity.save();
        }
      }

      return { message: "Both activities successfully updated!" };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}

module.exports = DeliveryService;