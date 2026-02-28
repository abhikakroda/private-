import app from './api/send-notification.js';
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Local dev server running on http://localhost:${PORT}`);
});
