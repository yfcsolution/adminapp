import { NextResponse } from 'next/server';
import { quranEmailService } from '@/lib/email-service';

export async function POST(req) {
  try {
    const body = await req.json();
    const { leadId, familyId, subject, mail, to } = body;

    const result = await quranEmailService.sendEmail({
      leadId,
      familyId,
      subject,
      mail,
      to
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Quran Email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email', 
        details: error.message,
        provider: 'quranonlinetutoring.com'
      },
      { status: 500 }
    );
  }
}
