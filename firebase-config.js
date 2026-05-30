// TODO: Replace with your Firebase config from Firebase Console
// Steps to get your config:
// 1. Go to https://firebase.google.com
// 2. Create a new project
// 3. Go to Project Settings > Your apps > Web
// 4. Copy your firebaseConfig
// 5. Replace the config below

const firebaseConfig = {
  apiKey: "AIzaSyD9fC1hha13zCWm7zkCV3HPQAnZ4EF_x3c",
  authDomain: "hop-on-val-6fcf7.firebaseapp.com",
  databaseURL: "https://hop-on-val-6fcf7-default-rtdb.firebaseio.com",
  projectId: "hop-on-val-6fcf7",
  storageBucket: "hop-on-val-6fcf7.firebasestorage.app",
  messagingSenderId: "716426590301",
  appId: "1:716426590301:web:b73a72a54944bfe457f5b4",
  measurementId: "G-7K95WBH6S4"
};

// Initialize Firebase when it's ready
function initializeFirebaseConfig() {
  if (typeof firebase === 'undefined') {
    console.log('⏳ Waiting for Firebase SDK to load...');
    setTimeout(initializeFirebaseConfig, 100);
    return;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    window.database = database; // Make it globally accessible
    console.log('✅ Firebase initialized successfully');

    // Tell script.js Firebase is ready — avoids race condition
    if (typeof initializeFirebase === 'function') {
      initializeFirebase();
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
}

initializeFirebaseConfig();