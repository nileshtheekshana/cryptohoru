import Link from 'next/link';

export default async function NewsPage() {
  const news = [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Crypto News</h1>
          <p className="text-xl opacity-90">
            Stay updated with the latest cryptocurrency news and market trends
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {news.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No news articles yet. Add some from the admin panel.
            </p>
            <Link
              href="/admin"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* News cards will be rendered here */}
          </div>
        )}
      </div>
    </div>
  );
}
