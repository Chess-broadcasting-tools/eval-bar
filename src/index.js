import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App'; // Your main App component
import LandingPage from './LandingPage';
import Ccm from './ccm' // Capitalize Ccm heres
import Messagedisplay from './messagedisplay';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/evalbars" element={<App />} />
        <Route path="/ccm" element={<Ccm />} /> 
        
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
