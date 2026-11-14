// backend/seed.js
require("dotenv").config();
const mongoose = require("mongoose");

const Province = require("./src/models/Province");
const District = require("./src/models/District");
const DSDivision = require("./src/models/DSDivision");
const Village = require("./src/models/Village");

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  process.env.DB_URI ||
  "mongodb+srv://nandathissasadaru_db_user:AGwfJAgzOdoTKq0y@cluster0.9qy0vmu.mongodb.net/?appName=Cluster0";

// ---------- Data ----------
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

// ---------- Seed function ----------
async function seed() {
  try {
    console.log("Connecting to MongoDB...");

    // ✅ Just pass the URI — no options needed for Mongoose 7+
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const villageIndexes = await Village.collection.indexes();
    const obsoleteVillageIdIndex = villageIndexes.find(
      (index) =>
        index.unique &&
        index.key?.village_id === 1 &&
        Object.keys(index.key).length === 1,
    );
    if (obsoleteVillageIdIndex) {
      await Village.collection.dropIndex(obsoleteVillageIdIndex.name);
      console.log(
        `🧹 Removed obsolete unique index: ${obsoleteVillageIdIndex.name}`,
      );
    }

    await Province.deleteMany({});
    await District.deleteMany({});
    await DSDivision.deleteMany({});
    await Village.deleteMany({});
    console.log("🧹 Cleared existing province/district/DS/village data");

    let provinceCount = 0;
    let districtCount = 0;
    let dsCount = 0;
    let villageCount = 0;

    for (const prov of provincesData) {
      const province = await Province.create({ name: prov.name });
      provinceCount++;

      for (const distName of prov.districts) {
        const district = await District.create({
          name: distName,
          province: province._id,
        });
        districtCount++;

        if (distName === "Kurunegala") {
          for (const dsName of kurunegalaDSDivisions) {
            const ds = await DSDivision.create({
              name: dsName,
              district: district._id,
            });
            dsCount++;

            if (dsName === "Ridigama") {
              for (const vilName of ridigamaVillages) {
                await Village.create({
                  name: vilName,
                  dsDivision: ds._id,
                });
                villageCount++;
              }
            }
          }
        }
      }
    }

    console.log("\n📊 Seed Summary:");
    console.log(`   Provinces:    ${provinceCount}`);
    console.log(`   Districts:    ${districtCount}`);
    console.log(`   DS Divisions: ${dsCount}`);
    console.log(`   Villages:     ${villageCount}`);
    console.log("\n🎉 Seeding completed successfully");

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
