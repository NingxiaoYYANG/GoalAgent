import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategorySelection.css';

const CategorySelection = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'technical',
      name: 'Technical',
      description: 'For those who enjoy working with technology, programming, and engineering.',
      image: '../Background/technical.png'
    },
    {
      id: 'arts',
      name: 'Arts',
      description: 'For creative individuals who excel in visual arts, design, and digital media.',
      image: '../Background/arts.png'
    },
    {
      id: 'services',
      name: 'Services',
      description: 'For those who are passionate about helping others through education, healthcare, and culinary arts.',
      image: '../Background/services.png'
    },
    {
      id: 'business',
      name: 'Business',
      description: 'For individuals interested in management, finance, and entrepreneurship.',
      image: '../Background/business.png'
    },
    {
      id: 'others',
      name: 'Others',
      description: 'For those interested in law, social work, and other specialized fields.',
      image: '../Background/others.png'
    }
  ];

  const handleCategorySelect = (categoryId) => {
    navigate(`/career-selection/${categoryId}`);
  };

  return (
    <div className="category-selection-container">
      <div className="category-selection-content">
        <h1>Select Your Preferred Category</h1>
        <p className="instruction-text">
          Based on your answers, please select the category that best matches your interests and strengths.
        </p>
        
        <div className="categories-grid">
          {categories.map(category => (
            <div 
              key={category.id}
              className="category-card"
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