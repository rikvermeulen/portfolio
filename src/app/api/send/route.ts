import * as React from 'react';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

import { env } from '@/env.mjs';

import { EmailTemplate } from '@/components/EmailTemplate';

const resend = new Resend(env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email, name, phone, reason } = await request.json();

  try {
    const data = await resend.emails.send({
      from: 'Rik Vermeulen <info@rikvermeulen.com>',
      to: ['rik.vermeulen.1997@live.nl'],
      subject: 'Contact form submission: rikvermeulen.com',
      react: EmailTemplate({
        name: name,
        reason: reason,
        phone: phone,
        email: email,
      }) as React.ReactElement,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
