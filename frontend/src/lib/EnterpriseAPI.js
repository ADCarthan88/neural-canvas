// Enterprise B2B API Management
class EnterpriseAPI {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.token = null;
  }

  // Authentication
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('admin_token', data.token);
    }
    return data;
  }

  // Client Management
  async getClients() {
    return this.apiCall('/api/admin/clients');
  }

  async createClient(clientData) {
    return this.apiCall('/api/admin/clients', 'POST', clientData);
  }

  async updateClient(clientId, updates) {
    return this.apiCall(`/api/admin/clients/${clientId}`, 'PUT', updates);
  }

  async deleteClient(clientId) {
    return this.apiCall(`/api/admin/clients/${clientId}`, 'DELETE');
  }

  // Analytics
  async getAnalytics(timeframe = '30d') {
    return this.apiCall(`/api/admin/analytics?timeframe=${timeframe}`);
  }

  async getRevenue(timeframe = '30d') {
    return this.apiCall(`/api/admin/revenue?timeframe=${timeframe}`);
  }

  async getUsageStats(clientId) {
    return this.apiCall(`/api/admin/usage/${clientId}`);
  }

  // Billing
  async getBillingHistory(clientId) {
    return this.apiCall(`/api/admin/billing/${clientId}`);
  }

  async createInvoice(clientId, amount, description) {
    return this.apiCall('/api/admin/invoices', 'POST', {
      clientId, amount, description
    });
  }

  // White-label Management
  async updateBranding(clientId, branding) {
    return this.apiCall(`/api/admin/branding/${clientId}`, 'PUT', branding);
  }

  async getCustomDomain(clientId) {
    return this.apiCall(`/api/admin/domains/${clientId}`);
  }

  // API Keys
  async generateAPIKey(clientId, permissions) {
    return this.apiCall('/api/admin/api-keys', 'POST', {
      clientId, permissions
    });
  }

  async revokeAPIKey(keyId) {
    return this.apiCall(`/api/admin/api-keys/${keyId}`, 'DELETE');
  }

  // Support
  async getSupportTickets(status = 'open') {
    return this.apiCall(`/api/admin/support?status=${status}`);
  }

  async createSupportTicket(clientId, issue) {
    return this.apiCall('/api/admin/support', 'POST', {
      clientId, issue
    });
  }

  // Notifications
  async sendNotification(clientId, message, type = 'info') {
    return this.apiCall('/api/admin/notifications', 'POST', {
      clientId, message, type
    });
  }

  // Helper method for API calls
  async apiCall(endpoint, method = 'GET', data = null) {
    const token = this.token || localStorage.getItem('admin_token');
    
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Call failed:', error);
      throw error;
    }
  }

  // Real-time updates
  setupWebSocket(onMessage) {
    const ws = new WebSocket(`${this.baseURL.replace('http', 'ws')}/admin-ws`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    return ws;
  }
}

export default new EnterpriseAPI();