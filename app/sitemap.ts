import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import { Airdrop, AMA, Giveaway, Blog, News, P2EGame } from '@/models';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

async function getAirdrops() {
  try {
    await connectDB();
    const airdrops = await Airdrop.find({ status: { $ne: 'hidden' } }).select('_id slug updatedAt').lean();
    return airdrops.map((a: any) => ({
      id: a.slug || a._id.toString(),
      updatedAt: a.updatedAt || new Date(),
    }));
  } catch {
    return [];
  }
}

async function getAMAs() {
  try {
    await connectDB();
    const amas = await AMA.find({ status: { $ne: 'hidden' } }).select('_id slug updatedAt').lean();
    return amas.map((a: any) => ({
      id: a.slug || a._id.toString(),
      updatedAt: a.updatedAt || new Date(),
    }));
  } catch {
    return [];
  }
}

async function getGiveaways() {
  try {
    await connectDB();
    const giveaways = await Giveaway.find({ status: { $ne: 'hidden' } }).select('_id slug updatedAt').lean();
    return giveaways.map((g: any) => ({
      id: g.slug || g._id.toString(),
      updatedAt: g.updatedAt || new Date(),
    }));
  } catch {
    return [];
  }
}

async function getBlogs() {
  try {
    await connectDB();
    const blogs = await Blog.find({ published: true }).select('_id slug updatedAt').lean();
    return blogs.map((b: any) => ({
      id: b.slug || b._id.toString(),
      updatedAt: b.updatedAt || new Date(),
    }));
  } catch {
    return [];
  }
}

async function getNews() {
  try {
    await connectDB();
    const news = await News.find({ published: true }).select('_id slug updatedAt').lean();
    return news.map((n: any) => ({
      id: n.slug || n._id.toString(),
      updatedAt: n.updatedAt || new Date(),
    }));
  } catch {
    return [];
  }
}

async function getP2EGames() {
  try {
    await connectDB();
    const games = await P2EGame.find({ status: { $ne: 'hidden' } }).select('_id slug updatedAt').lean();
    return games.map((g: any) => ({
      id: g.slug || g._id.toString(),
      updatedAt: g.updatedAt || new Date(),
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cryptohoru.com';
  
  // Fetch all dynamic content
  const [airdrops, amas, giveaways, blogs, news, games] = await Promise.all([
    getAirdrops(),
    getAMAs(),
    getGiveaways(),
    getBlogs(),
    getNews(),
    getP2EGames(),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/airdrops`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/ama`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/giveaways`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/p2e-games`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic airdrop pages
  const airdropPages: MetadataRoute.Sitemap = airdrops.map((airdrop) => ({
    url: `${baseUrl}/airdrops/${airdrop.id}`,
    lastModified: new Date(airdrop.updatedAt),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Dynamic AMA pages
  const amaPages: MetadataRoute.Sitemap = amas.map((ama) => ({
    url: `${baseUrl}/ama/${ama.id}`,
    lastModified: new Date(ama.updatedAt),
    changeFrequency: 'daily' as const,
    priority: 0.75,
  }));

  // Dynamic giveaway pages
  const giveawayPages: MetadataRoute.Sitemap = giveaways.map((giveaway) => ({
    url: `${baseUrl}/giveaways/${giveaway.id}`,
    lastModified: new Date(giveaway.updatedAt),
    changeFrequency: 'daily' as const,
    priority: 0.75,
  }));

  // Dynamic blog pages
  const blogPages: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.id}`,
    lastModified: new Date(blog.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic news pages
  const newsPages: MetadataRoute.Sitemap = news.map((article) => ({
    url: `${baseUrl}/news/${article.id}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic P2E game pages
  const gamePages: MetadataRoute.Sitemap = games.map((game) => ({
    url: `${baseUrl}/p2e-games/${game.id}`,
    lastModified: new Date(game.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.65,
  }));

  return [
    ...staticPages,
    ...airdropPages,
    ...amaPages,
    ...giveawayPages,
    ...blogPages,
    ...newsPages,
    ...gamePages,
  ];
}
