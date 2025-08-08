import React from 'react';

const Analytics = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-primary">📊 Analytics</h2>
      <p className="text-gray-600">Visualize your job search progress and performance.</p>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <h3 className="text-2xl font-bold text-blue-700">12</h3>
          <p className="text-sm text-gray-600">Applications Sent</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <h3 className="text-2xl font-bold text-green-700">4</h3>
          <p className="text-sm text-gray-600">Interviews Scheduled</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <h3 className="text-2xl font-bold text-yellow-700">2</h3>
          <p className="text-sm text-gray-600">Offers Received</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <h3 className="text-2xl font-bold text-red-700">3</h3>
          <p className="text-sm text-gray-600">Rejected</p>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-center text-gray-400">📈 Chart visualization coming soon...</p>
      </div>
    </div>
  );
};

export default Analytics;
