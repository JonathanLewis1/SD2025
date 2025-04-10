
// export default App;
/*import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hello World</h1>
        <div className="names-container">
          <p className="name">Carl</p>
          <p className="name">Aharon</p>
          <p className="name">Jake</p>
          <p className="name">Jonothan</p>
          <p className="name">Jacob</p>
        </div>
      </header>
    </div>
  );
}

export default App;*/

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './Login';
import SignUp from './SignUp';

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
};

export default App;

