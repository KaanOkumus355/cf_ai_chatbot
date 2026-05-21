/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env) {

	if (request.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Session-Id',
			}
		});
	}

	if (request.method === 'POST') {
		try {
			const { message } = await request.json(); 

		if (!message) {
			return new Response(JSON.stringify({error: "Message is required"}), {
				status: 400,
				headers: { 'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
				}
			});
		}

		const sessionId = request.headers.get('Session-Id') || 'default-session';
		const memoryKey = `conversation:${sessionId}`;

		const history = await env.CHAT_MEMORY.get(memoryKey);

		let conversationHistory = history ? JSON.parse(history) : [];
		
		conversationHistory.push({
			role: 'user',
			content: message
		})

		const response = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
			messages: [
				{role: 'system', content: 'You are a versatile AI assistant. Provide helpful, accurate responses to questions on any topic. Be clear, concise, and focus on being genuinely useful to the user.' },
				...conversationHistory.slice(-20)
			]
		});

		conversationHistory.push({
			role: "assistant",
			content: response.response
		});


		await env.CHAT_MEMORY.put(memoryKey, JSON.stringify(conversationHistory));

		return new Response(JSON.stringify({response: response.response}), {
			headers: { 'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*'
			}
			});
		} 
		catch (error) {
			return new Response(JSON.stringify({error: error.message}), {
				status: 500,
				headers: { 'Content-Type': 'application/json' ,
				'Access-Control-Allow-Origin': '*'
				}
				});
			}
		}
		return new Response(JSON.stringify({
			message: 'Send a POST request with {"message": "your question" } to chat '
		}), {
			headers: { 'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*'
			}
		});
	},
};