/**
 * Sri Lanka NIC Validation
 */
const validateNIC = (nic) => {
  if (!nic) return false;
  const trimmed = nic.trim().toUpperCase();
  return /^[0-9]{9}V$/.test(trimmed) || /^[0-9]{12}$/.test(trimmed);
};

/**
 * Phone: exactly 10 digits
 */
const validatePhone = (phone) => /^[0-9]{10}$/.test(phone?.trim() || "");

/**
 * Email: standard format
 */
const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || "");

/**
 * Password: min 8 chars, at least one letter and one number
 */
const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  return /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};

/**
 * Date of birth: valid date and age between 1 and 120
 */
const validateDateOfBirth = (dob) => {
  const date = new Date(dob);
  if (isNaN(date)) return false;
  const age = new Date().getFullYear() - date.getFullYear();
  return age >= 1 && age <= 120;
};

/**
 * Validate registration request data
 */
const validateRegistrationRequest = (data) => {
  const errors = [];

  if (!validateEmail(data.email)) errors.push("Invalid email format.");
  if (!validatePassword(data.password))
    errors.push(
      "Password must be at least 8 characters with a letter and number.",
    );
  if (!validateNIC(data.nic))
    errors.push("Invalid NIC format. Use 9 digits + V or 12 digits.");
  if (!data.full_name || data.full_name.trim().length < 2)
    errors.push("Full name required.");
  if (!validateDateOfBirth(data.date_of_birth))
    errors.push("Invalid date of birth.");
  if (!["Male", "Female", "Other"].includes(data.gender))
    errors.push("Invalid gender.");
  if (!data.address || data.address.trim().length < 5)
    errors.push("Address required.");
  if (!data.phone_numbers || data.phone_numbers.length === 0)
    errors.push("At least one phone number required.");
  data.phone_numbers.forEach((p, i) => {
    if (!validatePhone(p)) errors.push(`Phone ${i + 1} must be 10 digits.`);
  });
  if (!data.village_id) errors.push("Village selection required.");
  if (data.is_family_head === false && !data.family_reg_no) {
    errors.push("Family registration number required for non-head members.");
  }
  // profile_picture is handled by multer separately

  return { isValid: errors.length === 0, errors };
};

module.exports = {
  validateNIC,
  validatePhone,
  validateEmail,
  validatePassword,
  validateDateOfBirth,
  validateRegistrationRequest,
};
