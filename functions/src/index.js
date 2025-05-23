const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.submitMockOrder = onCall(async (data, context) => {
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
      throw new Error("You must be logged in to complete this purchase");
    }

    const { items, total, email, userId, timestamp } = data;
    console.log('Processing order for user:', {
      uid: context.auth.uid,
      email: context.auth.token.email,
      orderData: { items: items.length, total, email, userId }
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Invalid or empty cart items");
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
        throw new Error(`Product ${item.id} not found`);
      }

      const currentStock = productDoc.data().stock;
      const newStock = currentStock - item.quantity;

      if (newStock < 0) {
        throw new Error(`Insufficient stock for ${item.name}`);
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
    throw new Error(error.message || "An error occurred while processing your order");
  }
}); 