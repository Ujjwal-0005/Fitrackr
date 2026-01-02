import React from "react";

export const SkeletonCard = () => (
  <div className="bg-gray-800/50 p-4 rounded-xl animate-pulse">
    <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
    <div className="h-8 bg-gray-700 rounded w-1/2"></div>
  </div>
);

export const SkeletonChart = () => (
  <div className="bg-gray-800/50 p-5 rounded-2xl animate-pulse">
    <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
    <div className="h-64 bg-gray-700 rounded"></div>
  </div>
);

export const SkeletonList = ({ items = 5 }) => (
  <div className="space-y-3">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="bg-gray-800/50 p-4 rounded-lg animate-pulse">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-gray-800/50 rounded-lg overflow-hidden animate-pulse">
    <div className="h-12 bg-gray-700"></div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-800 border-t border-gray-700"></div>
    ))}
  </div>
);
