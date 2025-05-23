import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
// import { collection, doc, setDoc } from "firebase/firestore";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';



const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    if (!firstName) {
      setError('First Name is required');
      return;
    }
    if (!lastName) {
      setError('Last Name is required');
      return;
    }
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      // Create user in Firebase Authentication
      const checkBanned = httpsCallable(functions, 'isEmailBanned');
      const banCheck = await checkBanned({ email });
      if (banCheck.data.banned) {
        setError('This email has been banned. You cannot sign up.');
        return;
      }


      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("User created:", {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      metadata: user.metadata,
    });
    console.log("Registering user profile with data:", {
      uid: user.uid,
      firstName,
      lastName,
      role,
      email,
    });
      // Send verification email
      await sendEmailVerification(user);

      // Call the registerUserProfile function only after successful user creation
      const registerUserProfile = httpsCallable(functions, 'registerUserProfile');
      await registerUserProfile({
        uid: user.uid,
        firstName,
        lastName,
        role,
        email,
      });

      console.log('Navigating to login page after successful sign-up');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Create Account</h2>
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSignUp} noValidate style={styles.form}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={styles.input}
          />
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
          <label style={styles.label}>
            Role:
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.select}
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </label>
          <button type="submit" style={styles.button}>Sign Up</button>
        </form>
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
    backgroundColor: '#1a1a1a',
    padding: 32,
    borderRadius: 16,
    border: '1px solid #2a2a2a',
    maxWidth: 400,
    width: '100%',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    fontSize: 14,
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
  },
  select: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: '10px 14px',
    borderRadius: 16,
    border: '1px solid #2a2a2a',
    fontSize: 14,
    marginLeft: 8,
    marginTop: 8,
    outline: 'none',
  },
  label: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    display: 'flex',
    flexDirection: 'column',
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
};

export default SignUp;
