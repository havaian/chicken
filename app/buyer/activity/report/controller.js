const fs = require('fs').promises;
const path = require('path');
const Excel = require('exceljs');
const moment = require('moment-timezone');
const Buyer = require("../../model");
const DailyBuyerActivity = require("../model");
const { logger } = require('../../../utils/logging');

const REPORTS_DIR = path.join(__dirname, './reports/buyer/monthly_report');

const ReportMetadata = require('./model');

async function ensureReportsDirectory() {
  try {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
  } catch (error) {
    logger.error('Error creating reports directory:', error);
  }
}

async function generateAndSaveReport(year, month) {
  const fileName = `${year}_${month}.xlsx`;
  const filePath = path.join(REPORTS_DIR, fileName);

  const actualFilePath = path.join("./chicken-bot/reports/buyer/monthly_report", fileName);

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
  const headers = ['Mijoz', ...Array.from({ length: endDate.date() }, (_, i) => `${i + 1 > 9 ? i + 1 : "0" + (i + 1).toString()}.${month}.${year}`)];
  worksheet.addRow(headers);

  // Add buyer rows and create a map of buyer names to row numbers
  const buyerRowMap = new Map();
  buyers.forEach((buyer, index) => {
    const rowNumber = index + 2; // +2 because Excel is 1-indexed and we have a header row
    worksheet.addRow([buyer.full_name]);
    buyerRowMap.set(buyer.full_name, rowNumber);
  });

  // Set column widths
  worksheet.getColumn(1).width = 30;
  for (let i = 2; i <= headers.length; i++) {
    worksheet.getColumn(i).width = 20;
  }

  // Fill in the activities
  activities.forEach(activity => {
    const rowNumber = buyerRowMap.get(activity.buyer.full_name);
    if (rowNumber) {
      const day = moment(activity.date).date();
      const columnNumber = day + 1; // +1 because the first column is for buyer names
      
      let cellContent = '';
      if (Array.isArray(activity.accepted) && activity.accepted.length > 0) {
        activity.accepted.forEach((acceptance, index) => {
          if (index > 0) {
            cellContent += "\n=================\n";
          }
          if (Array.isArray(acceptance.eggs)) {
            acceptance.eggs.forEach(egg => {
              if (egg.amount > 0) {
                cellContent += `${egg.category}: ${egg.amount}\n`;
              }
            });
          }
          cellContent += `To'lov: ${acceptance.payment || 0}\n`;
          cellContent += `Qarz: ${acceptance.debt || 0}\n`;
        });
      } else {
        
      }

      const cell = worksheet.getCell(rowNumber, columnNumber);
      cell.value = cellContent;
      cell.alignment = { wrapText: true };
    }
  });

  // Save the workbook
  await workbook.xlsx.writeFile(filePath);

  const lastDataUpdate = await DailyBuyerActivity.findOne({
    date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
  }).sort('-lastModified');

  await ReportMetadata.findOneAndUpdate(
    { year, month },
    { 
      lastGenerated: new Date(),
      lastDataUpdate: lastDataUpdate ? lastDataUpdate.lastModified : new Date(),
      filePath,
      actualFilePath
    },
    { upsert: true, new: true }
  );

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