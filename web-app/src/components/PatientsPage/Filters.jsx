import React from "react";

const Filters = ({ filters, handleFilterChange, handleSearch }) => (
  <div className="bg-white p-4 rounded-lg shadow-md mb-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {/* Search Input */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search by name or ID"
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
        />
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
        >
          <option value="">All</option>
          <option value="DR">DR</option>
          <option value="AMD">AMD</option>
          <option value="Glaucoma">Glaucoma</option>
          <option value="RVO">RVO</option>
          <option value="Others">Others</option>
        </select>
      </div>

      {/* Gender Dropdown */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
        <select
          name="gender"
          value={filters.gender}
          onChange={handleFilterChange}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
        >
          <option value="">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Age Range Inputs */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Age Range</label>
        <div className="flex space-x-2">
          <input
            type="number"
            name="ageMin"
            value={filters.ageMin}
            onChange={handleFilterChange}
            placeholder="Min"
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
          />
          <input
            type="number"
            name="ageMax"
            value={filters.ageMax}
            onChange={handleFilterChange}
            placeholder="Max"
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Sort By Dropdown */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleFilterChange}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
        >
          <option value="createdAt">Created Date</option>
          <option value="age">Age</option>
        </select>
      </div>

      {/* Sort Order Dropdown */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
        <select
          name="sortOrder"
          value={filters.sortOrder}
          onChange={handleFilterChange}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
    </div>

    {/* Search Button */}
    <div className="mt-4 flex justify-end">
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
      >
        Search
      </button>
    </div>
  </div>
);

export default Filters;
