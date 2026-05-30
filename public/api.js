// API Module - handles all HTTP requests to backend
class API {
    constructor(baseURL, token = null) {
        this.baseURL = baseURL;
        this.token = token;
    }

    setToken(token) {
        this.token = token;
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Network error' }));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(username, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async register(username, password, displayName) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, displayName })
        });
    }

    async logout() {
        return this.request('/api/auth/logout', {
            method: 'POST'
        });
    }

    // User endpoints
    async getProfile() {
        return this.request('/api/users/profile');
    }

    async updateProfile(data) {
        return this.request('/api/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        return fetch(`${this.baseURL}/api/users/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        }).then(res => res.json());
    }

    async searchUsers(query) {
        return this.request(`/api/users/search?q=${encodeURIComponent(query)}`);
    }

    // Chat endpoints
    async getChats() {
        return this.request('/api/chats');
    }

    async getChat(chatId) {
        return this.request(`/api/chats/${chatId}`);
    }

    async createChat(userId) {
        return this.request('/api/chats', {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    }

    async deleteChat(chatId) {
        return this.request(`/api/chats/${chatId}`, {
            method: 'DELETE'
        });
    }

    // Message endpoints
    async getMessages(chatId, limit = 50, offset = 0) {
        return this.request(`/api/chats/${chatId}/messages?limit=${limit}&offset=${offset}`);
    }

    async sendMessage(chatId, text, attachments = []) {
        return this.request(`/api/chats/${chatId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ text, attachments })
        });
    }

    async deleteMessage(chatId, messageId) {
        return this.request(`/api/chats/${chatId}/messages/${messageId}`, {
            method: 'DELETE'
        });
    }

    async editMessage(chatId, messageId, text) {
        return this.request(`/api/chats/${chatId}/messages/${messageId}`, {
            method: 'PUT',
            body: JSON.stringify({ text })
        });
    }

    async markAsRead(chatId, messageId) {
        return this.request(`/api/chats/${chatId}/messages/${messageId}/read`, {
            method: 'POST'
        });
    }

    // Channel endpoints
    async getChannels() {
        return this.request('/api/channels');
    }

    async getChannel(channelId) {
        return this.request(`/api/channels/${channelId}`);
    }

    async createChannel(name, description, isPrivate = false) {
        return this.request('/api/channels', {
            method: 'POST',
            body: JSON.stringify({ name, description, isPrivate })
        });
    }

    async updateChannel(channelId, data) {
        return this.request(`/api/channels/${channelId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteChannel(channelId) {
        return this.request(`/api/channels/${channelId}`, {
            method: 'DELETE'
        });
    }

    async subscribeToChannel(channelId) {
        return this.request(`/api/channels/${channelId}/subscribe`, {
            method: 'POST'
        });
    }

    async unsubscribeFromChannel(channelId) {
        return this.request(`/api/channels/${channelId}/unsubscribe`, {
            method: 'POST'
        });
    }

    async getChannelMessages(channelId, limit = 50, offset = 0) {
        return this.request(`/api/channels/${channelId}/messages?limit=${limit}&offset=${offset}`);
    }

    async sendChannelMessage(channelId, text, attachments = []) {
        return this.request(`/api/channels/${channelId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ text, attachments })
        });
    }

    // File upload
    async uploadFile(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const progress = (e.loaded / e.total) * 100;
                    onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error('Upload failed'));
                }
            });

            xhr.addEventListener('error', () => reject(new Error('Upload failed')));

            xhr.open('POST', `${this.baseURL}/api/upload`);
            xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
            xhr.send(formData);
        });
    }

    // Reactions
    async addReaction(chatId, messageId, emoji) {
        return this.request(`/api/chats/${chatId}/messages/${messageId}/reactions`, {
            method: 'POST',
            body: JSON.stringify({ emoji })
        });
    }

    async removeReaction(chatId, messageId, emoji) {
        return this.request(`/api/chats/${chatId}/messages/${messageId}/reactions`, {
            method: 'DELETE',
            body: JSON.stringify({ emoji })
        });
    }

    // Contacts
    async getContacts() {
        return this.request('/api/contacts');
    }

    async addContact(userId) {
        return this.request('/api/contacts', {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    }

    async removeContact(userId) {
        return this.request(`/api/contacts/${userId}`, {
            method: 'DELETE'
        });
    }
}

export default API;
