/**
 * Filter Component
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const Filter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    brand: searchParams.get('brand') || '',
    size: searchParams.get('size') || '',
    color: searchParams.get('color') || '',
    sort: searchParams.get('sort') || 'id DESC',
  });

  const categories = ['shirts', 'jackets', 'pants', 'dresses', 'shoes', 'shorts', 'sweaters', 'accessories'];
  const brands = ['Basic Style', 'Polo Club', 'Business Elite', 'Weekend Wear', 'Comfort Zone', 'Leather Craft', 'Winter Wear', 'Denim Co', 'Urban Style', 'Elegance', 'Sport Fit', 'Garden Party', 'Party Time', 'Summer Breeze', 'Casual Steps', 'Travel Gear', 'Cozy Home', 'Utility Wear'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '41', '42', '43', '44', 'One Size'];
  const colors = ['White', 'Black', 'Navy', 'Navy Blue', 'Blue', 'Gray', 'Brown', 'Khaki', 'Beige', 'Pink', 'Red', 'Yellow', 'Light Blue', 'Cream', 'Olive Green', 'Floral Print', 'Black/White'];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((k) => {
      if (newFilters[k]) {
        params.set(k, newFilters[k]);
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      min_price: '',
      max_price: '',
      brand: '',
      size: '',
      color: '',
      sort: 'id DESC',
    });
    setSearchParams({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-gray hover:text-primary-black transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-black"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium mb-2">Price Range</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Min"
              value={filters.min_price}
              onChange={(e) => handleFilterChange('min_price', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-black"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.max_price}
              onChange={(e) => handleFilterChange('max_price', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-black"
            />
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Brand</label>
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-black"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Size Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Size</label>
          <select
            value={filters.size}
            onChange={(e) => handleFilterChange('size', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-black"
          >
            <option value="">All Sizes</option>
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Color Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Color</label>
          <select
            value={filters.color}
            onChange={(e) => handleFilterChange('color', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-black"
          >
            <option value="">All Colors</option>
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-black"
          >
            <option value="id DESC">Newest First</option>
            <option value="id ASC">Oldest First</option>
            <option value="price ASC">Price: Low to High</option>
            <option value="price DESC">Price: High to Low</option>
            <option value="name ASC">Name: A to Z</option>
            <option value="name DESC">Name: Z to A</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filter;
