const messageDiv = document.getElementById('messages');
const textarea = document.querySelector('textarea');
const sendButton = document.querySelector('button');

async function sendMessage() {
  const message = textarea.value.trim();
  if (!message) return;

  addMessage('user', message);
  textarea.value = '';

  const response = await fetch('https://cf-ai-chatbot.kaan-ai-chatbot.workers.dev/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });

    const data = await response.json();
    addMessage('ai', data.response);
}

function addMessage(sender, text) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}-message`;
  messageElement.textContent = text;
  messageDiv.appendChild(messageElement);
  messageDiv.scrollTop = messageDiv.scrollHeight;
}

sendButton.addEventListener('click', sendMessage);
textarea.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});