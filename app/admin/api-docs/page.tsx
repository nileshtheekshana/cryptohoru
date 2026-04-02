import Link from 'next/link';
import { FaArrowLeft, FaCode, FaKey } from 'react-icons/fa';

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-6 max-w-5xl">
        <Link
          href="/admin/api-keys"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <FaArrowLeft /> Back to API Keys
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white flex items-center gap-3 mb-4">
            <FaCode className="text-blue-600" />
            API Documentation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Complete guide to using the CryptoHoru external API
          </p>

          {/* Authentication */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FaKey className="text-blue-600" /> Authentication
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              All API requests require an API key. Include your key in the <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">X-API-Key</code> header.
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre>{`curl -X POST https://cryptohoru.com/api/v1/airdrops \\
  -H "X-API-Key: ck_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{ ... }'`}</pre>
            </div>
          </section>

          {/* Rate Limits */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Rate Limits</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Each API key has a daily rate limit (default: 100 requests per day). Rate limits reset at midnight UTC.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>429 Too Many Requests:</strong> You've exceeded your daily rate limit. Wait until tomorrow or contact admin to increase your limit.
              </p>
            </div>
          </section>

          {/* Endpoints */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Endpoints</h2>

            {/* Airdrops */}
            <div className="mb-8 border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                POST /api/v1/airdrops
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create a new airdrop. Requires <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-sm">create:airdrop</code> permission.
              </p>
              
              <h4 className="font-bold text-gray-800 dark:text-white mb-2">Request Body:</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <pre>{`{
  "title": "SuperToken Airdrop",
  "description": "Get 1000 SUPER tokens by completing tasks",
  "category": "Airdrop",
  "cost": "Free",
  "image": "/images/super-airdrop.jpg",
  "reward": "100,000 SUPER",
  "blockchain": "Ethereum",
  "status": "active",
  "startDate": "2025-12-17T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z",
  "requirements": ["Follow on Twitter", "Join Telegram", "Verify wallet"],
  "tasks": [
    {
      "title": "Follow Twitter",
      "description": "Follow @supertoken on Twitter",
      "type": "social",
      "reward": "100 SUPER",
      "link": "https://twitter.com/supertoken",
      "order": 0
    }
  ],
  "tags": ["DeFi", "Token"],
  "website": "https://supertoken.io",
  "twitter": "https://twitter.com/supertoken",
  "telegram": "https://t.me/supertoken",
  "discord": "https://discord.gg/supertoken",
  "slug": "supertoken-airdrop"
}`}</pre>
              </div>

              <h4 className="font-bold text-gray-800 dark:text-white mb-2">Response (Success):</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre>{`{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "slug": "supertoken-airdrop",
    "url": "https://cryptohoru.com/airdrops/supertoken-airdrop"
  }
}`}</pre>
              </div>
            </div>

            {/* AMAs */}
            <div className="mb-8 border-l-4 border-purple-500 pl-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                POST /api/v1/ama
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create a new AMA event. Requires <code className="bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded text-sm">create:ama</code> permission.
              </p>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <pre>{`{
  "title": "SuperToken AMA Session",
  "description": "Join us for an exciting AMA session!",
  "image": "/images/super-ama.jpg",
  "cost": "Free",
  "project": "SuperToken",
  "host": "John Doe, CEO",
  "date": "2025-12-25T18:00:00Z",
  "platform": "Twitter Spaces",
  "link": "https://twitter.com/i/spaces/xxx",
  "rewards": "1000 SUPER tokens for participants",
  "preAMA": true,
  "preAMADetails": "Submit questions in Telegram before the event",
  "status": "upcoming",
  "tags": ["DeFi", "AMA"],
  "tasks": [
    {
      "title": "Submit Your Question",
      "description": "Drop a question in our Telegram group",
      "type": "social",
      "link": "https://t.me/supertoken",
      "reward": "50 USDT"
    }
  ],
  "slug": "supertoken-ama-december"
}`}</pre>
              </div>
            </div>

            {/* Giveaways */}
            <div className="mb-8 border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                POST /api/v1/giveaways
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create a new giveaway. Requires <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-sm">create:giveaway</code> permission.
              </p>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <pre>{`{
  "title": "5 ETH Giveaway",
  "description": "Win 1 ETH by completing simple tasks!",
  "image": "/images/eth-giveaway.jpg",
  "cost": "Free",
  "prize": "5 ETH",
  "winners": 5,
  "endDate": "2025-12-31T23:59:59Z",
  "status": "active",
  "requirements": ["Follow Twitter", "Retweet pinned post", "Tag 3 friends"],
  "tasks": [
    {
      "title": "Follow Twitter",
      "description": "Follow @cryptohoru on Twitter",
      "type": "social",
      "link": "https://twitter.com/cryptohoru",
      "reward": "1 Entry"
    }
  ],
  "link": "https://twitter.com/cryptohoru",
  "tags": ["Giveaway", "ETH"]
}`}</pre>
              </div>
            </div>

            {/* Blog */}
            <div className="mb-8 border-l-4 border-orange-500 pl-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                POST /api/v1/blog
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create a new blog post. Requires <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded text-sm">create:blog</code> permission.
              </p>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <pre>{`{
  "title": "Top 10 Crypto Trends in 2025",
  "content": "Full markdown content here...",
  "excerpt": "A brief summary of the article",
  "image": "/images/crypto-trends.jpg",
  "imageUrl": "https://example.com/image.jpg",
  "author": "AI Writer",
  "category": "Analysis",
  "tags": ["Trends", "Analysis", "2025"],
  "published": true
}`}</pre>
              </div>
            </div>

            {/* News */}
            <div className="mb-8 border-l-4 border-red-500 pl-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                POST /api/v1/news
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create a news article. Requires <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-sm">create:news</code> permission.
              </p>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <pre>{`{
  "title": "Bitcoin Hits New All-Time High",
  "content": "Full article content here...",
  "image": "/images/btc-ath.jpg",
  "imageUrl": "https://example.com/btc.jpg",
  "author": "Crypto Reporter",
  "source": "CryptoNews",
  "sourceUrl": "https://cryptonews.com/article",
  "category": "Market",
  "tags": ["Bitcoin", "Market", "ATH"],
  "published": true
}`}</pre>
              </div>
            </div>

            {/* P2E Games */}
            <div className="mb-8 border-l-4 border-pink-500 pl-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                POST /api/v1/p2e
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create a P2E game entry. Requires <code className="bg-pink-100 dark:bg-pink-900 px-2 py-1 rounded text-sm">create:p2e</code> permission.
              </p>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <pre>{`{
  "title": "CryptoQuest",
  "description": "Epic RPG game with blockchain rewards",
  "image": "/images/cryptoquest.jpg",
  "imageUrl": "https://example.com/cq.jpg",
  "cost": "Free",
  "blockchain": "Polygon",
  "gameType": "RPG",
  "genre": "Adventure",
  "tokenSymbol": "QUEST",
  "earnings": "100-500 QUEST per day",
  "playToEarnMechanism": "Battle monsters, complete quests, earn tokens",
  "playLink": "https://cryptoquest.game/play",
  "websiteUrl": "https://cryptoquest.game",
  "status": "active",
  "website": "https://cryptoquest.game",
  "twitter": "https://twitter.com/cryptoquest",
  "discord": "https://discord.gg/cryptoquest",
  "whitepaper": "https://cryptoquest.game/whitepaper.pdf",
  "requirements": ["Web3 wallet", "Minimum 10 MATIC"],
  "features": ["PvP battles", "NFT items", "Guild system"],
  "tasks": [
    {
      "title": "Play Now",
      "description": "Start playing CryptoQuest",
      "type": "other",
      "link": "https://cryptoquest.game/play",
      "reward": "10 QUEST"
    }
  ],
  "tags": ["RPG", "Adventure", "NFT"]
}`}</pre>
              </div>
            </div>
          </section>

          {/* Error Responses */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Error Responses</h2>
            
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <code className="font-bold">401 Unauthorized</code>
                <p className="text-gray-700 dark:text-gray-300 mt-2">Invalid or missing API key, insufficient permissions, or expired key.</p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <code className="font-bold">400 Bad Request</code>
                <p className="text-gray-700 dark:text-gray-300 mt-2">Missing required fields or invalid data format.</p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <code className="font-bold">409 Conflict</code>
                <p className="text-gray-700 dark:text-gray-300 mt-2">Resource with the same slug already exists.</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <code className="font-bold">429 Too Many Requests</code>
                <p className="text-gray-700 dark:text-gray-300 mt-2">Rate limit exceeded. Wait until tomorrow or request limit increase.</p>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Best Practices</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Always include all required fields in your requests</li>
              <li>Use descriptive names and slugs to avoid conflicts</li>
              <li>Store your API key securely - never commit it to version control</li>
              <li>Monitor your daily usage to avoid hitting rate limits</li>
              <li>Handle errors gracefully and retry with exponential backoff</li>
              <li>Use ISO 8601 format for dates (e.g., 2025-12-31T23:59:59Z)</li>
              <li>Validate image URLs before sending to ensure they're accessible</li>
            </ul>
          </section>

          {/* Example Script */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Example: Python Script</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre>{`import requests
from datetime import datetime, timedelta

API_KEY = "ck_your_api_key_here"
BASE_URL = "https://cryptohoru.com/api/v1"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# Create an airdrop
airdrop_data = {
    "title": "SuperToken Airdrop",
    "description": "Get 1000 SUPER tokens by completing tasks",
    "image": "/images/super-airdrop.jpg",
    "reward": "100,000 SUPER",
    "blockchain": "Ethereum",
    "status": "active",
    "startDate": datetime.now().isoformat() + "Z",
    "endDate": (datetime.now() + timedelta(days=30)).isoformat() + "Z",
    "requirements": ["Follow Twitter", "Join Telegram", "Verify wallet"],
    "tasks": [
        {
            "title": "Follow Twitter",
            "description": "Follow @supertoken on Twitter",
            "type": "social",
            "reward": "100 SUPER",
            "link": "https://twitter.com/supertoken",
            "order": 0
        }
    ],
    "tags": ["DeFi", "Token"],
    "website": "https://supertoken.io",
    "twitter": "https://twitter.com/supertoken",
    "telegram": "https://t.me/supertoken"
}

response = requests.post(
    f"{BASE_URL}/airdrops",
    headers=headers,
    json=airdrop_data
)

if response.status_code == 200:
    result = response.json()
    print(f"✅ Airdrop created: {result['data']['url']}")
else:
    print(f"❌ Error: {response.json()['error']}")`}</pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
