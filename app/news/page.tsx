import Link from 'next/link';
import { FaNewspaper, FaUser, FaCalendar, FaTags } from 'react-icons/fa';

async function getNews() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/news`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export default async function NewsPage() {
  const news = await getNews();

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
            {news.map((article: any) => (
              <div key={article._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {article.content}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <FaUser className="mr-2" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <FaNewspaper className="mr-2" />
                      <span className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
                        {article.category}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <FaCalendar className="mr-2" />
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex items-start text-gray-600 dark:text-gray-400 text-sm">
                        <FaTags className="mr-2 mt-1" />
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span key={idx} className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    href={`/news/${article._id}`}
                    className="block w-full bg-red-600 text-white py-2 rounded-lg font-semibold text-center hover:bg-red-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
