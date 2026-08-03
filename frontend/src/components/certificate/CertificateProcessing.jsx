//Certificate type field configuration
export const certificateFields = {
  residence: [
    {
      name: "nic",
      label: "National Identity Card(NIC) Number",
      type: "text",
      required: true,
      placeholder: "123456789V",
    },
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "Saman Kumara Perera",
    },
    {
      name: "permanentAddress",
      label: "Permenant Address",
      type: "textarea",
      required: true,
      placeholder: "Enter your complete address",
    },
    {
      name: "phone",
      label: "House Number / Land Details",
      type: "text",
      required: false,
      placeholder: "e.g. No. 123, Samagi Mawatha",
    },
  ],

  family_composition: [
    {
      name: "applicantNic",
      label: "Applicant NIC",
      type: "text",
      required: true,
      placeholder: "123456789V",
    },
    {
      name: "familyMember",
      label: "Family Members (comma seperated names)",
      type: "text",
      required: true,
      placeholder: "e.g., Kamala Perera (Spouse), Suresh Perera (Son)",
    },
    {
      name: "address",
      label: "Household Address",
      type: "textarea",
      required: true,
      placeholder: "Enter your complete address",
    },
  ],

  character: [
    {
      name: "nic",
      label: "NIC",
      type: "text",
      required: true,
      placeholder: "123456789V",
    },
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "e.g., Saman Kumara Perera",
    },
    {
      name: "address",
      label: "Current Address",
      type: "textarea",
      required: true,
    },
    {
      name: "occupation",
      label: "Occupation",
      type: "text",
      required: true,
      placeholder: "e.g., Teacher, Farmer",
    },
    {
      name: "reason",
      label: "Reason for Request",
      type: "textarea",
      required: true,
      placeholder: "e.g., Employment, Scholarship",
    },
  ],
  income: [
    {
      name: "nic",
      label: "NIC",
      type: "text",
      required: true,
      placeholder: "123456789V",
    },
    {
      name: "householdIncome",
      label: "Monthly Household Income (LKR)",
      type: "number",
      required: true,
      placeholder: "e.g., 50000",
    },
    {
      name: "employmentDetails",
      label: "Employment Details",
      type: "textarea",
      required: true,
      placeholder: "e.g., Government Teacher - Gampaha",
    },
    {
      name: "address",
      label: "Residential Address",
      type: "textarea",
      required: true,
    },
  ],
  school_admission: [
    {
      name: "parentNic",
      label: "Parent/Guardian NIC",
      type: "text",
      required: true,
      placeholder: "123456789V",
    },
    {
      name: "childName",
      label: "Child's Full Name",
      type: "text",
      required: true,
      placeholder: "e.g., Nimal Perera",
    },
    {
      name: "homeAddress",
      label: "Home Address",
      type: "textarea",
      required: true,
    },
    {
      name: "schoolName",
      label: "School Name",
      type: "text",
      required: true,
      placeholder: "e.g., Vidyalaya Maha Vidyalaya",
    },
  ],
};
