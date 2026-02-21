import React from 'react';

const HomeSkeleton = () => {
    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-pulse">
            {/* Header / Greeting Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-3">
                    <div className="h-10 w-64 bg-gray-200 rounded"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-48 bg-gray-200 rounded-full"></div>
            </div>

            {/* Main Action - Scan Module Skeleton */}
            <div className="h-56 w-full bg-gray-200 rounded-2xl"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Metrics Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-7 w-40 bg-gray-200 rounded"></div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Advice & Actions Skeleton */}
                <div className="space-y-6">
                    <div className="h-7 w-40 bg-gray-200 rounded"></div>
                    <div className="h-48 bg-gray-200 rounded-xl"></div>
                    <div className="h-32 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
};

export default HomeSkeleton;
