import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOllama } from "@langchain/ollama";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { BaseChatModel } from "@langchain/core/dist/language_models/chat_models.js";

/**
 * Returns an initialized chat model instance based on the model name and config from ENV variables.
 *
 * Supports: OpenAI (including custom/Scaleway/Proxy), Anthropic (Claude), Ollama (Llama), HuggingFace, DeepSeek.
 *
 * Supported ENV variables (set them in your .env):
 *  - OPENAI_API_KEY           # for OpenAI models
 *  - OPENAI_API_BASE          # [optional] for custom OpenAI endpoint
 *  - ANTHROPIC_API_KEY        # for Anthropic Claude models
 *  - OLLAMA_URL               # for Ollama embedded/remote (e.g. http://localhost:11434)
 *  - SCW_SECRET_KEY           # for Scaleway AI models
 *  - HF_API_KEY               # HuggingFace Inference API token
 *  - DEEPSEEK_API_KEY         # for DeepSeek (OpenAI-compatible API)
 *  - DEEPSEEK_API_BASE        # [optional] for custom DeepSeek endpoint
 *
 * @param model - Model name (e.g. gpt-3.5-turbo, claude-3, llama2, mistral, etc.)
 * @param temperature - Temperature for text generation
 */
export function getChatModel(model: string, temperature = 0): BaseChatModel {
  const lcOpts = { temperature };

  switch (true) {
    case model.startsWith("llama") || model.startsWith("ollama"): {
      const baseUrl = process.env.OLLAMA_URL || "http://localhost:11434";
      return new ChatOllama({
        ...lcOpts,
        baseUrl,
        model,
      });
    }

    case model.startsWith("claude"): {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey)
        throw new Error(
          "La chiave ANTHROPIC_API_KEY è necessaria per Anthropic/Claude.",
        );
      return new ChatAnthropic({
        ...lcOpts,
        apiKey,
        model,
      });
    }

    // OpenAI/Scaleway/Custom endpoint
    case model.startsWith("bge-"):
    case model.startsWith("mistral-"):
    case model.startsWith("llama-"): {
      // Sfrutta OpenAI compat mode (es. Scaleway, Mistral etc.)
      const apiKey = process.env.SCW_SECRET_KEY;
      const baseURL = "https://api.scaleway.ai/v1";
      if (!apiKey) throw new Error("Serve SCW_SECRET_KEY");
      return new ChatOpenAI({
        ...lcOpts,
        model,
        apiKey,
        configuration: {
          baseURL,
        },
      });
    }

    // DeepSeek API compatibile OpenAI
    case model.startsWith("deepseek"): {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      const baseURL =
        process.env.DEEPSEEK_API_BASE || "https://api.deepseek.com/v1";
      if (!apiKey)
        throw new Error("DEEPSEEK_API_KEY è necessario per modelli deepseek.");
      return new ChatOpenAI({
        ...lcOpts,
        model,
        apiKey,
        configuration: {
          baseURL,
        },
      });
    }

    // HuggingFace
    case model.startsWith("hf-") || model.startsWith("huggingface/"): {
      const apiKey = process.env.HF_API_KEY;
      if (!apiKey)
        throw new Error("HF_API_KEY è necessario per modelli huggingface.");
      return new HuggingFaceInference({
        ...lcOpts,
        apiKey,
        model,
      });
    }

    // OpenAI GPT "ufficiale", endpoint custom disponibile
    case model.startsWith("gpt") || model.startsWith("o1-"): {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey)
        throw new Error("OPENAI_API_KEY è necessario per modelli OpenAI.");
      const opts: any = { ...lcOpts, model, apiKey };

      return new ChatOpenAI(opts);
    }

    default:
      throw new Error(
        `Model ${model} not recognized/supportato in getChatModel`,
      );
  }
}
