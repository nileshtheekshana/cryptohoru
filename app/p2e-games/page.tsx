import Link from 'next/link';
import { FaGamepad, FaCoins, FaGlobe } from 'react-icons/fa';
import type { Metadata } from 'next';
import { stripMarkdown } from '@/lib/stripMarkdown';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Play-to-Earn Games - Earn Crypto While Gaming",
  description: "Discover the best P2E (Play-to-Earn) games where you can earn cryptocurrency and NFTs while playing. Explore blockchain games on Ethereum, Polygon, BSC, and more.",
  keywords: ["play to earn games", "P2E games", "crypto games", "blockchain games", "earn crypto gaming", "NFT games", "GameFi"],
  openGraph: {
    title: "Play-to-Earn Games - Earn Crypto While Gaming",
    description: "Discover the best P2E (Play-to-Earn) games where you can earn cryptocurrency and NFTs while playing.",
    url: "https://cryptohoru.com/p2e-games",
  },
};

async function getP2EGames() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/p2e`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching P2E games:', error);
    return [];
  }
}

export default async function P2EGamesPage() {
  const games = await getP2EGames();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Play-to-Earn Games</h1>
          <p className="text-xl opacity-90">
            Discover P2E games where you can earn cryptocurrency while playing
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {games.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No P2E games yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game: any) => (
              <div key={game._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition">
                <div className="w-full h-48 bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  {game.imageUrl || game.image ? (
                    <img src={game.imageUrl || game.image} alt={game.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="text-white text-center p-6">
                      <div className="text-4xl mb-2">🎮</div>
                      <div className="font-bold text-lg">{game.title}</div>
                      <div className="text-sm opacity-90">P2E Game</div>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{game.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{stripMarkdown(game.description)}</p>
                  
                  <div className="flex gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      game.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                      game.status === 'coming-soon' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {game.status.replace('-', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FaGamepad className="text-orange-500" />
                    <span><strong>Type:</strong> {game.gameType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaGlobe className="text-orange-500" />
                    <span><strong>Blockchain:</strong> {game.blockchain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCoins className="text-orange-500" />
                    <span><strong>Token:</strong> {game.tokenSymbol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCoins className="text-orange-500" />
                    <span><strong>Earnings:</strong> {game.earnings}</span>
                  </div>
                </div>

                <Link
                  href={`/p2e-games/${game.slug || game._id}`}
                  className="mt-auto block text-center bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
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
