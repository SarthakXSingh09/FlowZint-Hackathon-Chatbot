const BACKEND_URL = "http://localhost:3000/chat";

// ── Helpers ────────────────────────────────────────────────────
function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function scrollToBottom() {
  const messages = document.getElementById("messages");
  messages.scrollTop = messages.scrollHeight;
}

// ── Set welcome message timestamp ──────────────────────────────
document.getElementById("welcome-time").textContent = getTime();

// ── Add a message bubble to the chat ───────────────────────────
function addMessage(text, role) {
  const messages = document.getElementById("messages");

  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const col = document.createElement("div");
  col.className = "msg-col";

  const bubble = document.createElement("div");
  bubble.className = `bubble ${role === "bot" ? "bot-bubble" : "user-bubble"}`;
  bubble.textContent = text;

  const time = document.createElement("span");
  time.className = "msg-time";
  time.textContent = getTime();

  col.appendChild(bubble);
  col.appendChild(time);

  // Bot messages have a small avatar on the left
  if (role === "bot") {
    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2"/>
        <circle cx="12" cy="5" r="2"/>
        <path d="M12 7v4"/>
      </svg>
    `;
    row.appendChild(avatar);
  }

  row.appendChild(col);
  messages.appendChild(row);
  scrollToBottom();
}

// ── Show animated typing indicator ─────────────────────────────
function showTyping() {
  const messages = document.getElementById("messages");

  const row = document.createElement("div");
  row.className = "msg-row bot";
  row.id = "typing-indicator";

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M12 7v4"/>
    </svg>
  `;

  const col = document.createElement("div");
  col.className = "msg-col";

  const typingBubble = document.createElement("div");
  typingBubble.className = "typing-bubble";
  typingBubble.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;

  col.appendChild(typingBubble);
  row.appendChild(avatar);
  row.appendChild(col);
  messages.appendChild(row);
  scrollToBottom();
}

// ── Remove typing indicator ─────────────────────────────────────
function removeTyping() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) indicator.remove();
}

// ── Hide quick reply buttons (after first use) ──────────────────
function hideQuickReplies() {
  const qr = document.getElementById("quick-replies");
  if (qr) {
    qr.style.display = "none";
  }
}

// ── Send message to backend and get AI reply ───────────────────
async function sendToBackend(userMessage) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply;

  } catch (error) {
    console.error("Error talking to backend:", error);
    return "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
  }
}

// ── Main send function ─────────────────────────────────────────
async function sendMessage() {
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const text = input.value.trim();

  // Don't send empty messages
  if (!text) return;

  // Clear input and hide quick replies
  input.value = "";
  autoResize(input);
  hideQuickReplies();

  // Disable send button while waiting
  sendBtn.disabled = true;
  sendBtn.style.opacity = "0.6";

  // Show user message
  addMessage(text, "user");

  // Show typing indicator
  showTyping();

  // Get AI reply from backend
  const reply = await sendToBackend(text);

  // Remove typing, show bot reply
  removeTyping();
  addMessage(reply, "bot");

  // Re-enable send button
  sendBtn.disabled = false;
  sendBtn.style.opacity = "1";
  input.focus();
}

// ── Quick reply buttons ────────────────────────────────────────
function sendQuick(button) {
  const text = button.textContent;
  const input = document.getElementById("chat-input");
  input.value = text;
  sendMessage();
}

// ── Send on Enter (Shift+Enter for new line) ───────────────────
function handleKey(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// ── Auto-resize textarea as user types ────────────────────────
function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 100) + "px";
}

// ── Toggle collapse/expand the chat window ────────────────────
function toggleChat() {
  const container = document.querySelector(".chat-container");
  container.classList.toggle("collapsed");
}
