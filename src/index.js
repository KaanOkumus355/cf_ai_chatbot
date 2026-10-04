/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const MAX_HISTORY = 20; // messages kept per session (10 user/assistant pairs)
const HISTORY_TTL = 60 * 60 * 24 * 7; // 7 days, in seconds
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
	});
}

export default {
  async fetch(request, env) {

	if (request.method === 'OPTIONS') {
		return new Response(null, { headers: CORS_HEADERS });
	}

	if (request.method === 'POST') {
		try {
			const { message, sessionId } = await request.json();

			if (!message) {
				return json({ error: "Message is required" }, 400);
			}
			if (typeof sessionId !== 'string' || !UUID_RE.test(sessionId)) {
				return json({ error: "A valid sessionId (UUID) is required" }, 400);
			}

			const memoryKey = `history:${sessionId}`;

			// 1. Load this session's history
			const history = await env.CHAT_MEMORY.get(memoryKey);
			const conversationHistory = history ? JSON.parse(history) : [];

			// 2. Append the new user message
			conversationHistory.push({ role: 'user', content: message });

			// 3. Call the model with the full history
			const response = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
				messages: [
					{role: 'system', content: 'You are a versatile AI assistant. Provide helpful, accurate responses to questions on any topic. Be clear, concise, and focus on being genuinely useful to the user.' },
					...conversationHistory
				]
			});

			// 4. Append the AI reply
			conversationHistory.push({ role: 'assistant', content: response.response });

			// 5. Save (capped, with expiry)
			await env.CHAT_MEMORY.put(
				memoryKey,
				JSON.stringify(conversationHistory.slice(-MAX_HISTORY)),
				{ expirationTtl: HISTORY_TTL }
			);

			return json({ response: response.response });
		}
		catch (error) {
			return json({ error: error.message }, 500);
		}
	}

	const sessionId = new URL(request.url).searchParams.get('sessionId');
	if (sessionId !== null) {
		if (!UUID_RE.test(sessionId)) {
			return json({ error: "A valid sessionId (UUID) is required" }, 400);
		}
		const history = await env.CHAT_MEMORY.get(`history:${sessionId}`);
		return json({ history: history ? JSON.parse(history) : [] });
	}

	return json({
		message: 'Send a POST request with {"message": "your question", "sessionId": "<uuid>" } to chat '
	});
  },
};
