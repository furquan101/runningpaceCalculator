import React, { useState } from 'react';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import ResultsPage from './pages/ResultsPage';
import { calculateSplits } from './utils/paceCalculator';
import { getFuelingReminders, generateFuelingPlan } from './utils/fuelingEngine';

function App() {
  const [results, setResults] = useState(null);

  const handleCalculate = (data) => {
    try {
      console.log('handleCalculate called with:', data);
      const calculation = calculateSplits(data);
      console.log('calculation result:', calculation);

      const fueling = getFuelingReminders(calculation.splits);
      console.log('fueling result:', fueling);

      const { carbsPerHour } = generateFuelingPlan(data);
      console.log('carbsPerHour:', carbsPerHour);

      setResults({
        ...data,
        ...calculation,
        fueling,
        carbsPerHour
      });
    } catch (error) {
      console.error('Error in handleCalculate:', error);
      alert(`Error generating race plan: ${error.message}`);
    }
  };

  const handleReset = () => {
    setResults(null);
  };

  return (
    <Layout>
      {results ? (
        <ResultsPage results={results} onReset={handleReset} />
      ) : (
        <LandingPage onCalculate={handleCalculate} />
      )}
    </Layout>
  );
}

export default App;
