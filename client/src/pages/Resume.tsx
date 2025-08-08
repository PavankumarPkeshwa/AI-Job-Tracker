import React from 'react';

const Resume = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-primary">📄 Resumes</h2>
      <p className="text-gray-600">Manage and analyze your resumes here.</p>

      <div className="bg-white shadow-md rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Upload New Resume</h3>
            <p className="text-sm text-gray-500">PDF, DOC, or DOCX</p>
          </div>
          <button className="bg-primary text-white font-medium px-5 py-2 rounded-lg hover:opacity-90">
            Upload Resume
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Example resume card */}
        <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
          <h4 className="text-lg font-semibold mb-1">Full Stack Resume</h4>
          <p className="text-sm text-gray-500">Uploaded: Aug 8, 2025</p>
          <div className="mt-4 flex items-center gap-4">
            <button className="bg-blue-500 text-white px-4 py-1 rounded-md text-sm">Analyze</button>
            <button className="bg-gray-200 text-sm px-4 py-1 rounded-md">Download</button>
          </div>
        </div>
        {/* More resume cards here... */}
      </div>
    </div>
  );
};

export default Resume;
