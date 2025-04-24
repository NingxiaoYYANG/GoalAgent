import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BigButton from '../components/BigButton';
import './Input.css';

const Input = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [careerPath, setCareerPath] = useState(null);

    useEffect(() => {
        // Get previously selected career path from localStorage
        const savedCareerPath = localStorage.getItem('careerSelection');
        if (savedCareerPath) {
            setCareerPath(JSON.parse(savedCareerPath));
        }
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

    const handleComplete = () => {
        // Store selection data
        const selectionData = {
            ...careerPath,
            year: selectedYear,
            skills: selectedSkills
        };
        localStorage.setItem('careerSelection', JSON.stringify(selectionData));
        navigate('/output');
    };

    return (
        <div className="input-container">
            <div className="input-content">
                <h1>Career Development Path</h1>
                
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
                            <BigButton onClick={handleComplete}>
                                Generate Career Development Path
                            </BigButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Input;
