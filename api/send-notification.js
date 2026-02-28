const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    serviceAccount = require('../serviceAccountKey.json');
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const app = express();
app.use(cors());
app.use(express.json());

// Main API endpoint to send a notification
app.post('/api/send-notification', async (req, res) => {
    const { title, body } = req.body;

    if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
    }

    const message = {
        topic: 'all', // Send to everyone tracking "all"
        notification: {
            title,
            body,
        },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        res.status(200).json({ success: true, messageId: response });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send notification', details: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`FCM API Server is running on http://localhost:${PORT}`);
});
