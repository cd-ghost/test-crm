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
        name TEXT NOT NULL,
        company TEXT NOT NULL,
        contact TEXT,
        value NUMERIC,
        stage TEXT,
        close_date TEXT,
        owner TEXT,
        probability NUMERIC,
        notes TEXT,
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
      const { id, name, company, contact, value, stage, close_date, owner, probability, notes } = req.body || {};
      if (!name || !company) {
        return res.status(400).json({ error: 'name and company are required.' });
      }
      
      await sql`
        INSERT INTO deals (id, name, company, contact, value, stage, close_date, owner, probability, notes)
        VALUES (${id}, ${name}, ${company}, ${contact || null}, ${value || null}, ${stage || 'new deals'}, ${close_date || null}, ${owner || null}, ${probability || null}, ${notes || null})
      `;
      return res.status(200).json({ success: true });
    }

    // 4. PUT: Update deal
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { name, company, contact, value, stage, close_date, owner, probability, notes } = req.body || {};
      
      await sql`
        UPDATE deals 
        SET name = ${name}, company = ${company}, contact = ${contact}, value = ${value}, 
            stage = ${stage}, close_date = ${close_date}, owner = ${owner}, 
            probability = ${probability}, notes = ${notes}
        WHERE id = ${id}
      `;
      return res.status(200).json({ success: true });
    }

    // 5. DELETE: Remove deal
    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM deals WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown database error' });
  }
}
