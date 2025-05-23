import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
import '../../App.css';
import { setPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { db } from '../../firebase';

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
        // Check if we're already on the login page
        if (window.location.pathname === '/login') {
          // Get user role and navigate
          handleNavigation(user);
        }
      } else {
        console.log('Auth state changed - User is signed out');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNavigation = async (user) => {
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(
        "https://us-central1-sd2025law.cloudfunctions.net/getUserRole",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: user.email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get user role");
      }

      const userData = await response.json();
      console.log("User data for navigation:", userData);

      if (userData.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (userData.role === "seller") {
        navigate("/sellerpage", { replace: true });
      } else if (userData.role === "buyer") {
        navigate("/home", { replace: true });
      } else {
        console.log("Unknown role, defaulting to home page");
        navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error("Navigation error:", error);
      setError(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User signed in:", user.uid);

      // Get a fresh token
      const token = await user.getIdToken(true);
      console.log("Token refreshed");

      // Call getUserRole function with the token
      const response = await fetch(
        "https://us-central1-sd2025law.cloudfunctions.net/getUserRole",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: user.email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get user role");
      }

      const userData = await response.json();
      console.log("User data:", userData);

      // Navigate based on role
      if (userData.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (userData.role === "seller") {
        navigate("/sellerpage", { replace: true });
      } else if (userData.role === "buyer") {
        navigate("/home", { replace: true });
      } else {
        // Default to home if role is not recognized
        console.log("Unknown role, defaulting to home page");
        navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
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
          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
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