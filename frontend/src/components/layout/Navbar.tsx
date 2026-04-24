import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { selectCartItemCount } from '@/store/slices/cartSlice';
import { UserMenu } from '@/components/layout/UserMenu';

interface NavigationLink {
  to: string;
  label: string;
  end?: boolean;
}

export function Navbar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') ?? '';
  const [searchValue, setSearchValue] = useState(searchFromUrl);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = useAppSelector(selectCartItemCount);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const navLinks = useMemo<NavigationLink[]>(
    () => [
      { to: '/', label: 'Home', end: true },
      { to: '/products', label: 'Products' },
      ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
    ],
    [isAuthenticated]
  );

  useEffect(() => {
    setSearchValue(searchFromUrl);
  }, [searchFromUrl]);

  const handleSearchChange = (nextValue: string) => {
    setSearchValue(nextValue);
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);
      if (nextValue) {
        nextParams.set('search', nextValue);
      } else {
        nextParams.delete('search');
      }
      return nextParams;
    });
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
      isActive
        ? 'bg-slate-100 text-slate-950'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-backdrop-filter:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 md:gap-4 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-800 text-slate-200 transition hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:hidden"
              onClick={() => setIsMobileMenuOpen((previous) => !previous)}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <span className="sr-only">Toggle navigation menu</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
                <path
                  d={isMobileMenuOpen ? 'M6 6L18 18M18 6L6 18' : 'M4 7H20M4 12H20M4 17H20'}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <Link
              to="/"
              className="rounded-md text-lg font-bold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              E-Commerce
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClasses}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="hidden w-full max-w-md flex-1 items-center md:flex ">
            <label htmlFor="desktop-site-search" className="sr-only">
              Search products
            </label>
            <div className="relative w-full">
              <input
                id="desktop-site-search"
                type="search"
                value={searchValue}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-400 transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200/20"
              />
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
                fill="none"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              aria-label="View cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-200 shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
                <path
                  d="M3 4H5L7.2 14.5H17.8L20 7H6.2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="19" r="1.5" fill="currentColor" />
                <circle cx="17" cy="19" r="1.5" fill="currentColor" />
              </svg>

              {cartItemCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-semibold text-white">
                  {cartItemCount}
                </span>
              ) : null}
            </Link>

            <UserMenu user={user} isAuthenticated={isAuthenticated} />
          </div>
        </div>

        <div className="md:hidden">
          <label htmlFor="mobile-site-search" className="sr-only">
            Search products
          </label>
          <div className="relative">
            <input
              id="mobile-site-search"
              type="search"
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-400 transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200/20"
            />
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
              fill="none"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </div>
        </div>

        <div
          id="mobile-navigation"
          aria-hidden={!isMobileMenuOpen}
          className={`${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden transition-all duration-200 md:hidden`}
        >
          <nav
            className="flex flex-col gap-1 border-t border-slate-800 pt-3"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navLinkClasses}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            <Link
              to="/cart"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cart {cartItemCount > 0 ? `(${cartItemCount})` : ''}
            </Link>

            <div className="px-1 pt-2">
              <UserMenu
                user={user}
                isAuthenticated={isAuthenticated}
                onNavigate={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
