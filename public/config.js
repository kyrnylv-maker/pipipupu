// Application Configuration

export const CONFIG = {
    // API Configuration
    API_URL: 'https://pipipupu-production.up.railway.app',
    WS_URL: 'wss://pipipupu-production.up.railway.app',
    
    // App Settings
    APP_NAME: 'Telegram Web Clone',
    APP_VERSION: '1.0.0',
    
    // Limits
    MAX_MESSAGE_LENGTH: 4096,
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50 MB
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10 MB
    MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50 MB
    MAX_ATTACHMENTS: 10,
    
    // Pagination
    MESSAGES_PER_PAGE: 50,
    CHATS_PER_PAGE: 30,
    
    // WebSocket
    WS_RECONNECT_ATTEMPTS: 5,
    WS_RECONNECT_DELAY: 3000,
    
    // Timeouts
    TYPING_TIMEOUT: 3000, // 3 seconds
    REQUEST_TIMEOUT: 30000, // 30 seconds
    
    // Image Compression
    IMAGE_MAX_WIDTH: 1920,
    IMAGE_MAX_HEIGHT: 1080,
    IMAGE_QUALITY: 0.8,
    
    // Themes
    THEMES: ['light', 'dark'],
    DEFAULT_THEME: 'light',
    
    // Folders
    FOLDERS: ['Все', 'Чаты', 'Каналы'],
    
    // Emoji Categories
    EMOJI_CATEGORIES: {
        'Смайлики': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
        'Жесты': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
        'Сердца': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
        'Символы': ['🔥', '✨', '💫', '⭐', '🌟', '💯', '🎉', '🎊', '🎈']
    },
    
    // Quick Reactions
    QUICK_REACTIONS: ['👍', '❤️', '😂', '😮', '😢', '🙏'],
    
    // Supported File Types
    SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
    SUPPORTED_AUDIO_TYPES: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    SUPPORTED_DOCUMENT_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed'
    ],
    
    // Colors
    COLORS: {
        primary: '#3390ec',
        secondary: '#5b9dd9',
        success: '#4caf50',
        danger: '#f44336',
        warning: '#ff9800',
        info: '#2196f3',
        light: '#f4f4f5',
        dark: '#212121',
        
        // Dark theme
        darkBg: '#212121',
        darkSecondary: '#181818',
        darkChat: '#0e0e0e',
        
        // Light theme
        lightBg: '#ffffff',
        lightSecondary: '#f4f4f5',
        
        // Avatar colors
        avatarColors: [
            '#e17076', '#7f8c8d', '#a695e7', '#ffb347',
            '#ffa07a', '#87ceeb', '#98d8c8', '#b39ddb',
            '#f06292', '#aed581', '#ffd54f', '#4dd0e1'
        ]
    },
    
    // Local Storage Keys
    STORAGE_KEYS: {
        token: 'token',
        user: 'user',
        theme: 'theme',
        chats: 'chats',
        settings: 'settings',
        drafts: 'drafts'
    },
    
    // Date Formats
    DATE_FORMATS: {
        time: { hour: '2-digit', minute: '2-digit' },
        date: { day: 'numeric', month: 'short' },
        fullDate: { day: 'numeric', month: 'long', year: 'numeric' },
        dateTime: { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
    },
    
    // Error Messages
    ERRORS: {
        NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
        AUTH_ERROR: 'Ошибка авторизации. Войдите снова.',
        FILE_TOO_LARGE: 'Файл слишком большой',
        INVALID_FILE_TYPE: 'Неподдерживаемый тип файла',
        MESSAGE_TOO_LONG: 'Сообщение слишком длинное',
        WEBSOCKET_ERROR: 'Ошибка подключения WebSocket',
        UNKNOWN_ERROR: 'Неизвестная ошибка'
    },
    
    // Success Messages
    SUCCESS: {
        PROFILE_UPDATED: 'Профиль обновлен',
        MESSAGE_SENT: 'Сообщение отправлено',
        FILE_UPLOADED: 'Файл загружен',
        CHANNEL_CREATED: 'Канал создан',
        CHAT_CREATED: 'Чат создан'
    },
    
    // Placeholder Messages
    PLACEHOLDERS: {
        SEARCH: 'Поиск',
        MESSAGE: 'Написать сообщение...',
        CHANNEL_NAME: 'Название канала',
        CHANNEL_DESCRIPTION: 'Описание канала',
        USERNAME: 'Username',
        PASSWORD: 'Пароль',
        DISPLAY_NAME: 'Имя',
        BIO: 'О себе'
    },
    
    // Animation Durations
    ANIMATIONS: {
        fast: 150,
        normal: 300,
        slow: 500
    },
    
    // Breakpoints (matching Tailwind)
    BREAKPOINTS: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536
    },
    
    // Feature Flags
    FEATURES: {
        VOICE_MESSAGES: false,
        STICKERS: false,
        GIF_SEARCH: false,
        EDIT_MESSAGES: true,
        DELETE_MESSAGES: true,
        FORWARD_MESSAGES: false,
        REPLY_MESSAGES: true,
        PINNED_MESSAGES: false,
        ARCHIVE_CHATS: false,
        NOTIFICATIONS: true,
        CALLS: true,
        VIDEO_CALLS: true,
        REACTIONS: true,
        TYPING_INDICATOR: true,
        READ_RECEIPTS: true,
        ONLINE_STATUS: true
    },
    
    // Call Settings
    CALL: {
        ICE_SERVERS: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ],
        VIDEO_CONSTRAINTS: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
        },
        AUDIO_CONSTRAINTS: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }
    }
};

// Export individual configurations for convenience
export const {
    API_URL,
    WS_URL,
    COLORS,
    STORAGE_KEYS,
    ERRORS,
    SUCCESS,
    FEATURES
} = CONFIG;

export default CONFIG;
