// Mock data for testing and development

export const mockUser = {
    id: 'user-1',
    username: 'john_doe',
    displayName: 'John Doe',
    bio: 'Software Developer | Tech Enthusiast',
    avatar: null,
    lastSeen: new Date().toISOString(),
    online: true
};

export const mockChats = [
    {
        id: 'chat-1',
        name: 'Alice Johnson',
        username: 'alice_j',
        avatar: null,
        isChannel: false,
        userId: 'user-2',
        lastMessage: {
            text: 'Привет! Как дела?',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            senderId: 'user-2'
        },
        timestamp: new Date(Date.now() - 300000).toISOString(),
        unreadCount: 2
    },
    {
        id: 'chat-2',
        name: 'Bob Smith',
        username: 'bob_smith',
        avatar: null,
        isChannel: false,
        userId: 'user-3',
        lastMessage: {
            text: 'Встречаемся завтра?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            senderId: 'user-3'
        },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 0
    },
    {
        id: 'channel-1',
        name: 'Tech News',
        username: 'tech_news',
        avatar: null,
        isChannel: true,
        subscribersCount: 1250,
        lastMessage: {
            text: 'Новая версия React уже доступна! 🚀',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            senderId: 'admin-1'
        },
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        unreadCount: 5
    },
    {
        id: 'chat-3',
        name: 'Emma Wilson',
        username: 'emma_w',
        avatar: null,
        isChannel: false,
        userId: 'user-4',
        lastMessage: {
            text: 'Спасибо за помощь!',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            senderId: 'user-1'
        },
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        unreadCount: 0
    },
    {
        id: 'channel-2',
        name: 'Design Inspiration',
        username: 'design_daily',
        avatar: null,
        isChannel: true,
        subscribersCount: 3420,
        lastMessage: {
            text: 'Новые тренды в UI/UX дизайне',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            senderId: 'admin-2'
        },
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        unreadCount: 12
    }
];

export const mockMessages = {
    'chat-1': [
        {
            id: 'msg-1',
            chatId: 'chat-1',
            senderId: 'user-2',
            senderName: 'Alice Johnson',
            text: 'Привет! Как дела?',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            read: false,
            reactions: {}
        },
        {
            id: 'msg-2',
            chatId: 'chat-1',
            senderId: 'user-1',
            senderName: 'John Doe',
            text: 'Привет! Отлично, спасибо! У тебя как?',
            timestamp: new Date(Date.now() - 240000).toISOString(),
            read: true,
            reactions: {}
        },
        {
            id: 'msg-3',
            chatId: 'chat-1',
            senderId: 'user-2',
            senderName: 'Alice Johnson',
            text: 'Тоже хорошо! Хочу показать тебе новый проект 😊',
            timestamp: new Date(Date.now() - 180000).toISOString(),
            read: false,
            reactions: {
                '👍': ['user-1']
            }
        }
    ],
    'chat-2': [
        {
            id: 'msg-4',
            chatId: 'chat-2',
            senderId: 'user-3',
            senderName: 'Bob Smith',
            text: 'Встречаемся завтра?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: true,
            reactions: {}
        },
        {
            id: 'msg-5',
            chatId: 'chat-2',
            senderId: 'user-1',
            senderName: 'John Doe',
            text: 'Да, конечно! В какое время?',
            timestamp: new Date(Date.now() - 3000000).toISOString(),
            read: true,
            reactions: {}
        },
        {
            id: 'msg-6',
            chatId: 'chat-2',
            senderId: 'user-3',
            senderName: 'Bob Smith',
            text: 'Давай в 15:00 у кофейни?',
            timestamp: new Date(Date.now() - 2400000).toISOString(),
            read: true,
            reactions: {
                '👌': ['user-1']
            }
        }
    ],
    'channel-1': [
        {
            id: 'msg-7',
            chatId: 'channel-1',
            senderId: 'admin-1',
            senderName: 'Tech News',
            text: 'Новая версия React уже доступна! 🚀\n\nОсновные изменения:\n- Улучшенная производительность\n- Новые хуки\n- Исправления багов',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: true,
            reactions: {
                '🔥': ['user-1', 'user-2', 'user-3'],
                '👍': ['user-1', 'user-4']
            }
        },
        {
            id: 'msg-8',
            chatId: 'channel-1',
            senderId: 'admin-1',
            senderName: 'Tech News',
            text: 'JavaScript остается самым популярным языком программирования в 2024 году',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true,
            reactions: {
                '💯': ['user-1', 'user-2']
            }
        }
    ]
};

export const mockContacts = [
    {
        id: 'user-2',
        username: 'alice_j',
        displayName: 'Alice Johnson',
        bio: 'Product Designer',
        avatar: null,
        online: true,
        lastSeen: new Date().toISOString()
    },
    {
        id: 'user-3',
        username: 'bob_smith',
        displayName: 'Bob Smith',
        bio: 'Backend Developer',
        avatar: null,
        online: false,
        lastSeen: new Date(Date.now() - 1800000).toISOString()
    },
    {
        id: 'user-4',
        username: 'emma_w',
        displayName: 'Emma Wilson',
        bio: 'Marketing Manager',
        avatar: null,
        online: false,
        lastSeen: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 'user-5',
        username: 'david_brown',
        displayName: 'David Brown',
        bio: 'DevOps Engineer',
        avatar: null,
        online: true,
        lastSeen: new Date().toISOString()
    }
];

export const mockChannels = [
    {
        id: 'channel-1',
        name: 'Tech News',
        username: 'tech_news',
        description: 'Последние новости из мира технологий',
        avatar: null,
        subscribersCount: 1250,
        isPrivate: false,
        isAdmin: false
    },
    {
        id: 'channel-2',
        name: 'Design Inspiration',
        username: 'design_daily',
        description: 'Ежедневная доза дизайн-вдохновения',
        avatar: null,
        subscribersCount: 3420,
        isPrivate: false,
        isAdmin: false
    },
    {
        id: 'channel-3',
        name: 'Developer Community',
        username: 'dev_community',
        description: 'Сообщество разработчиков',
        avatar: null,
        subscribersCount: 5680,
        isPrivate: false,
        isAdmin: true
    }
];

// Utility to enable mock mode
export function enableMockMode(state) {
    console.log('Mock mode enabled');
    
    // Set mock user
    state.user = mockUser;
    state.token = 'mock-token-123';
    
    // Set mock chats
    state.chats = mockChats;
    
    // Set mock messages
    state.messages = mockMessages;
    
    // Set mock contacts
    state.contacts = mockContacts;
    
    // Set mock channels
    state.channels = mockChannels;
    
    // Set online users
    state.onlineUsers = new Set(['user-2', 'user-5']);
    
    // Save to localStorage
    localStorage.setItem('token', state.token);
    localStorage.setItem('user', JSON.stringify(state.user));
    localStorage.setItem('mockMode', 'true');
    
    return state;
}

// Check if mock mode is enabled
export function isMockModeEnabled() {
    return localStorage.getItem('mockMode') === 'true';
}

// Disable mock mode
export function disableMockMode() {
    localStorage.removeItem('mockMode');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Mock mode disabled');
}

// Generate random message
export function generateRandomMessage(chatId, senderId, senderName) {
    const messages = [
        'Привет!',
        'Как дела?',
        'Что нового?',
        'Отличная идея!',
        'Согласен 👍',
        'Давай обсудим это позже',
        'Спасибо за информацию!',
        'Интересно! 🤔',
        'Отлично работает!',
        'Нужно подумать...'
    ];
    
    return {
        id: `msg-${Date.now()}`,
        chatId,
        senderId,
        senderName,
        text: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date().toISOString(),
        read: false,
        reactions: {}
    };
}

export default {
    mockUser,
    mockChats,
    mockMessages,
    mockContacts,
    mockChannels,
    enableMockMode,
    isMockModeEnabled,
    disableMockMode,
    generateRandomMessage
};
