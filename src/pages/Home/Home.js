import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="login-wrapper">
      <h1>This will be the home page</h1>
      <button className = "logout-button" onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default Home;