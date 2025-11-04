'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientPortal from '../../components/ClientPortal';
import MultiTenantManager from '../../lib/MultiTenantManager';

export default function ClientPage() {
  const [tenantConfig, setTenantConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const initializeTenant = async () => {
      try {
        // Get tenant from URL parameter or subdomain
        const tenantId = searchParams.get('tenant') || 
                        MultiTenantManager.getTenantFromDomain() || 
                        'demo';

        const config = await MultiTenantManager.initializeTenant(tenantId);
        setTenantConfig(config);
      } catch (error) {
        console.error('Failed to initialize tenant:', error);
        // Fallback to default config
        setTenantConfig(MultiTenantManager.getDefaultConfig());
      } finally {
        setLoading(false);
      }
    };

    initializeTenant();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading workspace...</div>
      </div>
    );
  }

  return (
    <ClientPortal 
      clientId={MultiTenantManager.currentTenant}
      branding={tenantConfig?.branding}
    />
  );
}