import express from "express";
import { google } from "googleapis";
import fs from "fs";
import nodemailer from "nodemailer";
import "dotenv/config";

const app = express();
app.use(express.json());

console.log("EMAIL_USER:", process.env.EMAIL_USER);

// ---------------- GOOGLE CALENDAR ----------------

// Load OAuth client credentials
const credentials = JSON.parse(
  fs.readFileSync("credentials.json", "utf8")
);

const { client_id, client_secret, redirect_uris } =
  credentials.installed;

// Create OAuth2 client WITH identity
const auth = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Attach user token
const token = JSON.parse(
  fs.readFileSync("token.json", "utf8")
);
auth.setCredentials(token);

// Create Calendar API client
const calendar = google.calendar({
  version: "v3",
  auth,
});

// ---------------- EMAIL ----------------

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ---------------- UTIL ----------------

function normalizeTimes(start_time, end_time) {
  const start = new Date(start_time);
  let end = new Date(end_time);

  if (isNaN(start.getTime())) {
    throw new Error("Invalid start time");
  }

  // Default duration: 1 hour
  if (isNaN(end.getTime()) || end <= start) {
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }

  return { start, end };
}

function withinClinicHours(start, end) {
  const startHour = start.getHours();
  const endHour = end.getHours();

  return !(
    startHour < 10 ||
    endHour > 18 ||
    (endHour === 18 && end.getMinutes() > 0)
  );
}

// ---------------- TOOL REGISTRY ----------------

const tools = {
  // 1️⃣ CHECK AVAILABILITY
  check_availability: async ({ start_time, end_time }) => {
    try {
      const { start, end } = normalizeTimes(start_time, end_time);

      if (!withinClinicHours(start, end)) {
        return {
          available: false,
          reason: "Clinic hours are 10:00 AM to 6:00 PM",
        };
      }

      const res = await calendar.events.list({
        calendarId: "primary",
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      if ((res.data.items || []).length > 0) {
        return {
          available: false,
          reason: "Slot already booked",
        };
      }

      return {
        available: true,
        reason: "Slot is available",
      };
    } catch (err) {
      console.error("❌ Availability check failed:", err.message);
      return {
        available: false,
        reason: "Failed to check availability",
      };
    }
  },

  // 2️⃣ BOOK APPOINTMENT (HARD ENFORCES AVAILABILITY)
  schedule_calendar_event: async ({ summary, start_time, end_time }) => {
    try {
      const availability = await tools.check_availability({
        start_time,
        end_time,
      });

      if (!availability.available) {
        return { error: availability.reason };
      }

      const { start, end } = normalizeTimes(start_time, end_time);

      const event = {
        summary,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      };

      const res = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      return {
        event_id: res.data.id,
        link: res.data.htmlLink,
        status: res.data.status,
      };
    } catch (err) {
      console.error("❌ Calendar booking failed:", err.response?.data || err.message);
      return {
        error: "Failed to book appointment",
      };
    }
  },

  // 3️⃣ SEND EMAIL (PATIENT ONLY)
  send_email_notification: async ({ to, subject, body }) => {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: body,
    });

    return { status: "sent", to };
  },
};

// ---------------- MCP-LIKE ENDPOINTS ----------------

// Tool discovery
app.get("/tools", (req, res) => {
  res.json({
    tools: [
      {
        name: "check_availability",
        input_schema: {
          start_time: "string",
          end_time: "string",
        },
      },
      {
        name: "schedule_calendar_event",
        input_schema: {
          summary: "string",
          start_time: "string",
          end_time: "string",
        },
      },
      {
        name: "send_email_notification",
        input_schema: {
          to: "string",
          subject: "string",
          body: "string",
        },
      },
    ],
  });
});

// Tool invocation
app.post("/invoke", async (req, res) => {
  const { tool_name, arguments: args } = req.body;

  if (!tools[tool_name]) {
    return res.status(400).json({ error: "Unknown tool" });
  }

  try {
    const result = await tools[tool_name](args);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- START SERVER ----------------

app.listen(8000, () => {
  console.log("✅ Tool server running on http://localhost:8000");
});


























































































































































































































































