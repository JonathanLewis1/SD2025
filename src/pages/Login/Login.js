
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
