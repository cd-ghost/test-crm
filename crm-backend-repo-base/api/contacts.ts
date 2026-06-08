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
        company TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        title TEXT,
        status TEXT,
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
      const { id, first_name, last_name, company, email, phone, title, status } = req.body || {};
      if (!first_name || !last_name || !email) {
        return res.status(400).json({ error: 'first_name, last_name, and email are required.' });
      }
      
      await sql`
        INSERT INTO contacts (id, first_name, last_name, company, email, phone, title, status)
        VALUES (${id}, ${first_name}, ${last_name}, ${company || null}, ${email}, ${phone || null}, ${title || null}, ${status || 'active'})
      `;
      return res.status(200).json({ success: true });
    }

    // 4. PUT: Update contact
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { first_name, last_name, company, email, phone, title, status } = req.body || {};
      
      await sql`
        UPDATE contacts 
        SET first_name = ${first_name}, last_name = ${last_name}, company = ${company}, 
            email = ${email}, phone = ${phone}, title = ${title}, status = ${status}
        WHERE id = ${id}
      `;
      return res.status(200).json({ success: true });
    }

    // 5. DELETE: Remove contact
    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM contacts WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown database error' });
  }
}
