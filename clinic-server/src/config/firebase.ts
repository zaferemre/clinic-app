import admin from "firebase-admin";

// Prevent re-initialization
if (!admin.apps.length) {
  if (process.env.NODE_ENV === "production") {
    // Use Railway env vars in production
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  } else {
    // Use local firebase.json in development
    const serviceAccount = require("../../firebase.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

export { admin };
