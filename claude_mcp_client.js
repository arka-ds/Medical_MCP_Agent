// # import anthropic
// # import os
// # import json

// # NGROK_URL = "https://obliging-odette-unequine.ngrok-free.dev"

// # client = anthropic.Anthropic(
// #     api_key=os.getenv("ANTHROPIC_API_KEY")
// # )

// # response = client.messages.create(
// #     model="claude-sonnet-4-20250514",
// #     max_tokens=1024,

// #     # 🔑 Required for MCP
// #     extra_headers={
// #         "anthropic-beta": "mcp-client-2025-11-20"
// #     },

// #     messages=[
// #         {
// #             "role": "user",
// #             "content": (
// #                 "Book a doctor appointment on June 12, 2026 at 3 PM for 1 hour, "
// #                 "add it to my Google Calendar, and email confirmation to "
// #                 "connection.error504@gmail.com"
// #             )
// #         }
// #     ],

// #     # 🌐 Your remote MCP-style server
// #     mcp_servers=[
// #         {
// #             "type": "url",
// #             "url": NGROK_URL,
// #             "name": "calendar-tools"
// #         }
// #     ],

// #     # 🧠 Claude discovers tools from MCP
// #     tools=[
// #         {
// #             "type": "mcp_toolset",
// #             "mcp_server_name": "calendar-tools"
// #         }
// #     ]
// # )

// # print(json.dumps(response.content, indent=2))







// import Anthropic from "@anthropic-ai/sdk";

// const NGROK_URL = "https://obliging-odette-unequine.ngrok-free.dev";

// const client = new Anthropic({
//     apiKey: process.env.ANTHROPIC_API_KEY
// });

// const response = await client.messages.create({
//     model: "claude-sonnet-4-20250514",
//     max_tokens: 1024,
//     headers: {
//         "anthropic-beta": "mcp-client-2025-11-20"
//     },
//     messages: [
//         {
//             role: "user",
//             content: (
//                 "Book a doctor appointment on June 12, 2026 at 3 PM for 1 hour, "
//                 "add it to my Google Calendar, and email confirmation to "
//                 "connection.error504@gmail.com"
//             )
//         }
//     ]
// });

// console.log(response);