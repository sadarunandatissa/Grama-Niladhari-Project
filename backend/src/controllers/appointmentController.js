const Appointment = require("../models/Appointment");
const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");
const Notification = require("../models/Notification");

// ─── Helper ──────────────────────────────────────────────
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

// ─── Citizen: Create Appointment ─────────────────────────
exports.createAppointment = async (req, res) => {
  try {
    const { reason, proposedSlots } = req.body;
    const citizenId = req.user.id;

    // Get citizen to fetch village
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    }

    // Validate slots (array of ISO strings)
    if (
      !proposedSlots ||
      !Array.isArray(proposedSlots) ||
      proposedSlots.length === 0
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one time slot is required.",
        });
    }
    if (proposedSlots.length > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Maximum 5 slots allowed." });
    }

    // Convert to Date objects and validate
    const slotDates = proposedSlots.map((s) => new Date(s));
    for (let date of slotDates) {
      if (isNaN(date.getTime())) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid date format." });
      }
      const day = date.getDay();
      if (day === 0 || day === 6) {
        return res
          .status(400)
          .json({ success: false, message: "Slots must be Monday to Friday." });
      }
      const hours = date.getHours();
      if (hours < 8 || hours >= 16) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Slots must be between 8:00 AM and 4:00 PM.",
          });
      }
    }

    // Create appointment
    const appointment = new Appointment({
      citizenId: citizen._id,
      village_id: citizen.village_id,
      reason: reason.trim(),
      proposedSlots: slotDates,
      status: "pending",
    });
    await appointment.save();

    // Notify GN officer
    const officer = await GNOfficer.findOne({ village_id: citizen.village_id });
    if (officer) {
      await sendNotification(
        officer._id,
        "GNOfficer",
        "appointment",
        "New Appointment Request",
        `Citizen ${citizen.full_name} requested an appointment.`,
        `/officer/appointments/${appointment._id}`,
      );
    }

    res.status(201).json({
      success: true,
      message: "Appointment request submitted.",
      data: appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
};

// ─── Citizen: Get My Appointments ────────────────────────
exports.getMyAppointments = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const appointments = await Appointment.find({ citizenId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Get my appointments error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GN Officer: Get Village Appointments ────────────────
exports.getVillageAppointments = async (req, res) => {
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

    const appointments = await Appointment.find(filter)
      .populate("citizenId", "full_name email nic phone_numbers")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Get village appointments error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── GN Officer: Update Appointment Status ────────────────
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, selectedSlot, officerMessage } = req.body;
    const officerId = req.user.id;

    // Validate status
    const validStatuses = ["pending", "accepted", "rejected", "rescheduled"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const appointment = await Appointment.findById(id).populate(
      "citizenId",
      "full_name email phone_numbers",
    );
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    // Verify officer belongs to same village
    const officer = await GNOfficer.findById(officerId);
    if (!officer || officer.village_id !== appointment.village_id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // If accepting, ensure selectedSlot is valid and in proposedSlots
    if (status === "accepted") {
      if (!selectedSlot) {
        return res
          .status(400)
          .json({ success: false, message: "Please select a time slot." });
      }
      const slotDate = new Date(selectedSlot);
      // Check if slot is within proposedSlots (allow slight tolerance)
      const isMatch = appointment.proposedSlots.some((s) => {
        return Math.abs(s.getTime() - slotDate.getTime()) < 60000; // within 1 minute
      });
      if (!isMatch) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Selected slot is not among proposed slots.",
          });
      }
      appointment.selectedSlot = slotDate;
    } else {
      appointment.selectedSlot = null;
    }

    // If rescheduled, officer can suggest new times via message
    if (status === "rescheduled" && !officerMessage) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide alternative time suggestions.",
        });
    }

    appointment.status = status;
    if (officerMessage) {
      appointment.officerMessage = officerMessage.trim();
    }
    appointment.updatedAt = new Date();
    await appointment.save();

    // ─── Send notification to citizen ──────────────────────
    let notificationMessage = "";
    let notificationType = "";
    if (status === "accepted") {
      notificationMessage = `Your appointment request was accepted. Scheduled time: ${new Date(appointment.selectedSlot).toLocaleString()}`;
      notificationType = "appointment_accepted";
    } else if (status === "rejected") {
      notificationMessage = `Your appointment request was rejected. ${appointment.officerMessage ? "Reason: " + appointment.officerMessage : ""}`;
      notificationType = "appointment_rejected";
    } else if (status === "rescheduled") {
      notificationMessage = `Your appointment request was rescheduled. Please review the officer's suggestion: ${appointment.officerMessage}`;
      notificationType = "appointment_rescheduled";
    }

    if (notificationMessage) {
      await sendNotification(
        appointment.citizenId._id,
        "Citizen",
        notificationType,
        `Appointment ${status}`,
        notificationMessage,
        `/citizen/appointments/${appointment._id}`,
      );
    }

    res.json({
      success: true,
      message: `Appointment ${status}`,
      data: appointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
