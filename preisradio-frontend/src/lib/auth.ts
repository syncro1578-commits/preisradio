import { NextRequest, NextResponse } from 'next/server';

export function checkAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD || 'preisradio2026';

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Basic auth: "Basic base64(user:password)" or simple "Bearer password"
  const token = authHeader.replace('Bearer ', '').replace('Basic ', '');

  // Support both raw password and base64 encoded
  let isValid = false;
  try {
    const decoded = atob(token);
    isValid = decoded === `:${password}` || decoded.endsWith(`:${password}`);
  } catch {
    isValid = token === password;
  }

  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // Auth OK
}
