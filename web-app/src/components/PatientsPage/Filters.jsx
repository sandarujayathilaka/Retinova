import React, { useState } from "react";
import { Search, Filter, ChevronDown, ChevronUp, RefreshCw, SlidersHorizontal } from "lucide-react";

const Filters = ({ filters, handleFilterChange, handleSearch }) => {
  const [expandedFilters, setExpandedFilters] = useState(false);
  
  const handleReset = () => {
    // Create a synthetic event to reset all filters
    const resetEvent = {
      target: {
        name: 'resetAll',
        value: true
      }
    };
    handleFilterChange(resetEvent);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden transition-all duration-300">
      {/* Basic Search Bar - Always Visible */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by patient name or ID"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setExpandedFilters(!expandedFilters)}
              className="px-3 py-2.5 flex items-center justify-center text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 flex-1 sm:flex-auto"
            >
              <SlidersHorizontal size={16} className="mr-2" />
              Filters
              {expandedFilters ? (
                <ChevronUp size={16} className="ml-2" />
              ) : (
                <ChevronDown size={16} className="ml-2" />
              )}
            </button>
            
            <button
              onClick={handleSearch}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-300 shadow-sm flex-1 sm:flex-auto"
            >
              Search
            </button>
          </div>
        </div>
      </div>
      
      {/* Advanced Filters - Expandable */}
      <div className={`px-4 py-3 bg-gray-50 border-b border-gray-100 transition-all duration-500 ease-in-out ${
        expandedFilters ? "block" : "hidden"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <Filter size={16} className="mr-2" />
            Advanced Filters
          </h3>
          <button
            onClick={handleReset}
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center transition-colors duration-200"
          >
            <RefreshCw size={12} className="mr-1" />
            Reset Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
            <div className="relative">
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full p-2.5 pr-10 text-sm appearance-none border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Categories</option>
                <option value="DR">DR</option>
                <option value="AMD">AMD</option>
                <option value="Glaucoma">Glaucoma</option>
                <option value="RVO">RVO</option>
                <option value="Others">Others</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none h-4 w-4" />
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Gender</label>
            <div className="relative">
              <select
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                className="w-full p-2.5 pr-10 text-sm appearance-none border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none h-4 w-4" />
            </div>
          </div>

          {/* Age Range Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Age Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="ageMin"
                value={filters.ageMin}
                onChange={handleFilterChange}
                placeholder="Min"
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <input
                type="number"
                name="ageMax"
                value={filters.ageMax}
                onChange={handleFilterChange}
                placeholder="Max"
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Sort By</label>
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-full p-2.5 pr-10 text-sm appearance-none border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="age">Age</option>
                  <option value="name">Name</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none h-4 w-4" />
              </div>
              <button
                onClick={() => handleFilterChange({ 
                  target: { 
                    name: 'sortOrder', 
                    value: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                  } 
                })}
                className="p-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                aria-label={filters.sortOrder === 'asc' ? "Sort descending" : "Sort ascending"}
              >
                {filters.sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;