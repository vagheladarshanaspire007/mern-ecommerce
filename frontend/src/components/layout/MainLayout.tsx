/**
 * MainLayout — shared layout (Navbar + content) for all main pages
 */
import { Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* TODO (Day 42): Add <Navbar /> component here */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-gray-500 text-sm">
            🛠 TODO: Implement Navbar with cart icon, user menu, search bar
          </p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      {/* TODO: Add <Footer /> component */}
    </div>
  );
}
