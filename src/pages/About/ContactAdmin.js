import React, { useState } from 'react';

const ContactAdmin = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted Message:', formData);
    setSubmitted(true);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Contact Admin</h1>
      {submitted ? (
        <p>Thank you for your message! We'll get back to you shortly.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>Name:<br />
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label><br /><br />
          <label>Email:<br />
            <input name="email" type="email" value={formData.email} onChange={handleChange} required />
          </label><br /><br />
          <label>Message:<br />
            <textarea name="message" value={formData.message} onChange={handleChange} required />
          </label><br /><br />
          <button type="submit">Send</button>
        </form>
      )}
    </div>
  );
};

export default ContactAdmin;
