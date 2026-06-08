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
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        assigned_to TEXT,
        due_date TEXT,
        priority TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. GET: Fetch all tasks
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM tasks ORDER BY created_at DESC`;
      return res.status(200).json(data);
    }

    // 3. POST: Create new task
    if (req.method === 'POST') {
      const { id, title, assigned_to, due_date, priority, completed } = req.body || {};
      if (!title) {
        return res.status(400).json({ error: 'title is required.' });
      }
      
      await sql`
        INSERT INTO tasks (id, title, assigned_to, due_date, priority, completed)
        VALUES (${id}, ${title}, ${assigned_to || null}, ${due_date || null}, ${priority || 'medium'}, ${completed || false})
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown database error' });
  }
}
