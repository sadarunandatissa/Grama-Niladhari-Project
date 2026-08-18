const Appointment = require("../models/Appointment");
const Citizen = require("../models/Citizen");
const GNOfficer = require("../models/GNOfficer");
const Notification = require("../models/Notification");

// ─── Constants ──────────────────────────────────────────────
const APPOINTMENT_DURATION = 15; // minutes per appointment

// ─── Helper: Send Notification ────────────────────────────
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

// ─── Helper: Get Available Slots for a Given Day ──────────
const getAvailableSlots = async (
  villageId,
  date,
  startTime = 8,
  endTime = 16,
) => {
  const slots = [];
  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);

  const dayStart = new Date(baseDate);
  dayStart.setHours(startTime, 0, 0, 0);
  const dayEnd = new Date(baseDate);
  dayEnd.setHours(endTime, 0, 0, 0);

  // Get all accepted appointments for this village on this day
  const accepted = await Appointment.find({
    village_id: villageId,
    status: "accepted",
    selectedSlot: { $exists: true, $ne: null },
  });
  const occupiedSlots = accepted
    .map((a) => a.selectedSlot)
    .filter((s) => {
      const sDate = new Date(s);
      return sDate >= dayStart && sDate < dayEnd;
    })
    .sort((a, b) => a - b);

  // Generate 15‑minute slots
  let current = new Date(dayStart);
  while (current < dayEnd) {
    const isOccupied = occupiedSlots.some((occupied) => {
      const occStart = occupied.getTime();
      const occEnd = occStart + APPOINTMENT_DURATION * 60000;
      const curStart = current.getTime();
      const curEnd = curStart + APPOINTMENT_DURATION * 60000;
      return curStart < occEnd && curEnd > occStart;
    });
    if (!isOccupied) {
      slots.push(new Date(current));
    }
    current = new Date(current.getTime() + APPOINTMENT_DURATION * 60000);
  }
  return slots;
};

// ─── Citizen: Create Appointment ──────────────────────────
exports.createAppointment = async (req, res) => {
  try {
    const { reason, proposedSlots } = req.body;
    const citizenId = req.user.id;

    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    }

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

    const appointment = new Appointment({
      citizenId: citizen._id,
      village_id: citizen.village_id,
      reason: reason.trim(),
      proposedSlots: slotDates,
      status: "pending",
    });
    await appointment.save();

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

// ─── Citizen: Get My Appointments ─────────────────────────
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

// ─── GN Officer: Get Village Appointments ─────────────────
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

// ─── GN Officer: Update Appointment Status ─────────────────
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, selectedSlot, officerMessage } = req.body;
    const officerId = req.user.id;

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

    const officer = await GNOfficer.findById(officerId);
    if (!officer || officer.village_id !== appointment.village_id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (status === "accepted") {
      if (!selectedSlot) {
        return res
          .status(400)
          .json({ success: false, message: "Please select a time slot." });
      }
      const slotDate = new Date(selectedSlot);
      const isMatch = appointment.proposedSlots.some((s) => {
        return Math.abs(s.getTime() - slotDate.getTime()) < 60000;
      });
      if (!isMatch) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Selected slot is not among proposed slots.",
          });
      }

      // ─── CONFLICT CHECK ──────────────────────────────────────
      const availableSlots = await getAvailableSlots(
        appointment.village_id,
        slotDate,
      );
      const isAvailable = availableSlots.some(
        (s) => Math.abs(s.getTime() - slotDate.getTime()) < 60000,
      );
      if (!isAvailable) {
        // Suggest next 3 free slots after the requested time
        const suggested = availableSlots
          .filter((s) => s > slotDate)
          .slice(0, 3)
          .map((s) => s.toISOString());
        return res.status(409).json({
          success: false,
          message: "This time slot is already booked for another appointment.",
          suggestedSlots: suggested,
        });
      }

      appointment.selectedSlot = slotDate;
    } else {
      appointment.selectedSlot = null;
    }

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

    // ─── Send notification to citizen ──────────────────────────
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

// ─── GN Officer: Get Today's Schedule ──────────────────────
exports.getTodaySchedule = async (req, res) => {
  try {
    const officerId = req.user.id;
    const officer = await GNOfficer.findById(officerId);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      village_id: officer.village_id,
      status: "accepted",
      selectedSlot: { $gte: today, $lt: tomorrow },
    })
      .populate("citizenId", "full_name email nic phone_numbers")
      .sort({ selectedSlot: 1 });

    res.json({
      success: true,
      data: appointments.map((app) => ({
        time: app.selectedSlot,
        citizen: app.citizenId,
        reason: app.reason,
      })),
    });
  } catch (error) {
    console.error("Get today schedule error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
