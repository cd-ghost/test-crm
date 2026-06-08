import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({ error: 'DATABASE_URL environment variable is missing.' });
    }
    
    const sql = neon(dbUrl);

    // Fetch all collections with individual error handling
    const results = await Promise.allSettled([
      sql`SELECT * FROM leads ORDER BY created_at DESC LIMIT 1000`,
      sql`SELECT * FROM contacts ORDER BY created_at DESC LIMIT 1000`,
      sql`SELECT * FROM deals ORDER BY created_at DESC LIMIT 1000`,
      sql`SELECT * FROM tasks ORDER BY created_at DESC LIMIT 1000`,
      sql`SELECT * FROM companies ORDER BY created_at DESC LIMIT 1000`,
      sql`SELECT * FROM activities ORDER BY created_at DESC LIMIT 1000`,
      sql`SELECT * FROM quotes ORDER BY created_at DESC LIMIT 1000`
    ]);

    // Extract results or default to empty arrays
    const [leadsResult, contactsResult, dealsResult, tasksResult, companiesResult, activitiesResult, quotesResult] = results;

    return res.status(200).json({
      leads: leadsResult.status === 'fulfilled' ? leadsResult.value : [],
      contacts: contactsResult.status === 'fulfilled' ? contactsResult.value : [],
      deals: dealsResult.status === 'fulfilled' ? dealsResult.value : [],
      tasks: tasksResult.status === 'fulfilled' ? tasksResult.value : [],
      companies: companiesResult.status === 'fulfilled' ? companiesResult.value : [],
      activities: activitiesResult.status === 'fulfilled' ? activitiesResult.value : [],
      quotes: quotesResult.status === 'fulfilled' ? quotesResult.value : []
    });
  } catch (error: any) {
    console.error('Sync endpoint error:', error.message);
    // Return empty collections to allow app to use mock data
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
