import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL  ='http://10.0.2.2:3000/api';

class ApiService {
  async getToken() {
    return await AsyncStorage.getItem('userToken');
  }

  async setToken(token) {
    await AsyncStorage.setItem('userToken', token);
  }

  async removeToken() {
    await AsyncStorage.removeItem('userToken');
  }

  async request(endpoint, options = {}) {
    const token = await this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.token) {
      await this.setToken(response.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      await this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    await this.removeToken();
  }

  // User
  async getUserProfile() {
    return await this.request('/user/profile');
  }

  async getUserActivities() {
    return await this.request('/user/activities');
  }

  // Dashboard
  async getSensorData() {
    return await this.request('/dashboard/sensor-data');
  }

  async getPhTrends() {
    return await this.request('/dashboard/ph-trends');
  }

  async getTreeHeight() {
    return await this.request('/dashboard/tree-height');
  }

  async getCarbonSequestration() {
    return await this.request('/dashboard/carbon-sequestration');
  }

  // Tasks
  async getTasks() {
    return await this.request('/tasks');
  }

  async completeTask(taskId) {
    return await this.request(`/tasks/${taskId}/complete`, {
      method: 'POST',
    });
  }

  // Leaderboard
  async getLeaderboard() {
    return await this.request('/leaderboard');
  }
  // Grids
  async getGrids() {
    return await this.request('/grids');
  }

  async getSelectedGrid() {
    return await this.request('/user/selected-grid');
  }

  async selectGrid(gridId) {
    return await this.request('/user/select-grid', {
      method: 'POST',
      body: JSON.stringify({ gridId }),
    });
  }

  async updateUserLocation(address, latitude, longitude) {
    return await this.request('/user/update-location', {
      method: 'POST',
      body: JSON.stringify({ address, latitude, longitude }),
    });
  }

  async calculateDistance(gridId) {
    return await this.request('/grids/calculate-distance', {
      method: 'POST',
      body: JSON.stringify({ gridId }),
    });
  }
}

export default new ApiService();