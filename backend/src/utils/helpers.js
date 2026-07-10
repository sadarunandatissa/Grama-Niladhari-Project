// backend/src/utils/helpers.js
const Family = require("../models/Family");

const generateFamilyRegNo = async (villageId) => {
  const last = await Family.findOne({ village_id: villageId }).sort({
    createdAt: -1,
  });
  let seq = 1;
  if (last) {
    const parts = last.family_reg_no.split("-");
    if (parts.length === 3) seq = parseInt(parts[2]) + 1;
  }
  return `${villageId}-FAM-${String(seq).padStart(3, "0")}`;
};

module.exports = { generateFamilyRegNo };
