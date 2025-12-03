import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCalendar, FaGlobe, FaTwitter, FaTelegram, FaDiscord, FaCheckCircle } from 'react-icons/fa';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import AirdropTasks from '@/components/AirdropTasks';
import FollowAirdropButton from '@/components/FollowAirdropButton';
import AirdropDates from '@/components/AirdropDates';
import connectDB from '@/lib/mongodb';
import { Airdrop } from '@/models';
import type { Metadata } from 'next';
import { stripMarkdown } from '@/lib/stripMarkdown';

async function getAirdrop(id: string) {
  try {
    await connectDB();
    const airdrop = await Airdrop.findById(id).lean();
    return airdrop ? JSON.parse(JSON.stringify(airdrop)) : null;
  } catch (error) {
    console.error('Error fetching airdrop:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const airdrop = await getAirdrop(id);
  
  if (!airdrop) {
    return {
      title: 'Airdrop Not Found',
      description: 'The requested airdrop could not be found.',
    };
  }

  const description = stripMarkdown(airdrop.description).substring(0, 160);
  
  return {
    title: `${airdrop.title} - Crypto Airdrop`,
    description: description || `Participate in ${airdrop.title} airdrop and earn free crypto rewards.`,
    keywords: [
      airdrop.title,
      'crypto airdrop',
      'free crypto',
      airdrop.blockchain || 'blockchain',
      ...(airdrop.tags || []),
    ],
    openGraph: {
      title: `${airdrop.title} - Crypto Airdrop`,
      description: description,
      images: airdrop.image ? [airdrop.image] : ['/og-image.png'],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${airdrop.title} - Crypto Airdrop`,
      description: description,
      images: airdrop.image ? [airdrop.image] : ['/og-image.png'],
    },
  };
}

export default async function AirdropDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const airdrop = await getAirdrop(id);

  if (!airdrop) {
    notFound();
  }

  // Check if airdrop has ended
  const isAirdropEnded = airdrop.endDate && new Date(airdrop.endDate) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-6">
          <Link
            href="/airdrops"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition"
          >
            <FaArrowLeft /> Back to Airdrops
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{airdrop.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image */}
            {airdrop.image && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <img
                  src={airdrop.image}
                  alt={airdrop.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                About this Airdrop
              </h2>
              <MarkdownRenderer content={airdrop.description} />
            </div>

            {/* Tasks with Status Tracking */}
            {airdrop.tasks && airdrop.tasks.length > 0 && (
              <AirdropTasks 
                airdropId={airdrop._id}
                tasks={airdrop.tasks}
                isAirdropEnded={isAirdropEnded}
              />
            )}

            {/* Requirements */}
            {airdrop.requirements && airdrop.requirements.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Requirements
                </h2>
                <ul className="space-y-3">
                  {airdrop.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Airdrop Info
              </h3>
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      airdrop.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : airdrop.status === 'upcoming'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {airdrop.status.charAt(0).toUpperCase() + airdrop.status.slice(1)}
                  </span>
                </div>

                {/* Reward */}
                {airdrop.reward && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reward</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{airdrop.reward}</p>
                  </div>
                )}

                {/* Blockchain */}
                {airdrop.blockchain && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Blockchain</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{airdrop.blockchain}</p>
                  </div>
                )}

                {/* Category */}
                {airdrop.category && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{airdrop.category}</p>
                  </div>
                )}

                {/* Dates */}
                <AirdropDates startDate={airdrop.startDate} endDate={airdrop.endDate} />
              </div>
            </div>

            {/* Follow Button */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <FollowAirdropButton airdropId={airdrop._id} />
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Links
              </h3>
              <div className="space-y-3">
                {airdrop.website && (
                  <a
                    href={airdrop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    <FaGlobe size={20} />
                    <span>Website</span>
                  </a>
                )}
                {airdrop.twitter && (
                  <a
                    href={airdrop.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    <FaTwitter size={20} />
                    <span>Twitter</span>
                  </a>
                )}
                {airdrop.telegram && (
                  <a
                    href={airdrop.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    <FaTelegram size={20} />
                    <span>Telegram</span>
                  </a>
                )}
                {airdrop.discord && (
                  <a
                    href={airdrop.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    <FaDiscord size={20} />
                    <span>Discord</span>
                  </a>
                )}
              </div>
            </div>

            {/* Tags */}
            {airdrop.tags && airdrop.tags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {airdrop.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
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
