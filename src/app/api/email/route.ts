import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with fallback for build time
const resend = new Resend(process.env.RESEND_API_KEY || '');

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  brand: string;
  website: string;
  interest: string;
  budget: string;
  engagementBudget?: string;
  about: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData: ContactFormData = await request.json();

    if (!process.env.RESEND_API_KEY || !resend) {
      console.warn('Resend API key not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Create email content
    const emailSubject = `New Contact Form Submission from ${formData.firstName} ${formData.lastName}`;
    
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Phone:</strong> ${formData.phone}</p>
      <p><strong>Brand:</strong> ${formData.brand}</p>
      <p><strong>Website:</strong> ${formData.website}</p>
      <p><strong>Interest:</strong> ${formData.interest}</p>
      <p><strong>Budget/Business Stage:</strong> ${formData.budget}</p>
      <p><strong>Annual Engagement Budget:</strong> ${formData.engagementBudget || ''}</p>
      <p><strong>Message:</strong></p>
      <p>${formData.about.replace(/\n/g, '<br>')}</p>
      
      <hr>
      <p><small>Submitted from: ${request.headers.get('referer') || 'Unknown'}</small></p>
      <p><small>Submission time: ${new Date().toISOString()}</small></p>
    `;

    const emailText = `
New Contact Form Submission

Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
Brand: ${formData.brand}
Website: ${formData.website}
Interest: ${formData.interest}
Budget/Business Stage: ${formData.budget}
Annual Engagement Budget: ${formData.engagementBudget || ''}

Message:
${formData.about}

---
Submitted from: ${request.headers.get('referer') || 'Unknown'}
Submission time: ${new Date().toISOString()}
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: 'Contact Form <hey@wemotif.com>',
      to: ['hey@wemotif.com'],
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      replyTo: formData.email,
    });

    if (emailResponse.error) {
      console.error('Resend email error:', emailResponse.error);
      return NextResponse.json(
        { error: 'Failed to send email notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: emailResponse.data?.id,
    });

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}