import { NextRequest, NextResponse } from 'next/server';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_PORTAL_ID = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
const HUBSPOT_FORM_ID = process.env.HUBSPOT_FORM_ID;

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

    // The HubSpot form has no engagement-budget field (unknown fields make the submission fail),
    // so it is added to the message text instead
    const message = formData.engagementBudget
      ? `${formData.about}\n\nAnnual Engagement Budget: ${formData.engagementBudget}`
      : formData.about;

    if (!HUBSPOT_ACCESS_TOKEN || !HUBSPOT_PORTAL_ID) {
      console.warn('HubSpot API credentials not configured');
      return NextResponse.json(
        { error: 'HubSpot integration not configured' },
        { status: 500 }
      );
    }

    // Submit to HubSpot Forms API
    const hubspotResponse = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: [
            { name: 'firstname', value: formData.firstName },
            { name: 'lastname', value: formData.lastName },
            { name: 'email', value: formData.email },
            { name: 'phone', value: formData.phone },
            { name: 'company', value: formData.brand },
            { name: 'website', value: formData.website },
            { name: 'interest_area', value: formData.interest },
            { name: 'business_stage', value: formData.budget },
            { name: 'message', value: message },
          ],
          context: {
            pageUri: request.headers.get('referer') || '',
            pageName: 'Contact Form',
          },
        }),
      }
    );

    if (!hubspotResponse.ok) {
      const error = await hubspotResponse.text();
      console.error('HubSpot submission error:', error);
      return NextResponse.json(
        { error: 'Failed to submit to HubSpot' },
        { status: 500 }
      );
    }

    const hubspotData = await hubspotResponse.json();

    // Also create/update contact using Contacts API for better tracking
    try {
      const contactResponse = await fetch(
        'https://api.hubapi.com/crm/v3/objects/contacts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            properties: {
              firstname: formData.firstName,
              lastname: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              company: formData.brand,
              website: formData.website,
              lifecyclestage: 'lead',
              lead_source: 'Website Contact Form',
              interest_area: formData.interest,
              business_stage: formData.budget,
              hs_lead_status: 'NEW',
            },
          }),
        }
      );

      if (contactResponse.ok) {
        const contactData = await contactResponse.json();
        console.log('Contact created/updated:', contactData.id);
      }
    } catch (contactError) {
      console.warn('Contact API submission failed (non-critical):', contactError);
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      hubspotId: hubspotData.inlineMessage,
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}