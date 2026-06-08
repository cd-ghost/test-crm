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
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        industry TEXT,
        website TEXT,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. GET: Fetch all companies
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM companies ORDER BY created_at DESC`;
      return res.status(200).json(data);
    }

    // 3. POST: Create new company
    if (req.method === 'POST') {
      const { id, name, industry, website, phone } = req.body || {};
      if (!name) {
        return res.status(400).json({ error: 'name is required.' });
      }
      
      await sql`
        INSERT INTO companies (id, name, industry, website, phone)
        VALUES (${id}, ${name}, ${industry || null}, ${website || null}, ${phone || null})
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown database error' });
  }
}
