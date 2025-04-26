import React from 'react';
import Site from './Site';
import "./App.css";

import {
  BrowserRouter as Router,
} from 'react-router-dom';

function App () {
  return (
    <Router>
      <Site />
    </Router>
  );
}

export default App;
