import readline from "readline";
import Anthropic from "@anthropic-ai/sdk";
import fetch from "node-fetch";
import "dotenv/config";

const NGROK_URL = "https://obliging-odette-unequine.ngrok-free.dev";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ---------------------------------------------------------------------- TOOL CALLER ----------------//

async function callTool(toolName, args) {
  const res = await fetch(`${NGROK_URL}/invoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tool_name: toolName,
      arguments: args,
    }),
  });

  return res.json();
}

// ------------------------------------------------------------------- CLI ---------------------------//

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askUser() {
  return new Promise((resolve) => {
    rl.question("USER You: ", resolve);
  });
}

// ------------------------------------------------------------------ INTERACTIVE RUNNER ----------------//

async function run() {
  console.log("🤖 Doctor Appointment Assistant");
  console.log("Type your request (or 'exit' to quit)\n");

  let messages = [];

  const SYSTEM_PROMPT = `
You are a medical clinic receptionist AI.
The doctor owns the calendar.
Patients never access the calendar directly.
You MUST check availability before booking.
Clinic hours are 10:00 AM to 6:00 PM.
If the slot is not available just share the slot is already booked
 and tell them about different slots but NEVER share who booked the slot.
Only send confirmation emails to patients.
Be polite, professional, and clear.
`;

  while (true) {
    const userInput = await askUser();
    if (userInput.toLowerCase() === "exit") break;

    messages.push({ role: "user", content: userInput });

    while (true) {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
        tools: [
          {
            name: "check_availability",
            description: "Check if a time slot is available in the doctor's calendar",
            input_schema: {
              type: "object",
              properties: {
                start_time: { type: "string" },
                end_time: { type: "string" },
              },
              required: ["start_time"],
            },
          },
          {
            name: "schedule_calendar_event",
            description: "Book an appointment in the doctor's calendar",
            input_schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
                start_time: { type: "string" },
                end_time: { type: "string" },
              },
              required: ["summary", "start_time"],
            },
          },
          {
            name: "send_email_notification",
            description: "Send an email confirmation to the patient",
            input_schema: {
              type: "object",
              properties: {
                to: { type: "string" },
                subject: { type: "string" },
                body: { type: "string" },
              },
              required: ["to", "subject", "body"],
            },
          },
        ],
      });

      let toolUsed = false;

      for (const block of response.content) {
        if (block.type === "tool_use") {
          toolUsed = true;

          console.log(`🔧 Claude calling tool: ${block.name}`);
          const result = await callTool(block.name, block.input);
          console.log(" Tool result:", result);

          messages.push({
            role: "assistant",
            content: [block],
          });

          messages.push({
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify(result),
              },
            ],
          });
        } else {
          console.log("🤖 Claude:", block.text);
          messages.push({
            role: "assistant",
            content: block.text,
          });
        }
      }

      // Stop if Claude is waiting for user input
      if (!toolUsed) break;
    }
  }

  rl.close();
  console.log("\n👋 Session ended. Please remember to arrive 15 minutes early for check-in.");
}

run().catch(console.error);

















































































































































// import readline from "readline";
// import Anthropic from "@anthropic-ai/sdk";
// import fetch from "node-fetch";
// import "dotenv/config";

// const NGROK_URL = "https://obliging-odette-unequine.ngrok-free.dev";

// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// });

// // ---------------- TOOL CALLER ----------------

// async function callTool(toolName, args) {
//   const res = await fetch(`${NGROK_URL}/invoke`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       tool_name: toolName,
//       arguments: args,
//     }),
//   });

//   return res.json();
// }

// // ---------------- CLI ----------------

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// function askUser() {
//   return new Promise((resolve) => {
//     rl.question("🧑 You: ", resolve);
//   });
// }

// // ---------------- INTERACTIVE RUNNER ----------------

// async function run() {
//   console.log("🤖 Doctor Appointment Assistant");
//   console.log("Type your request (or 'exit' to quit)\n");

//   let messages = [
//     {
//       role: "system",
//       content:
//         "You are a medical clinic receptionist AI. The doctor owns the calendar. Patients never access it directly. You must check availability before booking. Clinic hours are 10 AM to 6 PM. Only send confirmation emails to patients. Be polite, professional, and clear.",
//     },
//   ];

//   while (true) {
//     const userInput = await askUser();
//     if (userInput.toLowerCase() === "exit") break;

//     messages.push({ role: "user", content: userInput });

//     while (true) {
//       const response = await anthropic.messages.create({
//         model: "claude-sonnet-4-20250514",
//         max_tokens: 1024,
//         messages,
//         tools: [
//           {
//             name: "check_availability",
//             description: "Check if a time slot is available in the doctor's calendar",
//             input_schema: {
//               type: "object",
//               properties: {
//                 start_time: { type: "string" },
//                 end_time: { type: "string" },
//               },
//               required: ["start_time"],
//             },
//           },
//           {
//             name: "schedule_calendar_event",
//             description: "Book an appointment in the doctor's calendar",
//             input_schema: {
//               type: "object",
//               properties: {
//                 summary: { type: "string" },
//                 start_time: { type: "string" },
//                 end_time: { type: "string" },
//               },
//               required: ["summary", "start_time"],
//             },
//           },
//           {
//             name: "send_email_notification",
//             description: "Send an email confirmation to the patient",
//             input_schema: {
//               type: "object",
//               properties: {
//                 to: { type: "string" },
//                 subject: { type: "string" },
//                 body: { type: "string" },
//               },
//               required: ["to", "subject", "body"],
//             },
//           },
//         ],
//       });

//       let toolUsed = false;

//       for (const block of response.content) {
//         if (block.type === "tool_use") {
//           toolUsed = true;

//           console.log(`🔧 Claude calling tool: ${block.name}`);
//           const result = await callTool(block.name, block.input);
//           console.log("✅ Tool result:", result);

//           messages.push({
//             role: "assistant",
//             content: [block],
//           });

//           messages.push({
//             role: "user",
//             content: [
//               {
//                 type: "tool_result",
//                 tool_use_id: block.id,
//                 content: JSON.stringify(result),
//               },
//             ],
//           });
//         } else {
//           console.log("🤖 Claude:", block.text);
//           messages.push({
//             role: "assistant",
//             content: block.text,
//           });
//         }
//       }

//       // Claude is waiting for user input
//       if (!toolUsed) break;
//     }
//   }

//   rl.close();
//   console.log("\n👋 Session ended. Please arrive 15 minutes early for check-in.");
// }

// run().catch(console.error);
