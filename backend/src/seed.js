const mongoose = require("mongoose");
const Province = require("./models/Province");
const District = require("./models/District");
const DSDivision = require("./models/DSDivision");
const Village = require("./models/Village");

const MONGO_URI = "mongodb://localhost:27017/grama_niladhari"; // change if needed

const provincesData = [
  { name: "Central", districts: ["Kandy", "Matale", "Nuwara Eliya"] },
  { name: "Eastern", districts: ["Ampara", "Batticaloa", "Trincomalee"] },
  { name: "North Central", districts: ["Anuradhapura", "Polonnaruwa"] },
  {
    name: "Northern",
    districts: ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  },
  { name: "North Western", districts: ["Kurunegala", "Puttalam"] },
  { name: "Sabaragamuwa", districts: ["Kegalle", "Ratnapura"] },
  { name: "Southern", districts: ["Galle", "Hambantota", "Matara"] },
  { name: "Uva", districts: ["Badulla", "Monaragala"] },
  { name: "Western", districts: ["Colombo", "Gampaha", "Kalutara"] },
];

const kurunegalaDSDivisions = [
  "Giribawa",
  "Ganewatta",
  "Galgamuwa",
  "Ehetuwewa",
  "Maho",
  "Ambanpola",
  "Kotawehera",
  "Rasnayakepura",
  "Nikaweratiya",
  "Polpithigama",
  "Ibbagamuwa",
  "Ridigama",
  "Mawathagama",
  "Mallawapitiya",
  "Kurunegala",
  "Maspotha",
  "Weerabugedara",
  "Polgahawela",
  "Alawwa",
  "Kuliyapitiya East",
  "Kuliyapitiya West",
  "Wariyapola",
  "Panduwasnuwara East",
  "Bamunakotuwa",
  "Panduwasnuwara West",
  "Bingiriya",
  "Udubaddawa",
  "Narammala",
  "Kobeigane",
  "Pannala",
];

const ridigamaVillages = [
  "Adapola",
  "Alakolamada",
  "Arapolakanda",
  "Balawattala",
  "Bambaragahakanda",
  "Dedurunadigama",
  "Delvita",
  "Diniminiyathenna",
  "Dodamgahakotuwa",
  "Dodamgaslanda",
  "Dunumawa",
  "Eriyagolla",
  "Gallawa",
  "Ginihiriya",
  "Gopallawa",
  "Gorakaela",
  "Ihala Udaththapola",
  "Jankure",
  "Kahahena",
  "Kalugahathenna",
  "Kandupalatha",
  "Kanugolla",
  "Katiyawa",
  "Kegalle",
  "Kelemulla",
  "Kiribathgalla",
  "Kithulgolla",
  "Kithuwala",
  "Koorukeppitiya",
  "Korossa",
  "Koswatta",
  "Kothalawalagama",
  "Kotuhena",
];

async function seed() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB");

  // Clear existing data
  await Province.deleteMany({});
  await District.deleteMany({});
  await DSDivision.deleteMany({});
  await Village.deleteMany({});
  console.log("Cleared existing data");

  for (const prov of provincesData) {
    const province = await Province.create({ name: prov.name });
    for (const distName of prov.districts) {
      const district = await District.create({
        name: distName,
        province: province._id,
      });

      // If district is Kurunegala, add its DS divisions
      if (distName === "Kurunegala") {
        for (const dsName of kurunegalaDSDivisions) {
          const ds = await DSDivision.create({
            name: dsName,
            district: district._id,
          });

          // If DS division is Ridigama, add its villages
          if (dsName === "Ridigama") {
            for (const vilName of ridigamaVillages) {
              await Village.create({ name: vilName, dsDivision: ds._id });
            }
          }
        }
      }
    }
  }

  console.log("Seeding completed");
  mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});
