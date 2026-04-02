import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function processBase64Image(base64String: string | undefined): Promise<string | undefined> {
  if (!base64String || !base64String.startsWith('data:image/')) {
    return base64String; // Return as is if it's a URL or empty
  }

  try {
    const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64String;
    }

    const type = matches[1];
    const data = Buffer.from(matches[2], 'base64');
    
    // Create random filename
    const filename = `${crypto.randomBytes(16).toString('hex')}.${type === 'jpeg' ? 'jpg' : type.replace('+', '')}`;
    
    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filePath, data);

    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error processing base64 image:', error);
    return base64String; // Fallback to returning original string
  }
}
