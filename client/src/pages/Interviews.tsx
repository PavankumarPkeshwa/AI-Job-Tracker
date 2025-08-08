import React from 'react';

const Interviews = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-primary">🎙️ Interviews</h2>
      <p className="text-gray-600">Track and prepare for interviews.</p>

      {/* Schedule Interview */}
      <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-semibold">Schedule New Interview</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <input type="text" placeholder="Company" className="input" />
          <input type="date" className="input" />
          <input type="text" placeholder="Interview Type (e.g. HR, Tech)" className="input" />
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg mt-2">+ Schedule</button>
      </div>

      {/* Interview List */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h4 className="font-semibold text-lg">Tech Interview at InnovateX</h4>
          <p className="text-sm text-gray-600">Date: 2025-08-15 • Type: Technical</p>
          <div className="mt-3 flex gap-2">
            <button className="bg-blue-500 text-white px-3 py-1 text-sm rounded">Edit</button>
            <button className="bg-gray-200 text-sm px-3 py-1 rounded">Remove</button>
          </div>
        </div>
        {/* More interviews here... */}
      </div>
    </div>
  );
};

export default Interviews;
