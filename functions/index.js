/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
//const stripe = require("stripe")(functions.config().stripe.secret_key);
admin.initializeApp();

const db = admin.firestore();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Get user role by UID
exports.getUserRole = onCall({
  cors: true,
  maxInstances: 10,
}, async (request) => {
  logger.info('getUserRole function called', { auth: request.auth });
  
  if (!request.auth) {
    logger.error('No auth context in request');
    throw new Error('User must be logged in');
  }

  const uid = request.auth.uid;
  logger.info('Processing request for user', { uid });

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      logger.error('User document not found', { uid });
      throw new Error('User profile not found');
    }
    
    const userData = userDoc.data();
    logger.info('User role retrieved successfully', { uid, role: userData.role });
    return { role: userData.role };
  } catch (error) {
    logger.error('Error in getUserRole function', { error: error.message, uid });
    throw new Error(error.message);
  }
});

exports.registerUserProfile = onCall({
  cors: true,
  maxInstances: 10,
}, async (request) => {
  logger.info('registerUserProfile function called', { auth: request.auth });
  
  if (!request.auth) {
    logger.error('No auth context in request');
    throw new Error('User must be logged in');
  }

  const { firstName, lastName, role, email } = request.data;
  const uid = request.auth.uid;

  logger.info('Processing registration for user', { uid, email });

  if (!firstName || !lastName || !role || !email) {
    logger.error('Missing required fields', { firstName, lastName, role, email });
    throw new Error('Missing required fields');
  }

  try {
    await db.collection('users').doc(uid).set({
      firstName,
      lastName,
      role,
      email,
      createdAt: new Date().toISOString(),
    });
    logger.info('User profile registered successfully', { uid });
    return { success: true };
  } catch (error) {
    logger.error('Error registering user profile', { error: error.message, uid });
    throw new Error(error.message);
  }
});

exports.getAllUsersv2 = onCall({ cors: true }, async (request) => {
  const snapshot = await db.collection('users').get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
});

exports.getAllComplaintsv2 = onCall({ cors: true }, async (request) => {
  const snapshot = await db.collection('complaints').get();
  return snapshot.docs.map(doc => doc.data());
});

exports.banUser = onCall({ cors: true }, async (request) => {
  const { userId, email } = request.data;
  if (!userId || !email) throw new Error('Missing user ID or email');

  try {
    await db.collection('users').doc(userId).update({ banned: true });
    await db.collection('bannedEmails').doc(email).set({ banned: true });
    return { success: true };
  } catch (error) {
    throw new Error('Failed to ban user: ' + error.message);
  }
});


exports.submitComplaint = onCall({ cors: true }, async (request) => {
  const { name, email, message } = request.data;

  if (!name || !email || !message) {
    throw new Error('All fields are required');
  }

  try {
    await db.collection('complaints').add({
      name,
      email,
      message,
      createdAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    throw new Error('Failed to submit complaint: ' + error.message);
  }
});


exports.isEmailBanned = onCall({ cors: true }, async (request) => {
  const { email } = request.data;
  if (!email) throw new Error('Missing email');

  const docRef = db.collection('bannedEmails').doc(email);
  const docSnap = await docRef.get();

  return { banned: docSnap.exists };
});
