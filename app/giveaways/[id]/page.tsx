import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaGift, FaCalendar, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import GiveawayTasks from '@/components/GiveawayTasks';
import GiveawayDates from '@/components/GiveawayDates';
import connectDB from '@/lib/mongodb';
import { Giveaway } from '@/models';
import type { Metadata } from 'next';
import { stripMarkdown } from '@/lib/stripMarkdown';
import mongoose from 'mongoose';

// Helper to find by ID or slug
async function findGiveaway(idOrSlug: string) {
  // Check if it's a valid MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await Giveaway.findById(idOrSlug).lean();
    if (byId) return byId;
  }
  // Try to find by slug
  return await Giveaway.findOne({ slug: idOrSlug }).lean();
}

async function getGiveaway(id: string) {
  try {
    await connectDB();
    const giveaway = await findGiveaway(id);
    return giveaway ? JSON.parse(JSON.stringify(giveaway)) : null;
  } catch (error) {
    console.error('Error fetching giveaway:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const giveaway = await getGiveaway(id);
  
  if (!giveaway) {
    return {
      title: 'Giveaway Not Found',
      description: 'The requested giveaway could not be found.',
    };
  }

  const description = stripMarkdown(giveaway.description).substring(0, 160);
  
  return {
    title: `${giveaway.title} - Win ${giveaway.prize}`,
    description: description || `Participate in ${giveaway.title} and win ${giveaway.prize}!`,
    keywords: [
      giveaway.title,
      'crypto giveaway',
      'win crypto',
      giveaway.prize,
      ...(giveaway.tags || []),
    ],
    openGraph: {
      title: `${giveaway.title} - Crypto Giveaway`,
      description: description,
      images: giveaway.imageUrl || giveaway.image ? [giveaway.imageUrl || giveaway.image] : ['/og-image.png'],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${giveaway.title} - Win ${giveaway.prize}`,
      description: description,
      images: giveaway.imageUrl || giveaway.image ? [giveaway.imageUrl || giveaway.image] : ['/og-image.png'],
    },
  };
}

export default async function GiveawayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const giveaway = await getGiveaway(id);

  if (!giveaway) {
    notFound();
  }

  // Calculate dynamic status based on endDate
  const getGiveawayStatus = (endDate: string): 'active' | 'ended' => {
    const now = new Date();
    const end = new Date(endDate);
    
    if (end < now) {
      return 'ended';
    } else {
      return 'active';
    }
  };

  const dynamicStatus = giveaway.endDate ? getGiveawayStatus(giveaway.endDate) : giveaway.status;
  const isGiveawayEnded = dynamicStatus === 'ended';

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

            {/* Tasks with Status Tracking */}
            {giveaway.tasks && giveaway.tasks.length > 0 && (
              <div className="mb-8">
                <GiveawayTasks 
                  giveawayId={giveaway._id}
                  tasks={giveaway.tasks}
                  isGiveawayEnded={isGiveawayEnded}
                />
              </div>
            )}

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
                    dynamicStatus === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {dynamicStatus === 'active' ? '🔴 Active' : 'Ended'}
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

                <GiveawayDates endDate={giveaway.endDate} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
