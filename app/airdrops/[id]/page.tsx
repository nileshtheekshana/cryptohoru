import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCalendar, FaGlobe, FaTwitter, FaTelegram, FaDiscord, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import MarkdownRenderer from '@/components/MarkdownRenderer';

async function getAirdrop(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/airdrops/${id}`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching airdrop:', error);
    return null;
  }
}

export default async function AirdropDetailsPage({ params }: { params: { id: string } }) {
  const airdrop = await getAirdrop(params.id);

  if (!airdrop) {
    notFound();
  }

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

            {/* Tasks */}
            {airdrop.tasks && airdrop.tasks.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Tasks to Complete
                </h2>
                <div className="space-y-4">
                  {airdrop.tasks.map((task: any, index: number) => {
                    // Determine task status based on type or dates
                    const getTaskStatus = () => {
                      if (task.type === 'upcoming') return { label: 'Upcoming', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
                      if (task.type === 'ended') return { label: 'Ended', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
                      return { label: 'Ongoing', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
                    };
                    const taskStatus = getTaskStatus();
                    
                    return (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-500 transition"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {task.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${taskStatus.class}`}>
                                {taskStatus.label}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {task.description}
                            </p>
                            {task.reward && (
                              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                                <FaCheckCircle />
                                Reward: {task.reward}
                              </div>
                            )}
                            {task.link && taskStatus.label !== 'Ended' && (
                              <div className="mt-3">
                                <a
                                  href={task.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                    taskStatus.label === 'Upcoming' 
                                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                  {...(taskStatus.label === 'Upcoming' && { onClick: (e: any) => e.preventDefault() })}
                                >
                                  {taskStatus.label === 'Upcoming' ? 'Coming Soon' : 'Complete Task'} <FaExternalLinkAlt size={14} />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
                {airdrop.startDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</p>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <FaCalendar />
                      <span>{new Date(airdrop.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {airdrop.endDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</p>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <FaCalendar />
                      <span>{new Date(airdrop.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
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
