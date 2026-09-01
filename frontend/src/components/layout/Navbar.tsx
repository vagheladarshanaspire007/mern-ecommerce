import { useState } from 'react';
import { Link, NavLink, useSearchParams } from 'react-router-dom';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useAppSelector } from '@/store';
import { selectCartItemCount } from '@/store/slices/cartSlice';
import { UserMenu } from './UserMenu';

export function Navbar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = useAppSelector(selectCartItemCount);
  const search = searchParams.get('search') ?? '';

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set('search', value);
    } else {
      params.delete('search');
    }

    setSearchParams(params);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link to="/products" className="shrink-0" aria-label="Go to products">
          <img src="/images/logo.jpeg" alt="MyStore" className="h-16 w-auto object-contain" />
        </Link>

        {/* Desktop Search */}
        <div className="hidden flex-1 md:block">
          <label htmlFor="navbar-search" className="sr-only">
            Search products
          </label>

          <div className="relative mx-auto max-w-xl">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />

            <input
              id="navbar-search"
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 md:flex">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive ? 'font-semibold text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`
            }
          >
            Products
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive ? 'font-semibold text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`
            }
          >
            Dashboard
          </NavLink>

          {/* Cart */}
          <NavLink
            to="/cart"
            aria-label={`Cart with ${cartItemCount} items`}
            className={({ isActive }) =>
              `relative rounded-lg p-2 transition ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <ShoppingCart size={22} />

            {cartItemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                {cartItemCount}
              </span>
            )}
          </NavLink>

          {/* User */}
          <UserMenu />
        </div>

        {/* Mobile Controls */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          {/* Mobile Cart */}
          <NavLink
            to="/cart"
            aria-label={`Cart with ${cartItemCount} items`}
            className="relative rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          >
            <ShoppingCart size={22} />

            {cartItemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                {cartItemCount}
              </span>
            )}
          </NavLink>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t bg-white px-4 py-4 md:hidden">
          {/* Mobile Search */}
          <div className="mb-4">
            <label htmlFor="mobile-navbar-search" className="sr-only">
              Search products
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />

              <input
                id="mobile-navbar-search"
                type="search"
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Mobile Links */}
          <div className="flex flex-col gap-2">
            <NavLink
              to="/products"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 font-semibold text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Products
            </NavLink>

            <NavLink
              to="/dashboard"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 font-semibold text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Dashboard
            </NavLink>

            {/* Mobile User Menu */}
            <div className="border-t pt-3">
              <UserMenu />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
