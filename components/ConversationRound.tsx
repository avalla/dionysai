import React, { useState, useCallback } from "react";
import { Box, Text, useApp, useInput } from "ink";
import type Actor from "../lib/Actor.js";
import type { ConversationTurn, ConversationManagerOptions } from "../lib/ConversationManager.js";
import ConversationManager from "../lib/ConversationManager.js";
import ActorDisplay from "./ActorDisplay.js";

interface ConversationRoundProps {
	actors: Actor[];
	initialContext?: string;
	turnOrder?: string[];
	maxTurns?: number;
	onEnd?: (history: ConversationTurn[]) => void;
	autoMode?: boolean; // auto-play senza premere invio ad ogni risposta
}

const ConversationRound: React.FC<ConversationRoundProps & { profiles?: string[], languages?: string[] }> = ({
	actors,
	initialContext,
	turnOrder,
	maxTurns = 6,
	onEnd,
	autoMode = false,
	profiles = [],
	languages = []
}) => {
	const { exit } = useApp();
	const [manager] = useState(
		() => new ConversationManager({ actors, initialContext, turnOrder })
	);
	const [history, setHistory] = useState<ConversationTurn[]>([]);
	const [currentMessage, setCurrentMessage] = useState<string>("Ciao a tutti!");
	const [status, setStatus] = useState<"idle" | "thinking" | "done">("idle");
	const [turnIndex, setTurnIndex] = useState<number>(0);

	const playNextTurn = useCallback(async () => {
		setStatus("thinking");
		const turn = await manager.playTurn(currentMessage);
		setHistory(prevHistory => {
			const newHistory = [...prevHistory, turn];
			setCurrentMessage(turn.response ?? "");
			setTurnIndex(newHistory.length);
			if (newHistory.length >= maxTurns) {
				setStatus("done");
				if (onEnd) onEnd(newHistory);
				exit();
			} else {
				setStatus("idle");
			}
			return newHistory;
		});
		// eslint-disable-next-line
	}, [manager, currentMessage, maxTurns, exit, onEnd]);

	// Si avanza con SPAZIO o ENTER, si annulla con ESC/Q (solo se non in autoMode)
	useInput((input, key) => {
		if (autoMode) return;
		if (key.escape || input.toLowerCase() === "q") {
			exit();
		}
		if (key.return || input === " ") {
			if (status === "idle") playNextTurn();
		}
	});

	let currentActor: Actor | null = null;
	try {
		currentActor = manager.getCurrentActor();
	} catch {
		currentActor = null;
	}

	// Effect: in autoMode, avanza automaticamente ogni turno dopo che lo status torna idle e non è ancora finito
	React.useEffect(() => {
		if (!autoMode) return;
		if (status === "idle" && turnIndex < maxTurns) {
			playNextTurn();
		}
	}, [autoMode, status, turnIndex, maxTurns, playNextTurn]);

	return (
		<Box flexDirection="column" padding={1}>
			<Text color="green" bold>
				🗣  Round di Conversazione tra Attori AI
			</Text>
			<Box>
				<Text>
					{autoMode
						? <Text color="yellow">Modalità automatica: la conversazione avanza senza nessun input...</Text>
						: <>Avanza con <Text color="yellow">[SPACE]</Text> / <Text color="yellow">[ENTER]</Text> · Esci con <Text color="red">[ESC/Q]</Text></>
					}
				</Text>
			</Box>
			<Box marginBottom={1} flexDirection="column">
				<Text color="cyanBright" underline>
					Argomento: <Text color="white">{initialContext || "Nessun argomento specificato"}</Text>
				</Text>
			</Box>
			<Box marginBottom={1} flexDirection="column">
				<Text color="cyanBright" underline>
					Storia Conversazione ({history.length}/{maxTurns} turni):
				</Text>
				{history.length === 0 ? (
					<Text dimColor>Nessun turno ancora svolto.</Text>
				) : (
					history.map((turn, i) => (
						<Box key={i} flexDirection="column" marginBottom={1}>
							<Text>
								<Text color="magenta">[{turn.actorName}]</Text>
								{" "}- <Text color="white">{turn.response ?? "(nessuna risposta)"}</Text>
							</Text>
						</Box>
					))
				)}
			</Box>
			<Box marginBottom={1} flexDirection="column">
				{currentActor && (
					<>
						<Text color="yellow">
							Next turn: <Text color="white">{currentActor.name}</Text> (model: {currentActor.model})
						</Text>
						<ActorDisplay
							actor={currentActor}
							showContext={false}
							profile={profiles[turnIndex % profiles.length]}
							language={languages[turnIndex % languages.length]}
						/>
					</>
				)}
				{status === "thinking" ? (
					<Text color="gray" italic>Generating AI response...</Text>
				) : (
					<Text dimColor>
						Ready for message: <Text color="white">{currentMessage}</Text>
					</Text>
				)}
			</Box>
			{status === "done" && (
				<Box>
					<Text color="greenBright" bold>
						✔ Conversazione terminata dopo {history.length} turni!
					</Text>
				</Box>
			)}
		</Box>
	);
};

export default ConversationRound;