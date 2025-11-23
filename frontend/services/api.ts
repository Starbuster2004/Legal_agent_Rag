import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatResponse {
    answer: string;
    sources: string[];
}

export const authService = {
    login: async (password: string) => {
        const formData = new FormData();
        formData.append('username', 'admin'); // Username is not used but required by OAuth2PasswordRequestForm
        formData.append('password', password);

        // Note: FastAPI's OAuth2PasswordRequestForm expects form data, not JSON
        const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

export const chatService = {
    query: async (query: string, history: ChatMessage[] = []) => {
        const response = await api.post<ChatResponse>('/chat/query', {
            query,
            chat_history: history,
            top_k: 5
        });
        return response.data;
    }
};

export const documentService = {
    upload: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    list: async () => {
        const response = await api.get('/documents/list');
        return response.data;
    }
};

export default api;
