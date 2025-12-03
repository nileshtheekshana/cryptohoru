import Link from 'next/link';
import { FaExternalLinkAlt, FaTwitter, FaTelegram, FaDiscord, FaGlobe, FaClock, FaCheckCircle } from 'react-icons/fa';
import type { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import { Airdrop as AirdropModel } from '@/models';
import AirdropCardList from '@/components/AirdropCardList';

interface Task {
  _id?: string;
  title: string;
  description: string;
  type?: string;
  reward?: string;
  link?: string;
}

interface Airdrop {
  _id: string;
  title: string;
  description: string;
  image?: string;
  status: 'active' | 'upcoming' | 'ended';
  reward?: string;
  blockchain?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  tags?: string[];
  requirements?: string[];
  tasks?: Task[];
  createdAt?: string;
}

export const metadata: Metadata = {
  title: "Crypto Airdrops - Free Token Distribution & Rewards",
  description: "Find the latest cryptocurrency airdrops with detailed tasks. Participate in Bitcoin, Ethereum, and altcoin airdrops. Track ongoing airdrops and earn free crypto tokens daily.",
  keywords: ["crypto airdrops", "free tokens", "airdrop crypto", "bitcoin airdrop", "ethereum airdrop", "free cryptocurrency", "token distribution"],
  openGraph: {
    title: "Crypto Airdrops - Free Token Distribution & Rewards",
    description: "Find the latest cryptocurrency airdrops with detailed tasks. Participate in Bitcoin, Ethereum, and altcoin airdrops.",
    url: "https://cryptohoru.com/airdrops",
  },
};

async function getAirdrops(): Promise<Airdrop[]> {
  try {
    await connectDB();
    // Exclude hidden airdrops from public listing
    const airdrops = await AirdropModel.find({ status: { $ne: 'hidden' } }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(airdrops));
  } catch (error) {
    console.error('Error fetching airdrops:', error);
    return [];
  }
}

export default async function AirdropsPage() {
  const airdrops = await getAirdrops();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Crypto Airdrops</h1>
          <p className="text-xl opacity-90">
            Discover and participate in the latest cryptocurrency airdrops. Complete tasks over time as they become available.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            All
          </button>
          <button className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600">
            Active
          </button>
          <button className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600">
            Upcoming
          </button>
          <button className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600">
            Ended
          </button>
        </div>

        {/* Airdrops Grid */}
        {airdrops.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No airdrops found. Connect your MongoDB database to see real data.
            </p>
            <Link
              href="/admin"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <AirdropCardList airdrops={airdrops} />
        )}
      </div>
    </div>
  );
}
