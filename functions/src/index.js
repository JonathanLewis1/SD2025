const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { corsHandler } = require("./cors");

admin.initializeApp();

const VALID_ROLES = ["buyer", "seller", "admin"];

// Helper function to wrap functions with CORS
const wrapWithCors = (handler) => {
  return functions.region("us-central1").https.onRequest(async (req, res) => {
    // Set CORS headers
    res.set("Access-Control-Allow-Origin", "http://localhost:3000");
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      const result = await handler(req.body, { auth: req.auth });
      res.status(200).json(result);
    } catch (error) {
      console.error("Function error:", error);
      res.status(error.code === "unauthenticated" ? 401 : 500).json({
        error: error.message || "An error occurred",
      });
    }
  });
};

exports.getUserRole = wrapWithCors(async (data, context) => {
  console.log('getUserRole called with:', {
    data,
    auth: context.auth ? {
      uid: context.auth.uid,
      email: context.auth.token.email
    } : 'No auth'
  });

  if (!context.auth) {
    console.error('Authentication failed - No auth context');
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { email } = data;
  if (!email) {
    console.error('Email missing in request data');
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email is required'
    );
  }

  try {
    console.log('Attempting to fetch user document for email:', email);
    
    const userDoc = await admin.firestore()
      .collection("users")
      .doc(email)
      .get();

    console.log('Firestore response:', {
      exists: userDoc.exists,
      data: userDoc.exists ? userDoc.data() : null,
      path: userDoc.ref.path
    });

    if (!userDoc.exists) {
      console.error('User document not found for email:', email);
      throw new functions.https.HttpsError(
        'not-found',
        'User profile not found'
      );
    }

    const userData = userDoc.data();
    console.log('User data retrieved:', userData);

    const role = userData.role;
    console.log('Role from user data:', role);

    if (!role) {
      console.error('Role missing in user data for email:', email);
      throw new functions.https.HttpsError(
        'invalid-argument',
        'User role not set'
      );
    }

    if (!VALID_ROLES.includes(role)) {
      console.error('Invalid role found:', role);
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid user role. Must be one of: ${VALID_ROLES.join(', ')}`
      );
    }

    console.log('Successfully returning role:', { role });
    return { role };
  } catch (error) {
    console.error('Error in getUserRole:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      details: error.details,
      email
    });

    // If it's already a functions.https.HttpsError, rethrow it
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    // Otherwise wrap it in a proper HttpsError
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get user role: ' + error.message
    );
  }
});

exports.getAllProducts = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated",
    );
  }

  try {
    const productsSnapshot = await admin.firestore().collection("products").get();
    const products = [];
    productsSnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return { products };
  } catch (error) {
    console.error("Error getting products:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get products",
    );
  }
});

exports.getAllUsers = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated'
    );
  }

  try {
    const usersSnapshot = await admin.firestore()
      .collection("users")
      .get();

    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
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

exports.getAllComplaints = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated'
    );
  }

  try {
    const complaintsSnapshot = await admin.firestore()
      .collection("complaints")
      .get();

    const complaints = [];
    complaintsSnapshot.forEach(doc => {
      complaints.push({ id: doc.id, ...doc.data() });
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

exports.submitMockOrder = wrapWithCors(async (data, context) => {
  try {
    console.log('Function called with context:', {
      auth: context.auth ? {
        uid: context.auth.uid,
        email: context.auth.token.email
      } : 'No auth',
      raw: context.rawRequest ? {
        headers: context.rawRequest.headers,
        method: context.rawRequest.method
      } : 'No raw request'
    });

    // Verify authentication
    if (!context.auth) {
      console.error('Authentication failed - No auth context');
      throw new functions.https.HttpsError(
        'unauthenticated',
        "You must be logged in to complete this purchase"
      );
    }

    const { items, total, email, userId, timestamp } = data;
    console.log('Processing order for user:', {
      uid: context.auth.uid,
      email: context.auth.token.email,
      orderData: { items: items.length, total, email, userId }
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        "Invalid or empty cart items"
      );
    }

    // Create order document
    const orderRef = admin.firestore().collection("orders").doc();
    await orderRef.set({
      items,
      total,
      email,
      userId,
      timestamp,
      status: "completed",
      paymentStatus: "paid",
    });

    // Update product inventory
    const batch = admin.firestore().batch();

    for (const item of items) {
      const productRef = admin.firestore().collection("products").doc(item.id);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          `Product ${item.id} not found`
        );
      }

      const currentStock = productDoc.data().stock;
      const newStock = currentStock - item.quantity;

      if (newStock < 0) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Insufficient stock for ${item.name}`
        );
      }

      batch.update(productRef, { stock: newStock });
    }

    // Commit all updates
    await batch.commit();

    console.log('Order processed successfully:', {
      orderId: orderRef.id,
      userId: context.auth.uid
    });

    return {
      success: true,
      orderId: orderRef.id,
    };
  } catch (error) {
    console.error("Error processing order:", {
      error: error.message,
      stack: error.stack,
      context: context.auth ? {
        uid: context.auth.uid,
        email: context.auth.token.email
      } : 'No auth'
    });
    throw new functions.https.HttpsError(
      error.code || 'internal',
      error.message || "An error occurred while processing your order"
    );
  }
});

exports.createUserDocument = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated",
    );
  }

  const { email, role } = data;
  if (!email || !role) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email and role are required",
    );
  }

  try {
    const userRef = admin.firestore().collection("users").doc(context.auth.uid);
    await userRef.set({
      email,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      userId: context.auth.uid,
    };
  } catch (error) {
    console.error("Error creating user document:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create user document",
    );
  }
});

exports.getProduct = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated",
    );
  }

  const { productId } = data;
  if (!productId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Product ID is required",
    );
  }

  try {
    const productDoc = await admin.firestore()
      .collection("products")
      .doc(productId)
      .get();

    if (!productDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Product not found",
      );
    }

    return {
      id: productDoc.id,
      ...productDoc.data(),
    };
  } catch (error) {
    console.error("Error getting product:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get product",
    );
  }
});

exports.getSellerProducts = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated",
    );
  }

  try {
    const { email } = data;
    if (!email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Seller email is required",
      );
    }

    const productsSnapshot = await admin.firestore()
      .collection("products")
      .where("email", "==", email)
      .get();

    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { products };
  } catch (error) {
    console.error("Error getting seller products:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get seller products",
    );
  }
});

exports.addProduct = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const { name, price, description, image, category, email, dateAdded, stock } = data;
    
    if (!name || !price || !description || !image || !category || !email) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'All fields are required'
      );
    }

    const productRef = admin.firestore().collection('products').doc();
    await productRef.set({
      name,
      price,
      description,
      image,
      category,
      email,
      dateAdded,
      stock
    });

    return {
      success: true,
      productId: productRef.id
    };
  } catch (error) {
    console.error('Error adding product:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to add product'
    );
  }
});

exports.updateProductStock = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const { productId, stock } = data;
    
    if (!productId || stock === undefined) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Product ID and stock are required'
      );
    }

    const productRef = admin.firestore().collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Product not found'
      );
    }

    // Verify the user owns this product
    const productData = productDoc.data();
    if (productData.email !== context.auth.token.email) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You can only update your own products'
      );
    }

    await productRef.update({ stock });
    return { success: true };
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to update product stock'
    );
  }
});

exports.deleteProduct = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const { productId } = data;
    
    if (!productId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Product ID is required'
      );
    }

    const productRef = admin.firestore().collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Product not found'
      );
    }

    // Verify the user owns this product
    const productData = productDoc.data();
    if (productData.email !== context.auth.token.email) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You can only delete your own products'
      );
    }

    await productRef.delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to delete product'
    );
  }
});

exports.isEmailBanned = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated'
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
    const userDoc = await admin.firestore()
      .collection("users")
      .doc(email)
      .get();

    if (!userDoc.exists) {
      return { isBanned: false };
    }

    const userData = userDoc.data();
    return { isBanned: userData.isBanned || false };
  } catch (error) {
    console.error('Error checking email ban status:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to check email ban status'
    );
  }
});

exports.registerUserProfile = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated",
    );
  }

  const { uid, firstName, lastName, role, email } = data;
  if (!uid || !firstName || !lastName || !role || !email) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "All fields are required",
    );
  }

  try {
    await admin.firestore()
      .collection("users")
      .doc(email)
      .set({
        uid,
        firstName,
        lastName,
        role,
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isBanned: false,
      });

    return { success: true };
  } catch (error) {
    console.error("Error registering user profile:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to register user profile",
    );
  }
});

exports.submitComplaint = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated",
    );
  }

  const { name, email, message } = data;
  if (!name || !email || !message) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "All fields are required",
    );
  }

  try {
    await admin.firestore()
      .collection("complaints")
      .add({
        name,
        email,
        message,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "pending",
      });

    return { success: true };
  } catch (error) {
    console.error("Error submitting complaint:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to submit complaint",
    );
  }
});

exports.banUser = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated",
    );
  }

  const { userId, email } = data;
  if (!userId || !email) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "User ID and email are required",
    );
  }

  try {
    await admin.firestore()
      .collection("users")
      .doc(email)
      .update({
        isBanned: true,
        bannedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error) {
    console.error("Error banning user:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to ban user",
    );
  }
});

exports.makeAdmin = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated",
    );
  }

  const { userId } = data;
  if (!userId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "User ID is required",
    );
  }

  try {
    const userDoc = await admin.firestore()
      .collection("users")
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "User not found",
      );
    }

    await userDoc.ref.update({
      role: "admin",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error making user admin:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to make user admin",
    );
  }
});

exports.getAllUsersv2 = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated",
    );
  }

  try {
    const usersSnapshot = await admin.firestore()
      .collection("users")
      .get();

    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { users };
  } catch (error) {
    console.error("Error getting users:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get users",
    );
  }
});

exports.getAllComplaintsv2 = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated",
    );
  }

  try {
    const complaintsSnapshot = await admin.firestore()
      .collection("complaints")
      .orderBy("createdAt", "desc")
      .get();

    const complaints = [];
    complaintsSnapshot.forEach(doc => {
      complaints.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { complaints };
  } catch (error) {
    console.error("Error getting complaints:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get complaints",
    );
  }
});

exports.processCheckout = wrapWithCors(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be authenticated",
    );
  }

  const { items, total, email, userId } = data;
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid or empty cart items",
    );
  }

  try {
    // Create order document
    const orderRef = admin.firestore().collection("orders").doc();
    await orderRef.set({
      items,
      total,
      email,
      userId,
      status: "completed",
      paymentStatus: "paid",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update product inventory
    const batch = admin.firestore().batch();

    for (const item of items) {
      const productRef = admin.firestore().collection("products").doc(item.id);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          `Product ${item.id} not found`,
        );
      }

      const currentStock = productDoc.data().stock;
      const newStock = currentStock - item.quantity;

      if (newStock < 0) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          `Insufficient stock for ${item.name}`,
        );
      }

      batch.update(productRef, { stock: newStock });
    }

    // Commit all updates
    await batch.commit();

    return {
      success: true,
      orderId: orderRef.id,
    };
  } catch (error) {
    console.error("Error processing checkout:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to process checkout",
    );
  }
}); 