
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db, functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

import Container  from '../../components/common/Container';
import Section    from '../../components/common/Section';
import Header     from '../../components/common/Header';
import TextInput  from '../../components/common/TextInput';
import Button     from '../../components/common/Button';

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [role, setRole]           = useState('buyer');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!firstName || !lastName || !email || !password) {
      setError('All fields required.');
      return;
    }
    try {
      const checkBanned = httpsCallable(functions, 'isEmailBanned');
      const banCheck   = await checkBanned({ email });
      if (banCheck.data.banned) {
        setError('This email is banned.');
        return;
      }
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      await setDoc(doc(db, 'users', cred.user.uid), { firstName, lastName, role, email });
      navigate('/login');
    } catch (e) {
      setError(e.message);
    }
    finally {
      setLoading(false);
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
        <Header level={2} styleProps={{ color: '#000', marginBottom: 24, textAlign: 'center' }}>
          Create Account
        </Header>

        {error && (
          <Section as="p" styleProps={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>
            {error}
          </Section>
        )}

        <form onSubmit={handleSignUp} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextInput
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            styleProps={{ backgroundColor: '#fff', color: '#000', border: '1px solid #ccc' }}
          />
          <TextInput
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            styleProps={{ backgroundColor: '#fff', color: '#000', border: '1px solid #ccc' }}
          />
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
          <Section as="label" styleProps={{ color: '#000', fontSize: 14 }}>
            Role:
            <TextInput
              as="select"
              value={role}
              onChange={e => setRole(e.target.value)}
              styleProps={{ backgroundColor: '#fff', color: '#000', border: '1px solid #ccc', marginTop: 8 }}
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </TextInput>
          </Section>
          <Button
            type="submit"
            styleProps={{ backgroundColor: '#3b82f6', color: '#fff', borderRadius: 12 }}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>
      </Section>
    </Container>
  );
}
