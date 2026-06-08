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
        related TEXT,
        due_date TEXT,
        priority TEXT,
        status TEXT,
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
      const { id, title, related, due_date, priority, status } = req.body || {};
      if (!title) {
        return res.status(400).json({ error: 'title is required.' });
      }
      
      await sql`
        INSERT INTO tasks (id, title, related, due_date, priority, status)
        VALUES (${id}, ${title}, ${related || null}, ${due_date || null}, ${priority || 'medium'}, ${status || 'pending'})
      `;
      return res.status(200).json({ success: true });
    }

    // 4. PUT: Update task
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { title, related, due_date, priority, status } = req.body || {};
      
      await sql`
        UPDATE tasks 
        SET title = ${title}, related = ${related}, due_date = ${due_date}, 
            priority = ${priority}, status = ${status}
        WHERE id = ${id}
      `;
      return res.status(200).json({ success: true });
    }

    // 5. DELETE: Remove task
    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM tasks WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown database error' });
  }
}
