import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BigButton from '../components/BigButton';
import './Input.css';

// {
//     input: {
//       timeline: '3-5 years',  // 或 '1-2 years', '5-10 years', 'More than 10 years'
//       skills: ['technical', 'communication']  // 选择的技能列表
//     }
// }

const Input = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [careerPath, setCareerPath] = useState(null);
    const [questionnaireData, setQuestionnaireData] = useState(null);
    const [categoryData, setCategoryData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Get all previously collected data from localStorage
        const loadUserData = () => {
            try {
                // Load questionnaire data
                const savedQuestionnaire = localStorage.getItem('questionnaireData');
                if (savedQuestionnaire) {
                    setQuestionnaireData(JSON.parse(savedQuestionnaire));
                }

                // Load category selection data
                const savedCategory = localStorage.getItem('categorySelection');
                if (savedCategory) {
                    setCategoryData(JSON.parse(savedCategory));
                }

                // Load career path data
                const savedCareerPath = localStorage.getItem('careerSelection');
                if (savedCareerPath) {
                    setCareerPath(JSON.parse(savedCareerPath));
                }
            } catch (error) {
                console.error('Error loading data from localStorage:', error);
                setError('Failed to load previous selections. Please start over.');
            }
        };

        loadUserData();
    }, []);

    const years = ['1-2 years', '3-5 years', '5-10 years', 'More than 10 years'];

    const skillOptions = [
        { id: 'technical', name: 'Technical Skills', description: 'Programming, system design and other technical skills' },
        { id: 'communication', name: 'Communication Skills', description: 'Team collaboration, presentation and other communication skills' },
        { id: 'management', name: 'Management Skills', description: 'Project management, team leadership and other management skills' },
        { id: 'creative', name: 'Creative Skills', description: 'Creative design, problem solving and other innovative skills' }
    ];

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setCurrentStep(2);
    };

    const handleSkillSelect = (skillId) => {
        setSelectedSkills(prev => {
            if (prev.includes(skillId)) {
                return prev.filter(id => id !== skillId);
            } else {
                return [...prev, skillId];
            }
        });
    };

    const handleComplete = async () => {
        // Validate that we have all required data
        if (!questionnaireData || !categoryData || !careerPath || !selectedYear || selectedSkills.length === 0) {
            setError('Missing required data. Please complete all previous steps.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Prepare the complete user data for the API
            const userData = {
                questionnaire: questionnaireData,
                category_selection: categoryData,
                career_selection: careerPath,
                input: {
                    timeline: selectedYear,
                    skills: selectedSkills
                }
            };

            // Store the complete data in localStorage
            localStorage.setItem('completeUserData', JSON.stringify(userData));

            // Call the backend API
            const response = await fetch('http://localhost:5000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate career path');
            }

            // Get the career plan from the response
            const careerPlan = await response.json();
            
            // Store the career plan in localStorage
            localStorage.setItem('careerPlan', JSON.stringify(careerPlan));
            
            // Navigate to the output page
            navigate('/output');
        } catch (error) {
            console.error('Error generating career path:', error);
            setError(error.message || 'An error occurred while generating your career path. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="input-container">
            <div className="input-content">
                <h1>Career Development Path</h1>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                {currentStep === 1 && (
                    <div className="selection-step">
                        <h2>Select Your Career Development Timeline</h2>
                        <p className="instruction-text">
                            Please select your expected career development timeframe
                        </p>
                        <div className="options-grid">
                            {years.map(year => (
                                <div 
                                    key={year}
                                    className="option-card"
                                    onClick={() => handleYearSelect(year)}
                                >
                                    <h3>{year}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="selection-step">
                        <h2>Select Skills to Improve</h2>
                        <p className="instruction-text">
                            Please select the skills you want to focus on in your career development (multiple selections allowed)
                        </p>
                        <div className="options-grid">
                            {skillOptions.map(skill => (
                                <div 
                                    key={skill.id}
                                    className={`option-card ${selectedSkills.includes(skill.id) ? 'selected' : ''}`}
                                    onClick={() => handleSkillSelect(skill.id)}
                                >
                                    <h3>{skill.name}</h3>
                                    <p>{skill.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="button-container">
                            <BigButton 
                                onClick={handleComplete}
                                disabled={isLoading || selectedSkills.length === 0}
                            >
                                {isLoading ? 'Generating...' : 'Generate Career Development Path'}
                            </BigButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Input;
