const Permit = require("../models/Permit");
const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");
const Land = require("../models/Land");
const Notification = require("../models/Notification");

// ─── Helpers ──────────────────────────────────────────────
const sendNotification = async (
  recipientId,
  recipientModel,
  type,
  title,
  message,
  link,
) => {
  await Notification.create({
    recipientId,
    recipientModel,
    type,
    title,
    message,
    link,
  });
};

// ─── Citizen: Submit Permit Request ──────────────────────
exports.submitPermit = async (req, res) => {
  try {
    const { permitType, formData } = req.body;
    const citizenId = req.user.id;

    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    }

    // Validate permit type
    if (!["timber", "sand"].includes(permitType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid permit type" });
    }

    // Specific validations
    if (permitType === "timber") {
      // Check survey number exists in Land and belongs to citizen
      const { survey_number, trees } = formData;
      if (!survey_number) {
        return res
          .status(400)
          .json({ success: false, message: "Survey number is required." });
      }
      const land = await Land.findOne({
        survey_number,
        owner_nic: citizen.nic,
        is_active: true,
      });
      if (!land) {
        return res
          .status(400)
          .json({
            success: false,
            message: "No land found with this survey number for your NIC.",
          });
      }
      // Validate trees
      if (
        !trees ||
        !Array.isArray(trees) ||
        trees.length === 0 ||
        trees.length > 3
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Please provide between 1 and 3 trees.",
          });
      }
      const allowedTreeTypes = ["Jackfruit tree", "Breadfruit tree", "Palms"];
      for (let tree of trees) {
        if (!allowedTreeTypes.includes(tree.treeType)) {
          return res
            .status(400)
            .json({
              success: false,
              message: `Invalid tree type: ${tree.treeType}`,
            });
        }
        if (!tree.height || tree.height <= 0) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Tree height must be a positive number.",
            });
        }
        if (!tree.circumference || tree.circumference <= 0) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Tree circumference must be a positive number.",
            });
        }
        if (!tree.grossStandAge || tree.grossStandAge <= 0) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Gross stand age must be a positive number.",
            });
        }
      }
    } else if (permitType === "sand") {
      const { reason, quantity } = formData;
      const validReasons = [
        "Residential Construction",
        "Concrete Block Manufacturing",
      ];
      if (!validReasons.includes(reason)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid reason for sand permit." });
      }
      if (!quantity || quantity <= 0 || quantity > 5) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Quantity must be between 1 and 5 cubic meters.",
          });
      }
    }

    // Auto-fill citizen details
    const finalFormData = {
      ...formData,
      first_name: citizen.first_name,
      middle_name: citizen.middle_name,
      last_name: citizen.last_name,
      nic: citizen.nic,
      initials: citizen.initials,
      address: citizen.address,
      phone: citizen.phone_numbers?.[0] || "",
    };

    const permit = new Permit({
      citizenId: citizen._id,
      village_id: citizen.village_id,
      permitType,
      formData: finalFormData,
      status: "not_seen",
      requestedAt: new Date(),
    });
    await permit.save();

    // Notify GN officer
    const officer = await GNOfficer.findOne({ village_id: citizen.village_id });
    if (officer) {
      await sendNotification(
        officer._id,
        "GNOfficer",
        "permit_request",
        "New Permit Request",
        `Citizen ${citizen.full_name} requested a ${permitType} permit.`,
        `/officer/permits/${permit._id}`,
      );
    }

    res.status(201).json({
      success: true,
      message: "Permit request submitted.",
      data: { permitId: permit._id, status: permit.status },
    });
  } catch (error) {
    console.error("Submit permit error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Citizen: Get My Permits ─────────────────────────────
exports.getMyPermits = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const permits = await Permit.find({ citizenId }).sort({ createdAt: -1 });
    res.json({ success: true, data: permits });
  } catch (error) {
    console.error("Get my permits error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GN Officer: Get Village Permits ──────────────────────
exports.getVillagePermits = async (req, res) => {
  try {
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const { status } = req.query;
    const filter = { village_id: officer.village_id };
    if (status && status !== "all") {
      filter.status = status;
    }

    const permits = await Permit.find(filter)
      .populate("citizenId", "full_name email nic phone_numbers")
      .sort({ requestedAt: 1 });

    // Add warning flag
    const now = new Date();
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const enhanced = permits.map((p) => {
      const warning =
        (p.status === "not_seen" && p.requestedAt < twoDaysAgo) ||
        (p.status === "in_progress" && p.lastStatusChangeAt < fiveDaysAgo);
      return { ...p.toObject(), warning };
    });

    res.json({ success: true, data: enhanced });
  } catch (error) {
    console.error("Get village permits error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GN Officer: Update Permit Status ─────────────────────
exports.updatePermitStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, officerNotes, rejectionReason } = req.body;
    const officerId = req.user.id;

    if (!["not_seen", "in_progress", "accepted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const permit = await Permit.findById(id).populate(
      "citizenId",
      "full_name phone_numbers",
    );
    if (!permit) {
      return res
        .status(404)
        .json({ success: false, message: "Permit not found" });
    }

    const officer = await GNOfficer.findById(officerId);
    if (!officer || officer.village_id !== permit.village_id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    permit.status = status;
    permit.lastStatusChangeAt = new Date();
    if (officerNotes) permit.officerNotes = officerNotes.trim();
    if (status === "rejected") {
      permit.rejectionReason = rejectionReason || "No reason provided";
    }
    await permit.save();

    // ─── Notify citizen ──────────────────────────────────────
    let message = "";
    let type = "";
    if (status === "accepted") {
      message = "Your permit can be collected at the Grama Niladhari Office.";
      type = "permit_accepted";
    } else if (status === "rejected") {
      message = `Your permit request was rejected. Reason: ${permit.rejectionReason}`;
      type = "permit_rejected";
    } else if (status === "in_progress") {
      message = "Your permit request is being processed.";
      type = "permit_processing";
    }
    if (message) {
      await sendNotification(
        permit.citizenId._id,
        "Citizen",
        type,
        `Permit ${status}`,
        message,
        `/citizen/permits/${permit._id}`,
      );
    }

    // ─── Warning logic (if needed) ──────────────────────────
    const now = new Date();
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    let warningMsg = "";
    if (
      permit.status === "not_seen" &&
      permit.requestedAt < twoDaysAgo &&
      !permit.warningSent
    ) {
      warningMsg = `Permit request (${permit._id}) has not been seen for more than 2 days.`;
    } else if (
      permit.status === "in_progress" &&
      permit.lastStatusChangeAt < fiveDaysAgo &&
      !permit.warningSent
    ) {
      warningMsg = `Permit request (${permit._id}) has been 'In Progress' for more than 5 days.`;
    }
    if (warningMsg) {
      await sendNotification(
        officerId,
        "GNOfficer",
        "warning",
        "⚠️ Permit Warning",
        warningMsg,
        `/officer/permits/${permit._id}`,
      );
      permit.warningSent = true;
      await permit.save();
    }

    res.json({
      success: true,
      message: `Permit ${status}`,
      data: permit,
    });
  } catch (error) {
    console.error("Update permit error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GN Officer: Get Single Permit ────────────────────────
exports.getPermitDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const permit = await Permit.findById(id).populate(
      "citizenId",
      "full_name email nic phone_numbers",
    );
    if (!permit) {
      return res
        .status(404)
        .json({ success: false, message: "Permit not found" });
    }
    // Verify officer's village
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer || officer.village_id !== permit.village_id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    res.json({ success: true, data: permit });
  } catch (error) {
    console.error("Get permit details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
