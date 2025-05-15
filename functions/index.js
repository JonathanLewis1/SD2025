/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// Get user role by UID
exports.getUserRole = functions.https.onCall(async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
  
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found');
      }
      return { role: userDoc.data().role };
    } catch (error) {
      throw new functions.https.HttpsError('unknown', error.message);
    }
  });
  

exports.registerUserProfile = functions.https.onCall(async (data, context) => {
    console.log('Registering user profile with data:', data);
    const { uid, firstName, lastName, role, email } = data;
    if (!uid || !firstName || !lastName || !role || !email) {
      throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
    }
  
    try {
      await admin.firestore().collection("users").doc(uid).set({
        firstName,
        lastName,
        role,
        email,
        createdAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      throw new functions.https.HttpsError("unknown", error.message);
    }
  });


