export const DISTANCES = {
    marathon: 42195, // meters
    half: 21097.5,
    '10k': 10000,
};

export const parseTime = (timeStr) => {
    const parts = timeStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        seconds = parts[0] * 3600 + parts[1] * 60; // Assume HH:MM if 2 parts, or MM:SS? Standard usually HH:MM for race times
        // Actually for marathon HH:MM is common. For 5k MM:SS.
        // Let's assume HH:MM for now as default for longer races.
    }
    return seconds;
};

export const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const formatPace = (secondsPerMile) => {
    const m = Math.floor(secondsPerMile / 60);
    const s = Math.floor(secondsPerMile % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const calculateSplits = (formData) => {
    const { finishTime, distance, pacingStyle, terrain } = formData;
    const totalSeconds = parseTime(finishTime);
    const totalDistanceMeters = DISTANCES[distance];
    const totalMiles = totalDistanceMeters / 1609.34;

    const averagePaceSeconds = totalSeconds / totalMiles;

    let splits = [];
    for (let i = 1; i <= Math.ceil(totalMiles); i++) {
        let milePace = averagePaceSeconds;

        // Pacing Style Adjustments
        if (pacingStyle === 'negative') {
            // Start slower, end faster
            // Simple linear progression
            const factor = (i - totalMiles / 2) / totalMiles; // -0.5 to 0.5
            milePace -= factor * 20; // +/- 10 seconds swing
        } else if (pacingStyle === 'positive') {
            // Start faster, end slower
            const factor = (i - totalMiles / 2) / totalMiles;
            milePace += factor * 20;
        } else if (pacingStyle === 'conservative') {
            // Start very slow, build up gradually
            if (i <= 3) milePace += 15; // First 3 miles slow
            else if (i > totalMiles - 6) milePace -= 10; // Last 6 miles fast
        } else if (pacingStyle === 'aggressive') {
            // Bank time early
            if (i <= 10) milePace -= 10; // First 10 miles fast
            else if (i > 20) milePace += 15; // Fade late
        }

        // Terrain Adjustments (Mock logic)
        if (terrain === 'hilly') {
            // Simulate hills at specific miles (e.g., 7, 14, 20)
            if (i === 7 || i === 14 || i === 20) milePace += 30; // Uphill
            if (i === 8 || i === 15 || i === 21) milePace -= 10; // Downhill
        } else if (terrain === 'trail') {
            // Trail is generally slower and more variable
            if (i % 2 === 0) milePace += 20; // Technical section
            else milePace += 10; // Drag
        }

        splits.push({
            mile: i,
            paceSeconds: milePace,
            formattedPace: formatPace(milePace),
            elapsedTime: formatTime(milePace * i) // Approximate
        });
    }

    return {
        averagePace: formatPace(averagePaceSeconds),
        splits,
        totalTime: formatTime(totalSeconds)
    };
};
