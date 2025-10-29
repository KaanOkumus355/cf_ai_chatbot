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
				'Access-Control-Allow-Headers': 'Content-Type',
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

		const history = await env.CHAT_MEMORY.get("conversation");

		let conversationHistory = [];
		if (history) {
			const historyObj = JSON.parse(history);

			conversationHistory = [
				{role: 'user', content: historyObj.human },
				{role: 'assistant' , content: historyObj.ai }
			];
		} 

		const response = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
			messages: [
				{role: 'system', content: 'You are a versatile AI assistant. Provide helpful, accurate responses to questions on any topic. Be clear, concise, and focus on being genuinely useful to the user.' },
				...conversationHistory,
				{role: 'user' , content: message}
			]
		});

		const newEntry = {
			human: message,
			ai: response.response,
			timestamp: new Date().toISOString()
		};

		await env.CHAT_MEMORY.put("conversation", JSON.stringify(newEntry));

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