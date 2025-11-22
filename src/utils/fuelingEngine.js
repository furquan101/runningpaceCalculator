import { parseTime, formatTime } from './paceCalculator';

export const generateFuelingPlan = (formData) => {
    // This function seems unused in the current flow, but updating for consistency
    const { finishTime } = formData;
    const totalSeconds = parseTime(finishTime);
    const hours = totalSeconds / 3600;

    let carbsPerHour = 30;
    if (hours > 2.5) carbsPerHour = 90;
    else if (hours > 1.5) carbsPerHour = 60;

    return { carbsPerHour, totalSeconds };
};

export const getFuelingReminders = (splits) => {
    if (!splits || splits.length === 0) return [];

    // Calculate total time from last split
    const totalSeconds = splits[splits.length - 1].mile * splits[splits.length - 1].paceSeconds; // Approx
    const hours = totalSeconds / 3600;

    // Scientific Guidelines (ISSN / ACSM)
    // < 75 mins: Mouth rinse or small amounts
    // 1-2.5 hrs: 30-60g/hr
    // > 2.5 hrs: 60-90g/hr

    let carbsPerHour = 0;
    if (hours < 1.25) carbsPerHour = 30; // Optional but helpful
    else if (hours < 2.5) carbsPerHour = 60;
    else carbsPerHour = 90;

    const gramsPerGel = 25; // Standard gel
    const gelsPerHour = carbsPerHour / gramsPerGel;
    const secondsPerGel = 3600 / gelsPerHour;

    const reminders = [];
    let nextGelTime = 1800; // Start fueling at 30 mins usually

    // Iterate through splits to find when we cross the time thresholds
    let currentElapsedTime = 0;

    const coachMessages = [
        "Start fueling now. We top up early so you don't crash later.",
        "Time for another gel. This keeps your blood sugar steady and your brain sharp.",
        "Stick to the plan. Your muscles are burning fuel fast—replace it.",
        "Don't skip this. This specific gel is what prevents 'the wall' at mile 20.",
        "Keep it going. Your glycogen stores are depleting—stay ahead of it.",
        "Halfway fueled. Consistency is key to avoiding the bonk.",
        "You're doing great. This gel maintains your pace and mental clarity.",
        "Push through. Your body needs this to sustain power output.",
        "Almost there. This keeps your legs fresh for the final miles.",
        "Late-race fuel. This is crucial for maintaining form.",
        "Second-to-last gel. Your finish line fuel is coming up.",
        "Final top-up. Power through to the finish line!"
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
