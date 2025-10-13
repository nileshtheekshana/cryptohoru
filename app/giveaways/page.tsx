import Link from 'next/link';

export default async function GiveawaysPage() {
  const giveaways = [];

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
              No giveaways available. Add some from the admin panel.
            </p>
            <Link
              href="/admin"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Giveaway cards will be rendered here */}
          </div>
        )}
      </div>
    </div>
  );
}
