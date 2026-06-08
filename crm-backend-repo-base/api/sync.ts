import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({ error: 'DATABASE_URL environment variable is missing.' });
    }
    
    const sql = neon(dbUrl);

    // Fetch all collections in parallel
    const [leads, contacts, deals, tasks, companies, activities, quotes] = await Promise.all([
      sql`SELECT * FROM leads ORDER BY created_at DESC LIMIT 1000`.catch(() => []),
      sql`SELECT * FROM contacts ORDER BY created_at DESC LIMIT 1000`.catch(() => []),
      sql`SELECT * FROM deals ORDER BY created_at DESC LIMIT 1000`.catch(() => []),
      sql`SELECT * FROM tasks ORDER BY created_at DESC LIMIT 1000`.catch(() => []),
      sql`SELECT * FROM companies ORDER BY created_at DESC LIMIT 1000`.catch(() => []),
      sql`SELECT * FROM activities ORDER BY created_at DESC LIMIT 1000`.catch(() => []),
      sql`SELECT * FROM quotes ORDER BY created_at DESC LIMIT 1000`.catch(() => [])
    ]);

    return res.status(200).json({
      leads: leads || [],
      contacts: contacts || [],
      deals: deals || [],
      tasks: tasks || [],
      companies: companies || [],
      activities: activities || [],
      quotes: quotes || []
    });
  } catch (error: any) {
    // If tables don't exist yet, return empty collections (app will use mock data)
    console.warn('Sync endpoint error (tables may not exist yet):', error.message);
    return res.status(200).json({
      leads: [],
      contacts: [],
      deals: [],
      tasks: [],
      companies: [],
      activities: [],
      quotes: []
    });
  }
}
