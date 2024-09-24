const fs = require('fs').promises;
const path = require('path');
const Excel = require('exceljs');
const moment = require('moment-timezone');
const Buyer = require("../../model");
const DailyBuyerActivity = require("../model");
const { logger } = require('../../../utils/logging');

const REPORTS_DIR = path.join(__dirname, './reports/buyer');

async function ensureReportsDirectory() {
  try {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
  } catch (error) {
    logger.error('Error creating reports directory:', error);
  }
}

async function generateAndSaveReport(year, month) {
  const fileName = `monthly_report_${year}_${month}.xlsx`;
  const filePath = path.join(REPORTS_DIR, fileName);

  // Check if the file already exists
  try {
    await fs.access(filePath);
    return filePath; // File exists, return the path
  } catch (error) {
    // File doesn't exist, generate it
  }

  const startDate = moment.tz(`${year}-${month}-01`, "Asia/Tashkent").startOf('month');
  const endDate = moment(startDate).endOf('month');

  // Fetch all buyers
  const buyers = await Buyer.find({ deleted: false }).sort('full_name');

  // Fetch all activities for the month
  const activities = await DailyBuyerActivity.find({
    date: {
      $gte: startDate.toDate(),
      $lte: endDate.toDate()
    }
  }).populate('buyer', 'full_name');

  // Create a new workbook and worksheet
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Monthly Report');

  // Set up the headers
  worksheet.columns = [
    { header: 'Mijoz', key: 'buyer', width: 30 },
    ...Array.from({ length: endDate.date() }, (_, i) => ({
      header: i + 1,
      key: `day${i + 1}`,
      width: 20
    }))
  ];

  // Add buyer rows
  buyers.forEach(buyer => {
    worksheet.addRow({ buyer: buyer.full_name });
  });

  // Fill in the activities
  activities.forEach(activity => {
    const rowIndex = worksheet.getColumn('A').values.findIndex(v => v === activity.buyer.full_name);
    if (rowIndex > 0) {
      const day = moment(activity.date).date();
      const columnKey = `day${day}`;
      
      let cellContent = '';
      activity.accepted.forEach(acceptance => {
        acceptance.eggs.forEach(egg => {
          if (egg.amount > 0) {
            cellContent += `${egg.category}: ${egg.amount}\n`;
          }
        });
      });
      
      const lastAcceptance = activity.accepted[activity.accepted.length - 1];
      cellContent += `Payment: ${lastAcceptance.payment}\n`;
      cellContent += `Debt: ${lastAcceptance.debt}`;

      worksheet.getCell(`${columnKey}${rowIndex}`).value = cellContent;
      worksheet.getCell(`${columnKey}${rowIndex}`).alignment = { wrapText: true };
    }
  });

  // Save the workbook
  await workbook.xlsx.writeFile(filePath);

  return filePath;
}

exports.getOrGenerateMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.params;

    await ensureReportsDirectory();
    const filePath = await generateAndSaveReport(year, month);

    res.download(filePath);
  } catch (error) {
    logger.error('Error generating or retrieving monthly report:', error);
    res.status(500).json({ message: "Error generating or retrieving monthly report", error: error.message });
  }
};