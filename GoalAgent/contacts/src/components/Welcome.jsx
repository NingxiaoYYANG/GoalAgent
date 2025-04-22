import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css'; // Import Welcome.css here if needed
import BigButton from './BigButton';
import Title from '../Background/Title.png';

const Welcome = (props) => {
  return (
    <div className='Welcome_Section'>
      <h2 className="intro-heading">A DECENTRALIZED SKILL CERTIFICATION PLATFORM EMPOWERED BY AI</h2>
      <h1 className='Title'>
        <img src={Title} alt="Title" />
      </h1>
      {props.userConnected && ( /* 仅在 userConnected 为 true 时显示按钮 */
        <BigButton onClick={props.monsterInputBtnFn}>START </BigButton>
      )}
      <div className="space"></div>
      <div className="space"></div>
    </div>
  );
};

Welcome.propTypes = {
  monsterInputBtnFn: PropTypes.func,
  userConnected: PropTypes.bool
};

export default Welcome;
