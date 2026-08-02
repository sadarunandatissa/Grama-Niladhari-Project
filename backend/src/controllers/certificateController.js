const CertificateRequest = require("../models/CertificateRequest");
const Notification = require("../models/Notification");
const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");
const path = require("path");
const fs = require("fs");

//Filed Validation per Certificate Type
const getRequiredFields = (type) => {
  const fields = {
    residence: ["nic", "fullName", "permanentAddress", "phone", "purpose"],
    family_composition: ["applicantNic", "familyMembers", "address"],
    character: ["nic", "fullName", "address", "occupation", "reason"],
    income: ["nic", "householdIncome", "employmentDetails", "address"],
    school_admission: ["parentNic", "childName", "homeAddress", "schoolName"],
  };
  return fields[type] || [];
};
