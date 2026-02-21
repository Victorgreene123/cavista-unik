import React from 'react';

const SearchSkeleton = () => {
    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="h-8 w-64 bg-gray-200 rounded"></div>
                <div className="h-4 w-96 bg-gray-200 rounded"></div>
                
                {/* Search Bar & Filter Skeleton */}
                <div className="flex gap-4 mt-6">
                    <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="h-12 w-32 bg-gray-200 rounded-xl"></div>
                </div>
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Results List Skeleton */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                         <div className="h-5 w-32 bg-gray-200 rounded"></div>
                         <div className="h-5 w-24 bg-gray-200 rounded"></div>
                    </div>
                    
                    {/* Hospital Cards */}
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-xl">
                            <div className="w-full sm:w-32 h-32 bg-gray-200 rounded-lg shrink-0"></div>
                            <div className="flex-1 space-y-3 py-1">
                                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                                <div className="flex gap-2">
                                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                                </div>
                                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                                <div className="flex gap-2 pt-2">
                                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Map/Filter Sidebar Skeleton */}
                <div className="hidden lg:block space-y-6">
                    <div className="h-64 w-full bg-gray-200 rounded-2xl"></div>
                    <div className="h-40 w-full bg-gray-200 rounded-2xl"></div>
                </div>
            </div>
        </div>
    );
};

export default SearchSkeleton;
