import Link from 'next/link';
import { FaCalendar, FaUsers, FaLink } from 'react-icons/fa';

export default async function AMAPage() {
  // Mock data - will be replaced with API call
  const amas = [];

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
        {amas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No AMA sessions yet. Add some from the admin panel.
            </p>
            <Link
              href="/admin"
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AMA cards will be rendered here */}
          </div>
        )}
      </div>
    </div>
  );
}
