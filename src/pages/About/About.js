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




import React from 'react';
import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import Section from '../../components/common/Section';
import Card from '../../components/common/Card';

export default function About() {
  return (
    <Container>
      <Section styleProps={{ display: 'flex', justifyContent: 'center' }}>
        <Header level={1} styleProps={{ textAlign: 'center' }}>
          About Us
        </Header>
      </Section>
      <Section>
        <Card styleProps={{ maxWidth: 800, margin: '0 auto', lineHeight: '1.6' }}>
          <p>
            At CraftNest, we’re more than just a team — we’re a family of creators, collaborators,
            and visionaries brought together by a shared passion for creativity and craftsmanship.
          </p>
          <p>
            We are five friends — Jacob Boner, Jake Shapiro, Jonathan Lewis, Aharon Zagnoev, and
            Carl Germishuys — each bringing our own unique skills and ideas to the table. From design
            and development to strategy and storytelling, we’ve built CraftNest with a simple goal in
            mind: to create a platform where creativity thrives.
          </p>
          <p>
            CraftNest is a vibrant online space where artisans, makers, and small businesses can
            showcase their work and connect with people who value thoughtful, handmade products.
          </p>
          <p>
            What do we do? We build tools that empower makers. We support their journey from
            inspiration to creation to sale. And most importantly, we celebrate the love and intention
            behind every craft.
          </p>
          <p>
            We love what we do because we believe in creativity — in its power to tell stories, bring
            people together, and make the world a little more beautiful.
          </p>
          <p style={{ fontWeight: 600, fontSize: 18, marginTop: 16 }}>
            Welcome to CraftNest — where craft meets community.
          </p>
        </Card>
      </Section>
    </Container>
  );
}
