import Link from 'next/link';
import { FaCalendar, FaUsers, FaLink } from 'react-icons/fa';

async function getAMAs() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/ama`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching AMAs:', error);
    return [];
  }
}

export default async function AMAPage() {
  const amas = await getAMAs();

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
              No AMA sessions yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {amas.map((ama: any) => (
              <div key={ama._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                {ama.imageUrl && (
                  <img src={ama.imageUrl} alt={ama.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                )}
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{ama.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{ama.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-purple-500" />
                    <span><strong>Project:</strong> {ama.project}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-purple-500" />
                    <span>{new Date(ama.date).toLocaleDateString()} at {ama.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaLink className="text-purple-500" />
                    <span><strong>Platform:</strong> {ama.platform}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    ama.status === 'live' ? 'bg-green-100 text-green-800' :
                    ama.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ama.status.charAt(0).toUpperCase() + ama.status.slice(1)}
                  </span>
                </div>

                <Link
                  href={`/ama/${ama._id}`}
                  className="mt-4 block text-center bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
