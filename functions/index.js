const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({origin: true}));

// GET all products
app.get("/products", async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    res.json(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// GET single product by ID
app.get("/products/:id", async (req, res) => {
  try {
    const doc = await db.collection("products").doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).send("Product not found");
    } else {
      res.json({id: doc.id, ...doc.data()});
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

exports.api = functions.https.onRequest(app);
