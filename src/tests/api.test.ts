import axios, { AxiosResponse } from 'axios';

const API_URL = 'http://localhost:3000/api';
let authToken: string;
let userId: string;

// Define types for API responses
interface RegisterResponse {
  id: string;
}

interface LoginResponse {
  token: string;
}

describe('API Tests', () => {
  // Test user data
  const testUser = {
    name: 'Usuario de Prueba',
    email: 'test@example.com',
    password: 'password123'
  };

  // 1. Registration Test
  test('should register a new user', async () => {
    try {
      const response: AxiosResponse<RegisterResponse> = await axios.post(`${API_URL}/users/register`, testUser);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      userId = response.data.id;
    } catch (error: any) {
      throw new Error(`Registration failed: ${error.response?.data?.message || error.message}`);
    }
  });

  // 2. Login Test
  test('should login with registered user', async () => {
    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(`${API_URL}/users/login`, {
        email: testUser.email,
        password: testUser.password
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      authToken = response.data.token;
    } catch (error: any) {
      throw new Error(`Login failed: ${error.response?.data?.message || error.message}`);
    }
  });

  // 3. Get All Users Test
  test('should get all users with valid token', async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBeTruthy();
    } catch (error: any) {
      throw new Error(`Get users failed: ${error.response?.data?.message || error.message}`);
    }
  });

  // 4. Delete User Test
  test('should delete user with valid token', async () => {
    try {
      const response = await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      expect(response.status).toBe(204);
    } catch (error: any) {
      throw new Error(`Delete user failed: ${error.response?.data?.message || error.message}`);
    }
  });

  // 5. Authentication Error Test
  test('should fail to access protected route without token', async () => {
    try {
      await axios.get(`${API_URL}/users`);
      throw new Error('Should have failed without token');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });

  // 6. Validation Error Test
  test('should fail to register with invalid email', async () => {
    try {
      await axios.post(`${API_URL}/users/register`, {
        ...testUser,
        email: 'invalid-email'
      });
      throw new Error('Should have failed with invalid email');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });
});
