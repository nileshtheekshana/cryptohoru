import GiveawayList from '@/components/GiveawayList';
import type { Metadata } from 'next';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';

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

export default function GiveawaysPage() {
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
        <GiveawayList />
      </div>
    </div>
  );
}
