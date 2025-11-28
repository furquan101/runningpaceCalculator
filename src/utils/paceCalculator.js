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
    const { finishTime, distance, pacingStyle, terrain, unit = 'miles' } = formData;
    const totalSeconds = parseTime(finishTime);
    const totalDistanceMeters = DISTANCES[distance];

    // Calculate total units (miles or km)
    const isKm = unit === 'km';
    const totalUnits = isKm ? totalDistanceMeters / 1000 : totalDistanceMeters / 1609.34;

    const averagePaceSeconds = totalSeconds / totalUnits;

    let splits = [];
    for (let i = 1; i <= Math.ceil(totalUnits); i++) {
        let splitPace = averagePaceSeconds;

        // Pacing Style Adjustments
        if (pacingStyle === 'negative') {
            // Start slower, end faster
            // Simple linear progression
            const factor = (i - totalUnits / 2) / totalUnits; // -0.5 to 0.5
            splitPace -= factor * 20; // +/- 10 seconds swing
        } else if (pacingStyle === 'positive') {
            // Start faster, end slower
            const factor = (i - totalUnits / 2) / totalUnits;
            splitPace += factor * 20;
        } else if (pacingStyle === 'conservative') {
            // Start very slow, build up gradually
            if (i <= 3) splitPace += 15; // First 3 units slow
            else if (i > totalUnits - 6) splitPace -= 10; // Last 6 units fast
        } else if (pacingStyle === 'aggressive') {
            // Bank time early
            if (i <= 10) splitPace -= 10; // First 10 units fast
            else if (i > 20) splitPace += 15; // Fade late
        }

        // Terrain Adjustments (Mock logic)
        if (terrain === 'hilly') {
            // Simulate hills at specific markers
            // Adjust markers for KM vs Miles roughly
            const hillMarkers = isKm ? [11, 22, 32] : [7, 14, 20];
            const downhillMarkers = isKm ? [13, 24, 34] : [8, 15, 21];

            if (hillMarkers.includes(i)) splitPace += 30; // Uphill
            if (downhillMarkers.includes(i)) splitPace -= 10; // Downhill
        } else if (terrain === 'trail') {
            // Trail is generally slower and more variable
            if (i % 2 === 0) splitPace += 20; // Technical section
            else splitPace += 10; // Drag
        }

        splits.push({
            mile: i, // This is actually "unit" (mile or km)
            paceSeconds: splitPace,
            formattedPace: formatPace(splitPace),
            elapsedTime: formatTime(splitPace * i) // Approximate
        });
    }

    return {
        averagePace: formatPace(averagePaceSeconds),
        splits,
        totalTime: formatTime(totalSeconds)
    };
};
