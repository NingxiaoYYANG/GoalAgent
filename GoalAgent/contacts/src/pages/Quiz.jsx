import React from 'react';
import { useNavigate } from 'react-router-dom';
import BigButton from '../components/BigButton';
import './Quiz.css';

const Quiz = () => {
  const navigate = useNavigate();

  const handleStartQuestionnaire = () => {
    navigate('/questionnaire');
  };

  return (
    <div className="quiz-container">
      <div className="quiz-content">
        <h1>Career Planning Assessment System</h1>
        <p className="welcome-text">
          Welcome to the Career Planning Assessment System! This system will help you explore the most suitable career development path for you.
        </p>
        
        <div className="features">
          <h2>System Features</h2>
          <ul>
            <li>Scientific assessment methods</li>
            <li>Personalized career recommendations</li>
            <li>Clear career development paths</li>
            <li>Detailed skill requirements</li>
          </ul>
        </div>

        <div className="instructions">
          <h2>Assessment Process</h2>
          <ol>
            <li>Interest Scale (Q1-Q25): Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree)</li>
            <li>Category Confirmation (Q26): Based on your scores, select the most suitable career category</li>
            <li>Specific Career Choice (Q27-Q31): Choose your preferred career within the selected category</li>
            <li>Receive personalized career recommendations and skill development path</li>
          </ol>
        </div>

        <div className="button-container">
          <BigButton onClick={handleStartQuestionnaire}>
            START ASSESSMENT
          </BigButton>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
