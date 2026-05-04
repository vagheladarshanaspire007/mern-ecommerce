import { memo, useMemo } from 'react';
import type { Category } from '@/types/auth.types';

export interface ProductFiltersState {
  minPrice: string;
  maxPrice: string;
  category: string;
  inStock: boolean;
}

type FilterSidebarProps = {
  filters: ProductFiltersState;
  categories: Category[];
  onChange: (next: ProductFiltersState) => void;
  onReset: () => void;
};

function FilterSidebarComponent({
  filters,
  categories,
  onChange,
  onReset,
}: Readonly<FilterSidebarProps>) {
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  return (
    <aside className="h-fit rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-slate-400 transition hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">Price Range</p>
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
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
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
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">Category</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...filters, category: '' })}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filters.category === ''
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-300">
          <span>In stock only</span>
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(event) => onChange({ ...filters, inStock: event.target.checked })}
            className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
          />
        </label>
      </div>
    </aside>
  );
}

const FilterSidebar = memo(FilterSidebarComponent);

export default FilterSidebar;
