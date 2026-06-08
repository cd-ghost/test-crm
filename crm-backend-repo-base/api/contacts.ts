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
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. GET: Fetch all contacts
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM contacts ORDER BY created_at DESC`;
      return res.status(200).json(data);
    }

    // 3. POST: Create new contact
    if (req.method === 'POST') {
      const { id, first_name, last_name, email, phone, company } = req.body || {};
      if (!first_name || !last_name || !email) {
        return res.status(400).json({ error: 'first_name, last_name, and email are required.' });
      }
      
      await sql`
        INSERT INTO contacts (id, first_name, last_name, email, phone, company)
        VALUES (${id}, ${first_name}, ${last_name}, ${email}, ${phone || null}, ${company || null})
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown database error' });
  }
}
