import Link from 'next/link';
import { FaGift, FaCalendar, FaCheckCircle } from 'react-icons/fa';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Crypto Giveaways - Win Free Cryptocurrency & Prizes",
  description: "Participate in the latest crypto giveaways and win Bitcoin, Ethereum, NFTs, and other cryptocurrency prizes. Enter daily contests and win big in the crypto space.",
  keywords: ["crypto giveaways", "bitcoin giveaway", "free crypto", "cryptocurrency contest", "NFT giveaway", "win crypto"],
  openGraph: {
    title: "Crypto Giveaways - Win Free Cryptocurrency & Prizes",
    description: "Participate in the latest crypto giveaways and win Bitcoin, Ethereum, NFTs, and other cryptocurrency prizes.",
    url: "https://cryptohoru.com/giveaways",
  },
};

async function getGiveaways() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/giveaways`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching giveaways:', error);
    return [];
  }
}

export default async function GiveawaysPage() {
  const giveaways = await getGiveaways();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Giveaways</h1>
          <p className="text-xl opacity-90">
            Participate in exciting crypto giveaways and win amazing prizes
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {giveaways.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No giveaways available. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {giveaways.map((giveaway: any) => (
              <div key={giveaway._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition">
                <div className="w-full h-48 bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  {giveaway.imageUrl || giveaway.image ? (
                    <img src={giveaway.imageUrl || giveaway.image} alt={giveaway.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="text-white text-center p-6">
                      <div className="text-4xl mb-2">🎁</div>
                      <div className="font-bold text-lg">{giveaway.title}</div>
                      <div className="text-sm opacity-90">Giveaway</div>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{giveaway.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{giveaway.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FaGift className="text-green-500" />
                    <span><strong>Prize:</strong> {giveaway.prize}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FaCalendar className="text-green-500" />
                    <span><strong>Ends:</strong> {new Date(giveaway.endDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      giveaway.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {giveaway.status.charAt(0).toUpperCase() + giveaway.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Requirements:</p>
                  <ul className="space-y-1">
                    {giveaway.requirements.slice(0, 3).map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                    {giveaway.requirements.length > 3 && (
                      <li className="text-sm text-gray-500 dark:text-gray-500 italic">
                        +{giveaway.requirements.length - 3} more requirements...
                      </li>
                    )}
                  </ul>
                </div>

                <Link
                  href={`/giveaways/${giveaway._id}`}
                  className="mt-auto block text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
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
