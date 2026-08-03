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
};
