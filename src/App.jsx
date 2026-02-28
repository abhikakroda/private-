import React, { useState } from 'react';
import './index.css';

function App() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [status, setStatus] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const sendNotification = async (e) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMessage('');

        try {
            const response = await fetch('/api/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, body }),
            });

            if (response.ok) {
                setStatus('success');
                setTitle('');
                setBody('');
            } else {
                const errorData = await response.json().catch(() => null);
                setStatus('error');
                setErrorMessage(errorData?.details || errorData?.error || 'Unknown server error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setErrorMessage(err.message || 'Network error');
        }

        setTimeout(() => {
            setStatus('');
            setErrorMessage('');
        }, 5000);
    };

    return (
        <div className="container">
            <div className="dashboard-card">
                <header>
                    <h1>Timetable FCM</h1>
                    <p>Send real-time alerts to all students.</p>
                </header>

                <form onSubmit={sendNotification}>
                    <div className="input-group">
                        <label htmlFor="title">Notification Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Class Rescheduled"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="body">Message Body</label>
                        <textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="e.g. Tomorrow's Maths class will be in Hall 4."
                            rows={4}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={(status === 'sending') ? 'sending' : ''}
                        disabled={status === 'sending'}
                    >
                        {status === 'sending' ? 'Sending...' : 'Send Push Notification'}
                    </button>
                </form>

                {status === 'success' && <div className="toast success">Notification sent successfully!</div>}
                {status === 'error' && <div className="toast error">{errorMessage || 'Failed to send. Check server logs.'}</div>}
            </div>
        </div>
    );
}

export default App;
