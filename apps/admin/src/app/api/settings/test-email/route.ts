import { NextResponse } from 'next/server';
import { POST as settingsPost } from '../route';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const forwardedReq = new Request(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify({
        action: 'test-email',
        ...body
      })
    });
    return settingsPost(forwardedReq);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
