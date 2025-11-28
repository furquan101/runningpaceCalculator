import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
// Ensure you have VITE_GEMINI_API_KEY in your .env file
const apiKey = (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
    (typeof process !== 'undefined' && process.env && process.env.VITE_GEMINI_API_KEY) ||
    "YOUR_API_KEY_HERE";
console.log("API Key loaded:", apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING");
const genAI = new GoogleGenerativeAI(apiKey);

export const getRaceStrategy = async (formData) => {
    const { finishTime, pacingStyle, terrain, distance, unit = 'miles' } = formData;

    // Check if API key is missing or default
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        console.warn("Gemini API Key missing or invalid. Using Mock Strategy.");
        return getMockStrategy(formData);
    }

    const generateWithRetry = async (retries = 1) => {
        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-flash-latest",
                generationConfig: {
                    temperature: 0.9,
                }
            });

            const focuses = [
                "mental toughness and visualization",
                "physiological efficiency and form",
                "nutrition and hydration timing",
                "pacing discipline and negative splits",
                "enjoyment and soaking in the atmosphere"
            ];
            const randomFocus = focuses[Math.floor(Math.random() * focuses.length)];

            const prompt = `
            You are an Olympic-level running coach (like Renato Canova or Jack Daniels). Create a race strategy for a runner with the following goals:
            - Target Time: ${finishTime}
            - Distance: ${distance}
            - Pacing Style: ${pacingStyle}
            - Terrain: ${terrain}
            - Unit: ${unit}

            Focus this specific strategy on: ${randomFocus}.

            Provide the response in valid JSON format with exactly these two fields:
            1. "strategyText": A concise, punchy paragraph (max 3 sentences) explaining the physiological approach. Use elite terminology but keep it simple and direct. No fluff.
            2. "checkpoints": An array of 3 specific ${unit === 'km' ? 'kilometer' : 'mile'} markers with short, actionable advice (max 10 words each).

            Do not include markdown formatting like \`\`\`json. Just return the raw JSON string.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log("Raw AI response:", text);

            if (!text) {
                throw new Error("Empty response from AI model");
            }

            // Clean up potential markdown code blocks if the model adds them
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

            console.log("Cleaned AI response:", cleanedText);

            try {
                const parsed = JSON.parse(cleanedText);
                console.log("Parsed AI response:", parsed);
                return parsed;
            } catch (parseError) {
                console.error("JSON Parse Error. Received text:", cleanedText);
                throw parseError; // Re-throw to trigger retry
            }

        } catch (error) {
            console.error(`Gemini API Error (Attempt ${2 - retries}/2):`, error.message);
            if (retries > 0) {
                console.log("Retrying...");
                return generateWithRetry(retries - 1);
            }
            // Fallback to mock logic if all retries fail
            return { ...getMockStrategy(formData), isOffline: true };
        }
    };

    return generateWithRetry();
};

const getMockStrategy = (formData) => {
    const { finishTime, pacingStyle, terrain, distance, unit = 'miles' } = formData;
    let strategyText = "";
    let checkpoints = [];
    const distLabel = unit === 'km' ? 'Km' : 'Mile';

    if (pacingStyle === 'conservative') {
        strategyText = `Physiologically, a conservative start is the safest bet. By keeping your heart rate below your Aerobic Threshold (Zone 2) for the first few ${unit}, you spare muscle glycogen and rely more on fat oxidation. This delays the onset of fatigue. Expect your heart rate to drift upwards (Cardiac Drift) in the second half even at the same pace.`;
        if (terrain === 'hilly') strategyText += " On hills, ignore pace and run by power/effort to avoid spiking lactate levels early.";
        if (terrain === 'trail') strategyText += " On trails, technicality dictates pace. Keep your eyes up and flow with the terrain.";
        checkpoints = [`${distLabel} 5: HR Check - Stay in Zone 2`, `${distLabel} 15: Aerobic drift setting in - focus on form`, `${distLabel} 22: Glycogen low - rely on mental grit`];
    } else if (pacingStyle === 'aggressive') {
        strategyText = `An aggressive strategy is high risk, high reward. You are banking time by running near your Lactate Threshold early. This relies on your ability to clear lactate efficiently. The danger is 'bonking' if you burn through glycogen stores too fast. You must be disciplined with fueling to sustain this.`;
        checkpoints = [`${distLabel} 6: Threshold check - breathing controlled?`, `${distLabel} 18: Lactate accumulation rising - hold on`, `${distLabel} 24: Pure anaerobic drive`];
    } else if (pacingStyle === 'negative') {
        strategyText = `Scientific data supports negative splits for world records. By starting slightly slower, you prevent early acidosis and conserve energy. As fuel stores deplete, you increase effort to maintain or speed up, recruiting fast-twitch fibers only when necessary at the end.`;
        checkpoints = [`${distLabel} 13: Fresh legs - increase turnover`, `${distLabel} 20: Recruit fast-twitch fibers`];
    } else {
        strategyText = `Even pacing minimizes energy expenditure. Fluctuations in pace cost more metabolic energy than a steady state. Your goal is to run as efficiently as possible, keeping your running economy high.`;
        checkpoints = [`${distLabel} 10: Check running economy`, `${distLabel} 20: Maintain cadence`];
    }

    return {
        strategyText: `(Offline Mode) Based on your goal of ${finishTime} for the ${distance} with a ${pacingStyle} split: ${strategyText}`,
        checkpoints,
        isOffline: true
    };
};
