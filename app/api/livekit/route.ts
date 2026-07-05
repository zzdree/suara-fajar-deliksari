import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const roomName = request.nextUrl.searchParams.get('room');
  const participantName = request.nextUrl.searchParams.get('name');
  const isOperator = request.nextUrl.searchParams.get('operator') === 'true';

  if (!roomName || !participantName) {
    return NextResponse.json(
      { error: 'Missing room or name parameter' },
      { status: 400 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'LiveKit credentials not configured' },
      { status: 500 }
    );
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: isOperator, // Only operator can publish audio
    canSubscribe: true, // Everyone can subscribe (listen)
  });

  return NextResponse.json({ token: at.toJwt() });
}
