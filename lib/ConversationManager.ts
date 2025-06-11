// ConversationManager: gestisce una conversazione tra più attori AI, orchestrando i turni e i messaggi.
//
// Il manager tiene traccia dello stato della conversazione, del turno corrente,
// e consente di far parlare gli attori in sequenza o secondo una logica custom.

import Actor from "./Actor.js";

// Rappresenta un singolo scambio nella conversazione
export interface ConversationTurn {
	actorName: string;
	message: string;
	response?: string;
	timestamp: Date;
}

export interface ConversationManagerOptions {
	actors: Actor[];
	initialContext?: string;
	turnOrder?: string[]; // se vuoto: ordine di array actors
}

export default class ConversationManager {
	private actors: Map<string, Actor>;
	private turns: ConversationTurn[];
	private context: string;
	private turnOrder: string[];
	private currentTurnIndex: number;

	constructor(options: ConversationManagerOptions) {
		this.actors = new Map();
		options.actors.forEach(actor => this.actors.set(actor.name, actor));
		this.context = options.initialContext ?? "";
		this.turnOrder = options.turnOrder && options.turnOrder.length
			? options.turnOrder
			: options.actors.map(a => a.name);
		this.currentTurnIndex = 0;
		this.turns = [];
	}

	public getActors(): Actor[] {
		return Array.from(this.actors.values());
	}

	public getHistory(): ConversationTurn[] {
		return this.turns.slice();
	}

	public getCurrentActor(): Actor {
		const actorName = this.turnOrder[this.currentTurnIndex % this.turnOrder.length];
		const actor = this.actors.get(actorName);
		if (!actor) throw new Error(`Attore "${actorName}" non trovato.`);
		return actor;
	}

	public nextActor(): Actor {
		this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
		return this.getCurrentActor();
	}

	// Avvia/continua la discussione: l'attore corrente riceve il messaggio ed elabora una risposta
	public async playTurn(message: string): Promise<ConversationTurn> {
		const actor = this.getCurrentActor();

		// Prepara un contesto più naturale/vario: tutti i turni se <10, altrimenti ultimi 6
		const N = this.turns.length < 10 ? this.turns.length : 6;
		const recentTurns = this.turns.slice(-N).map(
			t => `[${t.actorName}]: ${t.message}${t.response ? `\n${t.response}` : ""}`
		).join('\n');
		const contextForTurn = [this.context, recentTurns].filter(Boolean).join('\n');

		// Random: topic switch con 10% di probabilità
		const topicSwitch = Math.random() < 0.10;

		const response = await actor.ask(message, contextForTurn, topicSwitch);

		const turn: ConversationTurn = {
			actorName: actor.name,
			message,
			response,
			timestamp: new Date()
		};

		this.turns.push(turn);

		// Aggiorna il contesto per la conversazione (semplificato)
		this.context += `\n[${actor.name}]: ${response}`;

		this.nextActor();
		return turn;
	}

	public resetConversation(): void {
		this.turns = [];
		this.currentTurnIndex = 0;
		this.context = "";
	}
}
