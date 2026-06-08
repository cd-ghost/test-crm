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
      CREATE TABLE IF NOT EXISTS deals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        value NUMERIC,
        stage TEXT,
        close_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. GET: Fetch all deals
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM deals ORDER BY created_at DESC`;
      return res.status(200).json(data);
    }

    // 3. POST: Create new deal
    if (req.method === 'POST') {
      const { id, title, company, value, stage, close_date } = req.body || {};
      if (!title || !company) {
        return res.status(400).json({ error: 'title and company are required.' });
      }
      
      await sql`
        INSERT INTO deals (id, title, company, value, stage, close_date)
        VALUES (${id}, ${title}, ${company}, ${value || null}, ${stage || 'negotiation'}, ${close_date || null})
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown database error' });
  }
}
