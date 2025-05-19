import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

const ContactAdmin = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
    <div style={styles.container}>
      <h1 style={styles.heading}>Contact Admin</h1>
      {submitted ? (
        <p>Thank you for your message! We'll get back to you shortly.</p>
      ) : (
        <section style={styles.panel}>
        <form style={styles.form} onSubmit={handleSubmit}>
          <label>Name:<br />
            <input name="name" value={formData.name} onChange={handleChange} required style={styles.input}/>
          </label><br /><br />
          <label>Email:<br />
            <input name="email" type="email" value={formData.email} onChange={handleChange} required style={styles.input}/>
          </label><br /><br />
          <label>Message:<br />
            <textarea name="message" value={formData.message} onChange={handleChange} required style={styles.input}/>
          </label><br /><br />
          <button style={styles.button} type="submit">Send</button>
        </form>
        </section>
      )}
    </div>
  );
};

const styles = {
  input: {
    backgroundColor: '#ffffff',
    padding: '12px 16px',
    borderRadius: 24,
    border: '1px solid #2a2a2a',
    fontSize: 14,
    outline: 'none',
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
  /*form: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },*/
  subheading: {
    fontSize: 24,
    fontWeight: 600,
    color: '#555',
    marginBottom: 4,
  },
  section: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: '#feffdf'
  },
  article: {
    maxWidth: '800px',
    width: '100%',
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
  },
  container: {
    backgroundColor: '#feffdf',
    minHeight: '100vh',
    padding: 32,
  },
  heading: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#3b82f6',
    textAlign: 'center'
  },
  /*panel: {
    marginBottom: 48,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },*/
  panel: {
  margin: '0 auto',
  backgroundColor: '#ffffff',
  padding: '24px 32px',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  maxWidth: 500,
  width: '100%',
},
form: {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
}
};

export default ContactAdmin;
