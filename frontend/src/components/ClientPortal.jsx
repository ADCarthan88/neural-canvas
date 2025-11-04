'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InclusiveNeuralCanvas from './InclusiveNeuralCanvas';

export default function ClientPortal({ clientId, branding }) {
  const [usage, setUsage] = useState({});
  const [team, setTeam] = useState([]);
  const [canvasSettings, setCanvasSettings] = useState({});

  useEffect(() => {
    // Load client-specific data
    setUsage({
      canvasViews: 1250,
      apiCalls: 8900,
      storageUsed: '2.3 GB',
      monthlyLimit: '10 GB'
    });
    
    setTeam([
      { id: 1, name: 'Sarah Johnson', role: 'Admin', lastActive: '2 hours ago' },
      { id: 2, name: 'Mike Chen', role: 'Designer', lastActive: '1 day ago' },
      { id: 3, name: 'Lisa Park', role: 'Developer', lastActive: '3 hours ago' }
    ]);
  }, [clientId]);

  const customColors = branding?.colors || {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Custom Header with Client Branding */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {branding?.logo && (
              <img src={branding.logo} alt="Logo" className="h-10 w-auto" />
            )}
            <h1 className="text-2xl font-bold" style={{ color: customColors.primary }}>
              {branding?.companyName || 'Neural Canvas Enterprise'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-300">
              Plan: <span className="text-green-400 font-semibold">Enterprise Pro</span>
            </div>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-lg text-sm font-semibold">
              Upgrade
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Usage Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-2">Canvas Views</h3>
            <p className="text-3xl font-bold" style={{ color: customColors.primary }}>
              {usage.canvasViews?.toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm">This month</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-2">API Calls</h3>
            <p className="text-3xl font-bold" style={{ color: customColors.secondary }}>
              {usage.apiCalls?.toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm">This month</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-2">Storage Used</h3>
            <p className="text-3xl font-bold" style={{ color: customColors.accent }}>
              {usage.storageUsed}
            </p>
            <p className="text-gray-400 text-sm">of {usage.monthlyLimit}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-2">Team Members</h3>
            <p className="text-3xl font-bold text-green-400">{team.length}</p>
            <p className="text-gray-400 text-sm">Active users</p>
          </motion.div>
        </div>

        {/* Main Canvas Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4">Interactive Canvas</h2>
              <div className="h-96 rounded-lg overflow-hidden">
                <InclusiveNeuralCanvas 
                  customColors={customColors}
                  enterpriseMode={true}
                  clientId={clientId}
                />
              </div>
            </motion.div>
          </div>

          {/* Team & Controls */}
          <div className="space-y-6">
            {/* Team Management */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Team Members</h3>
                <button className="text-sm px-3 py-1 rounded-lg border border-gray-600 hover:bg-gray-700">
                  + Invite
                </button>
              </div>
              
              <div className="space-y-3">
                {team.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-gray-400">{member.role}</p>
                    </div>
                    <p className="text-xs text-gray-500">{member.lastActive}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
                  <div className="font-semibold">🎨 Create New Canvas</div>
                  <div className="text-sm text-gray-400">Start fresh project</div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
                  <div className="font-semibold">📊 View Analytics</div>
                  <div className="text-sm text-gray-400">Usage insights</div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
                  <div className="font-semibold">🔧 API Settings</div>
                  <div className="text-sm text-gray-400">Manage integrations</div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
                  <div className="font-semibold">💬 Support</div>
                  <div className="text-sm text-gray-400">Get help</div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}