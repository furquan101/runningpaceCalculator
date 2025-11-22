import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Trophy, Timer, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { getRaceStrategy } from '../services/aiCoach';

const ResultsPage = ({ results, onReset }) => {
    const { averagePace, splits, fueling, finishTime, pacingStyle, distance, terrain, carbsPerHour } = results;
    const [strategy, setStrategy] = useState(null);
    const [loadingStrategy, setLoadingStrategy] = useState(true);

    useEffect(() => {
        const fetchStrategy = async () => {
            const data = await getRaceStrategy(results);
            setStrategy(data);
            setLoadingStrategy(false);
        };
        fetchStrategy();
    }, [results]);

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-12">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Your Race Plan</h2>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Recalculate
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Strategy & Splits */}
                <div className="lg:col-span-2 space-y-8">
                    {/* AI Strategy Card */}
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/20 p-6 rounded-2xl border border-primary/10">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-2xl">🤖</span> AI Coach Strategy
                        </h3>
                        {loadingStrategy ? (
                            <div className="flex items-center gap-3 text-gray-500 animate-pulse">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                Generating your personalized strategy...
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-gray-700 leading-relaxed">
                                    {strategy?.strategyText}
                                    <br /><br />
                                    <span className="font-medium text-primary">💡 Coach Tip:</span> Break the race into 3 chunks. The first 10 miles are for your head, the next 10 for your training, and the last 6.2 are for your heart.
                                </p>
                                {strategy?.checkpoints && Array.isArray(strategy.checkpoints) && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {strategy.checkpoints.map((cp, i) => {
                                            // Handle both string and object formats
                                            const displayText = typeof cp === 'string' ? cp : (cp?.text || cp?.advice || JSON.stringify(cp));
                                            return (
                                                <span key={i} className="px-3 py-1 bg-white/60 rounded-lg text-xs font-medium text-primary-hover border border-primary/10">
                                                    {displayText}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Splits Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Mile Splits</h3>
                            <span className="text-sm text-gray-500">Avg Pace: {averagePace}/mi</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-3">Mile</th>
                                        <th className="px-6 py-3">Pace</th>
                                        <th className="px-6 py-3">Elapsed</th>
                                        <th className="px-6 py-3">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {splits.map((split) => {
                                        const fuelReminder = fueling.find(f => f.mile === split.mile);
                                        return (
                                            <tr key={split.mile} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-gray-900">{split.mile}</td>
                                                <td className="px-6 py-3 text-primary font-semibold">{split.formattedPace}</td>
                                                <td className="px-6 py-3 text-gray-500">{split.elapsedTime}</td>
                                                <td className="px-6 py-3">
                                                    {fuelReminder && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/20 text-yellow-700 text-xs font-medium">
                                                            <Zap className="w-3 h-3" /> Gel
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Timer className="w-5 h-5" />
                            </div>
                            <span className="text-sm text-gray-500">Average Pace</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{averagePace}</p>
                        <p className="text-xs text-gray-400">min/mile</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-sm text-gray-500">Projected Finish</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{finishTime}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <h4 className="font-semibold text-gray-900">Fueling Plan</h4>
                            </div>
                            <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                ~{carbsPerHour}g carbs/hr
                            </span>
                        </div>
                        <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
                            {fueling.map((f, i) => (
                                <div key={i} className="relative">
                                    <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-yellow-400 border-2 border-white ring-1 ring-gray-100" />
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Mile {f.mile}</p>
                                    <p className="text-sm font-medium text-gray-900 bg-yellow-50/50 p-2 rounded-lg border border-yellow-100 inline-block">
                                        {f.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;
