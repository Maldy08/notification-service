/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
setGlobalOptions({maxInstances:10});

const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.productos = onRequest(async(req, res) => {
    const result = await getFirestore()
      .collection("productos")
      .listDocuments()
      res.json({result: result.productos});
});

// exports.sendPushNotification = onDocumentUpdated("promociones/{id}", (event) => {
//     const newValues = event.data.after.data();
//     const prevValues = event.data.before.data();
// });
