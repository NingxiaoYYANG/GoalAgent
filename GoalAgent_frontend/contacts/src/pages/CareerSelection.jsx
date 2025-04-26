import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BigButton from '../components/BigButton';
import './CareerSelection.css';

// {
//   career_selection: {
//     career_path: 'it',  // 例如：'it', 'engineering', 'painting' 等
//     specialization: 'web-dev'  // 例如：'web-dev', 'ai-ml', 'data-science' 等
//   }
// }

const CareerSelection = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);

  useEffect(() => {
    // Load previously selected career path if exists
    const savedCareerPath = localStorage.getItem('careerSelection');
    if (savedCareerPath) {
      const data = JSON.parse(savedCareerPath);
      if (data.category === category) {
        setSelectedCareer(data.career.id);
        setSelectedSpecialization(data.specialization.id);
        // setCurrentStep(3);
      }
    }
  }, [category]);

  const careerOptions = {
    technical: [
      { id: 'it', name: 'IT', description: 'Software development, web development, and IT infrastructure' },
      { id: 'engineering', name: 'Engineering', description: 'Mechanical, electrical, and civil engineering' },
      { id: 'data', name: 'Data Science', description: 'Data analysis, machine learning, and AI' }
    ],
    arts: [
      { id: 'painting', name: 'Painting', description: 'Traditional and digital painting techniques' },
      { id: 'digital-art', name: 'Digital Art', description: 'Graphic design, UI/UX, and 3D modeling' },
      { id: 'design', name: 'Design', description: 'Industrial, interior, and fashion design' }
    ],
    services: [
      { id: 'education', name: 'Education', description: 'Teaching and educational development' },
      { id: 'culinary-arts', name: 'Culinary Arts', description: 'Cooking and food preparation' },
      { id: 'healthcare', name: 'Healthcare', description: 'Medical and healthcare services' },
      { id: 'hospitality', name: 'Hospitality', description: 'Hotel management and tourism' }
    ],
    business: [
      { id: 'management', name: 'Management', description: 'Business and project management' },
      { id: 'finance', name: 'Finance', description: 'Financial services and investment' },
      { id: 'marketing', name: 'Marketing', description: 'Digital marketing and brand management' },
      { id: 'entrepreneurship', name: 'Entrepreneurship', description: 'Startup and business development' }
    ],
    others: [
      { id: 'law', name: 'Law', description: 'Legal services and practice' },
      { id: 'social-work', name: 'Social Work', description: 'Community and social services' },
      { id: 'public-service', name: 'Public Service', description: 'Government and public administration' }
    ]
  };

  const specializationOptions = {
    it: [
      { id: 'web-dev', name: 'Web Development', description: 'Frontend and backend web technologies' },
      { id: 'ai-ml', name: 'AI & Machine Learning', description: 'Artificial intelligence and machine learning' },
      { id: 'data-science', name: 'Data Science', description: 'Data analysis and visualization' },
      { id: 'cybersecurity', name: 'Cybersecurity', description: 'Network security and ethical hacking' },
      { id: 'cloud-computing', name: 'Cloud Computing', description: 'Cloud infrastructure and services' }
    ],
    engineering: [
      { id: 'mechanical', name: 'Mechanical Engineering', description: 'Mechanical systems and design' },
      { id: 'electrical', name: 'Electrical Engineering', description: 'Electrical systems and electronics' },
      { id: 'civil', name: 'Civil Engineering', description: 'Infrastructure and construction' },
      { id: 'chemical', name: 'Chemical Engineering', description: 'Chemical processes and materials' }
    ],
    'digital-art': [
      { id: 'ui-ux', name: 'UI/UX Design', description: 'User interface and experience design' },
      { id: 'graphic-design', name: 'Graphic Design', description: 'Visual communication and branding' },
      { id: '3d-modeling', name: '3D Modeling', description: '3D modeling and animation' },
      { id: 'game-design', name: 'Game Design', description: 'Video game design and development' }
    ],
    painting: [
      { id: 'digital-painting', name: 'Digital Painting', description: 'Digital art and illustration' },
      { id: 'traditional', name: 'Traditional Art', description: 'Traditional painting techniques' },
      { id: 'mixed-media', name: 'Mixed Media', description: 'Combining digital and traditional art' }
    ],
    education: [
      { id: 'k12', name: 'K-12 Education', description: 'Primary and secondary education' },
      { id: 'higher-ed', name: 'Higher Education', description: 'University and college teaching' },
      { id: 'special-ed', name: 'Special Education', description: 'Special needs education' },
      { id: 'ed-tech', name: 'Educational Technology', description: 'Technology in education' }
    ],
    'culinary-arts': [
      { id: 'chef', name: 'Professional Chef', description: 'Restaurant and hotel cooking' },
      { id: 'pastry', name: 'Pastry Arts', description: 'Baking and pastry making' },
      { id: 'food-science', name: 'Food Science', description: 'Food technology and innovation' }
    ],
    healthcare: [
      { id: 'nursing', name: 'Nursing', description: 'Patient care and medical support' },
      { id: 'pharmacy', name: 'Pharmacy', description: 'Medication and pharmaceutical care' },
      { id: 'public-health', name: 'Public Health', description: 'Community health and wellness' }
    ],
    management: [
      { id: 'project-management', name: 'Project Management', description: 'Project planning and execution' },
      { id: 'business-management', name: 'Business Management', description: 'Business operations and strategy' },
      { id: 'hr-management', name: 'HR Management', description: 'Human resources and talent management' }
    ],
    finance: [
      { id: 'investment', name: 'Investment Banking', description: 'Financial markets and investments' },
      { id: 'financial-planning', name: 'Financial Planning', description: 'Personal and corporate finance' },
      { id: 'accounting', name: 'Accounting', description: 'Financial accounting and auditing' }
    ],
    law: [
      { id: 'corporate-law', name: 'Corporate Law', description: 'Business and corporate legal services' },
      { id: 'criminal-law', name: 'Criminal Law', description: 'Criminal justice and defense' },
      { id: 'international-law', name: 'International Law', description: 'International legal affairs' }
    ],
    'social-work': [
      { id: 'clinical', name: 'Clinical Social Work', description: 'Mental health and counseling' },
      { id: 'community', name: 'Community Social Work', description: 'Community development and support' },
      { id: 'child-welfare', name: 'Child Welfare', description: 'Child protection and family services' }
    ]
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
    // Get the career and specialization names
    const career = careerOptions[category]?.find(c => c.id === selectedCareer);
    const specialization = specializationOptions[selectedCareer]?.find(s => s.id === selectedSpecialization);
    
    if (!career) {
      console.error('Selected career not found');
      return;
    }
    
    // Create the career selection data
    const selectionData = {
      category,
      career: {
        id: selectedCareer,
        name: career.name
      },
      specialization: specialization ? {
        id: selectedSpecialization,
        name: specialization.name
      } : null
    };
    
    // Save to localStorage
    localStorage.setItem('careerSelection', JSON.stringify(selectionData));
    
    // Navigate to the next page
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
                  className={`option-card ${selectedCareer === option.id ? 'selected' : ''}`}
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
                  className={`option-card ${selectedSpecialization === option.id ? 'selected' : ''}`}
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
              <p>Career: {careerOptions[category].find(c => c.id === selectedCareer)?.name}</p>
              <p>Specialization: {specializationOptions[selectedCareer]?.find(s => s.id === selectedSpecialization)?.name}</p>
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