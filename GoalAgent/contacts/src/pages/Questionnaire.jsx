import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BigButton from '../components/BigButton';
import './Questionnaire.css';

const Questionnaire = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [topCategory, setTopCategory] = useState(null);

  const questions = [
    {
      id: 1,
      text: "I enjoy disassembling electronic devices to study their internal structure and working principles.",
      category: "Technical"
    },
    {
      id: 2,
      text: "I like writing and debugging code, transforming ideas into programs.",
      category: "Technical"
    },
    {
      id: 3,
      text: "I enjoy analyzing the efficiency of complex algorithms and data structures.",
      category: "Technical"
    },
    {
      id: 4,
      text: "I'm interested in cloud computing, server operations, and automated deployment.",
      category: "Technical"
    },
    {
      id: 5,
      text: "I'm passionate about studying cybersecurity vulnerabilities and penetration testing techniques.",
      category: "Technical"
    },
    {
      id: 6,
      text: "I like expressing personal emotions and creativity through painting or software.",
      category: "Arts"
    },
    {
      id: 7,
      text: "I often pay attention to colors and composition, being very particular about visual effects.",
      category: "Arts"
    },
    {
      id: 8,
      text: "I'm willing to learn 3D modeling and animation techniques.",
      category: "Arts"
    },
    {
      id: 9,
      text: "I enjoy designing interfaces and user interaction flows for websites or applications.",
      category: "Arts"
    },
    {
      id: 10,
      text: "I'm good at visualizing complex concepts through graphics or videos.",
      category: "Arts"
    },
    {
      id: 11,
      text: "I enjoy helping others solve practical problems in learning or daily life.",
      category: "Services"
    },
    {
      id: 12,
      text: "I like taking on supportive and caring roles in teams.",
      category: "Services"
    },
    {
      id: 13,
      text: "I'm interested in educational methods, curriculum design, and teaching tools.",
      category: "Services"
    },
    {
      id: 14,
      text: "I'm passionate about studying nutrition planning and cooking techniques.",
      category: "Services"
    },
    {
      id: 15,
      text: "I want to learn the craft of pastry and baking.",
      category: "Services"
    },
    {
      id: 16,
      text: "I care about public health and disease prevention strategies.",
      category: "Services"
    },
    {
      id: 17,
      text: "I have a strong interest in clinical diagnosis and patient care processes.",
      category: "Services"
    },
    {
      id: 18,
      text: "I enjoy studying drug formulations and treatment plans.",
      category: "Services"
    },
    {
      id: 19,
      text: "I'm good at making plans and coordinating resources to achieve team goals.",
      category: "Business"
    },
    {
      id: 20,
      text: "I'm interested in financial markets, investment, and business operations.",
      category: "Business"
    },
    {
      id: 21,
      text: "I like analyzing the logical structure and social impact of legal provisions.",
      category: "Others"
    },
    {
      id: 22,
      text: "I care about the welfare of socially disadvantaged groups and am willing to engage in community service.",
      category: "Others"
    },
    {
      id: 23,
      text: "I'm interested in psychological counseling and crisis intervention techniques.",
      category: "Others"
    },
    {
      id: 24,
      text: "I enjoy studying business models and marketing strategies.",
      category: "Business"
    },
    {
      id: 25,
      text: "I'm enthusiastic about interdisciplinary projects and innovation.",
      category: "Others"
    }
  ];

  const handleAnswer = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    });
    
    if (currentQuestion < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const categoryScores = calculateCategoryScores();
      const topCategory = findTopCategory(categoryScores);
      setTopCategory(topCategory);
      setIsCompleted(true);
    }
  };

  const calculateCategoryScores = () => {
    const categoryScores = {};
    questions.forEach(q => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = 0;
      }
      categoryScores[q.category] += answers[q.id] || 0;
    });
    return categoryScores;
  };

  const findTopCategory = (scores) => {
    let maxScore = 0;
    let topCategory = null;
    
    Object.entries(scores).forEach(([category, score]) => {
      if (score > maxScore) {
        maxScore = score;
        topCategory = category;
      }
    });
    
    return topCategory;
  };

  const handleComplete = () => {
    const categoryScores = calculateCategoryScores();
    localStorage.setItem('categoryScores', JSON.stringify(categoryScores));
    navigate('/category-selection');
  };

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-content">
        {!isCompleted ? (
          <>
            <h2>Question {currentQuestion} of {questions.length}</h2>
            <p className="question-text">{questions[currentQuestion - 1].text}</p>
            <div className="rating-scale">
              <button onClick={() => handleAnswer(1)}>1 - Strongly Disagree</button>
              <button onClick={() => handleAnswer(2)}>2 - Disagree</button>
              <button onClick={() => handleAnswer(3)}>3 - Neutral</button>
              <button onClick={() => handleAnswer(4)}>4 - Agree</button>
              <button onClick={() => handleAnswer(5)}>5 - Strongly Agree</button>
            </div>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
              ></div>
            </div>
          </>
        ) : (
          <div className="completion-section">
            <h2>Questionnaire Completed!</h2>
            <p className="completion-text">
              Based on your answers, your highest scoring category is:
            </p>
            <div className="top-category">
              <h3>{topCategory}</h3>
              <p>This category best matches your interests and strengths.</p>
            </div>
            <p className="completion-text">
              Click the button below to proceed to category selection and explore specific career paths.
            </p>
            <div className="button-container">
              <BigButton onClick={handleComplete}>
                CONTINUE
              </BigButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Questionnaire; 