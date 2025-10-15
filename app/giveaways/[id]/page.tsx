import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaGift, FaCalendar, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import MarkdownRenderer from '@/components/MarkdownRenderer';

async function getGiveaway(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/giveaways/${id}`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching giveaway:', error);
    return null;
  }
}

export default async function GiveawayDetailPage({ params }: { params: { id: string } }) {
  const giveaway = await getGiveaway(params.id);

  if (!giveaway) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-8">
        <div className="container mx-auto px-6">
          <Link
            href="/giveaways"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition"
          >
            <FaArrowLeft /> Back to Giveaways
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{giveaway.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {giveaway.imageUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
                <img
                  src={giveaway.imageUrl}
                  alt={giveaway.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                About this Giveaway
              </h2>
              <MarkdownRenderer content={giveaway.description} />

              {giveaway.link && (
                <a
                  href={giveaway.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Participate Now <FaExternalLinkAlt />
                </a>
              )}
            </div>

            {giveaway.requirements && giveaway.requirements.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Requirements to Enter
                </h2>
                <ul className="space-y-3">
                  {giveaway.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Giveaway Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    giveaway.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : giveaway.status === 'upcoming'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {giveaway.status.charAt(0).toUpperCase() + giveaway.status.slice(1)}
                  </span>
                </div>

                {giveaway.prize && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prize</p>
                    <div className="flex items-center gap-2">
                      <FaGift className="text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">{giveaway.prize}</span>
                    </div>
                  </div>
                )}

                {giveaway.project && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Project</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{giveaway.project}</p>
                  </div>
                )}

                {giveaway.endDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</p>
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {new Date(giveaway.endDate).toLocaleDateString()}
                      </span>
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
