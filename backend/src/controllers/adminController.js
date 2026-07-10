const GNOfficer = require("../models/GNOfficer");
const Village = require("../models/Village");
const Citizen = require("../models/Citizen");
const RegistrationRequest = require("../models/RegistrationRequest");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const {
  validateEmail,
  validatePassword,
  validatePhone,
} = require("../utils/validators");

exports.getStats = async (req, res) => {
  try {
    const totalVillages = await Village.countDocuments();
    const totalOfficers = await GNOfficer.countDocuments();
    const totalCitizens = await Citizen.countDocuments();
    const pendingRegistrations = await RegistrationRequest.countDocuments({
      status: "pending",
    });
    res.json({
      success: true,
      data: {
        totalVillages,
        totalOfficers,
        totalCitizens,
        pendingRegistrations,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getVillages = async (req, res) => {
  try {
    const villages = await Village.find().select("village_id name").lean();
    res.json({ success: true, data: villages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllGNOfficers = async (req, res) => {
  try {
    const officers = await GNOfficer.find()
      .populate({
        path: "village_id",
        model: "Village",
        select: "name village_id",
        foreignField: "village_id",
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: officers });
  } catch (error) {
    console.error("Get officers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createGNOfficer = async (req, res) => {
  try {
    const { email, password, full_name, phone, village_id } = req.body;
    if (!validateEmail(email))
      return res.status(400).json({ success: false, message: "Invalid email" });
    if (!validatePassword(password))
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be 8+ chars with letter and number",
        });
    if (!full_name || full_name.length < 2)
      return res
        .status(400)
        .json({ success: false, message: "Full name required" });
    if (!validatePhone(phone))
      return res
        .status(400)
        .json({ success: false, message: "Phone must be 10 digits" });

    let villageIdString = village_id;
    if (Array.isArray(village_id)) villageIdString = village_id[0];
    if (!villageIdString)
      return res
        .status(400)
        .json({ success: false, message: "Village selection required" });

    const village = await Village.findOne({ village_id: villageIdString });
    if (!village)
      return res
        .status(404)
        .json({ success: false, message: "Village not found" });

    const existing = await GNOfficer.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });

    const existingOfficer = await GNOfficer.findOne({
      village_id: villageIdString,
      is_active: true,
    });
    if (existingOfficer) {
      return res
        .status(400)
        .json({
          success: false,
          message: `This village already has an officer: ${existingOfficer.full_name}`,
        });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    let profile_picture = null;
    if (req.file) profile_picture = `/uploads/gn_officers/${req.file.filename}`;

    const gnOfficer = new GNOfficer({
      email: email.trim().toLowerCase(),
      password_hash,
      full_name: full_name.trim(),
      phone: phone.trim(),
      village_id: villageIdString,
      profile_picture,
      created_by: req.user.id,
      is_active: true,
    });
    await gnOfficer.save();

    await AuditLog.create({
      user_type: "admin",
      user_id: req.user.id,
      user_model: "Admin",
      action: "CREATE_GN_OFFICER",
      details: { email, village_id: villageIdString, full_name },
    });

    res
      .status(201)
      .json({ success: true, message: "GN Officer created", data: gnOfficer });
  } catch (error) {
    console.error("Create officer error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteGNOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const officer = await GNOfficer.findByIdAndDelete(id);
    if (!officer)
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    await AuditLog.create({
      user_type: "admin",
      user_id: req.user.id,
      action: "DELETE_GN_OFFICER",
      details: { email: officer.email },
    });
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createVillage = async (req, res) => {
  try {
    const { village_id, name, ds_division, district, province } = req.body;
    if (!village_id || !name || !ds_division || !district || !province) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    const existing = await Village.findOne({ $or: [{ village_id }, { name }] });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Village already exists" });
    const village = new Village({
      village_id,
      name,
      ds_division,
      district,
      province,
    });
    await village.save();
    res.status(201).json({ success: true, data: village });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const village = await Village.findById(id);
    if (!village)
      return res
        .status(404)
        .json({ success: false, message: "Village not found" });
    const officer = await GNOfficer.findOne({ village_id: village.village_id });
    if (officer)
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot delete village with assigned officer",
        });
    await village.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
