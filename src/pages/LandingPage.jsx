
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import InputCard from '../components/InputCard';
import runnerImage1 from '../assets/runner-3d.png';
import runnerImage2 from '../assets/runner-1.png';
import runnerImage3 from '../assets/runner-2.png';

const images = [runnerImage1, runnerImage2, runnerImage3];

const LandingPage = ({ onCalculate }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [formData, setFormData] = useState({
        finishTime: '',
        pacingStyle: 'even',
        distance: 'marathon',
        terrain: 'flat',
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleTimeChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length > 4) value = value.slice(0, 4); // Max 4 digits

        if (value.length >= 3) {
            value = value.slice(0, 2) + ':' + value.slice(2);
        }

        setFormData(prev => ({ ...prev, finishTime: value }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        console.log('Generate button clicked', formData);

        if (!formData.finishTime || formData.finishTime.length < 4) {
            alert('Please enter a valid finish time (HH:MM)');
            return;
        }

        console.log('Calling onCalculate with:', formData);
        onCalculate(formData);
    };

    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* Left Side - Inputs */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Running Pace <span className="text-primary">Calculator</span>
                    </h1>
                    <p className="text-gray-600 mb-8 max-w-md">
                        Enter your goal time and get smart, science-backed splits—the same pacing approach thousands of runners rely on.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <InputCard label="Goal finish time">
                            <input
                                type="text"
                                name="finishTime"
                                placeholder="HH:MM"
                                value={formData.finishTime}
                                onChange={handleTimeChange}
                                maxLength={5}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-gray-50"
                            />
                        </InputCard>

                        <InputCard label="Distance">
                            <div className="relative">
                                <select
                                    name="distance"
                                    value={formData.distance}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-gray-50 appearance-none pr-10"
                                >
                                    <option value="marathon">Marathon</option>
                                    <option value="half">Half Marathon</option>
                                    <option value="10k">10K</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </InputCard>

                        <InputCard label="Pacing style">
                            <div className="relative">
                                <select
                                    name="pacingStyle"
                                    value={formData.pacingStyle}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-gray-50 appearance-none pr-10"
                                >
                                    <option value="even">Even Split</option>
                                    <option value="negative">Negative Split</option>
                                    <option value="positive">Positive Split</option>
                                    <option value="conservative">Conservative Start</option>
                                    <option value="aggressive">Aggressive Start</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </InputCard>

                        <InputCard label="Terrain">
                            <div className="relative">
                                <select
                                    name="terrain"
                                    value={formData.terrain}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-gray-50 appearance-none pr-10"
                                >
                                    <option value="flat">Flat</option>
                                    <option value="hilly">Hilly</option>
                                    <option value="trail">Trail</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </InputCard>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-primary/30 w-full md:w-auto"
                    >
                        Generate my race splits
                    </button>
                    <p className="text-xs text-gray-400 mt-3 max-w-sm">
                        Based on data from thousands of runners + peer-reviewed pacing strategies.
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Image */}
            <div className="flex-1 bg-primary-light relative overflow-hidden hidden md:flex items-center justify-center p-12">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 flex items-center justify-center p-12"
                    >
                        <img
                            src={images[currentImageIndex]}
                            alt="Runner"
                            className="object-contain max-h-full max-w-full rounded-[6px]"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LandingPage;

