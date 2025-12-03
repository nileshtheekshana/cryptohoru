import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaUser, FaCalendar, FaTags, FaNewspaper, FaExternalLinkAlt } from 'react-icons/fa';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import type { Metadata } from 'next';
import { stripMarkdown } from '@/lib/stripMarkdown';

async function getNews(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/news/${id}`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getNews(params.id);
  
  if (!article) {
    return {
      title: 'News Not Found',
      description: 'The requested news article could not be found.',
    };
  }

  const description = stripMarkdown(article.content).substring(0, 160);
  
  return {
    title: article.title,
    description: description,
    keywords: [
      article.title,
      article.category || 'crypto news',
      'cryptocurrency news',
      'blockchain news',
      ...(article.tags || []),
    ],
    authors: [{ name: article.author || 'CryptoHoru' }],
    openGraph: {
      title: article.title,
      description: description,
      images: article.image || article.imageUrl ? [article.image || article.imageUrl] : ['/og-image.png'],
      type: 'article',
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: description,
      images: article.image || article.imageUrl ? [article.image || article.imageUrl] : ['/og-image.png'],
    },
  };
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const article = await getNews(params.id);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-8">
        <div className="container mx-auto px-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition"
          >
            <FaArrowLeft /> Back to News
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{article.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {article.imageUrl && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FaUser className="mr-2" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FaCalendar className="mr-2" />
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <FaNewspaper className="mr-2 text-gray-600 dark:text-gray-400" />
                <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 px-3 py-1 rounded">
                  {article.category}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <MarkdownRenderer content={article.content} />
            </div>

            {article.sourceUrl && (
              <div className="mb-6">
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Read Original Source <FaExternalLinkAlt />
                </a>
              </div>
            )}

            {article.tags && article.tags.length > 0 && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <FaTags className="text-gray-600 dark:text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: string, index: number) => (
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
