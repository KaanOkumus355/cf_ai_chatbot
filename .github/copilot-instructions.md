# AI Agent Instructions for cf-ai-chatbot

## Project Overview
This is a Cloudflare Workers project that implements an AI chatbot using Cloudflare's AI models and KV storage for conversation memory. The bot is built as a serverless application that runs on Cloudflare's edge network.

## Key Architecture Components

### Core Components
- **Worker Entry Point** (`src/index.js`): Main worker file handling HTTP requests
- **AI Integration**: Uses Cloudflare's AI models via the `AI` binding
- **State Management**: Leverages Cloudflare KV for conversation history storage (`CHAT_MEMORY` binding)

### Development Workflow
```bash
npm run dev     # Start local development server at http://localhost:8787
npm run deploy  # Deploy to Cloudflare Workers
npm test       # Run tests using Vitest
```

## Critical Patterns and Conventions

### Worker Request Handling
- All requests are handled through the `fetch` event handler in `src/index.js`
- Each request can interact with both AI models and KV storage
- Example pattern from `src/index.js`:
```javascript
export default {
  async fetch(request, env) {
    // AI model interaction
    const response = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      prompt: "..."
    });
    
    // KV storage interaction
    await env.CHAT_MEMORY.put("conversation", JSON.stringify(newEntry));
  }
}
```

### Testing
- Tests are written using Vitest with Cloudflare Workers-specific test utilities
- Both unit and integration test styles are supported (see `test/index.spec.js`)
- Use `cloudflare:test` utilities for mocking Worker environment

### Configuration
Project configuration is managed through:
- `wrangler.jsonc`: Worker configuration, bindings, and environment settings
- `package.json`: NPM scripts and dependencies

## Integration Points
1. **AI Model Integration**
   - Uses Cloudflare AI binding specified in `wrangler.jsonc`
   - Current model: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`

2. **KV Storage Integration**
   - Uses `CHAT_MEMORY` KV namespace for persistence
   - Stores conversation history as JSON strings

## Common Tasks
- **Adding New AI Features**: Extend the `fetch` handler in `src/index.js`
- **Modifying Storage Schema**: Update the conversation object structure in KV operations
- **Testing Changes**: Add test cases in `test/index.spec.js` following existing patterns

## Important Notes
- Always use environment bindings (`env.AI`, `env.CHAT_MEMORY`) for external service access
- KV operations are async - always await them
- Remember to update tests when modifying the main worker functionality