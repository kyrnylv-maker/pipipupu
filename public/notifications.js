// Notification Manager

class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.sounds = {
            message: this.createSound('message'),
            sent: this.createSound('sent'),
            call: this.createSound('call')
        };
        this.enabled = true;
    }

    async init() {
        if ('Notification' in window) {
            this.permission = await Notification.requestPermission();
            return this.permission === 'granted';
        }
        return false;
    }

    createSound(type) {
        // Create audio elements for different notification sounds
        // In a real app, you would load actual sound files
        const audio = new Audio();
        audio.volume = 0.5;
        
        // Placeholder - in production, use actual sound files
        switch (type) {
            case 'message':
                // audio.src = '/sounds/message.mp3';
                break;
            case 'sent':
                // audio.src = '/sounds/sent.mp3';
                break;
            case 'call':
                // audio.src = '/sounds/call.mp3';
                break;
        }
        
        return audio;
    }

    playSound(type) {
        if (!this.enabled) return;
        
        const sound = this.sounds[type];
        if (sound && sound.src) {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.error('Error playing sound:', error);
            });
        }
    }

    show(title, options = {}) {
        if (!this.enabled || this.permission !== 'granted') {
            return null;
        }

        // Don't show notification if window is focused
        if (document.hasFocus()) {
            return null;
        }

        const notification = new Notification(title, {
            icon: options.icon || '/favicon.ico',
            badge: options.badge || '/favicon.ico',
            body: options.body || '',
            tag: options.tag || 'telegram-notification',
            requireInteraction: options.requireInteraction || false,
            silent: options.silent || false,
            data: options.data || {},
            ...options
        });

        // Auto close after 5 seconds
        if (!options.requireInteraction) {
            setTimeout(() => notification.close(), 5000);
        }

        // Handle clicks
        notification.onclick = () => {
            window.focus();
            if (options.onClick) {
                options.onClick(options.data);
            }
            notification.close();
        };

        return notification;
    }

    showMessageNotification(message, chat) {
        this.playSound('message');
        
        return this.show(`${message.senderName || chat.name}`, {
            body: message.text || 'Медиа',
            icon: chat.avatar || this.getDefaultAvatar(chat.name),
            tag: `chat-${chat.id}`,
            data: { chatId: chat.id, messageId: message.id },
            onClick: (data) => {
                // Navigate to chat
                window.dispatchEvent(new CustomEvent('openChat', { 
                    detail: { chatId: data.chatId } 
                }));
            }
        });
    }

    showCallNotification(caller, callType = 'audio') {
        this.playSound('call');
        
        return this.show(`${caller.name}`, {
            body: callType === 'video' ? 'Видеозвонок...' : 'Голосовой звонок...',
            icon: caller.avatar || this.getDefaultAvatar(caller.name),
            tag: `call-${caller.id}`,
            requireInteraction: true,
            data: { userId: caller.id, callType },
            onClick: (data) => {
                // Answer call
                window.dispatchEvent(new CustomEvent('answerCall', { 
                    detail: data 
                }));
            }
        });
    }

    showTypingNotification(chat) {
        // Optional: show typing notification in browser
        // Usually we just show this in the UI
    }

    getDefaultAvatar(name) {
        // Generate a data URL for default avatar
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = this.getColorForName(name);
        ctx.fillRect(0, 0, 64, 64);
        
        // Initials
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getInitials(name), 32, 32);
        
        return canvas.toDataURL();
    }

    getColorForName(name) {
        const colors = [
            '#e17076', '#7f8c8d', '#a695e7', '#ffb347',
            '#ffa07a', '#87ceeb', '#98d8c8', '#b39ddb',
            '#f06292', '#aed581', '#ffd54f', '#4dd0e1'
        ];
        
        const hash = name.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        return colors[Math.abs(hash) % colors.length];
    }

    getInitials(name) {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Vibration API (for mobile)
    vibrate(pattern = [200]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // Badge API (for PWA)
    setBadge(count) {
        if ('setAppBadge' in navigator) {
            if (count > 0) {
                navigator.setAppBadge(count);
            } else {
                navigator.clearAppBadge();
            }
        }
    }

    clearBadge() {
        this.setBadge(0);
    }
}

// Desktop notification with custom styling
class DesktopNotification {
    constructor(title, options = {}) {
        this.title = title;
        this.options = options;
        this.element = null;
        this.timeout = null;
    }

    show() {
        // Create notification element
        this.element = document.createElement('div');
        this.element.className = 'fixed top-4 right-4 bg-white dark:bg-tg-dark-secondary rounded-lg shadow-2xl p-4 max-w-sm z-50 slide-in-right';
        
        this.element.innerHTML = `
            <div class="flex items-start gap-3">
                ${this.options.icon ? `
                    <img src="${this.options.icon}" alt="" class="w-10 h-10 rounded-full flex-shrink-0">
                ` : ''}
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-1">${this.title}</h4>
                    ${this.options.body ? `
                        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">${this.options.body}</p>
                    ` : ''}
                </div>
                <button class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <span class="material-icons text-sm">close</span>
                </button>
            </div>
        `;

        // Add click handler
        this.element.addEventListener('click', (e) => {
            if (e.target.closest('button')) {
                this.close();
            } else if (this.options.onClick) {
                this.options.onClick(this.options.data);
                this.close();
            }
        });

        // Add to DOM
        document.body.appendChild(this.element);

        // Auto close
        if (!this.options.requireInteraction) {
            this.timeout = setTimeout(() => this.close(), 5000);
        }

        return this;
    }

    close() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        
        if (this.element) {
            this.element.classList.add('opacity-0');
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
            }, 300);
        }
    }
}

// Export singleton instance
const notificationManager = new NotificationManager();
export default notificationManager;
export { NotificationManager, DesktopNotification };
