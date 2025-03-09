import React from "react";

const Filters = ({ filters, handleFilterChange, handleSearch }) => (
  <div className="bg-white p-4 rounded-lg shadow-md mb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Search</label>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search by name or ID"
          className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="DR">DR</option>
          <option value="AMD">AMD</option>
          <option value="Glaucoma">Glaucoma</option>
          <option value="RVO">RVO</option>
          <option value="Others">Others</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Gender</label>
        <select
          name="gender"
          value={filters.gender}
          onChange={handleFilterChange}
          className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Age Min</label>
        <input
          type="number"
          name="ageMin"
          value={filters.ageMin}
          onChange={handleFilterChange}
          placeholder="Min Age"
          className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Age Max</label>
        <input
          type="number"
          name="ageMax"
          value={filters.ageMax}
          onChange={handleFilterChange}
          placeholder="Max Age"
          className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Sort By</label>
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleFilterChange}
          className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="createdAt">Created Date</option>
          <option value="age">Age</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Sort Order</label>
        <select
          name="sortOrder"
          value={filters.sortOrder}
          onChange={handleFilterChange}
          className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
    </div>
    <div className="mt-4 flex justify-end">
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Search
      </button>
    </div>
  </div>
);

export default Filters;
