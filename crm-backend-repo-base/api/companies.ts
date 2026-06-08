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
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS companies (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          industry TEXT,
          city TEXT,
          revenue TEXT,
          employees NUMERIC,
          website TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
    } catch (err) {
      console.warn('Table creation warning:', err);
    }

    // 2. GET: Fetch all companies
    if (req.method === 'GET') {
      try {
        const data = await sql`SELECT * FROM companies ORDER BY created_at DESC`;
        return res.status(200).json(data || []);
      } catch (err) {
        return res.status(200).json([]);
      }
    }

    // 3. POST: Create new company
    if (req.method === 'POST') {
      try {
        const { id, name, industry, city, revenue, employees, website } = req.body || {};
        if (!name) {
          return res.status(400).json({ error: 'name is required.' });
        }
        
        await sql`
          INSERT INTO companies (id, name, industry, city, revenue, employees, website)
          VALUES (${id}, ${name}, ${industry || null}, ${city || null}, ${revenue || null}, ${employees || null}, ${website || null})
        `;
        return res.status(200).json({ success: true });
      } catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : 'POST failed' });
      }
    }

    // 4. PUT: Update company
    if (req.method === 'PUT') {
      try {
        const id = (req.query.id as string) || (req.body?.id as string);
        if (!id) return res.status(400).json({ error: 'id required' });
        const { name, industry, city, revenue, employees, website } = req.body || {};
        
        await sql`
          UPDATE companies 
          SET name = ${name}, industry = ${industry}, city = ${city}, 
              revenue = ${revenue}, employees = ${employees}, website = ${website}
          WHERE id = ${id}
        `;
        return res.status(200).json({ success: true });
      } catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : 'PUT failed' });
      }
    }

    // 5. DELETE: Remove company
    if (req.method === 'DELETE') {
      try {
        const id = (req.query.id as string) || (req.body?.id as string);
        if (!id) return res.status(400).json({ error: 'id required' });
        await sql`DELETE FROM companies WHERE id = ${id}`;
        return res.status(200).json({ success: true });
      } catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : 'DELETE failed' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown database error' });
  }
}
