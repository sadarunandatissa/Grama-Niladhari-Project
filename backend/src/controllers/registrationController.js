const RegistrationRequest = require("../models/RegistrationRequest");
const Citizen = require("../models/Citizen");
const Family = require("../models/Family");
const GNOfficer = require("../models/GNOfficer");
const Village = require("../models/Village");
const bcrypt = require("bcryptjs");
const { validateRegistrationData } = require("../utils/validators");
const { generateFamilyRegNo } = require("../utils/helpers");

/**
 * Submit Registration Request
 * POST /api/registration/submit
 */
exports.submitRegistration = async (req, res) => {
  try {
    const data = req.body;

    // Validate all fields
    const validation = validateRegistrationData(data);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Check if NIC already exists
    const existingNIC = await RegistrationRequest.findOne({ nic: data.nic });
    if (existingNIC) {
      return res.status(400).json({
        success: false,
        message: "NIC already registered. Please use a different NIC.",
      });
    }

    // Check if username already exists
    const existingUsername = await RegistrationRequest.findOne({
      username: data.username,
    });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken. Please choose another username.",
      });
    }

    // Check if citizen already exists with same NIC
    const existingCitizen = await Citizen.findOne({ nic: data.nic });
    if (existingCitizen) {
      return res.status(400).json({
        success: false,
        message: "NIC already registered as a citizen.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    // Prepare registration data
    const registrationData = {
      nic: data.nic.toUpperCase().trim(),
      full_name: data.full_name.trim(),
      initials: data.initials ? data.initials.trim() : "",
      surname: data.surname ? data.surname.trim() : "",
      first_name: data.first_name ? data.first_name.trim() : "",
      middle_name: data.middle_name ? data.middle_name.trim() : "",
      last_name: data.last_name ? data.last_name.trim() : "",
      date_of_birth: new Date(data.date_of_birth),
      gender: data.gender,
      address: data.address.trim(),
      village: data.village.trim(),
      phone_numbers: data.phone_numbers.map((p) => p.trim()),
      email: data.email ? data.email.trim().toLowerCase() : "",
      occupation: data.occupation ? data.occupation.trim() : "",
      is_family_head: data.is_family_head,
      family_reg_no: data.family_reg_no ? data.family_reg_no.trim() : null,
      username: data.username.trim(),
      password_hash,
      status: "pending",
    };

    // Create registration request
    const registration = new RegistrationRequest(registrationData);
    await registration.save();

    // TODO: Send notification to GN Officer (will implement later)
    // await sendNotificationToGNOfficer(data.village, registration);

    res.status(201).json({
      success: true,
      message:
        "Registration submitted successfully! Awaiting GN officer verification.",
      data: {
        registration_id: registration._id,
        status: registration.status,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * Get Pending Registrations for GN Officer
 * GET /api/registration/pending
 */
exports.getPendingRegistrations = async (req, res) => {
  try {
    const officer_id = req.user.id;

    // Get officer's village
    const officer = await GNOfficer.findById(officer_id);
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "GN Officer not found",
      });
    }

    // Get pending registrations for this village
    const pending = await RegistrationRequest.find({
      status: "pending",
      village: officer.village_id, // Match by village name or ID
    }).sort({ created_at: -1 });

    res.json({
      success: true,
      count: pending.length,
      data: pending,
    });
  } catch (error) {
    console.error("Error fetching pending:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Verify Registration Request
 * PUT /api/registration/verify/:registration_id
 */
exports.verifyRegistration = async (req, res) => {
  try {
    const { registration_id } = req.params;
    const { action, rejection_reason } = req.body; // action: 'verify' or 'reject'
    const officer_id = req.user.id;

    // Get registration
    const registration = await RegistrationRequest.findById(registration_id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    if (registration.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Registration already ${registration.status}`,
      });
    }

    // Get officer
    const officer = await GNOfficer.findById(officer_id);
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "GN Officer not found",
      });
    }

    // Verify officer belongs to the same village
    const village = await Village.findOne({ name: registration.village });
    if (!village || village.village_id !== officer.village_id) {
      return res.status(403).json({
        success: false,
        message: "You can only verify citizens in your village",
      });
    }

    if (action === "reject") {
      // Reject registration
      registration.status = "rejected";
      registration.rejection_reason =
        rejection_reason || "Rejected by GN Officer";
      registration.verified_by = officer_id;
      registration.verified_at = new Date();
      await registration.save();

      // TODO: Send rejection notification to citizen

      return res.json({
        success: true,
        message: "Registration rejected",
        status: "rejected",
      });
    }

    if (action === "verify") {
      let familyId;
      let citizen;

      // Check family_reg_no if not family head
      if (!registration.is_family_head) {
        const family = await Family.findOne({
          family_reg_no: registration.family_reg_no,
          village_id: officer.village_id,
        });

        if (!family) {
          return res.status(400).json({
            success: false,
            message: "Family registration number not found in this village",
          });
        }
        familyId = family._id;
      }

      // Create Family or Citizen based on role
      if (registration.is_family_head) {
        // Family Head: Create Family first
        const familyRegNo = await generateFamilyRegNo(officer.village_id);
        const newFamily = new Family({
          village_id: officer.village_id,
          family_reg_no: familyRegNo,
          address: registration.address,
          is_verified: true,
          verified_at: new Date(),
          member_count: 1,
        });
        const savedFamily = await newFamily.save();
        familyId = savedFamily._id;

        // Create Citizen (Head)
        const newCitizen = new Citizen({
          family_id: familyId,
          village_id: officer.village_id,
          nic: registration.nic,
          full_name: registration.full_name,
          initials: registration.initials,
          surname: registration.surname,
          first_name: registration.first_name,
          middle_name: registration.middle_name,
          last_name: registration.last_name,
          date_of_birth: registration.date_of_birth,
          gender: registration.gender,
          address: registration.address,
          phone_numbers: registration.phone_numbers,
          email: registration.email,
          occupation: registration.occupation,
          relationship_to_head: "Self",
          is_head: true,
          is_verified: true,
          verified_at: new Date(),
          username: registration.username,
          password_hash: registration.password_hash,
          is_active: true,
        });
        citizen = await newCitizen.save();

        // Update Family with head_citizen_id
        savedFamily.head_citizen_id = citizen._id;
        await savedFamily.save();
      } else {
        // Family Member: Add to existing family
        const family = await Family.findById(familyId);
        if (!family) {
          return res.status(400).json({
            success: false,
            message: "Family not found",
          });
        }

        if (!family.head_citizen_id) {
          return res.status(400).json({
            success: false,
            message: "Family head not set. Please contact GN Officer.",
          });
        }

        // Create Citizen (Member)
        const newCitizen = new Citizen({
          family_id: familyId,
          village_id: officer.village_id,
          nic: registration.nic,
          full_name: registration.full_name,
          initials: registration.initials,
          surname: registration.surname,
          first_name: registration.first_name,
          middle_name: registration.middle_name,
          last_name: registration.last_name,
          date_of_birth: registration.date_of_birth,
          gender: registration.gender,
          address: registration.address,
          phone_numbers: registration.phone_numbers,
          email: registration.email,
          occupation: registration.occupation,
          relationship_to_head: "Other",
          is_head: false,
          is_verified: true,
          verified_at: new Date(),
          username: registration.username,
          password_hash: registration.password_hash,
          is_active: true,
        });
        citizen = await newCitizen.save();

        // Update family member count
        family.member_count += 1;
        await family.save();
      }

      // Update registration
      registration.status = "verified";
      registration.verified_by = officer_id;
      registration.verified_at = new Date();
      registration.village_id = officer.village_id;
      registration.family_id = familyId;
      registration.citizen_id = citizen._id;
      await registration.save();

      // TODO: Send verification notification to citizen

      res.json({
        success: true,
        message: "Registration verified successfully",
        data: {
          citizen_id: citizen._id,
          family_id: familyId,
          role: registration.is_family_head ? "family_head" : "family_member",
        },
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
