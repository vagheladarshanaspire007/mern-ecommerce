import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from '@/store/slices/authSlice';
import { clearCart } from '@/store/slices/cartSlice';
import { useAppDispatch } from '@/store';
import type { User } from '@/types/auth.types';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

interface UserMenuProps {
  user: User | null;
  isAuthenticated: boolean;
  onNavigate?: () => void;
}

export function UserMenu({ user, isAuthenticated, onNavigate }: Readonly<UserMenuProps>) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const initials = useMemo(() => {
    if (!user) return 'G';
    const first = user.firstName?.[0] ?? '';
    const last = user.lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase() || 'U';
  }, [user]);

  const avatarSrc = resolveImageUrl(user?.profileImageUrl);

  useEffect(() => {
    setHasImageError(false);
  }, [avatarSrc]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(clearCart());
      navigate('/login', { replace: true });
      onNavigate?.();
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  const handleMenuEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  const triggerClasses =
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-sm font-semibold text-slate-100 shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

  const menuItemClasses =
    'block w-full rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={triggerClasses}
        aria-label="Open user menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        {user?.profileImageUrl && !hasImageError ? (
          <img
            src={avatarSrc}
            alt={`${user?.firstName ?? 'User'} avatar`}
            loading="lazy"
            width={40}
            height={40}
            className="h-full w-full rounded-full object-cover"
            onError={() => {
              setHasImageError(true);
            }}
          />
        ) : (
          initials
        )}
      </button>

      {isOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label="User menu"
          tabIndex={-1}
          onKeyDown={handleMenuEscape}
          className="absolute right-0 z-60 mt-2 w-56 rounded-lg border border-slate-800 bg-slate-950 p-2 shadow-2xl"
        >
          <div className="mb-2 border-b border-slate-800 px-3 pb-2">
            <p className="truncate text-sm font-medium text-white">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </p>
            <p className="truncate text-xs text-slate-400">{user?.email ?? 'Not signed in'}</p>
          </div>

          {isAuthenticated ? (
            <div className="space-y-1">
              <Link
                to="/profile"
                role="menuitem"
                className={menuItemClasses}
                onClick={() => {
                  setIsOpen(false);
                  onNavigate?.();
                }}
              >
                Profile
              </Link>

              {user?.role === 'admin' ? (
                <Link
                  to="/admin"
                  role="menuitem"
                  className={menuItemClasses}
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate?.();
                  }}
                >
                  Admin Dashboard
                </Link>
              ) : null}

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`${menuItemClasses} text-rose-400 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60`}
                aria-label="Log out"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                to="/login"
                role="menuitem"
                className={menuItemClasses}
                onClick={() => {
                  setIsOpen(false);
                  onNavigate?.();
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                role="menuitem"
                className={menuItemClasses}
                onClick={() => {
                  setIsOpen(false);
                  onNavigate?.();
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
