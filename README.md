# 🎭 DionysAI

![Language](https://img.shields.io/badge/language-TypeScript-blue?style=flat-square)
![Terminal UI](https://img.shields.io/badge/UI-React%20Ink-lightgrey?style=flat-square)
![LLM](https://img.shields.io/badge/LLM-LangChain-ff69b4?style=flat-square)
![Runtime](https://img.shields.io/badge/runtime-Bun-8A2BE2?style=flat-square)

---

## 🧠 What is DionysAI?

DionysAI is a terminal-based stage where multiple AI actors — each loaded from JSON "cast files" — improvise, debate, ask questions and surprise you.  
Craft a scene by selecting your cast, set a topic, pick the global language, and experience fully creative, focused, and interactive AI-driven dialogue.

---

## ✨ Features

- 🎭 Scene/cast selection wizard: pick available actors (from `/cast/`), see their profile immediately
- 🗂️ Personalities are defined only in JSON, not chosen via wizard (no error or risk)
- 🗣️ Scene-wide language (picked at start, applied globally to all actors and prompt)
- 💬 Highly creative prompt for each actor: every reply must build on the previous, surprise, and never repeat itself!
- ✍️ Dialogue moves around a single topic (strict, warning if off-topic)
- 💡 Tweet-length answers (~144 chars) — creative, vivid, never dull
- 🧩 Modular architecture: easily add new personalities/roles/actors as JSON
- 📄 Auto-export of full dialogue, actor/role/language metadata to `output_script.txt`
- 💻 Rich terminal UI with personality/flags visible
- 👋 No manual role selection — it’s all from the cast file!

---

## 🛠️ Tech Stack

- **TypeScript** — type-safe logic and scalability
- **Bun** — ultra-fast runtime
- **React Ink** — beautiful terminal UIs
- **LangChain** — multi-agent LLM orchestration
- **Console-first** — headless-ready scripting or live interactions

---

## 🚀 Quickstart

1. **Clone the repository**
   ```bash
   git clone https://github.com/avalla/gpt-theatre.git
   cd gpt-theatre
   ```

2. **Setup your environment**

   * Copy `.env.example` to `.env`
   * Add your OpenAI or other LLM API keys

3. **Install dependencies**

   ```bash
   bun install
   ```

4. **Add your actor JSON files to the `/cast/` directory**  
   See examples like `cast/Maria.json`, `cast/Filos.json`, etc. Each file defines personality/profile and systemPrompt.

5. **Run the app**

   ```bash
   bun run src/index.tsx
   ```

6. **Follow the wizard**:
   - Select actors for the scene (numbers, with role preview)
   - Number of turns
   - Mode (manual/auto)
   - Language (scene-wide, applies to all)
   - Custom or AI-invented topic
   - That’s it! No more role selection, all details are from JSON.
   
---

## 🎭 Example Actor Profiles

* **Witty Comedian** – sarcastic, dry humor
* **Philosopher** – deep and existential
* **Science Teacher** – clear, logical, didactic
* **Journalist** – investigative, asks tough questions
* **Old Friend** – emotional and nostalgic
* **Villain** – dramatic, manipulative
* **AI Skeptic** – doubts everything
* **Movie Character** – speaks in references and tropes
* **Emotional** – over-the-top, passionate
* **Deep** – always brings in existential angles
* **Random**, or **Custom** defined in systemPrompt

Each actor’s profile/personality is always loaded from their JSON, never chosen in the wizard.

## 📂 Folder Structure

```
/src        → Main app logic and wizard
/lib        → Actor class, LLM tools, utilities, exporter
/components → Terminal UI components (Ink)
                \
                 /cast   → Actor JSONs (selectable cast)
```

---

## 📄 Output

At the end, DionysAI automatically creates:

* `output_script.txt`
   * Topic
   * Actor list (names, roles, language)
   * Full creative tweet-length transcript (formatted)

Perfect for readings, podcasts, streaming, or LLM "table reads".

---

## 📢 Contribute / Customize

- Add your own actors by dropping new JSON files in `/cast`
- Edit their `systemPrompt` for depth, color, or personality
- Dialogue creativity and tweet-length are guaranteed by prompt
- Scene language and rules are enforced globally via wizard
- Everything is modular (just JSON + prompt)


---

## ⚡ Inspiration

Inspired by:

* Ancient Greek drama
* Roleplay, podcasts, and improv
* Chaos and beauty of conversation

---

## 📜 License

MIT License — use freely, remix creatively.

---

> **DionysAI** — The world is your stage.  

