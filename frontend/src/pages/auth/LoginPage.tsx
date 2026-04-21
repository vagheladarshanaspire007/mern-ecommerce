/**
 * Stub Pages — to be implemented during Days 41-43
 * These exist so the router doesn't crash on import.
 * Replace each stub with the real implementation.
 */

// ── LoginPage ─────────────────────────────────────────────────
// src/pages/auth/LoginPage.tsx
// TODO (Day 41): Implement with React Hook Form + Zod + authService.login()
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Login</h1>
        <p className="text-gray-500 text-sm">
          📋 TODO (Day 41): Implement login form
          <br />• Use React Hook Form + Zod resolver
          <br />• Dispatch loginUser thunk on submit
          <br />• Show error toasts on failure
          <br />• Redirect to previous page or /dashboard on success
        </p>
      </div>
    </div>
  );
}
