import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // Importing the main App component which contains routing
import reportWebVitals from './reportWebVitals'; // Optional for measuring app performance

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />  {/* Rendering the main App component */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();  // Optional for performance tracking
