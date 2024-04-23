const { setGlobalOptions } = require("firebase-functions/v2");
const { onDocumentUpdated,onDocumentCreated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
setGlobalOptions({maxInstances:10});

const {initializeApp} = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { messaging } = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");

initializeApp();
const db = getFirestore(); 
const targetUrl = 'https://enofferta-app.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=DjAAEWG_vPTb2guXfOtLX5EFL849WOj8f60aUF3JEz0AAAGPCVbO2w&apiKey=AIzaSyBsbD_CrQIiAalLlvDlO2KDOuptxQ7iUG0&lang=es-419'

// const token = "c_6cINyB2kI9hw8VeZi5jE:APA91bHgC3UVaVmqk9jVOF8fAZwDN5XwEaPUMeXVzyD2LG72zZtD2red23p4HWGDp0rqExpQB6eLufCCHlM9A3k-PSivyerZvB2H936O_ErCY794UxBQTplBjvqoZVHA1T7INlmwd47G";
//const token ='fLS6n6pdRZOGhhBe4aQeHY:APA91bHjW78RvDZn86Q_zp3zwsJ8wDxlhXi_lUTeFiQlE2MU9GE8hFUEqBcCvdUdDzXeanAjgU89v9Xu3QNaCwLgRIyPywDy2is2j5W9-Wm8PwEben3i_OrpHxwS7zwy57AyKZOGrclN';

exports.onresetpassword = onRequest( async (req, res) => {

    const newUrl = new URL(targetUrl);
    const oobCode = req.query.oobCode;
    newUrl.searchParams.set("oobCode", oobCode);

  }
);


exports.onupdateproduct = onDocumentUpdated("productos/{id}", async ( event ) => {
  const newValue = event.data.after.data();
  const idnegocio = newValue.id_negocio;
  const idproducto = newValue.id;
  const descripcion = newValue.descripcion;
  const precio = newValue.precio;
  const nombreNegocio = newValue.nombreNegocio;
  const imageUrl = newValue.photoUrl;
  const users = db.collection("users");
  const tokens = db.collection("FCMtokens");
  const queryUsers = await users.get();
  const queryTokens = await tokens.get();

  if(queryUsers.size) {
    queryUsers.forEach( (doc) => {
      doc.data().favorites_negocios.forEach( (f) => {
        if(idnegocio == f.idnegocio ){
          queryTokens.forEach( (token ) => {
            if(token.data().email == doc.data().email) {
              const payload = 
              {
                notification: {
                  title: "Actualización de Producto",
                  body: `${nombreNegocio.toUpperCase()} ha actualizado un producto: ${descripcion.toUpperCase()} `,
                  // sound: "default",
                },

                android: {
                  notification: {
                    imageUrl: imageUrl
                  }
                },

                apns: {
                  payload: {
                    aps: {
                      'content_available': true,
                      'mutable_content': true,
                    }
                  }
                },

                data:{
                    idproducto: idproducto
                },
                token: token.data().token,
  
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
       }
      });
    });
  }
});

exports.oncreateproduct = onDocumentCreated("productos/{id}", async (event) => {
  const snapshot = event.data;
  const data = snapshot.data();
  const idnegocio = data.id_negocio;
  const idproducto = data.id;
  const nombreNegocio = data.nombreNegocio;
  const descripcion = data.descripcion;
  const imageUrl = data.photoUrl;
  const users = db.collection("users");
  const tokens = db.collection("FCMtokens");
  const queryTokens = await tokens.get();
  const querySnapshot = await users.get();
  if(querySnapshot.size) {
    querySnapshot.forEach( (doc) => {
      doc.data().favorites_negocios.forEach( (f) => {
        if(idnegocio == f.idnegocio ){
           //mandar notificacionpush
           queryTokens.forEach( (token) => {
            if( token.data().email == doc.data().email) {

              const payload = {
                notification: {
                  title: "Nuevo Producto",
                  body: `${nombreNegocio.toUpperCase()} ha dado de alta un nuevo producto: ${descripcion.toUpperCase()} `,
                  // sound: "default",
                },
                android: {
                  notification: {
                    imageUrl: imageUrl
                  }
                },

                apns: {
                  payload: {
                    aps: {
                      'content_available': true,
                      'mutable_content': true,
                    }
                  }
                },
                data:{
                  idproducto: idproducto
                },
                token: token.data().token,
              
              };
              messaging().send(payload).then((response) => {
                // Response is a message ID string.
                logger.log('Successfully sent message:', response);
              })
              .catch((error) => {
                logger.log('Error sending message:', error);
              });
            }
           })
        }
      });
    });
  }
});

exports.onucreatepromocion = onDocumentCreated("promociones/{id}", async (event) => { 
  const snapshot = event.data;
  const data = snapshot.data();
  const idnegocio = data.id_negocio;
  const descripcion = data.descripcion;
  const imageUrl = data.photoUrl;
  const idpromocion = data.id;
  const users = db.collection("users");
  const negocio = db.collection("negocios").where("id", "==", idnegocio);
  const tokens = db.collection("FCMtokens");
  const queryTokens = await tokens.get();
  const querySnapshotNegocio = await negocio.get();
  let nombreNegocio = "";
  if(querySnapshotNegocio.size) {
    querySnapshotNegocio.forEach( (f) => {
      nombreNegocio = f.data().nombre_empresa;

    })    
  }
  const querySnapshot = await users.get();
  if(querySnapshot.size) {
    querySnapshot.forEach( (doc) => {
      doc.data().favorites_negocios.forEach( (f) => {
        if(idnegocio == f.idnegocio ){

          queryTokens.forEach( (token) => {
            if( token.data().email == doc.data().email) { 
              const payload = {
                notification: {
                  title: "Nueva Promocion",
                  body: `${nombreNegocio.toUpperCase()} ha dado de alta una promocion: ${descripcion.toUpperCase()} `,
                  // sound: "default",
                },

                // android: {
                //   notification: {
                //     imageUrl: imageUrl != "" ? imageUrl : ""
                //   }
                // },

                apns: {
                  payload: {
                    aps: {
                      'content_available': true,
                      'mutable_content': true,
                    }
                  }
                },
                data:{
                  idpromocion: idpromocion
                },
                token: token.data().token,
              
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
        }
      });
    });
  }
});

exports.onupdatepromocion = onDocumentUpdated("promociones/{id}", async (event) => {
  const newValue = event.data.after.data();
  const idnegocio = newValue.id_negocio;
  const descripcion = newValue.descripcion;
  const idpromocion = newValue.id;
  const imageUrl = newValue.photoUrl;
  let nombreNegocio = '';
  const users = db.collection("users");
  const querySnapshot = await users.get();
  const negocio = db.collection("negocios").where("id", "==", idnegocio);
  const querySnapshotNegocio = await negocio.get();
  const tokens = db.collection("FCMtokens");
  const queryTokens = await tokens.get();

  if(querySnapshotNegocio.size) {
    querySnapshotNegocio.forEach( (f) => {
      nombreNegocio = f.data().nombre_empresa;

    });    
  }
  if(querySnapshot.size) {
    querySnapshot.forEach( (doc) => {
      doc.data().favorites_negocios.forEach( (f) => {
        if(idnegocio == f.idnegocio ) {
          queryTokens.forEach( ( token ) => {
            if(doc.data().email == token.data().email ) {
              const payload = {
                notification: {
                  title: "Actualización de Promoción",
                  body: `${nombreNegocio.toUpperCase()} ha actualizado una promoción: ${descripcion.toUpperCase()} `,
                  // sound: "default",
                },
                // android: {
                //   notification: {
                //     imageUrl: imageUrl
                //   }
                // },

                apns: {
                  payload: {
                    aps: {
                      'content_available': true,
                      'mutable_content': true,
                    }
                  }
                },
                data:{
                  idpromocion: idpromocion
                },
                token: token.data().token,
              
              };
              messaging().send(payload).then((response) => {
                // Response is a message ID string.
                logger.log('Successfully sent message:', response);
              })
              .catch((error) => {
                logger.log('Error sending message:', error);
              });
            }
          })


       }
      });
    });
  }
});

exports.oncreatecupon = onDocumentCreated("cupones/{id}", async (event) => {
  const snapshot = event.data;
  const data = snapshot.data();
  const idcupon = data.id;
  const idnegocio = data.id_negocio;
  const descripcion = data.descripcion;
  const imageUrl = data.photoUrl;

  const users = db.collection("users");
  const negocio = db.collection("negocios").where("id", "==", idnegocio);
  const querySnapshotNegocio = await negocio.get();
  const tokens = db.collection("FCMtokens");
  const queryTokens = await tokens.get();

  let nombreNegocio = "";
  if(querySnapshotNegocio.size) {
    querySnapshotNegocio.forEach( (f) => {
      nombreNegocio = f.data().nombre_empresa;

    })    
  }
  const querySnapshot = await users.get();
  if(querySnapshot.size) {
    querySnapshot.forEach( (doc) => {
      doc.data().favorites_negocios.forEach( (f) => {
        if(idnegocio == f.idnegocio ){
          queryTokens.forEach( (token) => {
            if(doc.data().email == token.data().email ) { 

              const payload = {
                notification: {
                  title: "Nuevo Cupon",
                  body: `${nombreNegocio.toUpperCase()} ha dado de alta un cupon: ${descripcion.toUpperCase()} `,
                  // sound: "default",
                },
                // android: {
                //   notification: {
                //     imageUrl: imageUrl
                //   }
                // },

                apns: {
                  payload: {
                    aps: {
                      'content_available': true,
                      'mutable_content': true,
                    }
                  }
                },
                data:{
                  idcupon: idcupon
                },
                token: token.data().token
              
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

        }
      });
    });
  }
});

exports.onupdatecupon = onDocumentUpdated("cupones/{id}", async (event) => {
  const newValue = event.data.after.data();
  const idnegocio = newValue.id_negocio;
  const descripcion = newValue.descripcion;
  const idcupon = newValue.id;
  const imageUrl = newValue.photoUrl; 
  let nombreNegocio = '';
  const users = db.collection("users");
  const querySnapshot = await users.get();
  const negocio = db.collection("negocios").where("id", "==", idnegocio);
  const querySnapshotNegocio = await negocio.get();
  const tokens = db.collection("FCMtokens");
  const queryTokens = await tokens.get();

  if(querySnapshotNegocio.size) {
    querySnapshotNegocio.forEach( (f) => {
      nombreNegocio = f.data().nombre_empresa;

    });    
  }
  if(querySnapshot.size) {
    querySnapshot.forEach( (doc) => {
      doc.data().favorites_negocios.forEach( (f) => {
        if(idnegocio == f.idnegocio ) {
          queryTokens.forEach( (token) => {
            if(doc.data().email == token.data().email ) {  
              const payload = {
                notification: {
                  title: "Actualización de Cupon",
                  body: `${nombreNegocio.toUpperCase()} ha actualizado un cupon: ${descripcion.toUpperCase()} `,
                  // sound: "default",
                },
                // android: {
                //   notification: {
                //     imageUrl: imageUrl
                //   }
                // },

                apns: {
                  payload: {
                    aps: {
                      'content_available': true,
                      'mutable_content': true,
                    }
                  }
                },
                data:{
                  idcupon: idcupon
                },
                token: token.data().token,
              
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
       }
      });
    });
  }
});

// exports.sendPushNotification = onDocumentUpdated("promociones/{id}", (event) => {
//     const newValues = event.data.after.data();
//     const prevValues = event.data.before.data();
// });
