import React from 'react';

const Jobs = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-primary">💼 Jobs</h2>
      <p className="text-gray-600">Track and manage your job applications.</p>

      {/* Add Job Application */}
      <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-semibold">Add New Job</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Job Title" className="input" />
          <input type="text" placeholder="Company" className="input" />
          <input type="text" placeholder="Application Status" className="input" />
        </div>
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2">+ Add Job</button>
      </div>

      {/* Job List */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h4 className="font-semibold text-lg">React Developer</h4>
          <p className="text-sm text-gray-600">Company: TechCorp • Status: Applied</p>
          <div className="mt-3 flex gap-2">
            <button className="bg-blue-500 text-white px-3 py-1 text-sm rounded">Update</button>
            <button className="bg-gray-200 text-sm px-3 py-1 rounded">Delete</button>
          </div>
        </div>
        {/* More jobs here... */}
      </div>
    </div>
  );
};

export default Jobs;
