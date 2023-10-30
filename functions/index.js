const { setGlobalOptions } = require("firebase-functions/v2");
const { onDocumentUpdated,onDocumentCreated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
setGlobalOptions({maxInstances:10});

const {initializeApp} = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { messaging } = require("firebase-admin");

initializeApp();
const db = getFirestore(); 
const token = "c_6cINyB2kI9hw8VeZi5jE:APA91bHgC3UVaVmqk9jVOF8fAZwDN5XwEaPUMeXVzyD2LG72zZtD2red23p4HWGDp0rqExpQB6eLufCCHlM9A3k-PSivyerZvB2H936O_ErCY794UxBQTplBjvqoZVHA1T7INlmwd47G";

exports.onupdateproduct = onDocumentUpdated("productos/{id}", async ( event ) => {
  const newValue = event.data.after.data();
  const idnegocio = newValue.id_negocio;
  const descripcion = newValue.descripcion;
  const precio = newValue.precio;
  const nombreNegocio = newValue.nombreNegocio;
  const users = db.collection("users");
  const querySnapshot = await users.get();
  if(querySnapshot.size) {
    querySnapshot.forEach( (doc) => {
      doc.data().favorites_negocios.forEach( (f) => {
        if(idnegocio == f.idnegocio ){
          logger.log(doc.data());
          logger.log(data);
          //mandar notificacionpush
          const payload = {
           notification: {
             title: "Actualización de Producto",
             body: `${nombreNegocio} ha dado de alta un nuevo producto: ${descripcion} `,
             // sound: "default",
           },
           token: token
         
         };
         const options = {
           priority: "high",
           timeToLive: 60 * 60 * 24,
         };
         messaging().send(payload).then((response) => {
           // Response is a message ID string.
           logger.log('Successfully sent message:', response);
         })
         .catch((error) => {
           logger.log('Error sending message:', error);
         });
       }
      });
    });
  }
});

exports.oncreateproduct = onDocumentCreated("productos/{id}", async (event) => {
  const snapshot = event.data;
  const data = snapshot.data();
  const idnegocio = data.id_negocio;
  const nombreNegocio = data.nombreNegocio;
  const descripcion = data.descripcion;
  const users = db.collection("users");
  //const q1 = users.where("email","==","camv29@gmail.com");
  const querySnapshot = await users.get();
  if(querySnapshot.size) {
    querySnapshot.forEach( (doc) => {
      // logger.log(`Usuarios: ${doc.data()}`);
      doc.data().favorites_negocios.forEach( (f) => {
        
        if(idnegocio == f.idnegocio ){
           logger.log(doc.data());
           logger.log(data);
           //mandar notificacionpush
           const payload = {
            notification: {
              title: "Nuevo Producto",
              body: `${nombreNegocio} ha dado de alta un nuevo producto: ${descripcion} `,
              // sound: "default",
            },
            token: token
          
          };
          const options = {
            priority: "high",
            timeToLive: 60 * 60 * 24,
          };
          messaging().send(payload).then((response) => {
            // Response is a message ID string.
            logger.log('Successfully sent message:', response);
          })
          .catch((error) => {
            logger.log('Error sending message:', error);
          });
        }
      });
    });
  }
});

// exports.sendPushNotification = onDocumentUpdated("promociones/{id}", (event) => {
//     const newValues = event.data.after.data();
//     const prevValues = event.data.before.data();
// });
