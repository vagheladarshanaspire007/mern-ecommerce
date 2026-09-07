import { useEffect, useState } from 'react';
import type { Category, ProductFilters } from '@/services/product.service';
import { Button } from './Button';

interface FilterSidebarProps {
  readonly categories: Category[];
  readonly filters: ProductFilters;
  readonly onChange: (filters: ProductFilters) => void;
  readonly onClear: () => void;
}

export function FilterSidebar({ categories, filters, onChange, onClear }: FilterSidebarProps) {
  const [minPrice, setMinPrice] = useState(
    filters.minPrice !== undefined ? String(filters.minPrice) : ''
  );

  const [maxPrice, setMaxPrice] = useState(
    filters.maxPrice !== undefined ? String(filters.maxPrice) : ''
  );

  useEffect(() => {
    setMinPrice(filters.minPrice !== undefined ? String(filters.minPrice) : '');

    setMaxPrice(filters.maxPrice !== undefined ? String(filters.maxPrice) : '');
  }, [filters.minPrice, filters.maxPrice]);

  const handlePriceChange = (type: 'minPrice' | 'maxPrice', value: string) => {
    const isValid = [...value].every((char) => (char >= '0' && char <= '9') || char === '.');

    if (!isValid) {
      return;
    }

    const decimalCount = [...value].filter((char) => char === '.').length;

    if (decimalCount > 1) {
      return;
    }

    if (type === 'minPrice') {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  };

  const applyPriceFilters = () => {
    const nextFilters: ProductFilters = {
      ...filters,
      cursor: undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    };

    onChange(nextFilters);
  };

  const handleCategoryChange = (categoryId: string) => {
    onChange({
      ...filters,
      cursor: undefined,
      categoryId: filters.categoryId === categoryId ? undefined : categoryId,
    });
  };

  const handleStockChange = (checked: boolean) => {
    onChange({
      ...filters,
      cursor: undefined,
      inStock: checked ? true : undefined,
    });
  };

  return (
    <aside className="w-full rounded-lg border border-gray-200 bg-white p-4 lg:w-64 lg:shrink-0">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>

        <Button variant="ghost" size="sm" onClick={onClear} type="button">
          Clear
        </Button>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Price Range</h3>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={minPrice}
            onChange={(event) => handlePriceChange('minPrice', event.target.value)}
            placeholder="Min"
            aria-label="Minimum price"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />

          <input
            type="text"
            inputMode="decimal"
            value={maxPrice}
            onChange={(event) => handlePriceChange('maxPrice', event.target.value)}
            placeholder="Max"
            aria-label="Maximum price"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={applyPriceFilters}
          className="mt-3 w-full"
          type="button"
        >
          Apply Price
        </Button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Category</h3>

        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
          {categories.map((category) => {
            const isSelected = filters.categoryId === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  isSelected
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            );
          })}

          {categories.length === 0 && (
            <p className="text-sm text-gray-500">No categories available.</p>
          )}
        </div>
      </div>

      {/* Stock Filter */}
      <div>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={filters.inStock === true}
            onChange={(event) => handleStockChange(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />

          <span className="text-sm font-medium text-gray-700">In stock only</span>
        </label>
      </div>
    </aside>
  );
}
