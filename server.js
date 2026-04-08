require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/submit', async (req, res) => {
    const { WEBHOOK_URL, WEBHOOK_USER, WEBHOOK_PASS } = process.env;

    if (!WEBHOOK_URL || !WEBHOOK_USER || !WEBHOOK_PASS) {
        console.error('Missing webhook environment variables');
        return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const basicAuth = Buffer.from(`${WEBHOOK_USER}:${WEBHOOK_PASS}`).toString('base64');

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${basicAuth}`
            },
            body: JSON.stringify(req.body)
        });

        res.status(response.ok ? 200 : 502).json({ ok: response.ok });
    } catch (err) {
        console.error('Webhook request failed:', err.message);
        res.status(502).json({ error: 'Failed to reach webhook' });
    }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
