// utils/helpers.js
const Family = require("../models/Family");

const generateFamilyRegNo = async (villageId) => {
  let seq = 1;
  let familyRegNo = `${villageId}-FAM-${String(seq).padStart(3, "0")}`;

  // Keep incrementing until we find a number that doesn't exist
  while (await Family.findOne({ family_reg_no: familyRegNo })) {
    seq++;
    familyRegNo = `${villageId}-FAM-${String(seq).padStart(3, "0")}`;
  }
  return familyRegNo;
};

module.exports = { generateFamilyRegNo };
