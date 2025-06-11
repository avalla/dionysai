// Utility di export transcript/script
import { writeFileSync } from "fs";

export function saveScriptToFile(
  topic: string,
  history: any[],
  path: string,
  actorsMeta?: { name: string; profile?: string; language?: string }[],
) {
  const personaLines =
    actorsMeta && actorsMeta.length
      ? [
          "ACTORS:",
          ...actorsMeta.map(
            (a) =>
              `- ${a.name} — profile: ${a.profile || "N/A"}, language: ${a.language || "N/A"}`,
          ),
          "",
        ]
      : [];
  const lines = [
    `TOPIC: ${topic}`,
    ...personaLines,
    ...history.map((turn) => `[${turn.actorName}]\n${turn.response}`),
  ];
  writeFileSync(path, lines.join("\n\n"), "utf8");
}
