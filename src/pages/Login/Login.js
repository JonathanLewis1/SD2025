import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { userRole, loading: authLoading, isCheckingRole } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || authLoading || isCheckingRole) return;

    setError("");
    setIsLoading(true);

    try {
      // First, attempt to sign in
      await signInWithEmailAndPassword(auth, email, password);
      
      // Wait for role check to complete
      let attempts = 0;
      const maxAttempts = 10;
      const checkRole = async () => {
        if (attempts >= maxAttempts) {
          setError("Failed to verify user role. Please try again.");
          setIsLoading(false);
          return;
        }

        if (isCheckingRole || !userRole) {
          attempts++;
          setTimeout(checkRole, 500);
          return;
        }

        // Role is available, handle navigation
        let targetPath;
        switch (userRole) {
          case "admin":
            targetPath = "/admin";
            break;
          case "seller":
            targetPath = "/sellerpage";
            break;
          case "buyer":
            targetPath = "/home";
            break;
          default:
            setError('Invalid user role');
            setIsLoading(false);
            return;
        }
        navigate(targetPath, { replace: true });
      };

      checkRole();
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (isLoading || authLoading || isCheckingRole) return;
    
    setError('');
    setResetMessage('');
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError('Failed to send reset email. Please check your email.');
    }
  };

  if (authLoading || isCheckingRole) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <h2 style={styles.subtitle}>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Welcome to Craft Nest!</h1>
        <h2 style={styles.subtitle}>Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        {resetMessage && <p style={styles.success}>{resetMessage}</p>}

        <form onSubmit={handleSubmit} noValidate style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            disabled={isLoading || authLoading || isCheckingRole}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            disabled={isLoading || authLoading || isCheckingRole}
          />
          <button 
            type="submit" 
            style={styles.button} 
            disabled={isLoading || authLoading || isCheckingRole}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p 
          style={styles.forgotPassword} 
          onClick={handleForgotPassword}
          className={isLoading || authLoading || isCheckingRole ? 'disabled' : ''}
        >
          Forgot your password?
        </p>

        <p style={styles.signupText}>
          New here? <Link to="/signup" style={styles.link}>Sign up now!</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: '#feffdf',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#dde0ab',
    padding: 32,
    borderRadius: 16,
    border: '1px solid #2a2a2a',
    maxWidth: 400,
    width: '100%',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
  },
  title: {
    color: '#97cba9',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 24,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  input: {
    backgroundColor: '#668ba4',
    color: '#ffffff',
    padding: '12px 16px',
    borderRadius: 24,
    border: '1px solid #2a2a2a',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '12px 16px',
    border: 'none',
    borderRadius: 12,
    fontWeight: 500,
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 8,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    fontSize: 14,
  },
  success: {
    color: 'green',
    marginBottom: 12,
    fontSize: 14,
  },
  forgotPassword: {
    marginTop: 12,
    fontSize: 14,
    color: '#3b82f6',
    textAlign: 'right',
    cursor: 'pointer',
  },
  signupText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default Login;