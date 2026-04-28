import { memo, useMemo } from 'react';
import type { ProductCategory } from '@/services/product.service';

export interface ProductFiltersState {
  minPrice: string;
  maxPrice: string;
  category: string;
  inStock: boolean;
}

type FilterSidebarProps = {
  filters: ProductFiltersState;
  categories: ProductCategory[];
  onChange: (next: ProductFiltersState) => void;
  onReset: () => void;
};

function FilterSidebarComponent({ filters, categories, onChange, onReset }: FilterSidebarProps) {
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  return (
    <aside className="h-fit rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Price Range</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="sr-only" htmlFor="minPrice">
              Minimum price
            </label>
            <input
              id="minPrice"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Min"
              value={filters.minPrice}
              onChange={(event) => onChange({ ...filters, minPrice: event.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            <label className="sr-only" htmlFor="maxPrice">
              Maximum price
            </label>
            <input
              id="maxPrice"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(event) => onChange({ ...filters, maxPrice: event.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Category</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...filters, category: '' })}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filters.category === ''
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {sortedCategories.map((category) => {
              const isSelected = filters.category === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onChange({ ...filters, category: category.id })}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-700">
          <span>In stock only</span>
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(event) => onChange({ ...filters, inStock: event.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
          />
        </label>
      </div>
    </aside>
  );
}

const FilterSidebar = memo(FilterSidebarComponent);

export default FilterSidebar;
