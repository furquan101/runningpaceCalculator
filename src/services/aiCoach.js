import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
// Ensure you have VITE_GEMINI_API_KEY in your .env file
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
console.log("API Key loaded:", apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING");
const genAI = new GoogleGenerativeAI(apiKey);

export const getRaceStrategy = async (formData) => {
    const { finishTime, pacingStyle, terrain, distance } = formData;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        You are an elite running coach. Create a race strategy for a runner with the following goals:
        - Target Time: ${finishTime}
        - Distance: ${distance}
        - Pacing Style: ${pacingStyle}
        - Terrain: ${terrain}

        Provide the response in valid JSON format with exactly these two fields:
        1. "strategyText": A paragraph (approx 3-4 sentences) explaining the physiological approach for this specific race. Use terms like "Lactate Threshold", "Aerobic Drift", or "Glycogen Depletion" where appropriate but keep it encouraging and practical.
        2. "checkpoints": An array of 3 specific mile markers with short, actionable advice (e.g., "Mile 5: Check HR").

        Do not include markdown formatting like \`\`\`json. Just return the raw JSON string.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Raw AI response:", text);

        // Clean up potential markdown code blocks if the model adds them
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        console.log("Cleaned AI response:", cleanedText);

        const parsed = JSON.parse(cleanedText);
        console.log("Parsed AI response:", parsed);
        return parsed;

    } catch (error) {
        console.error("Gemini API Error:", error);
        console.error("Error details:", error.message);
        // Fallback to mock logic if API fails or key is missing
        return getMockStrategy(formData);
    }
};

const getMockStrategy = (formData) => {
    const { finishTime, pacingStyle, terrain, distance } = formData;
    let strategyText = "";
    let checkpoints = [];

    if (pacingStyle === 'conservative') {
        strategyText = `Physiologically, a conservative start is the safest bet. By keeping your heart rate below your Aerobic Threshold (Zone 2) for the first 3-5 miles, you spare muscle glycogen and rely more on fat oxidation. This delays the onset of fatigue. Expect your heart rate to drift upwards (Cardiac Drift) in the second half even at the same pace.`;
        if (terrain === 'hilly') strategyText += " On hills, ignore pace and run by power/effort to avoid spiking lactate levels early.";
        if (terrain === 'trail') strategyText += " On trails, technicality dictates pace. Keep your eyes up and flow with the terrain.";
        checkpoints = ["Mile 5: HR Check - Stay in Zone 2", "Mile 15: Aerobic drift setting in - focus on form", "Mile 22: Glycogen low - rely on mental grit"];
    } else if (pacingStyle === 'aggressive') {
        strategyText = `An aggressive strategy is high risk, high reward. You are banking time by running near your Lactate Threshold early. This relies on your ability to clear lactate efficiently. The danger is 'bonking' if you burn through glycogen stores too fast. You must be disciplined with fueling to sustain this.`;
        checkpoints = ["Mile 6: Threshold check - breathing controlled?", "Mile 18: Lactate accumulation rising - hold on", "Mile 24: Pure anaerobic drive"];
    } else if (pacingStyle === 'negative') {
        strategyText = `Scientific data supports negative splits for world records. By starting slightly slower, you prevent early acidosis and conserve energy. As fuel stores deplete, you increase effort to maintain or speed up, recruiting fast-twitch fibers only when necessary at the end.`;
        checkpoints = ["Mile 13: Fresh legs - increase turnover", "Mile 20: Recruit fast-twitch fibers"];
    } else {
        strategyText = `Even pacing minimizes energy expenditure. Fluctuations in pace cost more metabolic energy than a steady state. Your goal is to run as efficiently as possible, keeping your running economy high.`;
        checkpoints = ["Mile 10: Check running economy", "Mile 20: Maintain cadence"];
    }

    return {
        strategyText: `(Offline Mode) Based on your goal of ${finishTime} for the ${distance} with a ${pacingStyle} split: ${strategyText}`,
        checkpoints
    };
};
