// TODO: Replace with your Firebase config from Firebase Console
// Steps to get your config:
// 1. Go to https://firebase.google.com
// 2. Create a new project
// 3. Go to Project Settings > Your apps > Web
// 4. Copy your firebaseConfig
// 5. Replace the config below

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);
