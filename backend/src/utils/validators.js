/**
 * Sri Lanka NIC Validation
 * OLD NIC: 9 digits + 1 Letter (V)
 * NEW NIC: 12 digits
 */
const validateNIC = (nic) => {
  if (!nic) return false;

  const trimmed = nic.trim().toUpperCase();

  // OLD NIC: 9 digits + 1 letter (V)
  const oldNICPattern = /^[0-9]{9}V$/;
  // NEW NIC: 12 digits
  const newNICPattern = /^[0-9]{12}$/;

  return oldNICPattern.test(trimmed) || newNICPattern.test(trimmed);
};

/**
 * Phone Number Validation
 * Must be exactly 10 digits
 */
const validatePhone = (phone) => {
  if (!phone) return false;
  return /^[0-9]{10}$/.test(phone.trim());
};

/**
 * Email Validation
 */
const validateEmail = (email) => {
  if (!email) return true; // Optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Password Validation
 * Min 8 chars, at least 1 letter and 1 number
 */
const validatePassword = (password) => {
  if (!password) return false;
  if (password.length < 8) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

/**
 * Username Validation
 * Min 3 chars, alphanumeric and underscore only
 */
const validateUsername = (username) => {
  if (!username) return false;
  return /^[a-zA-Z0-9_]{3,}$/.test(username.trim());
};

/**
 * Date of Birth Validation
 * Must be a valid date
 */
const validateDateOfBirth = (dob) => {
  const date = new Date(dob);
  if (isNaN(date.getTime())) return false;

  // Must be at least 1 year old and not more than 120 years old
  const now = new Date();
  const age = now.getFullYear() - date.getFullYear();
  return age >= 1 && age <= 120;
};

/**
 * Validate all registration fields
 */
const validateRegistrationData = (data) => {
  const errors = [];

  // Validate NIC
  if (!validateNIC(data.nic)) {
    errors.push("Invalid NIC format. Use 9 digits + V or 12 digits.");
  }

  // Validate Name fields
  if (!data.full_name || data.full_name.trim().length < 2) {
    errors.push("Full name is required and must be at least 2 characters.");
  }

  // Validate Date of Birth
  if (!validateDateOfBirth(data.date_of_birth)) {
    errors.push("Invalid date of birth. Must be a valid date.");
  }

  // Validate Gender
  if (!["Male", "Female", "Other"].includes(data.gender)) {
    errors.push("Invalid gender selection.");
  }

  // Validate Address
  if (!data.address || data.address.trim().length < 5) {
    errors.push("Address is required and must be at least 5 characters.");
  }

  // Validate Village
  if (!data.village || data.village.trim().length < 2) {
    errors.push("Village name is required.");
  }

  // Validate Phone Numbers
  if (!data.phone_numbers || data.phone_numbers.length === 0) {
    errors.push("At least one phone number is required.");
  } else {
    data.phone_numbers.forEach((phone, index) => {
      if (!validatePhone(phone)) {
        errors.push(`Phone number ${index + 1} is invalid. Must be 10 digits.`);
      }
    });
  }

  // Validate Email (optional)
  if (data.email && !validateEmail(data.email)) {
    errors.push("Invalid email format.");
  }

  // Validate Family Head Logic
  if (!data.is_family_head && !data.family_reg_no) {
    errors.push("Family registration number is required for non-head members.");
  }

  // Validate Username
  if (!validateUsername(data.username)) {
    errors.push(
      "Username must be at least 3 characters (letters, numbers, underscore only).",
    );
  }

  // Validate Password
  if (!validatePassword(data.password)) {
    errors.push(
      "Password must be at least 8 characters with at least 1 letter and 1 number.",
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateNIC,
  validatePhone,
  validateEmail,
  validatePassword,
  validateUsername,
  validateDateOfBirth,
  validateRegistrationData,
};
