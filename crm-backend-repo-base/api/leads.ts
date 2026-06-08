import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Fields required' });
    
    // Fixed: Using the required tagged template literal syntax with backticks
    await sql`INSERT INTO leads (name, email) VALUES (${name}, ${email})`;
    
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
