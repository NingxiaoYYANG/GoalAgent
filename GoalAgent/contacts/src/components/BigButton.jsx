import React from 'react';
import PropTypes from 'prop-types';
import './BigButton.css';

const Button = ({ onClick, disabled, children }) => {
  return (
    <button
      className="custom-button"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node,
};

export default Button;
