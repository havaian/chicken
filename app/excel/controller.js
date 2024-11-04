const ExcelJS = require('exceljs');
const fs = require('fs').promises;
const path = require('path');

const axios = require("../services/axios");

const { logger } = require("../utils/logging");

const { getPrices } = require("../buyer/activity/controller");

const DeliveryService = require('../general/deliveryService');

const { CourierService } = require('../courier/controller');

const { updateActivity } = require('../courier/activity/controller');

class ExcelController {
  constructor() {
    this.extractData = this.extractData.bind(this);
    this.prices = getPrices();
  }

  async extractData(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const result = await this.parseExcelFile(filePath);

      // Remove the temporary file after processing
      await fs.unlink(filePath);

      // Submit extracted data to DeliveryService
      const updateResults = await this.submitExtractedData(result.activities);

      // Update courier activity with additional info
      const courierActivityUpdateResult = await this.updateCourierActivity(result.activityId, result.additionalInfo);

      // Get the courier ID from the updated activity
      const courierId = courierActivityUpdateResult.courier;

      // Use CourierService to get courier details
      const courierDetails = await CourierService.getCourierById(courierId);

      const reportData = {
        data: courierActivityUpdateResult,
        phone_num: courierDetails.phone_num,
        full_name: courierDetails.full_name,
        message: "Kuryer ekzel qayta yuklandi"
      }

      const reportGenerated = await axios.post("/report/generate-courier-report", reportData);

      if (reportGenerated.status === 200) {
        res.status(200).json({ message: "Kuryer ma’lumotlari muvvafaqiyatli o’zgartirildi!" });
      }
    } catch (error) {
      console.error('Error extracting data:', error);
      res.status(500).json({ error: 'An error occurred while processing the file', details: error.message });
    }
  }

  async updateCourierActivity(activityId, additionalInfo) {
    try {
      const updatedActivity = await updateActivity(activityId, additionalInfo);

      return updatedActivity;
    } catch (error) {
      logger.error(error);
      return {
        error: "Failed to update courier activity",
        details: error.message
      };
    }
  }

  async submitExtractedData(activities) {
    const updateResults = [];
    for (const activity of activities) {
      const deliveryId = activity.courierActivity._id; // Assuming this is the correct ID to use
      try {
        const result = await DeliveryService.updateDeliveryById(deliveryId, {
          buyerActivity: activity.buyerActivity,
          courierActivity: activity.courierActivity
        });
        updateResults.push({ deliveryId, status: 'success', message: result.message });
      } catch (error) {
        logger.error(`Error updating delivery ${deliveryId}: ${error.message}`);
        updateResults.push({ deliveryId, status: 'error', message: error.message });
      }
    }
    return updateResults;
  }

  async parseExcelFile(filePath) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);
 
      const activityData = this.extractActivityData(worksheet);
      const additionalInfo = this.extractAdditionalInfo(worksheet);

      const pairedActivities = this.createPairedActivities(activityData);

      return {
        activities: pairedActivities,
        additionalInfo: additionalInfo.info,
        activityId: additionalInfo.activityId
      };
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw error;
    }
  }

  extractActivityData(worksheet) {
    const data = {};
    worksheet.eachRow((row, rowNumber) => {
      const idCell = row.getCell(1);
      
      if (idCell.value && typeof idCell.value === 'string' && idCell.value.length === 36) {
        data[idCell.value] = data[idCell.value] || [];
        const rowData = {
          id: idCell.value,
          category: row.getCell(4).value,
          amount: row.getCell(5).value,
          price: row.getCell(6).value,
          payment: row.getCell(8).value,
          debt: row.getCell(9).value
        };
        data[idCell.value].push(rowData);
      }
    });
    return data;
  }

  extractAdditionalInfo(worksheet) {
    const info = {};
    const categories = Object.keys(this.prices);
    const activityId = worksheet.getCell('A2').value;

    let categoryRow;
    worksheet.eachRow((row, rowNumber) => {
      const firstCell = row.getCell(1).value;
      if (firstCell === '№') {
        categoryRow = rowNumber;
      }

      const label = row.getCell(3).value;
      if (label) {
        switch (label) {
          case 'Qolgan maxsulot soni':
            info.current_by_courier = this.extractCategoryValues(row, categories);
            break;
          case 'Nasechka maxsulot soni':
            info.incision = this.extractCategoryValues(row, categories);
            break;
          case 'Melanj':
            info.melange_by_courier = this.extractCategoryValues(row, categories);
            break;
        }
      }

      const additionalLabel = row.getCell(8).value;
      if (additionalLabel) {
        switch (additionalLabel) {
          case "Umumiy yig'ilgan pul:":
            info.earnings = this.parseNumericValue(row.getCell(9).value);
            break;
          case 'Chiqim:':
            info.expenses = this.parseNumericValue(row.getCell(9).value);
            break;
          case 'Kassa topshirildi:':
            info.money_by_courier = this.parseNumericValue(row.getCell(9).value);
            break;
        }
      }
    });

    return { info, activityId };
  }

  extractCategoryValues(row, categories) {
    const values = {};
    categories.forEach((category, index) => {
      values[category] = this.parseNumericValue(row.getCell(index + 4).value);
    });
    return values;
  }

  labelToKey(label) {
    const map = {
      'Umumiy yig\'ilgan pul:': 'earnings',
      'Chiqim:': 'expenses',
      'Kassa topshirildi:': 'money_by_courier'
    };
    return map[label] || label.toLowerCase().replace(/\s+/g, '_');
  }

  createPairedActivities(activityData) {
    return Object.entries(activityData).map(([id, deliveries]) => ({
      courierActivity: this.createCourierActivity(id, deliveries),
      buyerActivity: this.createBuyerActivity(id, deliveries)
    }));
  }

  createBuyerActivity(id, deliveries) {
    const eggs = deliveries.map(item => ({
      category: item.category,
      amount: this.parseNumericValue(item.amount),
      price: this.parseNumericValue(item.price),
      _id: "" // We don't have this information
    }));

    const payment = deliveries.reduce((sum, item) => sum + this.parseNumericValue(item.payment), 0);
    const debt = this.parseNumericValue(deliveries[0].debt);

    return {
      _id: id,
      eggs: eggs,
      payment: payment,
      debt: debt,
      time: new Date().toLocaleString() // Assuming current time as it's not in the Excel
    };
  }

  createCourierActivity(id, deliveries) {
    const eggs = deliveries.map(item => ({
      category: item.category,
      amount: this.parseNumericValue(item.amount),
      price: this.parseNumericValue(item.price),
      _id: "" // We don't have this information
    }));

    const payment = deliveries.reduce((sum, item) => sum + this.parseNumericValue(item.payment), 0);
    const debt = this.parseNumericValue(deliveries[0].debt);

    return {
      _id: id,
      eggs: eggs,
      payment: payment,
      debt: debt,
      time: new Date().toLocaleString() // Assuming current time as it's not in the Excel
    };
  }

  parseNumericValue(value, categoryName) {
    if (value === null || value === undefined || value === "") {
      return 0;
    }
    if (typeof value === 'string' && value.includes('(')) {
      value = value.split(' ')[0];
    }
    return parseFloat(value.toString().replace(/,/g, '')) || 0;
  }
}

module.exports = new ExcelController();