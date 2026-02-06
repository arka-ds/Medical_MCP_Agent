import fs from "fs";
import { google } from "googleapis";
import readline from "readline";


const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const credentials = JSON.parse(
  fs.readFileSync("credentials.json", "utf8")
);

const { client_id, client_secret, redirect_uris } =
  credentials.installed;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
});

console.log("\nAuthorize this app by visiting this URL:\n");
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nPaste the authorization code here: ", async (code) => {
  const { tokens } = await oAuth2Client.getToken(code);
  fs.writeFileSync("token.json", JSON.stringify(tokens, null, 2));
  console.log("\n✅ token.json created successfully");
  rl.close();
});
