#!/bin/bash
# Simple static server starter

echo "🚀 Starting Telegram Web Clone..."

# Try different server options
if command -v python3 &> /dev/null; then
    echo "✅ Using Python server"
    python3 -m http.server ${PORT:-3000}
elif command -v node &> /dev/null; then
    echo "✅ Using Node server"
    if [ -f "server.cjs" ]; then
        node server.cjs
    else
        npx serve -p ${PORT:-3000}
    fi
else
    echo "❌ Neither Python nor Node found"
    exit 1
fi
