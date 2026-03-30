import "./style.css";
import { marked } from "marked";



const apiUrl = import.meta.env.VITE_BACKEND_URL;
const btnRecord = document.getElementById("btn_record");
const uListChat = document.getElementById("ulist_chat");
const statusIndicator = document.getElementById("status");
const chatContainer = document.getElementById("chat-container");
const contactContainer = document.getElementById("contact-container");
const visualizer = document.getElementById("visualizer");

// Nav Selectors
const navChat = document.getElementById("nav_chat");
const navContact = document.getElementById("nav_contact");

// View Switching Logic
navChat.addEventListener("click", () => {
    navChat.classList.add("active");
    navContact.classList.remove("active");
    chatContainer.classList.remove("hidden");
    contactContainer.classList.add("hidden");
});

navContact.addEventListener("click", () => {
    navContact.classList.add("active");
    navChat.classList.remove("active");
    contactContainer.classList.remove("hidden");
    chatContainer.classList.add("hidden");
});

// --- Speech Logic (Same as before but cleaned up) ---

function toggleRecording(config, listener) {
  if (config.isListening) {
    config.isListening = false;
    btnRecord.classList.remove("recording");
    visualizer.classList.remove("active");
    statusIndicator.innerText = "Processing...";
    listener.stop();
  } else {
    config.isListening = true;
    btnRecord.classList.add("recording");
    visualizer.classList.add("active");
    statusIndicator.innerText = "Listening...";
    listener.start();
  }
}

async function promptAI(prompt) {
  try {
    const res = await fetch(apiUrl, {
      body: JSON.stringify({ prompt }),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return await res.text();
  } catch (err) {
    return "Exceeded your current quota, please try again later. If the problem persists, contact support.";
  }
}

function appendToChat(text, type) {
  const li = document.createElement("li");
  li.classList.add(type);
  li.innerHTML = type === "ai_response" ? marked.parse(text) : text;
  uListChat.appendChild(li);
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
}

function setUpSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const listener = new SpeechRecognition();
  listener.continuous = true;
  let transcript = "";

  listener.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) transcript += e.results[i][0].transcript;
    }
  };

  listener.onend = async () => {
    if (!transcript.trim()) {
        statusIndicator.innerText = "System Ready";
        return;
    }
    btnRecord.disabled = true;
    statusIndicator.innerText = "Sonic is thinking...";
    appendToChat(transcript, "transcript");
    
    const aiRes = await promptAI(transcript);
    appendToChat(aiRes, "ai_response");

    btnRecord.disabled = false;
    statusIndicator.innerText = "System Ready";
    transcript = "";
  };
  return listener;
}

function start() {
  const config = { isListening: false };
  const listener = setUpSpeechRecognition();
  btnRecord.addEventListener("click", () => toggleRecording(config, listener));
}

// Check for API and Start
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    start();
} else {
    statusIndicator.innerText = "Unsupported Browser";
}