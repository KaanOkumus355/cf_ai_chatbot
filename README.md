# CF_AI_Chatbot - AI-Powered Chat Application

A full-stack AI chat application built on Cloudflare's platform featuring real-time conversations with memory using Llama 3.3.

## 🚀 Live Demo
**Frontend**: https://7e41a682.cf-ai-chatbot-frontend.pages.dev/
**Backend API**: https://cf-ai-chatbot.kaan-ai-chatbot.workers.dev

## 🎯 Features
- **AI Conversations**: Powered by Llama 3.3 via Cloudflare Workers AI
- **Conversation Memory**: Remembers chat history using Cloudflare KV storage
- **Real-time Chat**: Clean, responsive interface built with Cloudflare Pages
- **Typing Indicators**: Visual feedback while AI processes responses
- **Professional UI**: Modern gradient design with message bubbles

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript + Cloudflare Pages
- **Backend**: Cloudflare Worker + Workers AI (Llama 3.3)
- **Database**: Cloudflare KV for conversation memory
- **Deployment**: Fully deployed on Cloudflare's edge network

## 📋 Prerequisites
- Node.js and npm
- Cloudflare account
- Wrangler CLI installed

## 🏃‍♂️ Running Locally

### Backend (Worker)
```bash
cd cf-ai-chatbot
npm install
wrangler dev
```

### Frontend
```bash
cd public
# Open index.html in browser or use local server
python -m http.server 3000
```

## 🚀 Deployment

### Deploy Worker
```bash
wrangler deploy
```

### Deploy Frontend to Pages
```bash
cd public
npx wrangler pages deploy . --project-name=cf-ai-chatbot-frontend
```
## 📁 Project Structure
cf_ai_chatbot/
├── src/
│   └── index.js          # Cloudflare Worker with AI integration
├── public/               # Frontend assets
│   ├── index.html        # Chat interface
│   ├── style.css         # Styling and animations
│   └── main.js           # Frontend logic
├── wrangler.jsonc        # Worker configuration
├── README.md            # This file
└── PROMPTS.md           # AI development prompts and diary

## 🔧 API Endpoints

### POST /
Send a message to the AI:
```bash
{
  "message": "What is Cloudflare Workers?"
}
```
Response:
```bash
{
  "response": "Cloudflare Workers is a serverless platform..."
}
```

### GET /
Returns API usage instructions

## 🎨 Customization
Modify system prompt in src/index.js to change AI personality

Adjust colors in public/style.css for different themes

Update model in Worker from llama-3.3-70b-instruct-fp8-fast to other options

## 📝 Development Notes
AI-assisted development and personal notes documented in PROMPTS.md

CORS configured for frontend-backend communication

Conversation history stored with timestamps in KV

## 📄 License
MIT License - see  file for details
 
