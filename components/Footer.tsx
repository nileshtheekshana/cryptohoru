import Link from 'next/link';
import { FaTiktok, FaTelegram, FaFacebook, FaTwitter, FaReddit, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  const socialLinks = [
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@cryptohoru?lang=en',
      icon: <FaTiktok className="w-6 h-6" />,
      color: 'hover:text-pink-500'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/cryptohoru',
      icon: <FaTelegram className="w-6 h-6" />,
      color: 'hover:text-blue-400'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/cryptohoru',
      icon: <FaFacebook className="w-6 h-6" />,
      color: 'hover:text-blue-600'
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/cryptohoru',
      icon: <FaTwitter className="w-6 h-6" />,
      color: 'hover:text-sky-400'
    },
    {
      name: 'Reddit',
      url: 'https://www.reddit.com/r/cryptohoru/',
      icon: <FaReddit className="w-6 h-6" />,
      color: 'hover:text-orange-500'
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@cryptohoru/',
      icon: <FaYoutube className="w-6 h-6" />,
      color: 'hover:text-red-600'
    },
  ];

  const quickLinks = [
    { name: 'Airdrops', href: '/airdrops' },
    { name: 'AMA Sessions', href: '/ama' },
    { name: 'Giveaways', href: '/giveaways' },
    { name: 'P2E Games', href: '/p2e-games' },
    { name: 'News', href: '/news' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h4 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              CryptoHoru
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Your ultimate platform for crypto airdrops, AMA sessions, giveaways, P2E games, and the latest cryptocurrency news.
            </p>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} CryptoHoru. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Follow Us</h5>
            <div className="grid grid-cols-3 gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 ${social.color} transition duration-200 flex items-center justify-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transform hover:scale-110`}
                  aria-label={social.name}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <div className="mt-6">
              <a
                href="https://www.facebook.com/groups/cryptohoru"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-500 transition duration-200"
              >
                <FaFacebook className="w-5 h-5" />
                Join our Facebook Group
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="mb-4 md:mb-0">
              <p>Made with ❤️ by the CryptoHoru Team</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="hover:text-white transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-white transition">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
