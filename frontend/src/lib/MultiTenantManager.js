// Multi-Tenant Architecture Manager
class MultiTenantManager {
  constructor() {
    this.currentTenant = null;
    this.tenantConfig = {};
  }

  // Tenant Management
  async initializeTenant(tenantId) {
    try {
      const config = await this.fetchTenantConfig(tenantId);
      this.currentTenant = tenantId;
      this.tenantConfig = config;
      
      // Apply tenant-specific settings
      this.applyTenantBranding(config.branding);
      this.setupTenantDatabase(config.database);
      this.configureTenantFeatures(config.features);
      
      return config;
    } catch (error) {
      console.error('Failed to initialize tenant:', error);
      throw error;
    }
  }

  async fetchTenantConfig(tenantId) {
    // In production, this would fetch from your database
    const mockConfigs = {
      'techcorp': {
        name: 'TechCorp Inc',
        plan: 'enterprise',
        branding: {
          logo: '/logos/techcorp.png',
          colors: {
            primary: '#1e40af',
            secondary: '#7c3aed',
            accent: '#059669'
          },
          companyName: 'TechCorp Neural Studio'
        },
        features: {
          maxUsers: 100,
          apiCalls: 100000,
          storage: '50GB',
          customDomain: true,
          whiteLabel: true,
          analytics: true,
          support: 'priority'
        },
        database: {
          schema: `tenant_${tenantId}`,
          isolation: 'schema'
        }
      },
      'creative-agency': {
        name: 'Creative Agency',
        plan: 'pro',
        branding: {
          colors: {
            primary: '#dc2626',
            secondary: '#ea580c',
            accent: '#ca8a04'
          },
          companyName: 'Creative Canvas Pro'
        },
        features: {
          maxUsers: 25,
          apiCalls: 25000,
          storage: '10GB',
          customDomain: false,
          whiteLabel: false,
          analytics: true,
          support: 'standard'
        }
      }
    };

    return mockConfigs[tenantId] || this.getDefaultConfig();
  }

  getDefaultConfig() {
    return {
      name: 'Default Tenant',
      plan: 'free',
      branding: {
        colors: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4'
        },
        companyName: 'Neural Canvas'
      },
      features: {
        maxUsers: 5,
        apiCalls: 1000,
        storage: '1GB',
        customDomain: false,
        whiteLabel: false,
        analytics: false,
        support: 'community'
      }
    };
  }

  // Branding Application
  applyTenantBranding(branding) {
    if (!branding) return;

    // Update CSS custom properties
    const root = document.documentElement;
    if (branding.colors) {
      root.style.setProperty('--tenant-primary', branding.colors.primary);
      root.style.setProperty('--tenant-secondary', branding.colors.secondary);
      root.style.setProperty('--tenant-accent', branding.colors.accent);
    }

    // Update page title
    if (branding.companyName) {
      document.title = branding.companyName;
    }

    // Update favicon if provided
    if (branding.favicon) {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) favicon.href = branding.favicon;
    }
  }

  // Feature Gating
  hasFeature(featureName) {
    return this.tenantConfig.features?.[featureName] || false;
  }

  getFeatureLimit(featureName) {
    return this.tenantConfig.features?.[featureName] || 0;
  }

  checkUsageLimit(resource, currentUsage) {
    const limit = this.getFeatureLimit(resource);
    return {
      allowed: currentUsage < limit,
      usage: currentUsage,
      limit: limit,
      percentage: (currentUsage / limit) * 100
    };
  }

  // Database Isolation
  setupTenantDatabase(dbConfig) {
    // Configure database connection for tenant
    this.dbSchema = dbConfig?.schema || 'public';
    this.isolationLevel = dbConfig?.isolation || 'shared';
  }

  getTenantQuery(baseQuery) {
    // Add tenant filtering to queries
    if (this.isolationLevel === 'schema') {
      return `SET search_path TO ${this.dbSchema}; ${baseQuery}`;
    }
    return `${baseQuery} WHERE tenant_id = '${this.currentTenant}'`;
  }

  // API Rate Limiting
  async checkRateLimit(endpoint) {
    const key = `rate_limit:${this.currentTenant}:${endpoint}`;
    const limit = this.getFeatureLimit('apiCalls');
    
    // In production, use Redis for rate limiting
    const current = parseInt(localStorage.getItem(key) || '0');
    
    if (current >= limit) {
      throw new Error('API rate limit exceeded');
    }

    localStorage.setItem(key, (current + 1).toString());
    return true;
  }

  // Usage Tracking
  async trackUsage(resource, amount = 1) {
    const usage = {
      tenantId: this.currentTenant,
      resource: resource,
      amount: amount,
      timestamp: new Date().toISOString()
    };

    // In production, send to analytics service
    console.log('Usage tracked:', usage);
    
    // Update local usage counters
    const key = `usage:${this.currentTenant}:${resource}`;
    const current = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (current + amount).toString());
  }

  async getUsageStats(timeframe = '30d') {
    // Mock usage data - replace with real analytics
    return {
      canvasViews: 1250,
      apiCalls: 8900,
      storageUsed: 2.3,
      storageLimit: this.getFeatureLimit('storage'),
      users: 12,
      userLimit: this.getFeatureLimit('maxUsers')
    };
  }

  // Billing Integration
  async getBillingInfo() {
    return {
      plan: this.tenantConfig.plan,
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount: this.getPlanPrice(),
      currency: 'USD'
    };
  }

  getPlanPrice() {
    const prices = {
      free: 0,
      pro: 299,
      enterprise: 999
    };
    return prices[this.tenantConfig.plan] || 0;
  }

  // Security & Permissions
  hasPermission(action, resource) {
    const permissions = this.tenantConfig.permissions || {};
    return permissions[`${action}:${resource}`] !== false;
  }

  // Subdomain Routing
  static getTenantFromDomain() {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Check for subdomain pattern: tenant.neuralcanvas.com
    if (parts.length > 2 && parts[1] === 'neuralcanvas') {
      return parts[0];
    }
    
    // Check for custom domain
    const customDomains = {
      'studio.techcorp.com': 'techcorp',
      'canvas.creativeagency.com': 'creative-agency'
    };
    
    return customDomains[hostname] || null;
  }

  // Cleanup
  cleanup() {
    this.currentTenant = null;
    this.tenantConfig = {};
    
    // Reset CSS variables
    const root = document.documentElement;
    root.style.removeProperty('--tenant-primary');
    root.style.removeProperty('--tenant-secondary');
    root.style.removeProperty('--tenant-accent');
  }
}

export default new MultiTenantManager();