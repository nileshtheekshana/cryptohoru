import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaGamepad, FaCoins, FaGlobe, FaExternalLinkAlt } from 'react-icons/fa';
import MarkdownRenderer from '@/components/MarkdownRenderer';

async function getP2EGame(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/p2e/${id}`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching P2E game:', error);
    return null;
  }
}

export default async function P2EDetailPage({ params }: { params: { id: string } }) {
  const game = await getP2EGame(params.id);

  if (!game) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-8">
        <div className="container mx-auto px-6">
          <Link
            href="/p2e-games"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition"
          >
            <FaArrowLeft /> Back to P2E Games
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{game.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {game.imageUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                About this Game
              </h2>
              <MarkdownRenderer content={game.description} />

              <div className="flex flex-wrap gap-4 mt-6">
                {game.playLink && (
                  <a
                    href={game.playLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
                  >
                    Play Now <FaExternalLinkAlt />
                  </a>
                )}
                {game.websiteUrl && (
                  <a
                    href={game.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-orange-600 text-orange-600 dark:text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition font-semibold"
                  >
                    Visit Website <FaGlobe />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Game Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    game.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : game.status === 'coming-soon'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {game.status === 'coming-soon' ? 'Coming Soon' : game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                  </span>
                </div>

                {game.gameType && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Game Type</p>
                    <div className="flex items-center gap-2">
                      <FaGamepad className="text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{game.gameType}</span>
                    </div>
                  </div>
                )}

                {game.blockchain && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Blockchain</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{game.blockchain}</p>
                  </div>
                )}

                {game.tokenSymbol && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Token</p>
                    <div className="flex items-center gap-2">
                      <FaCoins className="text-orange-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">{game.tokenSymbol}</span>
                    </div>
                  </div>
                )}

                {game.earnings && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Potential Earnings</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">{game.earnings}</p>
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
