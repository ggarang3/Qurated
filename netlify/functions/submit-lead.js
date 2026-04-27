exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { name, email, phone, business } = JSON.parse(event.body);

    const nameParts = (name || '').trim().split(' ');
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';

    console.log('=== submit-lead called ===');
    console.log('Data:', { firstname, lastname, email, phone, business });

    // ── HubSpot — only safe, guaranteed fields ────────────────────────────────
    const properties = { email };
    if (firstname) properties.firstname = firstname;
    if (lastname)  properties.lastname  = lastname;
    if (phone)     properties.phone     = phone;
    if (business)  properties.company   = business;

    const hubspotRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`
      },
      body: JSON.stringify({ properties })
    });

    const hubspotData = await hubspotRes.json();
    console.log('HubSpot status:', hubspotRes.status);
    console.log('HubSpot body:', JSON.stringify(hubspotData));

    // Contact already exists — patch it
    if (hubspotRes.status === 409) {
      const existingId = hubspotData.message?.match(/ID: (\d+)/)?.[1];
      if (existingId) {
        const patch = { ...properties };
        delete patch.email;
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`
          },
          body: JSON.stringify({ properties: patch })
        });
        console.log('Patched existing contact:', existingId);
      }
    }

    // ── Formspree backup ──────────────────────────────────────────────────────
    await fetch('https://formspree.io/f/mreovojd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, business, source: 'Quinn AI Chat' })
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, hubspot_status: hubspotRes.status })
    };

  } catch (err) {
    console.error('submit-lead error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
