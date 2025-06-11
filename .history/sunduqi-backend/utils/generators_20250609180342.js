const { Receipt, Disbursement, CashDelivery, CashCollection } = require('../models');
const moment = require('moment');
const { Op } = require('sequelize');


const generateReceiptNumber = async () => {
  const today = moment().format('YYYYMMDD');
  const lastReceipt = await Receipt.findOne({
    where: {
      receipt_number: {
        [Op.like]: `RCPT-${today}%`,
      },
    },
    order: [['receipt_number', 'DESC']],
  });

  let sequence = 1;
  if (lastReceipt) {
    const lastSeq = parseInt(lastReceipt.receipt_number.split('-')[2]);
    sequence = lastSeq + 1;
  }

  return `RCPT-${today}-${sequence.toString().padStart(4, '0')}`;
};


async function generateDisbursementNumber() {
  // Get count of existing disbursements to create a unique number
  const count = await Disbursement.count();
  const newNumber = `D-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
  return newNumber;
}

function generateDeliveryNumber() {
  return 'DEL-' + Date.now();
}

// utils/generators.js
function generateCollectionNumber() {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-6); // آخر 6 أرقام من الوقت
  return `CC-${timestamp}`;
}

module.exports = {
  ,
};


module.exports = {
  generateReceiptNumber,
  generateDisbursementNumber,
  generateDeliveryNumber,
  generateCollectionNumber,
};

