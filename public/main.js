const messageDiv = document.getElementById('messages');
const textarea = document.querySelector('textarea');
const sendButton = document.querySelector('button');
const typingIndicator = document.getElementById('typingIndicator');

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

  addMessage('user', message);
  textarea.value = '';

  showTypingIndicator();

  try {
    const response = await fetch('https://cf-ai-chatbot.kaan-ai-chatbot.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
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

sendButton.addEventListener('click', sendMessage);
textarea.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});