const normalizeName = (value) => (typeof value === "string" ? value.trim() : "");

export const getCitizenNameParts = (citizen = {}) => {
  const firstName = normalizeName(citizen.first_name || citizen.firstName);
  const middleName = normalizeName(citizen.middle_name || citizen.middleName);
  const lastName = normalizeName(citizen.last_name || citizen.lastName);

  if (firstName || middleName || lastName) {
    return {
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
    };
  }

  const fullName = normalizeName(citizen.full_name || citizen.fullName);
  const parts = fullName ? fullName.split(/\s+/) : [];

  return {
    first_name: parts[0] || "",
    middle_name: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
    last_name: parts.length > 1 ? parts[parts.length - 1] : "",
  };
};
