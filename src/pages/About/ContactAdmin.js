
import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import Section from '../../components/common/Section';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TextInput from '../../components/common/TextInput';

export default function ContactAdmin() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitComplaint = httpsCallable(functions, 'submitComplaint');
      await submitComplaint(formData);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting complaint:', err.message);
      alert('Failed to send your message. Please try again.');
    }
  };

  return (
    <Container>
      <Section styleProps={{ display: 'flex', justifyContent: 'center' }}>
        <Header level={1} styleProps={{ textAlign: 'center' }}>
          Contact Admin
        </Header>
      </Section>

      {submitted ? (
        <p style={{ textAlign: 'center' }}>
          Thank you for your message! We'll get back to you shortly.
        </p>
      ) : (
        <Section>
          <Card styleProps={{ maxWidth: 500, margin: '0 auto' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TextInput
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <TextInput
                name="email"
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <TextInput
                as="textarea"
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
              />
              <Button type="submit">Send</Button>
            </form>
          </Card>
        </Section>
      )}
    </Container>
  );
}
