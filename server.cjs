// Simple Express server for Railway deployment (CommonJS version)
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from root directory
app.use(express.static(__dirname, {
    index: 'index.html',
    extensions: ['html']
}));

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Telegram Web Clone is running' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Telegram Web Clone running on port ${PORT}`);
    console.log(`🌐 Open: http://localhost:${PORT}`);
});
