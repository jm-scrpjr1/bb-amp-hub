import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // Enable CORS credentials
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        // Try both token keys for compatibility
        const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear both token keys
          localStorage.removeItem('authToken');
          localStorage.removeItem('auth_token');
          window.location.href = '/auth/signin';
        }
        return Promise.reject(error);
      }
    );
  }

  // Chat API
  async sendChatMessage(message, threadId = null) {
    try {
      const response = await this.api.post('/chat', {
        message,
        threadId,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Chat request failed');
    }
  }

  // Groups API
  async getGroups() {
    try {
      const response = await this.api.get('/groups');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch groups');
    }
  }

  async createGroup(groupData) {
    try {
      const response = await this.api.post('/groups', groupData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create group');
    }
  }

  async updateGroup(groupId, groupData) {
    try {
      const response = await this.api.put(`/groups/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update group');
    }
  }

  async deleteGroup(groupId) {
    try {
      const response = await this.api.delete(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete group');
    }
  }

  async getGroupSuggestions(groupName, description) {
    try {
      const response = await this.api.post('/groups/ai/suggestions', {
        groupName,
        description,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get AI suggestions');
    }
  }

  async getGroupMembers(groupId) {
    try {
      const response = await this.api.get(`/groups/${groupId}/members`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get group members');
    }
  }

  async getGroupRecommendations() {
    try {
      const response = await this.api.get('/groups/ai/recommendations');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get group recommendations');
    }
  }

  async getUserAssignmentSuggestions(groupId, searchTerm = '') {
    try {
      const response = await this.api.get(`/groups/${groupId}/ai/user-suggestions`, {
        params: { search: searchTerm }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user assignment suggestions');
    }
  }

  async addGroupMember(groupId, memberData) {
    try {
      const response = await this.api.post(`/groups/${groupId}/members`, memberData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add group member');
    }
  }

  async removeGroupMember(groupId, userId) {
    try {
      const response = await this.api.delete(`/groups/${groupId}/members/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove group member');
    }
  }

  // User API
  async getUsers() {
    try {
      const response = await this.api.get('/users');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await this.api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  async deleteUser(userId) {
    try {
      const response = await this.api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }

  // Permissions API
  async getUserPermissions(userId) {
    try {
      const response = await this.api.get(`/permissions/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch permissions');
    }
  }

  async updateUserPermissions(userId, permissions) {
    try {
      const response = await this.api.put(`/permissions/user/${userId}`, {
        permissions,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update permissions');
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Health check failed');
    }
  }
}

export const apiService = new ApiService();
