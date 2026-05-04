import { useCallback, useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useIntersectionObserver } from '@/hooks';
import FilterSidebar, { type ProductFiltersState } from '@/components/ui/FilterSidebar';
import ProductCard, { ProductCardSkeleton } from '@/components/ui/ProductCard';
import { fetchCategories, fetchProducts, type ProductListItem } from '@/services/product.service';

const PAGE_LIMIT = 20;

const INITIAL_SKELETONS = Array.from({ length: 8 }, (_, i) => `skeleton-initial-${i}`);
const NEXT_SKELETONS = Array.from({ length: 4 }, (_, i) => `skeleton-next-${i}`);

type SearchParamsShape = {
  search: string;
  minPrice: string;
  maxPrice: string;
  category: string;
  inStock: boolean;
};

interface EmptyStateProps {
  onReset: () => void;
}

function parseSearchParams(searchParams: URLSearchParams): SearchParamsShape {
  return {
    search: searchParams.get('search') ?? '',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    category: searchParams.get('category') ?? '',
    inStock: searchParams.get('inStock') === 'true',
  };
}

function toNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) return undefined;
  return parsed;
}

function EmptyState({ onReset }: Readonly<EmptyStateProps>) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-10 text-center shadow-2xl shadow-slate-950/30">
      <h2 className="text-lg font-semibold text-slate-100">No products found</h2>
      <p className="mt-2 text-sm text-slate-400">Try adjusting your search or filters.</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        Reset filters
      </button>
    </div>
  );
}

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    document.title = 'Products | MERN E-Commerce';
  }, []);

  const initialParams = useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const [filters, setFilters] = useState<ProductFiltersState>({
    search: initialParams.search,
    minPrice: initialParams.minPrice,
    maxPrice: initialParams.maxPrice,
    category: initialParams.category,
    inStock: initialParams.inStock,
  });

  useEffect(() => {
    setFilters({
      search: initialParams.search,
      minPrice: initialParams.minPrice,
      maxPrice: initialParams.maxPrice,
      category: initialParams.category,
      inStock: initialParams.inStock,
    });
  }, [initialParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (filters.search.trim()) nextParams.set('search', filters.search.trim());
    if (filters.minPrice.trim()) nextParams.set('minPrice', filters.minPrice.trim());
    if (filters.maxPrice.trim()) nextParams.set('maxPrice', filters.maxPrice.trim());
    if (filters.category) nextParams.set('category', filters.category);
    if (filters.inStock) nextParams.set('inStock', 'true');

    const timeout = globalThis.setTimeout(() => {
      if (nextParams.toString() !== searchParams.toString()) {
        setSearchParams(nextParams, { replace: true });
      }
    }, 300);

    return () => globalThis.clearTimeout(timeout);
  }, [filters, searchParams, setSearchParams]);

  const queryFilters = useMemo(
    () => ({
      search: filters.search.trim() || undefined,
      minPrice: toNumber(filters.minPrice),
      maxPrice: toNumber(filters.maxPrice),
      category: filters.category || undefined,
      inStock: filters.inStock ? true : undefined,
    }),
    [filters]
  );

  const categoriesQuery = useQuery({
    queryKey: ['product-categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  const productsQuery = useInfiniteQuery({
    queryKey: ['products', queryFilters],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchProducts({
        ...queryFilters,
        cursor: pageParam ?? undefined,
        limit: PAGE_LIMIT,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  });

  const products = useMemo<ProductListItem[]>(
    () => productsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [productsQuery.data]
  );

  const shouldAutoFetchNext = useCallback(() => {
    if (!productsQuery.hasNextPage) return;
    if (productsQuery.isFetchingNextPage) return;
    if (productsQuery.isLoading) return;
    productsQuery.fetchNextPage().catch(() => undefined);
  }, [productsQuery]);

  const { ref: sentinelRef } = useIntersectionObserver(shouldAutoFetchNext, {
    threshold: 0.25,
    rootMargin: '300px',
  });

  const handleResetFilters = useCallback(() => {
    setFilters({ search: '', minPrice: '', maxPrice: '', category: '', inStock: false });
  }, []);

  const hasNoProducts = !productsQuery.isLoading && products.length === 0;

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_52%,_#111827_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-7 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400/90">
                Explore Catalog
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Products</h1>
              <p className="mt-1 text-sm text-slate-400">
                Discover and filter products in real time.
              </p>
            </div>
            <p className="text-sm font-medium text-slate-400">
              {productsQuery.isLoading ? 'Loading products...' : `${products.length} items`}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <FilterSidebar
              filters={filters}
              categories={categoriesQuery.data ?? []}
              onChange={setFilters}
              onReset={handleResetFilters}
            />
          </div>

          <div className="lg:col-span-9">
            {hasNoProducts ? (
              <EmptyState onReset={handleResetFilters} />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {productsQuery.isLoading
                    ? INITIAL_SKELETONS.map((key) => <ProductCardSkeleton key={key} />)
                    : products.map((product) => <ProductCard key={product.id} product={product} />)}

                  {productsQuery.isFetchingNextPage &&
                    NEXT_SKELETONS.map((key) => <ProductCardSkeleton key={`next-${key}`} />)}
                </div>

                <div ref={sentinelRef} className="h-10" aria-hidden="true" />

                {!productsQuery.hasNextPage && products.length > 0 && (
                  <p className="mt-6 text-center text-sm font-medium text-slate-500">
                    All products loaded
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductListPage;
