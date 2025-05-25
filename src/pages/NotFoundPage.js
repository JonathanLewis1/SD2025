import React from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '../components/common/Section';
import Button from '../components/common/Button';
import Header from '../components/common/Header';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const goHome = () => navigate('/');

  return (
    <Section
      styleProps={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111111',
        padding: 24,
      }}
    >
      <Header level={1} styleProps={{ color: '#3b82f6', marginBottom: 16 }}>404</Header>
      <Header level={3} styleProps={{ color: '#cccccc', marginBottom: 32 }}>
        Oops! The page you&rsquo;re looking for doesn't exist.
      </Header>
      <Button onClick={goHome} styleProps={{ backgroundColor: '#3b82f6', color: '#fff', padding: '12px 24px' }}>
        Go Back Home
      </Button>
    </Section>
  );
}

