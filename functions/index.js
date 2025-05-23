/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
admin.initializeApp();

// const db = admin.firestore(); // This variable is not used

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Get user role by UID
exports.getUserRole = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Get the authorization token from the request
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      // const decodedToken = await admin.auth().verifyIdToken(idToken); // This variable is not used

      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      const userDoc = await admin.firestore()
        .collection("users")
        .doc(email)
        .get();

      if (!userDoc.exists) {
        res.json({ role: "user" });
        return;
      }

      res.json(userDoc.data());
    } catch (error) {
      console.error("Error getting user role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

exports.registerUserProfile = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Get the authorization token from the request
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      // const decodedToken = await admin.auth().verifyIdToken(idToken); // This variable is not used

      const { email, role, firstName, lastName } = req.body;
      if (!email || !role) {
        res.status(400).json({ error: "Email and role are required" });
        return;
      }

      await admin.firestore().collection('users').doc(email).set({
        email,
        role,
        firstName,
        lastName,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error registering user profile:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

exports.getAllUsers = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const usersSnapshot = await admin.firestore().collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return { users };
  } catch (error) {
    console.error('Error getting users:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get users'
    );
  }
});

exports.getAllComplaints = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const complaintsSnapshot = await admin.firestore().collection('complaints').get();
    const complaints = [];
    complaintsSnapshot.forEach(doc => {
      complaints.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return { complaints };
  } catch (error) {
    console.error('Error getting complaints:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get complaints'
    );
  }
});

exports.banUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { email } = data;
  if (!email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email is required'
    );
  }

  try {
    await admin.firestore().collection('banned_users').doc(email).set({
      email,
      bannedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error banning user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to ban user'
    );
  }
});

exports.submitComplaint = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { subject, message } = data;
  if (!subject || !message) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Subject and message are required'
    );
  }

  try {
    const complaintRef = await admin.firestore().collection('complaints').add({
      email: context.auth.token.email,
      subject,
      message,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: complaintRef.id };
  } catch (error) {
    console.error('Error submitting complaint:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to submit complaint'
    );
  }
});

exports.isEmailBanned = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      const bannedUserDoc = await admin.firestore()
        .collection("banned_users")
        .doc(email)
        .get();

      res.json({ isBanned: bannedUserDoc.exists });
    } catch (error) {
      console.error("Error checking banned status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

exports.submitMockOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { items, total } = data;
  if (!items || !total) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Items and total are required'
    );
  }

  try {
    const orderItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    const orderRef = await admin.firestore().collection('orders').add({
      email: context.auth.token.email,
      items: orderItems,
      total,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      sellersEmails: [context.auth.token.email]
    });
    return { id: orderRef.id };
  } catch (error) {
    console.error('Error submitting order:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to submit order'
    );
  }
});

exports.getSellerProducts = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { email } = data;
  if (!email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email is required'
    );
  }

  try {
    const productsSnapshot = await admin.firestore()
      .collection('products')
      .where('email', '==', email)
      .get();

    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return { products };
  } catch (error) {
    console.error('Error getting seller products:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get seller products'
    );
  }
});

exports.addProduct = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { name, price, description, image, category, email, stock } = data;
  if (!name || !price || !description || !image || !category || !email || stock === undefined) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'All fields are required'
    );
  }

  try {
    const productRef = await admin.firestore().collection('products').add({
      name,
      price,
      description,
      image,
      category,
      email,
      stock,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: productRef.id };
  } catch (error) {
    console.error('Error adding product:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to add product'
    );
  }
});

exports.updateProductStock = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { productId, stock } = data;
  if (!productId || stock === undefined) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Product ID and stock are required'
    );
  }

  try {
    const productDoc = await admin.firestore().collection('products').doc(productId).get();
    if (!productDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Product not found'
      );
    }

    const productData = productDoc.data();
    if (productData.email !== context.auth.token.email) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You can only update your own products'
      );
    }

    await admin.firestore().collection('products').doc(productId).update({
      stock,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to update product stock'
    );
  }
});

exports.deleteProduct = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { productId } = data;
  if (!productId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Product ID is required'
    );
  }

  try {
    const productDoc = await admin.firestore().collection('products').doc(productId).get();
    if (!productDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Product not found'
      );
    }

    const productData = productDoc.data();
    if (productData.email !== context.auth.token.email) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You can only delete your own products'
      );
    }

    await admin.firestore().collection('products').doc(productId).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to delete product'
    );
  }
});

exports.getSellerOrders = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { email } = data;
  if (!email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email is required'
    );
  }

  try {
    const snapshot = await admin.firestore().collection('orders').get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter orders where the seller's email matches
    const sellerOrders = orders.filter(order => 
      order.sellersEmails && order.sellersEmails.includes(email)
    );

    return sellerOrders;
  } catch (error) {
    console.error('Error getting seller orders:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get seller orders'
    );
  }
});

exports.getAllProducts = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Get the authorization token from the request
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      await admin.auth().verifyIdToken(idToken);

      const productsSnapshot = await admin.firestore().collection('products').get();
      const products = [];
      productsSnapshot.forEach(doc => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });
      res.json({ products });
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

exports.getProduct = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Get the authorization token from the request
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      await admin.auth().verifyIdToken(idToken);

      const { productId } = req.body;
      if (!productId) {
        res.status(400).json({ error: "Product ID is required" });
        return;
      }

      const productDoc = await admin.firestore().collection('products').doc(productId).get();
      if (!productDoc.exists) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json({
        id: productDoc.id,
        ...productDoc.data()
      });
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});