import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { shopName, website, email } = await request.json();

    if (!shopName || !website || !email) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      );
    }

    // Send email using Resend or similar service
    // For now, we'll use a simple mailto approach via external service
    const emailBody = `
Neue Händler-Anfrage auf Preisradio

Shop-Name: ${shopName}
Website: ${website}
E-Mail: ${email}

---
Gesendet von preisradio.de/haendler
    `.trim();

    // Option 1: Using Resend (if configured)
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Preisradio <noreply@preisradio.de>',
          to: ['contact@preisradio.de'],
          subject: `Neue Händler-Anfrage: ${shopName}`,
          text: emailBody,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } else {
      // Fallback: Log the request (you can integrate with other email services)
      console.log('Shop Request:', { shopName, website, email });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing shop request:', error);
    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten der Anfrage' },
      { status: 500 }
    );
  }
}