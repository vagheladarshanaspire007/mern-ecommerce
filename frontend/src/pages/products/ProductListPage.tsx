import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, PackageOpen } from 'lucide-react';

import { useDebounce, useIntersectionObserver } from '@/hooks';
import { productService, type ProductFilters } from '@/services/product.service';

import { ProductCard } from '@/components/ui/ProductCard';
import { FilterSidebar } from '@/components/ui/FilterSidebar';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

const PAGE_SIZE = 20;

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchFromUrl = searchParams.get('search') ?? '';
  const minPriceFromUrl = searchParams.get('minPrice');
  const maxPriceFromUrl = searchParams.get('maxPrice');
  const categoryIdFromUrl = searchParams.get('categoryId') ?? undefined;
  const inStockFromUrl = searchParams.get('inStock') === 'true';

  const [search, setSearch] = useState(searchFromUrl);
  const debouncedSearch = useDebounce(search, 300);

  const filters = useMemo<ProductFilters>(
    () => ({
      search: debouncedSearch || undefined,
      minPrice: minPriceFromUrl !== null ? Number(minPriceFromUrl) : undefined,
      maxPrice: maxPriceFromUrl !== null ? Number(maxPriceFromUrl) : undefined,
      categoryId: categoryIdFromUrl,
      inStock: inStockFromUrl ? true : undefined,
      limit: PAGE_SIZE,
    }),
    [debouncedSearch, minPriceFromUrl, maxPriceFromUrl, categoryIdFromUrl, inStockFromUrl]
  );

  /*
   * Keep the search value synchronized with the URL.
   * The request is triggered only after the 300ms debounce.
   */
  useEffect(() => {
    const currentSearch = searchParams.get('search') ?? '';

    if (debouncedSearch === currentSearch) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);

    if (debouncedSearch) {
      nextParams.set('search', debouncedSearch);
    } else {
      nextParams.delete('search');
    }

    setSearchParams(nextParams, { replace: true });
  }, [debouncedSearch, searchParams, setSearchParams]);

  const productsQuery = useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: ({ pageParam }) =>
      productService.getProducts({
        ...filters,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const categoriesQuery = useQuery({
    queryKey: ['product-categories'],
    queryFn: productService.getCategories,
    staleTime: 5 * 60 * 1000,
  });

  /*
   * Destructure the query result so individual values can be used
   * as hook dependencies instead of the complete query object.
   */
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    productsQuery;

  const products = useMemo(() => data?.pages.flatMap((page) => page.products) ?? [], [data]);

  useEffect(() => {
    if (products.length === 0) {
      return;
    }

    const savedScrollPosition = sessionStorage.getItem('product-list-scroll-position');

    if (!savedScrollPosition) {
      return;
    }

    sessionStorage.removeItem('product-list-scroll-position');

    requestAnimationFrame(() => {
      window.scrollTo({
        top: Number(savedScrollPosition),
        behavior: 'auto',
      });
    });
  }, [products.length]);

  const updateFilters = useCallback(
    (nextFilters: ProductFilters) => {
      const nextParams = new URLSearchParams();

      if (nextFilters.search) {
        nextParams.set('search', nextFilters.search);
      }

      if (nextFilters.minPrice !== undefined) {
        nextParams.set('minPrice', String(nextFilters.minPrice));
      }

      if (nextFilters.maxPrice !== undefined) {
        nextParams.set('maxPrice', String(nextFilters.maxPrice));
      }

      if (nextFilters.categoryId) {
        nextParams.set('categoryId', nextFilters.categoryId);
      }

      if (nextFilters.inStock === true) {
        nextParams.set('inStock', 'true');
      }

      setSearchParams(nextParams);
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearch('');
    setSearchParams({});
  }, [setSearchParams]);

  /*
   * Load the next page when the infinite-scroll sentinel
   * becomes visible.
   */
  const loadNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { ref: sentinelRef } = useIntersectionObserver(loadNextPage, {
    threshold: 0.1,
  });

  const isInitialLoading = isLoading && !data;
  const hasProducts = products.length > 0;

  /*
   * Keep rendering states as independent conditions instead of
   * using nested ternary operations.
   */
  const showInitialLoading = isInitialLoading;
  const showError = !showInitialLoading && isError;
  const showEmpty = !showInitialLoading && !isError && !hasProducts;
  const showProducts = !showInitialLoading && !isError && hasProducts;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Products</h1>

        <p className="mt-1 text-sm text-gray-500">Browse our latest products</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>

        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          />

          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="mb-4 lg:hidden">
        <details className="rounded-lg border border-gray-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-4 font-medium text-gray-900">
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </summary>

          <div className="border-t border-gray-200 p-4">
            <FilterSidebar
              categories={categoriesQuery.data ?? []}
              filters={filters}
              onChange={updateFilters}
              onClear={clearFilters}
            />
          </div>
        </details>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Desktop Filters */}
        <div className="hidden lg:block">
          <FilterSidebar
            categories={categoriesQuery.data ?? []}
            filters={filters}
            onChange={updateFilters}
            onClear={clearFilters}
          />
        </div>

        {/* Product Section */}
        <section className="min-w-0 flex-1">
          {/* Initial Loading */}
          {showInitialLoading && (
            <div
              className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4"
              aria-label="Loading products"
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`product-skeleton-${index}`}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                >
                  <Skeleton className="aspect-square" />

                  <div className="space-y-3 p-4">
                    <Skeleton height="20px" />
                    <Skeleton width="60%" height="16px" />
                    <Skeleton width="40%" height="22px" />
                    <Skeleton height="36px" rounded="md" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {showError && (
            <EmptyState
              icon={<PackageOpen className="h-10 w-10" />}
              title="Unable to load products"
              description="Something went wrong while loading products. Please try again."
              action={
                <Button variant="primary" onClick={() => void refetch()}>
                  Try Again
                </Button>
              }
            />
          )}

          {/* Empty State */}
          {showEmpty && (
            <EmptyState
              icon={<PackageOpen className="h-10 w-10" />}
              title="No products found"
              description="Try changing your search or filters to find products."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              }
            />
          )}

          {/* Products */}
          {showProducts && (
            <>
              {/* Product Count */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {products.length} product
                  {products.length === 1 ? '' : 's'}
                </p>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Loading Next Page */}
              {isFetchingNextPage && (
                <div
                  className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4"
                  aria-label="Loading more products"
                >
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`next-skeleton-${index}`}
                      className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                    >
                      <Skeleton className="aspect-square" />

                      <div className="space-y-3 p-4">
                        <Skeleton height="20px" />
                        <Skeleton width="60%" height="16px" />
                        <Skeleton width="40%" height="22px" />
                        <Skeleton height="36px" rounded="md" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Infinite Scroll Sentinel */}
              <div ref={sentinelRef} className="h-8" aria-hidden="true" />

              {/* All Products Loaded */}
              {!hasNextPage && !isFetchingNextPage && (
                <p className="py-6 text-center text-sm text-gray-500">All products loaded.</p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default ProductListPage;
