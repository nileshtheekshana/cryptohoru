import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaUsers, FaCalendar, FaLink, FaExternalLinkAlt } from 'react-icons/fa';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import AMADates from '@/components/AMADates';
import type { Metadata } from 'next';
import { stripMarkdown } from '@/lib/stripMarkdown';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';

async function getAMA(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/ama/${id}`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching AMA:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const ama = await getAMA(id);
  
  if (!ama) {
    return {
      title: 'AMA Not Found',
      description: 'The requested AMA session could not be found.',
    };
  }

  const description = stripMarkdown(ama.description).substring(0, 160);
  
  return {
    title: `${ama.title} - AMA with ${ama.project}`,
    description: description || `Join the AMA session with ${ama.project}. ${ama.host ? `Hosted by ${ama.host}.` : ''}`,
    keywords: [
      ama.title,
      ama.project,
      'crypto AMA',
      'ask me anything',
      ama.platform || 'live session',
      ...(ama.tags || []),
    ],
    openGraph: {
      title: `${ama.title} - Crypto AMA`,
      description: description,
      images: ama.image ? [ama.image] : ['/og-image.png'],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ama.title} - AMA with ${ama.project}`,
      description: description,
      images: ama.image ? [ama.image] : ['/og-image.png'],
    },
  };
}

export default async function AMADetailPage({ params }: { params: { id: string } }) {
  const ama = await getAMA(params.id);

  if (!ama) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8">
        <div className="container mx-auto px-6">
          <Link
            href="/ama"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition"
          >
            <FaArrowLeft /> Back to AMA Sessions
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{ama.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {ama.image && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
                <img
                  src={ama.image}
                  alt={ama.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                About this AMA
              </h2>
              <MarkdownRenderer content={ama.description} />

              {ama.platformLink && (
                <a
                  href={ama.platformLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Join AMA Session <FaExternalLinkAlt />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                AMA Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    ama.status === 'live'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : ama.status === 'upcoming'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {ama.status.charAt(0).toUpperCase() + ama.status.slice(1)}
                  </span>
                </div>

                {ama.project && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Project</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{ama.project}</p>
                  </div>
                )}

                {ama.host && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Host</p>
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{ama.host}</span>
                    </div>
                  </div>
                )}

                <AMADates date={ama.date} />

                {ama.platform && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Platform</p>
                    <div className="flex items-center gap-2">
                      <FaLink className="text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{ama.platform}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pre-AMA Activities Section */}
            {ama.preAMA && ama.status === 'upcoming' && ama.preAMADetails && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🎯</span>
                  <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200">
                    Pre-AMA Activities Available
                  </h3>
                </div>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {ama.preAMADetails}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
