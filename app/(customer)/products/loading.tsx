// Streamed skeleton shown while the products listing query and page render.
// Matches the page.tsx structure (header + sidebar + grid) so the interim
// frame doesn't shift layout when the real content arrives.
export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="h-10 sm:h-12 lg:h-14 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
              <div className="h-4 sm:h-5 w-80 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block lg:w-1/4 space-y-4">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          </aside>

          <main className="lg:w-3/4">
            <div className="mb-6 h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="h-44 sm:h-40 md:h-44 lg:h-48 xl:h-52 bg-gray-200 rounded-lg animate-pulse mb-3" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
