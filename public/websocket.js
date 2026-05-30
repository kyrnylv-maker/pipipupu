// WebSocket Module - handles real-time communication
class WebSocketClient {
    constructor(url, token) {
        this.url = url;
        this.token = token;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.listeners = new Map();
        this.isConnected = false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                const wsUrl = this.token ? `${this.url}?token=${this.token}` : this.url;
                this.ws = new WebSocket(wsUrl);

                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.emit('connected');
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.emit('error', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.isConnected = false;
                    this.emit('disconnected');
                    this.attemptReconnect();
                };
            } catch (error) {
                console.error('Failed to create WebSocket connection:', error);
                reject(error);
            }
        });
    }

    handleMessage(data) {
        const { type, payload } = data;
        
        switch (type) {
            case 'message':
                this.emit('message', payload);
                break;
            case 'message_update':
                this.emit('message_update', payload);
                break;
            case 'message_delete':
                this.emit('message_delete', payload);
                break;
            case 'typing':
                this.emit('typing', payload);
                break;
            case 'user_online':
                this.emit('user_online', payload);
                break;
            case 'user_offline':
                this.emit('user_offline', payload);
                break;
            case 'reaction':
                this.emit('reaction', payload);
                break;
            case 'chat_update':
                this.emit('chat_update', payload);
                break;
            case 'call_offer':
                this.emit('call_offer', payload);
                break;
            case 'call_answer':
                this.emit('call_answer', payload);
                break;
            case 'call_ice_candidate':
                this.emit('call_ice_candidate', payload);
                break;
            case 'call_end':
                this.emit('call_end', payload);
                break;
            default:
                console.log('Unknown message type:', type);
        }
    }

    send(type, payload) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
            return true;
        }
        console.warn('WebSocket not connected');
        return false;
    }

    // Specific message types
    sendMessage(chatId, text, attachments = []) {
        return this.send('message', { chatId, text, attachments });
    }

    sendTyping(chatId, isTyping) {
        return this.send('typing', { chatId, isTyping });
    }

    sendReaction(chatId, messageId, emoji) {
        return this.send('reaction', { chatId, messageId, emoji });
    }

    markAsRead(chatId, messageId) {
        return this.send('read', { chatId, messageId });
    }

    // Call signaling
    sendCallOffer(userId, offer) {
        return this.send('call_offer', { userId, offer });
    }

    sendCallAnswer(userId, answer) {
        return this.send('call_answer', { userId, answer });
    }

    sendIceCandidate(userId, candidate) {
        return this.send('call_ice_candidate', { userId, candidate });
    }

    endCall(userId) {
        return this.send('call_end', { userId });
    }

    // Event listeners
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                this.connect().catch(error => {
                    console.error('Reconnection failed:', error);
                });
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
            this.emit('max_reconnect_attempts');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
    }

    isOpen() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

export default WebSocketClient;
