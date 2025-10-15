import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaUsers, FaCalendar, FaLink, FaExternalLinkAlt } from 'react-icons/fa';

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
            {ama.imageUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
                <img
                  src={ama.imageUrl}
                  alt={ama.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                About this AMA
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-6">
                {ama.description}
              </p>

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

                {ama.date && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date & Time</p>
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {new Date(ama.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

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
          </div>
        </div>
      </div>
    </div>
  );
}
