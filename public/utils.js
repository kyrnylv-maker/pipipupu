// Utility functions

// Date and Time formatting
export function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Только что (< 1 минуты)
    if (diff < 60000) {
        return 'только что';
    }
    
    // Минуты назад (< 1 часа)
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} ${pluralize(minutes, 'минуту', 'минуты', 'минут')} назад`;
    }
    
    // Сегодня
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Вчера
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'вчера';
    }
    
    // Эта неделя
    if (diff < 604800000) {
        return date.toLocaleDateString('ru', { weekday: 'short' });
    }
    
    // Этот год
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
    }
    
    // Другой год
    return date.toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatFullDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Pluralization helper
export function pluralize(count, one, few, many) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    
    if (mod10 === 1 && mod100 !== 11) {
        return one;
    }
    
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return few;
    }
    
    return many;
}

// File size formatting
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Get initials from name
export function getInitials(name) {
    if (!name) return '?';
    
    const cleaned = name.trim();
    const parts = cleaned.split(/\s+/);
    
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    if (cleaned.length >= 2) {
        return cleaned.substring(0, 2).toUpperCase();
    }
    
    return cleaned.toUpperCase();
}

// HTML escaping
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// URL detection and linkify
export function linkify(text) {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlPattern, '<a href="$1" target="_blank" class="text-tg-primary hover:underline">$1</a>');
}

// Mention detection
export function mentionify(text) {
    const mentionPattern = /@(\w+)/g;
    return text.replace(mentionPattern, '<span class="text-tg-primary cursor-pointer hover:underline">@$1</span>');
}

// Format message text with links and mentions
export function formatMessageText(text) {
    let formatted = escapeHtml(text);
    formatted = linkify(formatted);
    formatted = mentionify(formatted);
    return formatted;
}

// Generate random ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Storage helpers
export const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Check if element is in viewport
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Scroll to element smoothly
export function scrollToElement(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Copy to clipboard
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

// Download file
export function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Image compression
export async function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    }));
                }, 'image/jpeg', quality);
            };
            
            img.onerror = reject;
            img.src = e.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Validate file type
export function isImageFile(file) {
    return file && file.type.startsWith('image/');
}

export function isVideoFile(file) {
    return file && file.type.startsWith('video/');
}

export function isAudioFile(file) {
    return file && file.type.startsWith('audio/');
}

// Get file extension
export function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

// Validate email
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate username (Telegram style)
export function isValidUsername(username) {
    // Username must be 5-32 characters, can contain a-z, 0-9 and underscores
    const re = /^[a-zA-Z0-9_]{5,32}$/;
    return re.test(username);
}

// Generate random color for avatar
export function getRandomColor(seed) {
    const colors = [
        '#e17076', '#7f8c8d', '#a695e7', '#ffb347',
        '#ffa07a', '#87ceeb', '#98d8c8', '#b39ddb',
        '#f06292', '#aed581', '#ffd54f', '#4dd0e1'
    ];
    
    if (seed) {
        const hash = seed.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    }
    
    return colors[Math.floor(Math.random() * colors.length)];
}

// Parse mentions from text
export function parseMentions(text) {
    const mentionPattern = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionPattern.exec(text)) !== null) {
        mentions.push(match[1]);
    }
    
    return mentions;
}

// Check if user is online (last seen within 5 minutes)
export function isUserOnline(lastSeen) {
    if (!lastSeen) return false;
    const diff = Date.now() - new Date(lastSeen).getTime();
    return diff < 300000; // 5 minutes
}

// Format last seen
export function formatLastSeen(lastSeen) {
    if (!lastSeen) return 'давно';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    
    return formatTime(lastSeen);
}

// Notification helpers
export async function requestNotificationPermission() {
    if ('Notification' in window) {
        return await Notification.requestPermission();
    }
    return 'denied';
}

export function showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        return new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options
        });
    }
}

// Service Worker registration (for PWA)
export async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    }
}

// Detect mobile device
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Get device type
export function getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
}

// Prevent XSS
export function sanitizeHtml(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}
