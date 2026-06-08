import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({ error: 'DATABASE_URL environment variable is missing.' });
    }
    
    const sql = neon(dbUrl);

    // 1. Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        description TEXT,
        related_to TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. GET: Fetch all activities
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM activities ORDER BY created_at DESC`;
      return res.status(200).json(data);
    }

    // 3. POST: Create new activity
    if (req.method === 'POST') {
      const { id, type, description, related_to } = req.body || {};
      if (!type) {
        return res.status(400).json({ error: 'type is required.' });
      }
      
      await sql`
        INSERT INTO activities (id, type, description, related_to)
        VALUES (${id}, ${type}, ${description || null}, ${related_to || null})
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown database error' });
  }
}
