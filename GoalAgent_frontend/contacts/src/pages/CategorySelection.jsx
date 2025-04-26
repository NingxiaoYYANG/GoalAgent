import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CategorySelection.css';
import technical from '../Background/technical.png';
import arts from '../Background/arts.png';
import services from '../Background/services.png';
import business from '../Background/business.png';
import other from '../Background/other.png';

// {
//   category_selection: {
//     selected_category: 'Technical'  // 或 'Arts', 'Services', 'Business', 'Others'
//   }
// }

const CategorySelection = () => {
  const navigate = useNavigate();
  const [recommendedCategory, setRecommendedCategory] = useState(null);

  useEffect(() => {
    // Get the recommended category from localStorage
    const questionnaireData = localStorage.getItem('questionnaireData');
    if (questionnaireData) {
      const data = JSON.parse(questionnaireData);
      setRecommendedCategory(data.top_category);
    }
  }, []);

  const categories = [
    {
      id: 'technical',
      name: 'Technical',
      description: 'For those who enjoy working with technology, programming, and engineering.',
      image: technical
    },
    {
      id: 'arts',
      name: 'Arts',
      description: 'For creative individuals who excel in visual arts, design, and digital media.',
      image: arts
    },
    {
      id: 'services',
      name: 'Services',
      description: 'For those who are passionate about helping others through education, healthcare, and culinary arts.',
      image: services
    },
    {
      id: 'business',
      name: 'Business',
      description: 'For individuals interested in management, finance, and entrepreneurship.',
      image: business
    },
    {
      id: 'others',
      name: 'Others',
      description: 'For those interested in law, social work, and other specialized fields.',
      image: other
    }
  ];

  const handleCategorySelect = (categoryId) => {
    // Find the selected category
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    
    // Create the category selection data
    const categorySelection = {
      selected_category: selectedCategory.name
    };
    
    // Save to localStorage
    localStorage.setItem('categorySelection', JSON.stringify(categorySelection));
    
    // Navigate to the next page
    navigate(`/career-selection/${categoryId}`);
  };

  return (
    <div className="category-selection-container">
      <div className="category-selection-content">
        <h1>Select Your Preferred Category</h1>
        <p className="instruction-text">
          Based on your answers, please select the category that best matches your interests and strengths.
        </p>
        
        {recommendedCategory && (
          <div className="recommended-category">
            <p>Based on your questionnaire, we recommend: <strong>{recommendedCategory}</strong></p>
          </div>
        )}
        
        <div className="categories-grid">
          {categories.map(category => (
            <div 
              key={category.id}
              className={`category-card ${recommendedCategory === category.name ? 'recommended' : ''}`}
              onClick={() => handleCategorySelect(category.id)}
            >
              <div className="category-image">
                <img src={category.image} alt={category.name} />
              </div>
              <h2>{category.name}</h2>
              <p>{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySelection; 