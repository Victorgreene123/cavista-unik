import React from 'react';

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <span className="text-sm text-gray-500">Welcome back, Admin</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">1,234</p>
                    <p className="text-green-500 text-xs mt-1">↑ 12% from last month</p>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Appointments Today</h3>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">42</p>
                    <p className="text-gray-400 text-xs mt-1">6 pending confirmation</p>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Revenue (Monthly)</h3>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">$45,200</p>
                    <p className="text-green-500 text-xs mt-1">Paid In Full</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center">
                <p className="text-gray-400">Chart or Recent Activity data will appear here.</p>
            </div>
        </div>
    );
}