/**
 * MainLayout — shared layout (Navbar + content) for all main pages
 */
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>

      {/* TODO: Add <Footer /> component */}
    </div>
  );
}
