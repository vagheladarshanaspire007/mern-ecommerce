import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } finally {
      setIsOpen(false);
      navigate('/login');
    }
  };

  if (!user) {
    return null;
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="relative">
      {/* Avatar / User Button */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open user menu"
        className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-gray-100"
      >
        {/* User Avatar */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
          aria-hidden="true"
        >
          {initials}
        </div>

        {/* User Name */}
        <span className="hidden max-w-32 truncate text-sm font-medium text-gray-700 lg:block">
          {user.firstName} {user.lastName}
        </span>

        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
        >
          {/* User Info */}
          <div className="border-b px-4 py-2">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </p>

            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>

          {/* Profile */}
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <UserCircle size={18} />
            Profile
          </Link>

          {/* Admin Dashboard */}
          {user.role === 'admin' && (
            <Link
              to="/admin"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Admin Dashboard
            </Link>
          )}

          {/* Logout */}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
