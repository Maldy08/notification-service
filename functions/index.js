/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


const { setGlobalOptions } = require("firebase-functions/v2");
const { onDocumentUpdated,onDocumentCreated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
setGlobalOptions({maxInstances:10});

const {initializeApp} = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore(); 

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.sendpushnotification = onDocumentUpdated("promociones/{id}", (event) => {
//   const newValues = event.data.after.data();
//   const prevValues = event.data.before.data();
//   logger.log(prevValues);
//   logger.log(newValues);
// });

exports.oncreateproducto = onDocumentCreated("productos/{id}", async (event) => {
  const snapshot = event.data;
  const data = snapshot.data();
  const idnegocio = data.id_negocio;
  const users = db.collection("users");
  const q1 = users.where("email","==","camv29@gmail.com");
  const querySnapshot = await q1.get();
  if(querySnapshot.size) {
    querySnapshot.forEach( (doc) => {
      doc.data().favorites_negocios.forEach( (f) => {
        
        if(idnegocio == f.id_negocio ){
           logger.log(doc.data())

           //mandar notificacionpush
        }
        else{
          logger.log("nada")
        }
      });
    });

  }
 // logger.log(querySnapshot.size);
  // db.collection("users").get()
  //   .then( (snapshot) => {
  //     snapshot.forEach( (doc) => {
  //       logger.log(doc.data().email);
  //     })
  //   })
  
});

// exports.sendPushNotification = onDocumentUpdated("promociones/{id}", (event) => {
//     const newValues = event.data.after.data();
//     const prevValues = event.data.before.data();
// });
