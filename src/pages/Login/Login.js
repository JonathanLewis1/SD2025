import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
import '../../App.css';
import { setPersistence, browserSessionPersistence } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Auth state changed - User is signed in:', user.uid);
      } else {
        console.log('Auth state changed - User is signed out');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setIsLoading(true);
  
    if (!email || !password) {
      setError('Email and password are required.');
      setIsLoading(false);
      return;
    }
  
    try {
      // Set persistence first
      await setPersistence(auth, browserSessionPersistence);
      console.log('Persistence set to session');

      // Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed in:', user.uid);

      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        await signOut(auth);
        setIsLoading(false);
        return;
      }

      // Force refresh token
      const token = await user.getIdToken(true);
      console.log('Token refreshed');
      
      if (!token) {
        setError('Failed to get authentication token. Please try again.');
        setIsLoading(false);
        return;
      }

      // Wait for auth state to be fully established
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        // Ensure we're still authenticated
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User authentication lost');
        }

        // Get a fresh token right before the call
        const freshToken = await currentUser.getIdToken(true);
        console.log('Fresh token obtained for cloud function call');

        const getUserRole = httpsCallable(functions, 'getUserRole');
        console.log('Calling getUserRole function with fresh token:', freshToken.substring(0, 10) + '...');
        
        // Add a small delay to ensure token propagation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await getUserRole();
        console.log('getUserRole response:', response.data);
        
        if (!response.data || !response.data.role) {
          console.error('Invalid response from getUserRole:', response);
          throw new Error('Invalid response from getUserRole function');
        }
        
        const { role } = response.data;
        console.log('User role retrieved:', role);

        // Redirect based on role
        console.log('Redirecting user based on role:', role);
        if (role === 'buyer') {
          navigate('/home');
        } else if (role === 'seller') {
          navigate('/sellerpage');
        } else if (role === 'admin') {
          navigate('/admin');
        } else {
          console.error('Unrecognized role:', role);
          setError('User role not recognized.');
        }
      } catch (funcError) {
        console.error('Cloud function error:', funcError);
        if (funcError.code === 'functions/unauthenticated') {
          setError('Authentication failed. Please try logging in again.');
        } else if (funcError.code === 'functions/not-found') {
          setError('User profile not found. Please contact support.');
        } else if (funcError.message === 'User authentication lost') {
          setError('Authentication session expired. Please try logging in again.');
        } else if (funcError.message === 'Invalid response from getUserRole function') {
          setError('Failed to get user role. Please try again.');
        } else {
          console.error('Unexpected error:', funcError);
          setError('An unexpected error occurred. Please try again.');
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'functions/not-found') {
        setError('User profile not found in database.');
      } else if (err.code === 'functions/invalid-argument') {
        setError('Invalid login request. Try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Login failed: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleForgotPassword = async () => {
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
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Log In</button>
        </form>

        <p style={styles.forgotPassword} onClick={handleForgotPassword}>
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