const express = require("express");
const router = express.Router();
const sendMessage = require("../utils/sendMessage");
const Appointment = require("../models/Appointment");

// Temporary in-memory user state
let userState = {};

router.get("/", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    const msg = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg) return res.sendStatus(200);

    const from = msg.from;
    const text = msg.text?.body?.toLowerCase();

    if (!userState[from]) userState[from] = { step: 0 };

    const state = userState[from];

    // FLOW START
    if (text === "hi" || text === "menu") {
      state.step = 1;
      return sendMessage(from, "Welcome to Hospital 👋\n1. Book Appointment");
    }

    if (state.step === 1 && text === "1") {
      state.step = 2;
      return sendMessage(from, "Enter your name:");
    }

    if (state.step === 2) {
      state.name = text;
      state.step = 3;
      return sendMessage(from, "Select Doctor:\n1. Dr Sharma\n2. Dr Mehta");
    }

    if (state.step === 3) {
      state.doctor = text === "1" ? "Dr Sharma" : "Dr Mehta";
      state.step = 4;
      return sendMessage(from, "Enter date (YYYY-MM-DD):");
    }

    if (state.step === 4) {
      state.date = text;
      state.step = 5;
      return sendMessage(from, "Enter time (HH:MM):");
    }

    if (state.step === 5) {
      state.time = text;

      await Appointment.create({
        phone: from,
        name: state.name,
        doctor: state.doctor,
        date: state.date,
        time: state.time,
      });

      state.step = 0;

      return sendMessage(
        from,
        `✅ Appointment Confirmed\nName: ${state.name}\nDoctor: ${state.doctor}\nDate: ${state.date}\nTime: ${state.time}`
      );
    }

    return sendMessage(from, "Type 'menu' to start");
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
