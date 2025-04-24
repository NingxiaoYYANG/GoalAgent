import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BigButton from '../components/BigButton';
import './CareerSelection.css';

const CareerSelection = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);

  const careerOptions = {
    technical: [
      { id: 'it', name: 'IT', description: 'Software development, web development, and IT infrastructure' },
      { id: 'engineering', name: 'Engineering', description: 'Mechanical, electrical, and civil engineering' }
    ],
    arts: [
      { id: 'painting', name: 'Painting', description: 'Traditional and digital painting techniques' },
      { id: 'digital-art', name: 'Digital Art', description: 'Graphic design, UI/UX, and 3D modeling' }
    ],
    services: [
      { id: 'education', name: 'Education', description: 'Teaching and educational development' },
      { id: 'culinary-arts', name: 'Culinary Arts', description: 'Cooking and food preparation' },
      { id: 'healthcare', name: 'Healthcare', description: 'Medical and healthcare services' }
    ],
    business: [
      { id: 'management', name: 'Management', description: 'Business and project management' },
      { id: 'finance', name: 'Finance', description: 'Financial services and investment' }
    ],
    others: [
      { id: 'law', name: 'Law', description: 'Legal services and practice' },
      { id: 'social-work', name: 'Social Work', description: 'Community and social services' }
    ]
  };

  const specializationOptions = {
    it: [
      { id: 'web-dev', name: 'Web Development', description: 'Frontend and backend web technologies' },
      { id: 'ai-ml', name: 'AI & Machine Learning', description: 'Artificial intelligence and machine learning' },
      { id: 'data-science', name: 'Data Science', description: 'Data analysis and visualization' },
      { id: 'cybersecurity', name: 'Cybersecurity', description: 'Network security and ethical hacking' }
    ],
    engineering: [
      { id: 'mechanical', name: 'Mechanical Engineering', description: 'Mechanical systems and design' },
      { id: 'electrical', name: 'Electrical Engineering', description: 'Electrical systems and electronics' },
      { id: 'civil', name: 'Civil Engineering', description: 'Infrastructure and construction' }
    ],
    // ... 其他职业的专业方向
  };

  const handleCareerSelect = (careerId) => {
    setSelectedCareer(careerId);
    setCurrentStep(2);
  };

  const handleSpecializationSelect = (specializationId) => {
    setSelectedSpecialization(specializationId);
    setCurrentStep(3);
  };

  const handleComplete = () => {
    // 存储选择结果
    const selectionData = {
      category,
      career: selectedCareer,
      specialization: selectedSpecialization
    };
    localStorage.setItem('careerSelection', JSON.stringify(selectionData));
    navigate('/input');
  };

  return (
    <div className="career-selection-container">
      <div className="career-selection-content">
        <h1>Career Path Selection</h1>
        
        {currentStep === 1 && (
          <div className="selection-step">
            <h2>Select Your Career Path</h2>
            <p className="instruction-text">
              Choose the career path that best aligns with your interests and goals.
            </p>
            <div className="options-grid">
              {careerOptions[category]?.map(option => (
                <div 
                  key={option.id}
                  className="option-card"
                  onClick={() => handleCareerSelect(option.id)}
                >
                  <h3>{option.name}</h3>
                  <p>{option.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="selection-step">
            <h2>Choose Your Specialization</h2>
            <p className="instruction-text">
              Select a specific area of focus within your chosen career path.
            </p>
            <div className="options-grid">
              {specializationOptions[selectedCareer]?.map(option => (
                <div 
                  key={option.id}
                  className="option-card"
                  onClick={() => handleSpecializationSelect(option.id)}
                >
                  <h3>{option.name}</h3>
                  <p>{option.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="selection-step">
            <h2>Career Path Confirmation</h2>
            <div className="selection-summary">
              <h3>Your Selected Path:</h3>
              <p>Category: {category}</p>
              <p>Career: {selectedCareer}</p>
              <p>Specialization: {selectedSpecialization}</p>
            </div>
            <div className="button-container">
              <BigButton onClick={handleComplete}>
                PROCEED TO CAREER PATH
              </BigButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerSelection; 