// import React, { useState, useEffect } from 'react';
// import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from 'firebase/auth';
// import { auth } from '../../firebase';
// import { httpsCallable } from 'firebase/functions';
// import { functions } from '../../firebase';
// import { useNavigate, Link } from 'react-router-dom';
// import '../../App.css';
// import { setPersistence, browserSessionPersistence } from 'firebase/auth';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [resetMessage, setResetMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         console.log('Auth state changed - User is signed in:', user.uid);
//       } else {
//         console.log('Auth state changed - User is signed out');
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setResetMessage('');
//     setIsLoading(true);
  
//     if (!email || !password) {
//       setError('Email and password are required.');
//       setIsLoading(false);
//       return;
//     }
  
//     try {
//       // Set persistence first
//       await setPersistence(auth, browserSessionPersistence);
//       console.log('Persistence set to session');

//       // Sign in user
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
//       console.log('User signed in:', user.uid);

//       if (!user.emailVerified) {
//         setError('Please verify your email before logging in.');
//         await signOut(auth);
//         setIsLoading(false);
//         return;
//       }

//       // Force refresh token
//       const token = await user.getIdToken(true);
//       console.log('Token refreshed');
      
//       if (!token) {
//         setError('Failed to get authentication token. Please try again.');
//         setIsLoading(false);
//         return;
//       }

//       // Wait for auth state to be fully established
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       try {
//         // Ensure we're still authenticated
//         const currentUser = auth.currentUser;
//         if (!currentUser) {
//           throw new Error('User authentication lost');
//         }

//         // Get a fresh token right before the call
//         const freshToken = await currentUser.getIdToken(true);
//         console.log('Fresh token obtained for cloud function call');

//         const checkBanned = httpsCallable(functions, 'isEmailBanned');
//         const banCheck = await checkBanned({ email });
//         if (banCheck.data.banned) {
//           setError('Your account has been banned.');
//           await signOut(auth);
//           return;
//         }

//         const getUserRole = httpsCallable(functions, 'getUserRole');
//         console.log('Calling getUserRole function with fresh token:', freshToken.substring(0, 10) + '...');
        
//         // Add a small delay to ensure token propagation
//         await new Promise(resolve => setTimeout(resolve, 500));
        
//         const response = await getUserRole();
//         console.log('getUserRole response:', response.data);
        
//         if (!response.data || !response.data.role) {
//           console.error('Invalid response from getUserRole:', response);
//           throw new Error('Invalid response from getUserRole function');
//         }
        
//         const { role } = response.data;
//         console.log('User role retrieved:', role);

//         // Redirect based on role
//         console.log('Redirecting user based on role:', role);
//         if (role === 'buyer') {
//           navigate('/home');
//         } else if (role === 'seller') {
//           navigate('/sellerpage');
//         } else if (role === 'admin') {
//           navigate('/admin');
//         } else {
//           console.error('Unrecognized role:', role);
//           setError('User role not recognized.');
//         }
//       } catch (funcError) {
//         console.error('Cloud function error:', funcError);
//         if (funcError.code === 'functions/unauthenticated') {
//           setError('Authentication failed. Please try logging in again.');
//         } else if (funcError.code === 'functions/not-found') {
//           setError('User profile not found. Please contact support.');
//         } else if (funcError.message === 'User authentication lost') {
//           setError('Authentication session expired. Please try logging in again.');
//         } else if (funcError.message === 'Invalid response from getUserRole function') {
//           setError('Failed to get user role. Please try again.');
//         } else {
//           console.error('Unexpected error:', funcError);
//           setError('An unexpected error occurred. Please try again.');
//         }
//       }
//     } catch (err) {
//       console.error("Login failed:", err);
//       if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
//         setError('Invalid email or password');
//       } else if (err.code === 'functions/not-found') {
//         setError('User profile not found in database.');
//       } else if (err.code === 'functions/invalid-argument') {
//         setError('Invalid login request. Try again.');
//       } else if (err.code === 'auth/too-many-requests') {
//         setError('Too many failed attempts. Please try again later.');
//       } else {
//         setError('Login failed: ' + err.message);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };
  

//   const handleForgotPassword = async () => {
//     setError('');
//     setResetMessage('');
//     if (!email) {
//       setError('Please enter your email first');
//       return;
//     }
//     try {
//       await sendPasswordResetEmail(auth, email);
//       setResetMessage('Password reset email sent! Check your inbox.');
//     } catch (err) {
//       setError('Failed to send reset email. Please check your email.');
//     }
//   };

//   return (
//     <div style={styles.wrapper}>
//       <div style={styles.container}>
//         <h1 style={styles.title}>Welcome to Craft Nest!</h1>
//         <h2 style={styles.subtitle}>Login</h2>
//         {error && <p style={styles.error}>{error}</p>}
//         {resetMessage && <p style={styles.success}>{resetMessage}</p>}

//         <form onSubmit={handleSubmit} noValidate style={styles.form}>
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             style={styles.input}
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             style={styles.input}
//           />
//           <button type="submit" style={styles.button}>Log In</button>
//         </form>

//         <p style={styles.forgotPassword} onClick={handleForgotPassword}>
//           Forgot your password?
//         </p>

//         <p style={styles.signupText}>
//           New here? <Link to="/signup" style={styles.link}>Sign up now!</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   wrapper: {
//     backgroundColor: '#feffdf',
//     minHeight: '100vh',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 24,
//   },
//   container: {
//     backgroundColor: '#dde0ab',
//     padding: 32,
//     borderRadius: 16,
//     border: '1px solid #2a2a2a',
//     maxWidth: 400,
//     width: '100%',
//     boxShadow: '0 0 10px rgba(0,0,0,0.5)',
//   },
//   title: {
//     color: '#97cba9',
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   subtitle: {
//     color: '#ffffff',
//     fontSize: 20,
//     fontWeight: 600,
//     marginBottom: 24,
//   },
//   form: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: 16,
//   },
//   input: {
//     backgroundColor: '#668ba4',
//     color: '#ffffff',
//     padding: '12px 16px',
//     borderRadius: 24,
//     border: '1px solid #2a2a2a',
//     fontSize: 14,
//     outline: 'none',
//     transition: 'border-color 0.2s ease',
//   },
//   button: {
//     backgroundColor: '#3b82f6',
//     color: '#ffffff',
//     padding: '12px 16px',
//     border: 'none',
//     borderRadius: 12,
//     fontWeight: 500,
//     fontSize: 16,
//     cursor: 'pointer',
//     marginTop: 8,
//   },
//   error: {
//     color: 'red',
//     marginBottom: 12,
//     fontSize: 14,
//   },
//   success: {
//     color: 'green',
//     marginBottom: 12,
//     fontSize: 14,
//   },
//   forgotPassword: {
//     marginTop: 12,
//     fontSize: 14,
//     color: '#3b82f6',
//     textAlign: 'right',
//     cursor: 'pointer',
//   },
//   signupText: {
//     color: '#6b7280',
//     fontSize: 14,
//     marginTop: 20,
//     textAlign: 'center',
//   },
//   link: {
//     color: '#3b82f6',
//     textDecoration: 'none',
//     fontWeight: '500',
//   },
// };

// export default Login;
import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth, functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import { useNavigate, Link } from 'react-router-dom';

import Container   from '../../components/common/Container';
import Section     from '../../components/common/Section';
import Header      from '../../components/common/Header';
import TextInput   from '../../components/common/TextInput';
import Button      from '../../components/common/Button';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    return onAuthStateChanged(auth, user => {
      if (user) console.log('Signed in:', user.uid);
    });
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setResetMsg(''); setLoading(true);

    if (!email || !password) {
      setError('Email and password required.');
      setLoading(false);
      return;
    }

    try {
      await setPersistence(auth, browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        setError('Please verify your email first.');
        await signOut(auth);
        setLoading(false);
        return;
      }
      const checkBanned = httpsCallable(functions, 'isEmailBanned');
      const banCheck   = await checkBanned({ email });
      if (banCheck.data.banned) {
        setError('Account banned.');
        await signOut(auth);
        setLoading(false);
        return;
      }
      const getRole = httpsCallable(functions, 'getUserRole');
      const { role } = (await getRole()).data;
      if (role === 'buyer')       navigate('/home');
      else if (role === 'seller') navigate('/sellerpage');
      else if (role === 'admin')  navigate('/admin');
      else setError('Unknown role.');
    } catch (e) {
      console.error(e);
      setError(
        e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password'
          ? 'Invalid credentials.'
          : 'Login failed: ' + e.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setError(''); setResetMsg('');
    if (!email) { setError('Enter your email first.'); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMsg('Reset email sent!');
    } catch {
      setError('Failed to send reset email.');
    }
  };

  return (
    <Container styleProps={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: 24 }}>
      <Section
        as="section"
        styleProps={{
          backgroundColor: '#f9f9f9',
          padding: 32,
          borderRadius: 16,
          maxWidth: 400,
          margin: '0 auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Header level={1} styleProps={{ color: '#000', marginBottom: 12, textAlign: 'center' }}>
          Craft Nest
        </Header>
        <Header level={2} styleProps={{ color: '#000', marginBottom: 24, textAlign: 'center' }}>
          Login
        </Header>

        {error && (
          <Section as="p" styleProps={{ color: 'red', marginBottom: 12 }}>{error}</Section>
        )}
        {resetMsg && (
          <Section as="p" styleProps={{ color: 'green', marginBottom: 12 }}>{resetMsg}</Section>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            styleProps={{ backgroundColor: '#fff', color: '#000', border: '1px solid #ccc' }}
          />
          <TextInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            styleProps={{ backgroundColor: '#fff', color: '#000', border: '1px solid #ccc' }}
          />
          <Button
            type="submit"
            styleProps={{ backgroundColor: '#3b82f6', color: '#fff', borderRadius: 12 }}
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </Button>
        </form>

        <Section
          as="p"
          styleProps={{
            fontSize: 14,
            textAlign: 'right',
            marginTop: 12,
            color: '#3b82f6',
            cursor: 'pointer'
          }}
          onClick={handleForgot}
        >
          Forgot your password?
        </Section>

        <Section
          as="p"
          styleProps={{
            fontSize: 14,
            textAlign: 'center',
            marginTop: 20,
            color: '#555'
          }}
        >
          New here?{' '}
          <Link to="/signup" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
            Sign up now!
          </Link>
        </Section>
      </Section>
    </Container>
  );
}
