import AMAClientList from '@/components/AMAClientList';
import connectDB from '@/lib/mongodb';
import { AMA } from '@/models';
import type { Metadata } from 'next';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Crypto AMA Sessions - Ask Me Anything with Project Teams",
  description: "Join live cryptocurrency AMA sessions with blockchain project founders and teams. Get your questions answered directly from crypto experts and industry leaders.",
  keywords: ["crypto AMA", "ask me anything crypto", "blockchain AMA", "crypto Q&A", "project AMA sessions"],
  openGraph: {
    title: "Crypto AMA Sessions - Ask Me Anything with Project Teams",
    description: "Join live cryptocurrency AMA sessions with blockchain project founders and teams.",
    url: "https://cryptohoru.com/ama",
  },
};

async function getAMAs() {
  try {
    await connectDB();
    
    // Get all non-hidden AMAs and recalculate status
    const now = new Date();
    const nowTime = now.getTime();
    const allAMAs = await AMA.find({ status: { $ne: 'hidden' } }).lean();
    
    // Recalculate status for each AMA
    const updatedAMAs = allAMAs.map(ama => {
      const amaDateTime = new Date(ama.date);
      const amaStartTime = amaDateTime.getTime();
      const amaEndTime = amaStartTime + (2 * 60 * 60 * 1000); // 2 hours
      
      let status = ama.status;
      if (nowTime >= amaStartTime && nowTime <= amaEndTime) {
        status = 'live';
      } else if (nowTime < amaStartTime) {
        status = 'upcoming';
      } else {
        status = 'completed';
      }
      
      return { ...ama, status };
    });
    
    // Separate by calculated status
    const liveAMAs = updatedAMAs.filter(ama => ama.status === 'live').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const upcomingAMAs = updatedAMAs.filter(ama => ama.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 100);
    const completedAMAs = updatedAMAs.filter(ama => ama.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

    return {
      liveAMAs: JSON.parse(JSON.stringify(liveAMAs)),
      upcomingAMAs: JSON.parse(JSON.stringify(upcomingAMAs)),
      completedAMAs: JSON.parse(JSON.stringify(completedAMAs)),
    };
  } catch (error) {
    console.error('Error fetching AMAs:', error);
    return {
      liveAMAs: [],
      upcomingAMAs: [],
      completedAMAs: [],
    };
  }
}

export default async function AMAPage() {
  const { liveAMAs, upcomingAMAs, completedAMAs } = await getAMAs();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">AMA Sessions</h1>
          <p className="text-xl opacity-90">
            Join exclusive Ask Me Anything sessions with crypto project teams
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <AMAClientList 
          initialLiveAMAs={liveAMAs}
          initialUpcomingAMAs={upcomingAMAs}
          initialCompletedAMAs={completedAMAs}
        />
      </div>
    </div>
  );
}
