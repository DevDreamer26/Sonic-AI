import http from "node:http";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

async function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(JSON.parse(data)));
    req.on("error", reject);
  });
}
const server = http.createServer(async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  switch (req.method) {
    case "POST":
      const body = await parseRequestBody(req);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: body.prompt,
      });
      return res.end(response.text);
    default:
      return res.end("non-POST request received");
  }
});

const port = Number(process.env.PORT) || 8000;
server.listen(port, function () {
  console.log(`server running on port ${port}`);
});
