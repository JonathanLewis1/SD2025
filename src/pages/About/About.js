// import React, { useState, useEffect } from 'react';
// import { db, auth } from '../../firebase';
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   addDoc,
//   deleteDoc,
//   doc,
//   updateDoc
// } from 'firebase/firestore';
// import { onAuthStateChanged } from 'firebase/auth';

const SellerPage = () => {
  

  return (
    <div style = {styles.container}>
        <h1>About Us</h1>
    <section style={styles.section}>
      <article style = {styles.article}>
      <p>At CraftNest, we’re more than just a team — we’re a family of creators, collaborators, and visionaries brought together by a shared passion for creativity and craftsmanship. </p>

<p>We are five friends — Jacob Boner, Jake Shapiro, Jonathan Lewis, Aharon Zagnoev, and Carl Germishuys — each bringing our own unique skills and ideas to the table. From design and development to strategy and storytelling, we’ve built CraftNest with a simple goal in mind: to create a platform where creativity thrives. </p>

<p>CraftNest is a vibrant online space where artisans, makers, and small businesses can showcase their work and connect with people who value thoughtful, handmade products. Whether it's bespoke jewelry, handcrafted home goods, or digital art with soul, we’re here to help creators share their passions with the world.</p>

<p>What do we do? We build tools that empower makers. We support their journey from inspiration to creation to sale. And most importantly, we celebrate the love and intention behind every craft.</p>

<p>We love what we do because we believe in creativity — in its power to tell stories, bring people together, and make the world a little more beautiful.</p>

<p style = {styles.subheading}>Welcome to CraftNest — where craft meets community.</p>
</article>
    </section>
    </div>
  );
};


const styles = {
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
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    padding: 32,
  },
};

export default SellerPage;
