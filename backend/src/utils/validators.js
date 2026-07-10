const validateNIC = (nic) => {
  if (!nic) return false;
  const trimmed = nic.trim().toUpperCase();
  return /^[0-9]{9}V$/.test(trimmed) || /^[0-9]{12}$/.test(trimmed);
};

const validatePhone = (phone) => /^[0-9]{10}$/.test(phone?.trim() || "");

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || "");

const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  return /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};

const validateDateOfBirth = (dob) => {
  const date = new Date(dob);
  if (isNaN(date)) return false;
  const age = new Date().getFullYear() - date.getFullYear();
  return age >= 1 && age <= 120;
};

module.exports = {
  validateNIC,
  validatePhone,
  validateEmail,
  validatePassword,
  validateDateOfBirth,
};
