'use client';
import { useState, useEffect } from 'react';

export default function EnterpriseAdmin() {
  const [clients, setClients] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    // Mock data - replace with real API
    setClients([
      { id: 1, name: 'TechCorp Inc', plan: 'Enterprise', users: 45, revenue: 2500, status: 'active' },
      { id: 2, name: 'Creative Agency', plan: 'Pro', users: 12, revenue: 500, status: 'active' },
      { id: 3, name: 'Event Masters', plan: 'Enterprise', users: 78, revenue: 5000, status: 'trial' }
    ]);
    setRevenue(8000);
    setAnalytics({ totalUsers: 135, activeToday: 89, conversions: 12 });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          💰 Enterprise Dashboard
        </h1>
        <p className="text-gray-300 mt-2">Neural Canvas B2B Command Center</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl hover:scale-105 transition-transform">
          <h3 className="text-lg font-semibold">Monthly Revenue</h3>
          <p className="text-3xl font-bold">${revenue.toLocaleString()}</p>
          <p className="text-green-200">+23% this month</p>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl hover:scale-105 transition-transform">
          <h3 className="text-lg font-semibold">Active Clients</h3>
          <p className="text-3xl font-bold">{clients.length}</p>
          <p className="text-blue-200">2 new this week</p>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl hover:scale-105 transition-transform">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-3xl font-bold">{analytics.totalUsers}</p>
          <p className="text-purple-200">{analytics.activeToday} active today</p>
        </div>

        <div className="bg-gradient-to-r from-pink-600 to-pink-700 p-6 rounded-xl hover:scale-105 transition-transform">
          <h3 className="text-lg font-semibold">Conversions</h3>
          <p className="text-3xl font-bold">{analytics.conversions}</p>
          <p className="text-pink-200">8.9% conversion rate</p>
        </div>
      </div>

      {/* Client Management */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Client Management</h2>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform">
            + Add Client
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3">Company</th>
                <th className="text-left py-3">Plan</th>
                <th className="text-left py-3">Users</th>
                <th className="text-left py-3">Revenue</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr 
                  key={client.id}
                  className="border-b border-gray-700/50 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 font-semibold">{client.name}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      client.plan === 'Enterprise' ? 'bg-purple-600' : 'bg-blue-600'
                    }`}>
                      {client.plan}
                    </span>
                  </td>
                  <td className="py-4">{client.users}</td>
                  <td className="py-4 font-bold text-green-400">${client.revenue}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      client.status === 'active' ? 'bg-green-600' : 'bg-yellow-600'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300">Edit</button>
                      <button className="text-purple-400 hover:text-purple-300">Analytics</button>
                      <button className="text-green-400 hover:text-green-300">Billing</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <button className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl text-left hover:scale-105 active:scale-95 transition-transform">
          <h3 className="text-xl font-bold mb-2">🎨 Create Demo</h3>
          <p className="text-gray-300">Generate custom demo for prospects</p>
        </button>

        <button className="bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-xl text-left hover:scale-105 active:scale-95 transition-transform">
          <h3 className="text-xl font-bold mb-2">📊 Analytics Report</h3>
          <p className="text-gray-300">Generate monthly performance report</p>
        </button>

        <button className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-xl text-left hover:scale-105 active:scale-95 transition-transform">
          <h3 className="text-xl font-bold mb-2">🚀 Launch Campaign</h3>
          <p className="text-gray-300">Start new client acquisition campaign</p>
        </button>
      </div>
    </div>
  );
}