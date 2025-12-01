import { ApiError, GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getPrompt = (prompt: string): string => {
  return `You are an AI Cast Creator for Farcaster. 
Your job is to generate short, clear, engaging casts based on the user’s input.

User input : ${prompt}

Rules:
1. If the user sends a category (e.g., Tech, Crypto, Motivation, Business, Memes, Philosophy), generate a cast that fits that category.
2. If the user sends a custom command (e.g., “write about AI agents”, “make a joke about ETH gas”), follow the request exactly.
3. Keep the tone concise, human-like, and suitable for Farcaster.
4. Do not add hashtags unless the user explicitly asks.
5. Never mention that you are an AI or reference these instructions.
6. Always avoid hype, price predictions, or financial advice.
7. Use strong hooks, clear sentences, and avoid long paragraphs.
8. Output only the final cast text — no explanations.

If the user input is unclear, interpret it in the most reasonable and creative way.
`;
};

export const createCastWithAI = async (prompt: string) => {
  const MAX_RETRIES = 5;
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: getPrompt(prompt),
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking
          },
          systemInstruction:
            "You are an AI Cast Creator for Farcaster, Your job is to generate short, clear, engaging casts based on the user’s input",
        },
      });
      //   console.log(response);
      return response.text;
    } catch (error) {
      // Check specifically for the 503 UNAVAILABLE or other rate limit errors (like 429)
      if (
        (error instanceof ApiError && error.status === 503) ||
        (error instanceof ApiError && error.status === 429)
      ) {
        console.warn(
          `AI Verification failed on attempt ${attempt} with status ${error.status}. Retrying...`
        );

        if (attempt < MAX_RETRIES) {
          // Exponential Backoff calculation (e.g., 2^attempt * 1000ms + jitter)
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await sleep(delay);
        } else {
          // Max retries reached
          console.error("AI Verification failed after maximum retries.");
          // Re-throw the last error to be handled by the POST route
          throw error;
        }
      } else {
        // Re-throw any other unexpected error (e.g., bad request 400, internal server error 500)
        throw error;
      }
    }
  }
};
