import React, { useState } from "react";
import { render, Box, Text } from "ink";
import TextInput from "ink-text-input";
import fs from "fs";
import path from "path";
import Actor from "../lib/Actor.js";
import ConversationRound from "../components/ConversationRound.js";
import { saveScriptToFile } from "../lib/saveScriptToFile.js";

// System prompt labels
const profileLabels: Record<string, string> = {
  comedian: "Witty Comedian",
  teacher: "Science Teacher",
  philosopher: "Philosopher",
  journalist: "Journalist",
  movie: "Movie Character",
  rival: "Friendly Rival",
  oldfriend: "Old Friend",
  emotional: "Emotional",
  deep: "Philosophically Deep",
  random: "Random",
  custom: "Custom prompt",
};

// Wizard utility: load available actor names & profiles from cast/
function getAvailableActorNames() {
  const dirPath = path.join(process.cwd(), "cast");
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath);
  return files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/i, ""));
}
function getAvailableActorProfiles(availableActorNames: string[]) {
  const dirPath = path.join(process.cwd(), "cast");
  return availableActorNames.map((name) => {
    const data = JSON.parse(
      fs.readFileSync(path.join(dirPath, name + ".json")),
    );
    return data.profile || "unknown-profile";
  });
}
function loadScene(selectedNames: string[], forcedLanguage: string) {
  const dirPath = path.join(process.cwd(), "cast");
  return selectedNames.map((name) => {
    const filePath = path.join(dirPath, `${name}.json`);
    const actor = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    actor.language = forcedLanguage;
    return actor;
  });
}

// -------------------------
// WIZARD
// -------------------------
const SetupPrompt: React.FC<{
  onSubmit: (setup: {
    maxTurns: number;
    autoMode: boolean;
    topic: string;
    language: string;
    scene: Array<any>;
  }) => void;
}> = ({ onSubmit }) => {
  const availableActorNames = getAvailableActorNames();
  const availableActorProfiles = getAvailableActorProfiles(availableActorNames);

  // States
  const [step, setStep] = useState<
    "selectActors" | "turns" | "mode" | "lang" | "topic" | "topic-loading"
  >("selectActors");
  const [selectedActorNumbers, setSelectedActorNumbers] = useState<string>("");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [turns, setTurns] = useState("6");
  const [modeValue, setModeValue] = useState("");
  const [langStep, setLangStep] = useState<1 | 2>(1);
  const [langSelect, setLangSelect] = useState("");
  const [langValue, setLangValue] = useState("");
  const [topicValue, setTopicValue] = useState("");
  const [selectedLang, setSelectedLang] = useState("en");
  const [autoMode, setAutoMode] = useState(false);
  const [tmpMax, setTmpMax] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- WIZARD STEPS ---

  // STEP: selectActors (show personalities)
  if (step === "selectActors") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text>
          Select the actors for your scene. Separate numbers with commas:
        </Text>
        {availableActorNames.map((name, idx) => {
          // Read profile/personality from file (live)
          let profileShort = "unknown-profile";
          try {
            const dirPath = path.join(process.cwd(), "cast");
            const data = JSON.parse(
              fs.readFileSync(path.join(dirPath, name + ".json")),
            );
            profileShort =
              profileLabels[data.profile] || data.profile || "unknown-profile";
          } catch {}
          return (
            <Text key={name}>
              {idx + 1}) {name} <Text color="gray">({profileShort})</Text>
            </Text>
          );
        })}
        <TextInput
          value={selectedActorNumbers}
          onChange={setSelectedActorNumbers}
          onSubmit={(input) => {
            const nums = input
              .split(",")
              .map((x) => parseInt(x.trim(), 10))
              .filter((x) => x >= 1 && x <= availableActorNames.length);
            if (nums.length === 0) {
              setError("Please enter valid numbers separated by commas!");
              return;
            }
            const names = nums.map((n) => availableActorNames[n - 1]);
            setSelectedNames(names);
            setStep("turns");
          }}
          placeholder="1,2,3"
        />
        {error && <Text color="red">{error}</Text>}
      </Box>
    );
  }

  // STEP: turns
  if (step === "turns") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text>How many messages/turns?</Text>
        <TextInput
          value={turns}
          onChange={setTurns}
          onSubmit={(input) => {
            const num = Number(input);
            if (isNaN(num) || !Number.isInteger(num) || num < 1) {
              setError("Please enter a positive integer!");
              return;
            }
            setTmpMax(num);
            setError(null);
            setModeValue("");
            setStep("mode");
          }}
        />
        {error && <Text color="red">{error}</Text>}
      </Box>
    );
  }

  // STEP: mode
  if (step === "mode") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text>Select mode:</Text>
        <Text>1) Manual</Text>
        <Text>2) Automatic</Text>
        <TextInput
          value={modeValue}
          onChange={setModeValue}
          onSubmit={(input) => {
            if (input.trim() === "2") setAutoMode(true);
            else setAutoMode(false);
            setStep("lang");
            setLangStep(1);
            setLangSelect("");
            setLangValue("");
          }}
          placeholder="1 or 2"
        />
        {error && <Text color="red">{error}</Text>}
      </Box>
    );
  }

  // STEP: lang
  if (step === "lang" && langStep === 1) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text>Select language:</Text>
        <Text>1) Italian</Text>
        <Text>2) English</Text>
        <Text>3) Other</Text>
        <TextInput
          value={langSelect}
          onChange={setLangSelect}
          onSubmit={(input) => {
            if (input.trim() === "1") {
              setSelectedLang("it");
              setTopicValue("");
              setStep("topic");
            } else if (input.trim() === "2") {
              setSelectedLang("en");
              setTopicValue("");
              setStep("topic");
            } else if (input.trim() === "3") {
              setLangStep(2);
              setLangValue("");
            } else setError("Choose 1, 2 or 3!");
          }}
          placeholder="1, 2 or 3"
        />
        {error && <Text color="red">{error}</Text>}
      </Box>
    );
  }
  if (step === "lang" && langStep === 2) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text>Enter language code (e.g. es for Spanish):</Text>
        <TextInput
          value={langValue}
          onChange={setLangValue}
          onSubmit={(input) => {
            const lang = input.trim().toLowerCase();
            if (!lang) {
              setError("Please provide a code");
              return;
            }
            setSelectedLang(lang);
            setTopicValue("");
            setStep("topic");
          }}
          placeholder="es, fr, de, ..."
        />
        {error && <Text color="red">{error}</Text>}
      </Box>
    );
  }

  // STEP: topic
  if (step === "topic") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text>
          Choose the topic (or type 'invent' for a random AI-generated topic):
        </Text>
        <TextInput
          value={topicValue}
          onChange={setTopicValue}
          onSubmit={(input) => {
            const t = input.trim();
            if (!t) {
              setError("Please provide a topic.");
              return;
            }
            const actorsArr = loadScene(selectedNames, selectedLang);
            onSubmit({
              maxTurns: tmpMax!,
              autoMode: autoMode,
              topic: t,
              language: selectedLang,
              scene: actorsArr,
            });
          }}
          placeholder="topic or invent"
        />
        {error && <Text color="red">{error}</Text>}
      </Box>
    );
  }

  // ... altri step come topic-loading se serve (omesso per brevità)

  return null;
};

// APP ROOT
const App = () => {
  const [setup, setSetup] = useState<{
    maxTurns: number;
    autoMode: boolean;
    topic: string;
    language: string;
    scene: Array<any>;
  } | null>(null);
  const [scriptSaved, setScriptSaved] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(true);

  require("ink").useInput((input, key) => {
    if (showSummary && (key.return || input === " ")) setShowSummary(false);
  });

  if (setup == null) return <SetupPrompt onSubmit={setSetup} />;

  if (showSummary) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="yellow"
        padding={1}
        margin={1}
      >
        <Text color="greenBright" bold>
          🎭 DionysAI — Setup Summary 🎭
        </Text>
        <Text>
          Turns: <Text color="yellow">{setup.maxTurns}</Text>
        </Text>
        <Text>
          Mode:{" "}
          <Text color="yellow">{setup.autoMode ? "Automatic" : "Manual"}</Text>
        </Text>
        <Text>
          Language: <Text color="yellow">{setup.language}</Text>
        </Text>
        <Text>
          Topic: <Text color="magenta">{setup.topic}</Text>
        </Text>
        <Text>Actors:</Text>
        {setup.scene.map((a, idx) => (
          <Box
            key={a.name + a.model + idx}
            marginLeft={2}
            flexDirection="column"
          >
            <Text>
              <Text color="cyan">{a.name}</Text>
              {" · "}Model: <Text color="yellow">{a.model}</Text>
              {" · "}Personality: <Text color="yellow">{a.profile}</Text>
            </Text>
            <Text color="gray">
              {a.systemPrompt && a.systemPrompt.length > 72
                ? a.systemPrompt.slice(0, 72) + "..."
                : a.systemPrompt || "(standard personality)"}
            </Text>
          </Box>
        ))}
        <Text />
        <Text color="greenBright">
          Press [Enter] to start the conversation!
        </Text>
      </Box>
    );
  }

  // Prompt strong context for creativity, tweet-length, and focus
    const actorsWithTopic = setup.scene.map(meta => {
        const creativityPrompt = `
    Your role: ${profileLabels[meta.profile] || meta.profile || "character"}.
    Language: ${setup.language.toUpperCase()} ONLY.
    Main topic: "${setup.topic}".

    RULES:
    - Every response must build on what's been said, add something new, and must not repeat the same idea or wording.
    - Be creative and brilliant! Add anecdotes, funny twists, subplots, or surprising insights.
    - Ask the other actor questions, provoke them, or propose unexpected analogies or connections!
    - Never be predictable or dull.
    - If you are about to change topic/language without explicit request, WARN the user: [Warning: attempting to change topic/language].
    - Do NOT change topic unless the user explicitly asks.
    - Each response: about 144 characters, like a tweet.
  `.replace(/\s+/g, " ").trim();

        return new Actor({
            ...meta,
            baseContext: creativityPrompt,
            profile: meta.profile,
            language: setup.language
        });
    });
  const profiles = setup.scene.map((a) => a.profile || "unknown-profile");
  const languages = setup.scene.map((a) => setup.language || "en");
  const handleEnd = (history: any[]) => {
    saveScriptToFile(
      `${setup.topic} (language: ${setup.language})`,
      history,
      "output_script.txt",
      setup.scene.map((a, i) => ({
        name: a.name,
        profile: profiles[i],
        language: setup.language || "en",
      })),
    );
    setScriptSaved(true);
  };

  return (
    <>
      <ConversationRound
        actors={actorsWithTopic}
        initialContext={`${setup.topic} (language: ${setup.language})`}
        turnOrder={actorsWithTopic.map((a) => a.name)}
        maxTurns={setup.maxTurns}
        autoMode={setup.autoMode}
        onEnd={handleEnd}
        profiles={profiles}
        languages={languages}
      />
      {scriptSaved && (
        <Box borderStyle="round" borderColor="green" padding={1} marginTop={1}>
          <Text>
            Script exported to <Text color="yellow">output_script.txt</Text>
          </Text>
        </Box>
      )}
    </>
  );
};

render(<App />);
