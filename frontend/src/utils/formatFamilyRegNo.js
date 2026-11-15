const formatFamilyRegNo = (familyRegNo) =>
  typeof familyRegNo === "string"
    ? familyRegNo.replace(/^[a-f\d]{24}-/i, "")
    : familyRegNo;

export default formatFamilyRegNo;
