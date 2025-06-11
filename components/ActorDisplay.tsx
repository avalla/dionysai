import React from "react";
import { Box, Text } from "ink";
import type Actor from "../lib/Actor.js";

export interface ActorDisplayProps {
	actor: Actor;
	showContext?: boolean;
}

const ActorDisplay: React.FC<ActorDisplayProps> = ({ actor, showContext = false }) => (
	<Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
		<Text>
			<Text color="yellow">Name:</Text> {actor.name}
		</Text>
		<Text>
			<Text color="yellow">LLM Model:</Text> {actor.model}
		</Text>
		<Text>
			<Text color="yellow">Personality:</Text> {actor.profile}
		</Text>
		<Text>
			<Text color="yellow">Language:</Text> {actor.language}{" "}
			{actor.language === "it" && "🇮🇹"}
			{actor.language === "en" && "🇬🇧"}
			{actor.language === "es" && "🇪🇸"}
			{actor.language === "fr" && "🇫🇷"}
			{actor.language === "de" && "🇩🇪"}
			{actor.language === "pt" && "🇵🇹"}
			{actor.language === "ru" && "🇷🇺"}
			{actor.language === "zh" && "🇨🇳"}
			{actor.language === "ja" && "🇯🇵"}
			{actor.language === "pl" && "🇵🇱"}
			{actor.language === "nl" && "🇳🇱"}
			{actor.language === "tr" && "🇹🇷"}
			{actor.language === "ar" && "🇸🇦"}
			{actor.language === "uk" && "🇺🇦"}
			{actor.language === "cs" && "🇨🇿"}
			{actor.language === "ro" && "🇷🇴"}
		</Text>
		{showContext && actor.baseContext && (
			<Text>
				<Text color="yellow">Base Context / System Prompt:</Text> {actor.baseContext}
			</Text>
		)}
	</Box>
);

export default ActorDisplay;