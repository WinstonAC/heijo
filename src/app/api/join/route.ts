import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { error } = await supabase
      .from("emails")
      .insert([{ email }]);

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const csvPath = path.join('/tmp', 'heijo-waitlist.csv');
    const row = `"${email}","${new Date().toISOString()}"\n`;
    // Append to CSV (create if not exists)
    fs.appendFileSync(csvPath, row, { encoding: 'utf8', flag: 'a' });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 