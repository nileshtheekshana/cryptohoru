import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Blog, News, Airdrop, AMA, Giveaway } from '@/models';

export const dynamic = 'force-dynamic';

function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{2,}/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export async function GET() {
  try {
    await connectDB();
    
    const baseUrl = 'https://cryptohoru.com';
    const now = new Date().toISOString();
    
    // Fetch latest content (excluding hidden items)
    const [blogs, news, airdrops, amas, giveaways] = await Promise.all([
      Blog.find({ published: true }).sort({ createdAt: -1 }).limit(20).lean(),
      News.find({ published: true }).sort({ createdAt: -1 }).limit(20).lean(),
      Airdrop.find({ status: { $ne: 'hidden' } }).sort({ createdAt: -1 }).limit(20).lean(),
      AMA.find({ status: { $ne: 'hidden' } }).sort({ createdAt: -1 }).limit(20).lean(),
      Giveaway.find({ status: { $ne: 'hidden' } }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    // Build RSS items
    const items: string[] = [];

    // Add blog posts
    blogs.forEach((post: any) => {
      const description = stripMarkdown(post.content || '').substring(0, 300);
      const postUrl = `${baseUrl}/blog/${post.slug || post._id}`;
      items.push(`
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(description)}</description>
      <category>Blog</category>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      ${post.author ? `<author>${escapeXml(post.author)}</author>` : ''}
    </item>`);
    });

    // Add news articles
    news.forEach((article: any) => {
      const description = stripMarkdown(article.content || '').substring(0, 300);
      const articleUrl = `${baseUrl}/news/${article.slug || article._id}`;
      items.push(`
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description>${escapeXml(description)}</description>
      <category>News</category>
      <pubDate>${new Date(article.createdAt).toUTCString()}</pubDate>
    </item>`);
    });

    // Add airdrops
    airdrops.forEach((airdrop: any) => {
      const description = stripMarkdown(airdrop.description || '').substring(0, 300);
      const airdropUrl = `${baseUrl}/airdrops/${airdrop.slug || airdrop._id}`;
      items.push(`
    <item>
      <title>${escapeXml(airdrop.title)} - Crypto Airdrop</title>
      <link>${airdropUrl}</link>
      <guid isPermaLink="true">${airdropUrl}</guid>
      <description>${escapeXml(description)}</description>
      <category>Airdrop</category>
      <pubDate>${new Date(airdrop.createdAt).toUTCString()}</pubDate>
    </item>`);
    });

    // Add AMAs
    amas.forEach((ama: any) => {
      const description = stripMarkdown(ama.description || '').substring(0, 300);
      const amaUrl = `${baseUrl}/ama/${ama.slug || ama._id}`;
      items.push(`
    <item>
      <title>${escapeXml(ama.title)} - AMA Session</title>
      <link>${amaUrl}</link>
      <guid isPermaLink="true">${amaUrl}</guid>
      <description>${escapeXml(description)}</description>
      <category>AMA</category>
      <pubDate>${new Date(ama.createdAt).toUTCString()}</pubDate>
    </item>`);
    });

    // Add giveaways
    giveaways.forEach((giveaway: any) => {
      const description = stripMarkdown(giveaway.description || '').substring(0, 300);
      const giveawayUrl = `${baseUrl}/giveaways/${giveaway.slug || giveaway._id}`;
      items.push(`
    <item>
      <title>${escapeXml(giveaway.title)} - Win ${escapeXml(giveaway.prize)}</title>
      <link>${giveawayUrl}</link>
      <guid isPermaLink="true">${giveawayUrl}</guid>
      <description>${escapeXml(description)}</description>
      <category>Giveaway</category>
      <pubDate>${new Date(giveaway.createdAt).toUTCString()}</pubDate>
    </item>`);
    });

    // Sort items by date (newest first)
    items.sort((a, b) => {
      const dateA = new Date(a.match(/<pubDate>(.+)<\/pubDate>/)?.[1] || '');
      const dateB = new Date(b.match(/<pubDate>(.+)<\/pubDate>/)?.[1] || '');
      return dateB.getTime() - dateA.getTime();
    });

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CryptoHoru - Crypto Airdrops, AMA, Giveaways &amp; News</title>
    <link>${baseUrl}</link>
    <description>Discover the latest crypto airdrops, participate in AMA sessions, win giveaways, explore P2E games, and stay updated with cryptocurrency news.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/og-image.png</url>
      <title>CryptoHoru</title>
      <link>${baseUrl}</link>
    </image>
    ${items.slice(0, 50).join('\n')}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating feed', { status: 500 });
  }
}
