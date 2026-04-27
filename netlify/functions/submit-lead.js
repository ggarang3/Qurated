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

    // ── HubSpot Contacts API ──────────────────────────────────────────────────
    const nameParts = (name || '').trim().split(' ');
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';

    const hubspotRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`
      },
      body: JSON.stringify({
        properties: {
          firstname,
          lastname,
          email,
          phone,
          company: business,
          hs_lead_status: 'NEW',
          lead_source: 'Quinn AI Chat — Qurated Website'
        }
      })
    });

    const hubspotData = await hubspotRes.json();

    // If contact already exists (409), update instead
    if (hubspotRes.status === 409 && hubspotData.message) {
      const existingId = hubspotData.message.match(/ID: (\d+)/)?.[1];
      if (existingId) {
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`
          },
          body: JSON.stringify({
            properties: { firstname, lastname, phone, company: business }
          })
        });
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
      body: JSON.stringify({ success: true })
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
