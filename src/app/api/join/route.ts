import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const emailjsServiceId = process.env.EMAILJS_SERVICE_ID;
const emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID;
const emailjsUserId = process.env.EMAILJS_USER_ID;

// Log environment variable status (without exposing sensitive values)
console.log('[API/join] Environment check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseKey: !!supabaseKey,
  hasEmailjsConfig: !!(emailjsServiceId && emailjsTemplateId && emailjsUserId)
});

if (!supabaseUrl || !supabaseKey) {
  console.error('[API/join] Missing required Supabase environment variables');
  throw new Error('Missing required Supabase environment variables');
}

if (!emailjsServiceId || !emailjsTemplateId || !emailjsUserId) {
  console.error('[API/join] Missing required EmailJS environment variables');
  throw new Error('Missing required EmailJS environment variables');
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Add CORS headers to all responses
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  // Log incoming request method and body
  console.log('[API/join] Method:', req.method);
  let body;
  try {
    body = await req.json();
    console.log('[API/join] Body:', body);
  } catch (parseError) {
    console.error('[API/join] Failed to parse JSON body:', parseError);
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email } = body || {};
  if (!email) {
    console.warn('[API/join] Missing email field in request body:', body);
    return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
  }

  // Try/catch around Supabase insert
  try {
    const { data, error } = await supabase
      .from('emails')
      .insert([{ email }])
      .select();
    if (error) {
      console.error('[API/join] Supabase insert error:', error);
      return NextResponse.json({ success: false, error: 'Failed to store email', details: error.message }, { status: 500 });
    }
    console.log('[API/join] Successfully inserted email:', data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API/join] Unexpected error during Supabase insert:', err);
    return NextResponse.json({ success: false, error: 'Internal server error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
} 