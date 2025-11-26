import AMAList from '@/components/AMAList';
import type { Metadata } from 'next';

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

export default function AMAPage() {
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
        <AMAList />
      </div>
    </div>
  );
}
