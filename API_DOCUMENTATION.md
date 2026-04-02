# CryptoHoru API v1

External API for creating events programmatically on CryptoHoru.

## Features

✅ **API Key Authentication** - Secure access with rate limiting  
✅ **Permission-based Access** - Granular control over what each key can do  
✅ **Daily Rate Limits** - Prevents abuse (default: 100 requests/day)  
✅ **Auto Telegram Notifications** - Posts are automatically shared to Telegram  
✅ **Complete Event Support** - Airdrops, AMAs, Giveaways, Blog, News, P2E Games  

## Quick Start

### 1. Create an API Key

1. Go to `/admin/api-keys`
2. Click "Create API Key"
3. Fill in details:
   - Name (e.g., "AI Bot")
   - Description (optional)
   - Permissions (select what you need)
   - Rate Limit (default: 100/day)
   - Expiration (0 = never expires)
4. **Copy the generated key immediately** - it won't be shown again!

### 2. Use the API

All API endpoints are under `/api/v1/`:

- `POST /api/v1/airdrops` - Create airdrop
- `PUT /api/v1/airdrops/:id` - Update airdrop
- `DELETE /api/v1/airdrops/:id` - Delete airdrop
- `POST /api/v1/ama` - Create AMA
- `POST /api/v1/giveaways` - Create giveaway
- `PUT /api/v1/giveaways/:id` - Update giveaway
- `DELETE /api/v1/giveaways/:id` - Delete giveaway
- `POST /api/v1/blog` - Create blog post
- `POST /api/v1/news` - Create news article
- `POST /api/v1/p2e` - Create P2E game
- `PUT /api/v1/p2e/:id` - Update P2E game
- `DELETE /api/v1/p2e/:id` - Delete P2E game

### 3. Image Uploads (Base64)
You can directly send base64-encoded images (starting with `data:image/...`) in the `image` or `imageUrl` fields for `POST` and `PUT` endpoints. The API will automatically decode and save the image, storing only the final uploaded URL in the database.

### 4. Make a Request

```bash
curl -X POST https://cryptohoru.com/api/v1/airdrops \
  -H "X-API-Key: ck_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "SuperToken Airdrop",
    "description": "Get 1000 SUPER tokens by completing tasks",
    "category": "Airdrop",
    "cost": "Free",
    "reward": "100,000 SUPER",
    "blockchain": "Ethereum",
    "endDate": "2025-12-31T23:59:59Z",
    "requirements": ["Follow on Twitter", "Join Telegram"],
    "tags": ["DeFi", "Token"],
    "website": "https://supertoken.io",
    "twitter": "https://twitter.com/supertoken"
  }'
```

## Permissions

Each API key can have one or more permissions:

- `create:airdrop`, `update:airdrop`, `delete:airdrop`
- `create:ama`, `update:ama`, `delete:ama`
- `create:giveaway`, `update:giveaway`, `delete:giveaway`
- `create:blog`, `update:blog`, `delete:blog`
- `create:news`, `update:news`, `delete:news`
- `create:p2e`, `update:p2e`, `delete:p2e`

## Rate Limiting

- Each API key has a daily rate limit (default: 100 requests)
- Limits reset at midnight UTC
- HTTP 429 returned when limit exceeded
- Check usage in `/admin/api-keys`

## Error Responses

| Code | Meaning |
|------|---------|
| `401` | Invalid/missing API key, insufficient permissions, or expired key |
| `400` | Missing required fields or invalid data |
| `409` | Resource with same slug already exists |
| `429` | Rate limit exceeded |
| `500` | Server error |

## Python Example

```python
import requests
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
    "category": "Airdrop",
    "cost": "Free",
    "reward": "100,000 SUPER",
    "blockchain": "Ethereum",
    "startDate": datetime.now().isoformat() + "Z",
    "endDate": (datetime.now() + timedelta(days=30)).isoformat() + "Z",
    "requirements": ["Follow Twitter", "Join Telegram", "Verify wallet"],
    "tasks": [],
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
    print(f"❌ Error: {response.json()['error']}")
```

## Node.js Example

```javascript
const axios = require('axios');

const API_KEY = 'ck_your_api_key_here';
const BASE_URL = 'https://cryptohoru.com/api/v1';

async function createAirdrop() {
  try {
    const response = await axios.post(
      `${BASE_URL}/airdrops`,
      {
        title: 'SuperToken Airdrop',
        description: 'Get 1000 SUPER tokens by completing tasks',
        category: 'Airdrop',
        cost: 'Free',
        reward: '100,000 SUPER',
        blockchain: 'Ethereum',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        requirements: ['Follow Twitter', 'Join Telegram', 'Verify wallet'],
        tags: ['DeFi', 'Token'],
        website: 'https://supertoken.io',
        twitter: 'https://twitter.com/supertoken',
      },
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Airdrop created:', response.data.data.url);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
  }
}

createAirdrop();
```

## AI Integration Example

For AI-powered event posting (your use case):

1. **Analyze Airdrops with AI** - Use your AI to scrape/analyze airdrop data
2. **Format Data** - Convert AI output to API request format
3. **Post via API** - Use API to automatically create events
4. **Auto Telegram** - Events are automatically posted to your Telegram channel

```python
# Example: AI → CryptoHoru workflow
def ai_to_cryptohoru(ai_analyzed_data):
    """Convert AI-analyzed airdrop data to CryptoHoru format"""
    
    # AI extracts key info
    airdrop_info = {
        "title": ai_analyzed_data["project_name"],
        "description": ai_analyzed_data["summary"],
        "reward": ai_analyzed_data["reward"],
        "blockchain": ai_analyzed_data["blockchain"],
        "endDate": ai_analyzed_data["deadline"],
        "requirements": ai_analyzed_data["steps"],
        "tags": ai_analyzed_data["categories"],
        "website": ai_analyzed_data.get("website_url"),
        "twitter": ai_analyzed_data.get("twitter_url"),
        "telegram": ai_analyzed_data.get("telegram_url")
    }
    
    # Post to CryptoHoru
    response = requests.post(
        f"{BASE_URL}/airdrops",
        headers=headers,
        json=airdrop_info
    )
    
    return response.json()
```

## Documentation

Full documentation available at: `/admin/api-docs`

## Security Best Practices

1. ✅ **Never commit API keys** to version control
2. ✅ **Use environment variables** to store keys
3. ✅ **Rotate keys regularly** for production use
4. ✅ **Use separate keys** for different environments (dev/prod)
5. ✅ **Monitor usage** in the admin panel
6. ✅ **Revoke compromised keys** immediately

## Admin Management

Manage API keys at: `/admin/api-keys`

Features:
- Create new keys with custom permissions
- View usage statistics
- Revoke keys instantly
- Monitor rate limit usage
- Set expiration dates

## Support

For issues or questions, contact the admin team.

---

**Built with Next.js, MongoDB, and ❤️**
