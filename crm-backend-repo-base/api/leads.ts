import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({ error: 'DATABASE_URL environment variable is missing on Vercel.' });
    }
    
    const sql = neon(dbUrl);

    // 1. HANDLE GET REQUESTS (Fetch data to display on load/refresh)
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
      return res.status(200).json(data);
    }

    // 2. HANDLE POST REQUESTS (Submit new form data)
    if (req.method === 'POST') {
      const { name, email } = req.body || {};
      if (!name || !email) {
        return res.status(400).json({ error: 'Both name and email fields are required.' });
      }
      
      await sql`INSERT INTO leads (name, email) VALUES (${name}, ${email})`;
      return res.status(200).json({ success: true });
    }

    // Catch-all for unsupported request methods (PUT, DELETE, etc.)
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown database error' });
  }
}