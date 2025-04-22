import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BigButton from '../components/BigButton';
import PropTypes from 'prop-types';
import './Input.css';

const Input = (props) => {
    const [position, setPosition] = useState('')
    const [areaOfInterest, setAreaOfInterest] = useState('');
    const navigate = useNavigate();

    const navigateToOutput = () => {
      if (position.length != 0) {
        navigate(`/monster-output`);
      } else {
        alert("Please select a valid position")
    };
      }
      

    // handle change when user selects an option for area of interest
    const handleInterestChange = (event) => {
        setAreaOfInterest(event.target.value);
        setPosition('');
    };

    // handle change when user selects an option for area of Position
    const handlePositionChange = (event) => {
        setPosition(event.target.value);
        props.setUserInputFn(event.target.value);
        localStorage.setItem('userInput', event.target.value);
    };
    
    const InterestOptions = [
      { value: 'art', label: 'ART' },
      { value: 'iT', label: 'IT' },
      { value: 'engineering', label: 'ENGINEERING' },
      { value: 'science', label: 'SCIENCE' },
      { value: 'design', label: 'DESIGN' },
  ];
  
  const ArtPositions = [
      { value: 'Fine Artist', label: 'FINE ARTIST' },
      { value: 'Art Illustrator', label: 'ART ILLUSTRATOR' },
      { value: 'Graphic Designer', label: 'GRAPHIC DESIGNER' },
  ];
  
  const ITPositions = [
      { value: 'Software Development', label: 'SOFTWARE DEVELOPMENT' },
      { value: 'Web Development', label: 'WEB DEVELOPMENT' },
      { value: 'Systems Administration', label: 'SYSTEMS ADMINISTRATION' },
      { value: 'Network Engineering', label: 'NETWORK ENGINEERING' },
      { value: 'Cybersecurity', label: 'CYBERSECURITY' },
      { value: 'Data Science and Analytics', label: 'DATA SCIENCE AND ANALYTICS' },
      { value: 'Cloud Computing', label: 'CLOUD COMPUTING' },
      { value: 'IT Consulting', label: 'IT CONSULTING' },
  ];
  
  const EngineeringPositions = [
      { value: 'Civil Engineering', label: 'CIVIL' },
      { value: 'Mechanical Engineering', label: 'MECHANICAL' },
      { value: 'Electrical Engineering', label: 'ELECTRICAL' },
      { value: 'Aerospace Engineering', label: 'AEROSPACE' },
      { value: 'Computer Engineering', label: 'COMPUTER' },
      { value: 'Chemical Engineering', label: 'CHEMICAL' },
      { value: 'Environmental Engineering', label: 'ENVIRONMENTAL' },
      { value: 'Biomedical Engineering', label: 'BIOMEDICAL' },
      { value: 'Industrial Engineering', label: 'INDUSTRIAL' },
      { value: 'Software Engineering', label: 'SOFTWARE' },
      { value: 'Materials Engineering', label: 'MATERIALS' },
      { value: 'Petroleum Engineering', label: 'PETROLEUM' },
      { value: 'Nuclear Engineering', label: 'NUCLEAR' },
      { value: 'Renewable Energy Engineering', label: 'RENEWABLE ENERGY' },
  ];
  
  const SciencePositions = [
      { value: 'Research Scientist', label: 'RESEARCH' },
      { value: 'Medical Scientist', label: 'MEDICAL' },
      { value: 'Biotechnologist', label: 'BIOTECHNOLOGIST' },
      { value: 'Pharmacist', label: 'PHARMACIST' },
      { value: 'Environmental Scientist', label: 'ENVIRONMENTAL' },
      { value: 'Geoscientist', label: 'GEOSCIENTIST' },
      { value: 'Astrophysicist/Astronomer', label: 'ASTROPHYSICIST' },
      { value: 'Neuroscientist', label: 'NEUROSCIENTIST' },
      { value: 'Forensic Scientist', label: 'FORENSIC' },
      { value: 'Science Educator', label: 'EDUCATOR' },
      { value: 'Science Communicator', label: 'COMMUNICATOR' },
      { value: 'Science Policy Analyst', label: 'ANALYST' },
      { value: 'Food Scientist', label: 'FOOD' },
      { value: 'Zoologist/Botanist', label: 'ZOOLOGIST' },
      { value: 'Biomedical Researcher', label: 'BIOMEDICAL' },
      { value: 'Materials Scientist', label: 'MATERIALS' },
      { value: 'Science Illustrator', label: 'ILLUSTRATOR' },
  ];
  
  const DesignPositions = [
      { value: 'Graphic Design', label: 'GRAPHIC' },
      { value: 'Web Design and Development', label: 'WEB DESIGN' },
      { value: 'UX/UI Design', label: 'UX/UI' },
      { value: 'Industrial Design', label: 'INDUSTRIAL' },
      { value: 'Interior Design', label: 'INTERIOR' },
      { value: 'Fashion Design', label: 'FASHION' },
      { value: 'Animation and Motion Graphics', label: 'ANIMATION' },
      { value: 'Architectural Design', label: 'ARCHITECTURAL' },
      { value: 'Game Design', label: 'GAME DESIGN' },
      { value: 'Multimedia Design', label: 'MULTIMEDIA' },
      { value: 'User Experience Research', label: 'USER EXPERIENCE' },
      { value: 'Advertising and Branding Design', label: 'ADVERTISING' },
  ];
  
    
    let positions = []
    if (areaOfInterest === 'art') {
        positions = ArtPositions;
    } else if (areaOfInterest === 'iT') {
        positions = ITPositions;
    } else if (areaOfInterest === 'engineering') {
        positions = EngineeringPositions;
    } else if (areaOfInterest === 'science') {
        positions = SciencePositions;
    } else if (areaOfInterest === 'design') {
        positions = DesignPositions;
    }

    return (
        <div className="Input_Section">
          <div className="Interest_question">
            <h1 className="input-heading">WHAT IS YOUR AREA OF INTEREST?</h1>
            <div className="select-wrapper">
              <select value={areaOfInterest} onChange={handleInterestChange} className="input-select">
                <option value="">SELECT AN INTEREST</option>
                {InterestOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
      
          {areaOfInterest && positions && (
            <div className="career_question">
              <h1 className="input-heading">WHAT IS YOUR CAREER GOAL?</h1>
              <div className="select-wrapper">
                <select value={position} onChange={handlePositionChange} className="input-select">
                  <option value="">SELECT A POSITION</option>
                  {positions.map((position) => (
                    <option key={position.value} value={position.value}>
                      {position.label}
                    </option>
                  ))}
                </select>
                <div className='button'>
                  <BigButton id='confirm' onClick={navigateToOutput}> CONFIRM </BigButton>
                </div>
              </div>
            </div>
          )}
        </div>
    );
};

Input.protoTypes = {
    setUserInputFn: PropTypes.func
}

export default Input;
