/**
 * PageLoader — full-page loading spinner for Suspense boundaries
 */
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
        <p className="mt-4 text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
