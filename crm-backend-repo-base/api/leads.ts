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
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        company TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        source TEXT,
        status TEXT,
        value NUMERIC,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. GET: Fetch all leads
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
      return res.status(200).json(data);
    }

    // 3. POST: Create new lead
    if (req.method === 'POST') {
      const { id, first_name, last_name, company, email, phone, source, status, value, notes } = req.body || {};
      if (!email) {
        return res.status(400).json({ error: 'email is required.' });
      }
      
      await sql`
        INSERT INTO leads (id, first_name, last_name, company, email, phone, source, status, value, notes)
        VALUES (${id}, ${first_name || null}, ${last_name || null}, ${company || null}, ${email}, ${phone || null}, ${source || null}, ${status || null}, ${value || null}, ${notes || null})
      `;
      return res.status(200).json({ success: true });
    }

    // 4. PUT: Update lead
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { first_name, last_name, company, email, phone, source, status, value, notes } = req.body || {};
      
      await sql`
        UPDATE leads 
        SET first_name = ${first_name}, last_name = ${last_name}, company = ${company}, 
            email = ${email}, phone = ${phone}, source = ${source}, status = ${status}, 
            value = ${value}, notes = ${notes}
        WHERE id = ${id}
      `;
      return res.status(200).json({ success: true });
    }

    // 5. DELETE: Remove lead
    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM leads WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown database error' });
  }
}