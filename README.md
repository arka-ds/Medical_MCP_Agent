# Medical MCP Agent

This project implements an MCP-style agentic architecture using Claude to
autonomously manage doctor appointment scheduling.

## Features
- LLM-driven tool selection
- Doctor-owned Google Calendar
- Availability checks with clinic-hour enforcement
- Appointment booking
- Patient-only email notifications

## Architecture
- `run.js` — interactive receptionist agent
- `server.js` — MCP-style tool server
- Tools exposed over HTTP
- Claude decides tool usage autonomously

## Security
- OAuth credentials and tokens are excluded
- Patients never access the calendar directly

