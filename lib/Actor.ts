// Classe Actor per rappresentare un attore AI nel sistema, integrato con tutti i provider principali via getChatModel

import { getChatModel } from "./getChatModel.js";
import type { BaseMessage } from "@langchain/core/messages";

export type ModelType =
	| "openai"
	| "anthropic"
	| "llama"
	| "huggingface"
	| "scaleway"
	| "deepseek"
	| "custom"
	| string;

export type ActorMode = "chat" | "script";

export interface ActorOptions {
	name: string;
	model: ModelType;
	baseContext?: string;
	temperature?: number;
	mode?: ActorMode;
	systemPrompt?: string;
	profile?: string;
	language?: string;
}

export default class Actor {
	public name: string;
	public model: ModelType;
	public baseContext: string;
	public temperature: number;
	public mode: ActorMode;
	public systemPrompt: string | null;
	public profile: string;
	public language: string;

	constructor(options: ActorOptions) {
		this.name = options.name;
		this.model = options.model;
		this.baseContext = options.baseContext ?? "";
		this.temperature = options.temperature ?? 0.7;
		this.mode = options.mode ?? "chat";
		this.systemPrompt = options.systemPrompt ?? null;
		this.profile = options.profile || "unknown-profile";
		this.language = options.language || "en";
	}

	// Prepara il prompt contestuale per il modello LLM
	public getPrompt(message: string): string {
		return `${this.baseContext ? this.baseContext + '\n' : ''}[${this.name}]: ${message}`;
	}

	/**
	 * Chiamata generica a LLM con proxy per handling 'invent random topic'.
	 * Se useInventTopic=true, chiede al modello di generare un argomento casuale.
	 */
	private async inventRandomTopic(): Promise<string> {
		const llm = getChatModel(this.model, this.temperature);
		const messages: BaseMessage[] = [
			{
				role: "system",
				content:
					"Invent a creative, unique, or fun topic for two expert AIs to discuss. Reply ONLY with the topic sentence/title and nothing else.",
			},
		];
		const res = await llm.call(messages);
		if (typeof res === "string") return res;
		if (typeof res === "object" && "content" in res) return (res as any).content ?? "(No topic returned)";
		return "(No topic from invention)";
	}

	/**
	 * Richiede una risposta reale all'attore via modello universale getChatModel, fallback stub se errore.
	 * randomTopicSwitch: se true, l'attore può cambiare argomento.
	 */
	public async ask(question: string, context?: string, randomTopicSwitch = false): Promise<string> {
		try {
			let finalContext = context || "";
			let actualQuestion = question;

			// --- CAMBIO RANDOM ARGOMENTO ---
			if (randomTopicSwitch) {
				const topic = await this.inventRandomTopic();
				finalContext += `\nNUOVO ARGOMENTO: ${topic}`;
				actualQuestion = `Let's discuss about: ${topic}`;
			}

			// Stile naturale avanzato/personalizzazione (systemPrompt per attore se presente):
			let systemInstructions = "";
			if (this.systemPrompt) {
				systemInstructions = this.systemPrompt;
			} else if (this.mode === "script") {
				systemInstructions =
					"Answer in script format, as if this were a real staged dialogue. Never repeat or echo the last message, instead build upon it or react with emotion or detail.";
			} else {
				systemInstructions =
					"Continue the conversation naturally. Do not just repeat or mirror the previous message; add new details, ask follow-up, reply with imagination.";
			}

			const llm = getChatModel(this.model, this.temperature);
			const messages: BaseMessage[] = [
				{
					role: "system",
					content: [systemInstructions, this.baseContext].filter(Boolean).join(" ")
				},
				...(finalContext ? [{ role: "system", content: finalContext }] : []),
				{
					role: "user",
					content: actualQuestion,
				},
			];
			const res = await llm.call(messages);
			// standard output: string | { content: string }
			if (typeof res === "string") return res;
			if (typeof res === "object" && "content" in res) return (res as any).content ?? "(risposta vuota dal modello LLM)";
			return "(risposta vuota dal modello LLM)";
		} catch (err: any) {
			return `(${this.name} [errore modello ${this.model}]: ${err?.message || String(err)} | fallback demo) (${this.name} risponde al messaggio: "${question}")`;
		}
	}

	// Stub: Esegue una azione custom contestuale all'attore
	public async act(action: string): Promise<string> {
		return `(${this.name} compie l'azione: "${action}")`;
	}
}
