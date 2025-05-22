/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onCall, HttpsError} = require("firebase-functions/v2/https");
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
  cors: ["http://localhost:3000", "https://your-production-domain.com"],
  maxInstances: 10,
}, async (request) => {
  try {
    if (!request.auth) {
      logger.error('getUserRole: No auth context in request');
      throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    const uid = request.auth.uid;
    logger.info('getUserRole: Processing request for user', { uid });

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      logger.error('getUserRole: User document not found', { uid });
      throw new HttpsError('not-found', 'User profile not found');
    }

    const userData = userDoc.data();
    logger.info('getUserRole: User role retrieved successfully', { uid, role: userData.role });
    return { role: userData.role };
  } catch (err) {
    logger.error('getUserRole: Unexpected error', { message: err.message });
    throw new HttpsError('internal', err.message || 'Unknown error');
  }
});


exports.registerUserProfile = onCall({
  cors: ["http://localhost:3000", "https://your-production-domain.com"],
  maxInstances: 10,
}, async (request) => {
  logger.info('registerUserProfile function called', { auth: request.auth });
  
  if (!request.auth) {
    logger.error('No auth context in request');
    throw new HttpsError('User must be logged in');
  }

  const { firstName, lastName, role, email } = request.data;
  const uid = request.auth.uid;

  logger.info('Processing registration for user', { uid, email });

  if (!firstName || !lastName || !role || !email) {
    logger.error('Missing required fields', { firstName, lastName, role, email });
    throw new HttpsError('Missing required fields');
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
    throw new HttpsError(error.message);
  }
});

exports.getAllUsers = onCall({ cors: true }, async (request) => {
  const snapshot = await db.collection('users').get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
});

exports.getAllComplaints = onCall({ cors: true }, async (request) => {
  const snapshot = await db.collection('complaints').get();
  return snapshot.docs.map(doc => doc.data());
});

exports.banUser = onCall({ cors: true }, async (request) => {
  const { userId, email } = request.data;
  if (!userId || !email) throw new HttpsError('Missing user ID or email');

  try {
    await db.collection('users').doc(userId).update({ banned: true });
    await db.collection('bannedEmails').doc(email).set({ banned: true });
    return { success: true };
  } catch (error) {
    throw new HttpsError('Failed to ban user: ' + error.message);
  }
});


exports.submitComplaint = onCall({ cors: true }, async (request) => {
  const { name, email, message } = request.data;

  if (!name || !email || !message) {
    throw new HttpsError('All fields are required');
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
    throw new HttpsError('Failed to submit complaint: ' + error.message);
  }
});


exports.isEmailBanned = onCall({ cors: ["http://localhost:3000", "https://your-production-domain.com"] }, async (request) => {
  try {
    const email = request.data?.email;
    if (typeof email !== 'string' || email.trim() === '') {
      logger.error("Missing or invalid email received", { data: request.data });
      throw new HttpsError('invalid-argument', 'Email is required');
    }
    const docRef = db.collection('bannedEmails').doc(email.trim().toLowerCase());
    const docSnap = await docRef.get();
    return { banned: docSnap.exists };
  } catch (err) {
    logger.error("Fatal error in isEmailBanned", { message: err.message, stack: err.stack });
    throw new HttpsError('internal', err.message || 'Unexpected failure');
  }
});

exports.submitMockOrder = onCall({ cors: true }, async (request) => {
  const { cartItems, buyerEmail, shippingAddress } = request.data;

  if (!cartItems || !buyerEmail || !shippingAddress) {
    throw new HttpsError("Missing required fields");
  }

  const orderData = {
    buyerEmail,
    shippingAddress,
    timestamp: Date.now(),
    products: cartItems.map(item => item.name),
    quantity: cartItems.map(item => item.quantity),
    Price: cartItems.map(item => item.price),
    sellersEmails: cartItems.map(item => item.email),
    productNames: cartItems.map(item => item.name),
    DeliveryStatus: "Pending"
  };

  await admin.firestore().collection("orders").add(orderData);
  return { success: true };
});