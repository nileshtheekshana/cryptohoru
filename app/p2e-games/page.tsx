import Link from 'next/link';
import { FaGamepad, FaCoins, FaGlobe } from 'react-icons/fa';

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
              <div key={game._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                {game.imageUrl && (
                  <img src={game.imageUrl} alt={game.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{game.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    game.status === 'active' ? 'bg-green-100 text-green-800' : 
                    game.status === 'coming-soon' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {game.status.replace('-', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">{game.description}</p>
                
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

                <div className="flex gap-2">
                  <a
                    href={game.playLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
                  >
                    Play Now
                  </a>
                  {game.websiteUrl && (
                    <a
                      href={game.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
