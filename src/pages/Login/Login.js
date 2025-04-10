import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'; 
import '../../App.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home'); // Redirect after successful login
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h1>Welcome to Craft Nest!</h1>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit} noValidate>
          <input 
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button type="submit">Log In</button>
        </form>
        <p>
          New here? <Link to="/signup">Sign up now!</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
