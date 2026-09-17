import { generateResponse } from "@/lib/services/species-chat";

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as { message?: unknown };
		const message = typeof body.message === "string" ? body.message.trim() : "";

		console.log("Received chatbot request:", message);

		if (!message) {
			return Response.json({ error: "Message is required." }, { status: 400 });
		}

		const response = await generateResponse(message);
		console.log("Generated chatbot response.");

		return Response.json({ response });
	} catch (error) {
		console.error("Chat API request failed:", error);
		return Response.json({ error: "Unable to process chatbot request." }, { status: 500 });
	}
}
