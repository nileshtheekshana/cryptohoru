import { NextRequest, NextResponse } from 'next/server';
import connectDB from './mongodb';
import { APIKey } from '@/models';

export interface APIKeyData {
  _id: string;
  name: string;
  permissions: string[];
  rateLimit: number;
  usageCount: number;
}

/**
 * Validate API key and check permissions
 */
export async function validateAPIKey(
  req: NextRequest,
  requiredPermission: string
): Promise<{ valid: boolean; key?: APIKeyData; error?: string }> {
  try {
    // Get API key from header
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      return { valid: false, error: 'API key is required. Provide X-API-Key header.' };
    }

    await connectDB();

    // Find API key in database
    const keyDoc = await APIKey.findOne({ key: apiKey, status: 'active' });

    if (!keyDoc) {
      return { valid: false, error: 'Invalid or revoked API key' };
    }

    // Check if key has expired
    if (keyDoc.expiresAt && new Date() > keyDoc.expiresAt) {
      return { valid: false, error: 'API key has expired' };
    }

    // Check if key has required permission
    if (!keyDoc.permissions.includes(requiredPermission)) {
      return { valid: false, error: `API key does not have permission: ${requiredPermission}` };
    }

    // Check rate limit (requests per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (keyDoc.lastUsed) {
      const lastUsedDate = new Date(keyDoc.lastUsed);
      lastUsedDate.setHours(0, 0, 0, 0);
      
      // Reset usage count if it's a new day
      if (lastUsedDate < today) {
        keyDoc.usageCount = 0;
      }
    }

    // Check if rate limit exceeded
    if (keyDoc.usageCount >= keyDoc.rateLimit) {
      return { 
        valid: false, 
        error: `Rate limit exceeded. Limit: ${keyDoc.rateLimit} requests per day` 
      };
    }

    // Update usage
    keyDoc.usageCount += 1;
    keyDoc.lastUsed = new Date();
    await keyDoc.save();

    return {
      valid: true,
      key: {
        _id: keyDoc._id.toString(),
        name: keyDoc.name,
        permissions: keyDoc.permissions,
        rateLimit: keyDoc.rateLimit,
        usageCount: keyDoc.usageCount,
      },
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return { valid: false, error: 'Internal server error' };
  }
}

/**
 * Generate a secure API key
 */
export function generateAPIKey(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const keyLength = 32;
  let key = 'ck_'; // cryptohoru key prefix
  
  for (let i = 0; i < keyLength; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return key;
}
