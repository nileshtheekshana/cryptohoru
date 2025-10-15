import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaUser, FaCalendar, FaTags, FaBlog } from 'react-icons/fa';

async function getBlog(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/blog/${id}`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  const post = await getBlog(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition"
          >
            <FaArrowLeft /> Back to Blog
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{post.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {post.imageUrl && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FaUser className="mr-2" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FaCalendar className="mr-2" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <FaBlog className="mr-2 text-gray-600 dark:text-gray-400" />
                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded">
                  {post.category}
                </span>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {post.content}
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <FaTags className="text-gray-600 dark:text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
