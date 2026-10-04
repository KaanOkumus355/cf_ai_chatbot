const messageDiv = document.getElementById('messages');
const textarea = document.querySelector('textarea');
const sendButton = document.querySelector('.input-area button');
const newChatButton = document.getElementById('newChatButton');
const typingIndicator = document.getElementById('typingIndicator');

const API_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:8787/'
  : 'https://cf-ai-chatbot.kaan-ai-chatbot.workers.dev/';

// One sessionId per browser. Falls back to an in-memory ID if localStorage is blocked.
let memorySessionId = null;

function getSessionId() {
  try {
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('sessionId', id);
    }
    return id;
  } catch {
    if (!memorySessionId) memorySessionId = crypto.randomUUID();
    return memorySessionId;
  }
}

function startNewChat() {
  const id = crypto.randomUUID();
  memorySessionId = id;
  try {
    localStorage.setItem('sessionId', id);
  } catch {}
  messageDiv.querySelectorAll('.message').forEach((el) => el.remove());
  hideTypingIndicator();
}

function showTypingIndicator() {
  hideTypingIndicator();
    
  typingIndicator.style.display = 'flex';

  messageDiv.scrollTop = messageDiv.scrollHeight;
}

function hideTypingIndicator() {
  if (typingIndicator) {
    typingIndicator.style.display = 'none';
  }
}

async function sendMessage() {
  const message = textarea.value.trim();
  if (!message) return;

  const sessionId = getSessionId();

  addMessage('user', message);
  textarea.value = '';

  showTypingIndicator();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId })
    });

    const data = await response.json();
    hideTypingIndicator(); 
    addMessage('ai', data.response);

  } catch (error) {
    hideTypingIndicator(); 
    addMessage('ai', 'Sorry, I encountered an error. Please try again.');
  }
}

function addMessage(sender, text) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}-message`;
  messageElement.textContent = text;
  messageDiv.appendChild(messageElement);
  messageDiv.insertBefore(messageElement, typingIndicator);
  messageDiv.scrollTop = messageDiv.scrollHeight;
}

async function loadHistory() {
  try {
    const sessionId = getSessionId();
    const response = await fetch(`${API_URL}?sessionId=${encodeURIComponent(sessionId)}`);
    const data = await response.json();
    if (sessionId !== getSessionId()) return; // "New chat" was clicked meanwhile
    (data.history || []).forEach((m) => addMessage(m.role === 'user' ? 'user' : 'ai', m.content));
  } catch {
    // History is a convenience; the chat still works without it.
  }
}

loadHistory();

sendButton.addEventListener('click', sendMessage);
newChatButton.addEventListener('click', startNewChat);
textarea.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});