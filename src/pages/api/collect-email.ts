import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { email } = req.body
    const { error } = await supabase.from('emails').insert([{ email }])
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json({ success: true })
  }
  return res.status(405).json({ error: 'Method not allowed' })
} 