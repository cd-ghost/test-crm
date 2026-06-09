import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto'; // Natively available for generating bulletproof unique string IDs

function toNullable(v: any) {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  return v;
}

// Foolproof numeric sanitizer protecting your NUMERIC database column
function toNullableNumeric(v: any) {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  const parsed = Number(v);
  return isNaN(parsed) ? null : parsed;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return res.status(500).json({ error: 'DATABASE_URL environment variable is missing.' });
    }
    
    const sql = neon(dbUrl);

    // 1. Ensure table exists with a native UUID fallback generator
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS leads (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          first_name TEXT,
          last_name TEXT,
          company TEXT,
          email TEXT NOT NULL,
          phone TEXT,
          source TEXT,
          status TEXT,
          industry TEXT,
          value NUMERIC,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // Defensive: add missing columns in case production schema drifts
      await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry TEXT`;
    } catch (tableErr) {
      console.warn('Table creation warning:', tableErr);
    }

    // 2. GET: Fetch all leads
    if (req.method === 'GET') {
      try {
        const data = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
        return res.status(200).json(data || []);
      } catch (err) {
        console.error('GET error:', err);
        return res.status(200).json([]);
      }
    }

    // 3. POST: Create or Upsert new lead
    if (req.method === 'POST') {
      try {
        const { id, first_name, last_name, company, email, phone, source, status, industry, value, notes } = req.body || {};
        if (!email) {
          return res.status(400).json({ error: 'email is required.' });
        }

        // FOOLPROOF GUARD: If the client didn't supply an ID string, create a fresh one immediately
        const finalId = (id && typeof id === 'string' && id.trim() !== '') ? id.trim() : crypto.randomUUID();

        await sql`
          INSERT INTO leads (id, first_name, last_name, company, email, phone, source, status, industry, value, notes)
          VALUES (
            ${finalId},
            ${toNullable(first_name)},
            ${toNullable(last_name)},
            ${toNullable(company)},
            ${email},
            ${toNullable(phone)},
            ${toNullable(source)},
            ${toNullable(status)},
            ${toNullable(industry)},
            ${toNullableNumeric(value)},
            ${toNullable(notes)}
          )
          ON CONFLICT (id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name  = EXCLUDED.last_name,
            company    = EXCLUDED.company,
            email      = EXCLUDED.email,
            phone      = EXCLUDED.phone,
            source     = EXCLUDED.source,
            status     = EXCLUDED.status,
            industry   = EXCLUDED.industry,
            value      = EXCLUDED.value,
            notes      = EXCLUDED.notes
        `;

        return res.status(200).json({ success: true, id: finalId });
      } catch (err) {
        console.error('POST error:', err);
        return res.status(500).json({ error: err instanceof Error ? err.message : 'POST failed' });
      }
    }

    // 4. PUT: Update lead
    if (req.method === 'PUT') {
      try {
        const id = (req.query.id as string) || (req.body?.id as string);
        if (!id) return res.status(400).json({ error: 'id is required' });
        const { first_name, last_name, company, email, phone, source, status, industry, value, notes } = req.body || {};

        await sql`
          UPDATE leads 
          SET first_name = ${toNullable(first_name)},
              last_name  = ${toNullable(last_name)},
              company    = ${toNullable(company)},
              email      = ${toNullable(email)},
              phone      = ${toNullable(phone)},
              source     = ${toNullable(source)},
              status     = ${toNullable(status)},
              industry   = ${toNullable(industry)},
              value      = ${toNullableNumeric(value)},
              notes      = ${toNullable(notes)}
          WHERE id = ${id}
        `;

        return res.status(200).json({ success: true });
      } catch (err) {
        console.error('PUT error:', err);
        return res.status(500).json({ error: err instanceof Error ? err.message : 'PUT failed' });
      }
    }

    // 5. DELETE: Remove lead
    if (req.method === 'DELETE') {
      try {
        const id = (req.query.id as string) || (req.body?.id as string);
        if (!id) return res.status(400).json({ error: 'id is required' });
        await sql`DELETE FROM leads WHERE id = ${id}`;
        return res.status(200).json({ success: true });
      } catch (err) {
        console.error('DELETE error:', err);
        return res.status(500).json({ error: err instanceof Error ? err.message : 'DELETE failed' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown database error' });
  }
}