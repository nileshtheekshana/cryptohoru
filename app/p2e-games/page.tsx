import Link from 'next/link';

export default async function P2EGamesPage() {
  const games = [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Play-to-Earn Games</h1>
          <p className="text-xl opacity-90">
            Discover P2E games where you can earn cryptocurrency while playing
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {games.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No P2E games yet. Add some from the admin panel.
            </p>
            <Link
              href="/admin"
              className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Game cards will be rendered here */}
          </div>
        )}
      </div>
    </div>
  );
}
