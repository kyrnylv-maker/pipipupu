// Simple Express server for Railway deployment (CommonJS version)
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));
app.use(express.static('.'));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Telegram Web Clone running on port ${PORT}`);
    console.log(`🌐 Open: http://localhost:${PORT}`);
});
