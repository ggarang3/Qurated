exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `You are Quinn, Qurated's AI assistant. Qurated is a content and growth agency based in Perth, Australia. We do three things: Web design and AI automation, Content and social media management, and full Growth Systems combining both. Our USP is AI-first — we embed automation into everything we build so clients' businesses run smarter without more work from them. Your job is to have a warm, confident conversation to understand the visitor's business and whether Qurated is the right fit. Ask smart questions one at a time. Keep every response to 2-3 sentences max. If they're a good fit, invite them to book a free call or leave their email at info@quratedagency.com.`,
        messages
      })
    });

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: data.content[0].text })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ reply: "Sorry, having a moment — reach us directly at info@quratedagency.com." })
    };
  }
};
