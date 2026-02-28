import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

let serviceAccount;
let initError = null;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const rawData = fs.readFileSync(path.join(__dirname, '../serviceAccountKey.json'), 'utf8');
        serviceAccount = JSON.parse(rawData);
    }

    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
} catch (error) {
    console.error("Firebase Initialization Error:", error);
    initError = error.message;
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

    // Check if the initialization actually succeeded
    if (initError || !admin.apps.length) {
        return res.status(500).json({
            error: 'Backend Configuration Error',
            details: `Firebase Admin SDK failed to initialize. Error: ${initError || 'Unknown formatting issue in Environment Variable JSON.'}`
        });
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

export default app;
