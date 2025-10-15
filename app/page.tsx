import Link from 'next/link';
import { FaGift, FaComments, FaGamepad, FaNewspaper, FaBlog, FaParachuteBox } from 'react-icons/fa';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "CryptoHoru - Your Ultimate Crypto Airdrops & Giveaways Hub",
  description: "Discover the latest cryptocurrency airdrops, participate in AMA sessions, win crypto giveaways, explore P2E games, and stay updated with blockchain news. Join thousands earning free crypto daily.",
  openGraph: {
    title: "CryptoHoru - Your Ultimate Crypto Airdrops & Giveaways Hub",
    description: "Discover the latest cryptocurrency airdrops, participate in AMA sessions, win crypto giveaways, explore P2E games, and stay updated with blockchain news.",
    url: "https://cryptohoru.com",
    type: "website",
  },
};

export default function Home() {
  const features = [
    {
      icon: <FaParachuteBox className="text-5xl text-blue-500" />,
      title: 'Crypto Airdrops',
      description: 'Discover the latest crypto airdrops with detailed tasks that you can complete over time. Track ongoing airdrops that may last months or even a year.',
      href: '/airdrops',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <FaComments className="text-5xl text-purple-500" />,
      title: 'AMA Sessions',
      description: 'Join exclusive Ask Me Anything sessions with crypto project teams and industry leaders.',
      href: '/ama',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <FaGift className="text-5xl text-green-500" />,
      title: 'Giveaways',
      description: 'Participate in exciting crypto giveaways and win amazing prizes from various projects.',
      href: '/giveaways',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <FaGamepad className="text-5xl text-orange-500" />,
      title: 'P2E Games',
      description: 'Explore Play-to-Earn games where you can earn cryptocurrency while playing.',
      href: '/p2e-games',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <FaNewspaper className="text-5xl text-red-500" />,
      title: 'Crypto News',
      description: 'Stay updated with the latest cryptocurrency news and market trends.',
      href: '/news',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: <FaBlog className="text-5xl text-indigo-500" />,
      title: 'Blog',
      description: 'Read in-depth articles, guides, and tutorials about cryptocurrency and blockchain.',
      href: '/blog',
      color: 'from-indigo-500 to-purple-500'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Welcome to CryptoHoru
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Your one-stop platform for crypto airdrops, AMA sessions, giveaways, P2E games, and the latest cryptocurrency news
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/airdrops"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition transform hover:scale-105 shadow-xl"
            >
              Explore Airdrops
            </Link>
            <Link
              href="/auth/signup"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-lg transition transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br hover:from-gray-50 hover:to-white dark:hover:from-gray-800 dark:hover:to-gray-900"
              >
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Active Airdrops</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100+</div>
              <div className="text-lg opacity-90">AMA Sessions</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">P2E Games</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">1000+</div>
              <div className="text-lg opacity-90">Daily Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
            Ready to Start Your Crypto Journey?
          </h2>
          <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
            Join thousands of users tracking airdrops and earning crypto rewards
          </p>
          <Link
            href="/airdrops"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-10 py-4 rounded-lg transition transform hover:scale-105 shadow-xl"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="text-xl font-bold">CryptoHoru</h4>
              <p className="text-gray-400 text-sm">© 2025 All rights reserved</p>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-white transition">Privacy</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition">Terms</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

