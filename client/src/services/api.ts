export const API_BASE_URL = 'http://localhost:3000';

// Generic API service
class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      console.log(`[API] Requesting: ${url}`);
      console.log(`[API] Method: ${config.method || 'GET'}`);
      if (config.body) {
        console.log(`[API] Body: ${config.body}`);
      }

      const response = await fetch(url, config);

      const contentType = response.headers.get("content-type");
      const rawText = await response.text();

      // Log raw response
      console.log('[API] Raw Response:', rawText);

      if (!response.ok) {
        console.error(`[API] Request failed with status ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (contentType && contentType.includes("application/json")) {
        return JSON.parse(rawText); // safely parse only if JSON
      } else {
        console.error('[API] Unexpected content-type:', contentType);
        throw new Error('Response is not valid JSON.');
      }

    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  // POST request
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
