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
      CREATE TABLE IF NOT EXISTS quotes (
        id TEXT PRIMARY KEY,
        number TEXT NOT NULL,
        customer TEXT NOT NULL,
        amount NUMERIC,
        status TEXT,
        description TEXT,
        valid_until TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. GET: Fetch all quotes
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM quotes ORDER BY created_at DESC`;
      return res.status(200).json(data);
    }

    // 3. POST: Create new quote
    if (req.method === 'POST') {
      const { id, number, customer, amount, status, description, valid_until } = req.body || {};
      if (!number || !customer) {
        return res.status(400).json({ error: 'number and customer are required.' });
      }
      
      await sql`
        INSERT INTO quotes (id, number, customer, amount, status, description, valid_until)
        VALUES (${id}, ${number}, ${customer}, ${amount || null}, ${status || 'draft'}, ${description || null}, ${valid_until || null})
      `;
      return res.status(200).json({ success: true });
    }

    // 4. PUT: Update quote
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { number, customer, amount, status, description, valid_until } = req.body || {};
      
      await sql`
        UPDATE quotes 
        SET number = ${number}, customer = ${customer}, amount = ${amount}, 
            status = ${status}, description = ${description}, valid_until = ${valid_until}
        WHERE id = ${id}
      `;
      return res.status(200).json({ success: true });
    }

    // 5. DELETE: Remove quote
    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM quotes WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown database error' });
  }
}
