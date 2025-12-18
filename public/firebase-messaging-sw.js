importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// This is required for background notifications.
firebase.initializeApp({
    apiKey: "AIzaSyC9V8T84LsSG5kN9qmQ0rkSXpOFsj0WPJg", // Taking from user's env for consistency
    authDomain: "expense-203f7.firebaseapp.com",
    projectId: "expense-203f7",
    storageBucket: "expense-203f7.firebasestorage.app",
    messagingSenderId: "962679780320",
    appId: "1:962679780320:web:c80e23fb7ae1b197827185"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
