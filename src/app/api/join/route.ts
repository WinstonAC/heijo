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

async function sendThankYouEmail(email: string) {
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_USER_ID,
        template_params: {
          to_email: email,
          from_name: 'Heijō',
          message: 'Thank you for joining the Heijō waitlist! We'll keep you updated.'
        }
      })
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }
    return true;
  } catch (err) {
    console.error('[EmailJS] Failed to send thank-you email:', err);
    return false;
  }
}

export async function POST(req: Request) {
  console.log("[/api/join] POST hit");

  try {
    const body = await req.json();
    console.log("[/api/join] Request body:", body);

    if (!body.email) {
      console.error("[/api/join] Missing email");
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase.from("emails").insert([{ email: body.email }]);

    if (error) {
      console.error("[/api/join] Supabase insert error:", error);
      return new Response(JSON.stringify({ error: "Insert failed", detail: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send thank-you email, but do not block user if it fails
    try {
      await sendThankYouEmail(body.email);
    } catch (emailErr) {
      // Already logged in sendThankYouEmail
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[/api/join] Unexpected error:", err?.message || err);
    return new Response(JSON.stringify({ error: "Unexpected server error", detail: err?.message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 