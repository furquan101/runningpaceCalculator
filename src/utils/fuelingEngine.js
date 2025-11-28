import { parseTime, formatTime } from './paceCalculator.js';

export const generateFuelingPlan = (formData) => {
    // This function seems unused in the current flow, but updating for consistency
    const { finishTime } = formData;
    const totalSeconds = parseTime(finishTime);
    const hours = totalSeconds / 3600;

    let carbsPerHour = 30;
    if (hours > 2.5) carbsPerHour = 50; // Reduced from 90 for conservative approach
    else if (hours > 1.5) carbsPerHour = 40; // Reduced from 60

    return { carbsPerHour, totalSeconds };
};

export const getFuelingReminders = (splits) => {
    if (!splits || splits.length === 0) return [];

    // Calculate total time from last split
    const totalSeconds = splits[splits.length - 1].mile * splits[splits.length - 1].paceSeconds; // Approx
    const hours = totalSeconds / 3600;

    // Conservative Guidelines (Better for recreational runners / sensitive stomachs)
    // < 75 mins: Mouth rinse or small amounts
    // 1-2.5 hrs: 30-40g/hr
    // > 2.5 hrs: 40-50g/hr

    let carbsPerHour = 0;
    if (hours < 1.25) carbsPerHour = 0; // Short runs don't strictly need carbs
    else if (hours < 2.5) carbsPerHour = 30; // ~1 gel every 50 mins
    else if (hours < 4.0) carbsPerHour = 40; // ~1 gel every 37 mins (Conservative)
    else carbsPerHour = 50; // ~1 gel every 30 mins (Max conservative)

    const gramsPerGel = 25; // Standard gel
    const gelsPerHour = carbsPerHour / gramsPerGel;
    const secondsPerGel = 3600 / gelsPerHour;

    const reminders = [];
    let nextGelTime = 1800; // Start fueling at 30 mins usually

    // Iterate through splits to find when we cross the time thresholds
    let currentElapsedTime = 0;

    const coachMessages = [
        "Fuel early. Digestion slows as you fatigue.",
        "Bank energy now. The race starts at mile 20.",
        "Stay ahead of the depletion curve.",
        "Your brain needs this sugar to stay sharp.",
        "Don't think, just fuel. Stick to the plan.",
        "Consistency beats intensity. Keep fueling.",
        "Protect your glycogen stores.",
        "This gel buys you a strong finish.",
        "Fueling is training. Execute.",
        "Late race power comes from this gel.",
        "Focus. Form. Fuel.",
        "Empty the tank, but fill it first."
    ];

    for (const split of splits) {
        currentElapsedTime += split.paceSeconds;

        if (currentElapsedTime >= nextGelTime) {
            const gelNumber = reminders.length + 1;
            // Cycle through messages, using modulo to repeat if we have more gels than messages
            const messageIndex = (gelNumber - 1) % coachMessages.length;

            reminders.push({
                mile: split.mile,
                message: `Gel #${gelNumber}: ${coachMessages[messageIndex]}`
            });
            nextGelTime += secondsPerGel;
        }
    }

    return reminders;
};
