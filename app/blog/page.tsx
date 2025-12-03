import Link from 'next/link';
import { FaBlog, FaUser, FaCalendar, FaTags } from 'react-icons/fa';
import type { Metadata } from 'next';
import { stripMarkdown } from '@/lib/stripMarkdown';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Crypto Blog - Guides, Tutorials & Industry Insights",
  description: "Read in-depth crypto guides, blockchain tutorials, DeFi strategies, NFT insights, and expert analysis on cryptocurrency trends and market movements.",
  keywords: ["crypto blog", "blockchain guides", "DeFi tutorials", "NFT insights", "cryptocurrency analysis", "crypto education"],
  openGraph: {
    title: "Crypto Blog - Guides, Tutorials & Industry Insights",
    description: "Read in-depth crypto guides, blockchain tutorials, DeFi strategies, and expert analysis on cryptocurrency trends.",
    url: "https://cryptohoru.com/blog",
  },
};

async function getBlogs() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/blog`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl opacity-90">
            Read in-depth articles and guides about cryptocurrency
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No blog posts yet. Add some from the admin panel.
            </p>
            <Link
              href="/admin"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post: any) => (
              <div key={post._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition">
                <div className="w-full h-48 bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  {post.imageUrl || post.image ? (
                    <img src={post.imageUrl || post.image} alt={post.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="text-white text-center p-6">
                      <div className="text-4xl mb-2">📝</div>
                      <div className="font-bold text-lg line-clamp-2">{post.title}</div>
                      <div className="text-sm opacity-90">Blog Post</div>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {stripMarkdown(post.content)}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <FaUser className="mr-2" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <FaBlog className="mr-2" />
                      <span className="bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded">
                        {post.category}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <FaCalendar className="mr-2" />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-start text-gray-600 dark:text-gray-400 text-sm">
                        <FaTags className="mr-2 mt-1" />
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map((tag: string, idx: number) => (
                            <span key={idx} className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    href={`/blog/${post.slug || post._id}`}
                    className="block w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold text-center hover:bg-indigo-700 transition"
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
