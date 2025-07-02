import { initializeApiClient, getApiClient, ApiError } from '@/services/ApiClient';

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('initialization', () => {
    it('should initialize ApiClient with config', () => {
      const config = {
        baseURL: 'https://test.api.com',
        timeout: 5000,
      };

      const client = initializeApiClient(config);
      expect(client).toBeDefined();
    });

    it('should throw error when getting client before initialization', () => {
      // Reset the singleton
      (global as any).apiClient = null;
      
      expect(() => getApiClient()).toThrow(
        'ApiClient not initialized. Call initializeApiClient first.'
      );
    });
  });

  describe('request handling', () => {
    let client: ReturnType<typeof getApiClient>;

    beforeEach(() => {
      initializeApiClient({ baseURL: 'https://test.api.com' });
      client = getApiClient();
    });

    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.request('/test');
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.api.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        })
      );
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        error: 'Bad Request',
        message: 'Invalid input',
        statusCode: 400,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      await expect(client.request('/test')).rejects.toThrow(ApiError);
      await expect(client.request('/test')).rejects.toMatchObject({
        message: 'Invalid input',
        status: 400,
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new TypeError('Network request failed')
      );

      await expect(client.request('/test')).rejects.toThrow(ApiError);
      await expect(client.request('/test')).rejects.toMatchObject({
        message: 'Network error',
        status: 0,
      });
    });

    it('should handle timeout errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        Object.assign(new Error('AbortError'), { name: 'AbortError' })
      );

      await expect(client.request('/test', { timeout: 100 })).rejects.toThrow(ApiError);
      await expect(client.request('/test', { timeout: 100 })).rejects.toMatchObject({
        message: 'Request timeout',
        status: 408,
      });
    });
  });

  describe('auth token management', () => {
    let client: ReturnType<typeof getApiClient>;

    beforeEach(() => {
      initializeApiClient({ baseURL: 'https://test.api.com' });
      client = getApiClient();
    });

    it('should set auth token', async () => {
      client.setAuthToken('test-token');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.request('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should clear auth token', async () => {
      client.setAuthToken('test-token');
      client.clearAuthToken();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.request('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });
  });
}); 