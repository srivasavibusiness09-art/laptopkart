importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCs7_6PyShfGAKWM0G1SwQ1eYJDdSggAs4",
  authDomain: "srivasavibusiness-website.firebaseapp.com",
  projectId: "srivasavibusiness-website",
  storageBucket: "srivasavibusiness-website.firebasestorage.app",
  messagingSenderId: "826760515321",
  appId: "1:826760515321:web:5b2ce018cca9cfb4d81c28"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || "Laptopkart Alert";
  const notificationOptions = {
    body: payload.notification.body || "You have a new update.",
    icon: '/logo.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
