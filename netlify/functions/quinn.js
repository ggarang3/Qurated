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
    const { messages, context = {} } = JSON.parse(event.body);
    const { businessType = '', mainChallenge = '' } = context;

    // Build context-aware system prompt
    const contextLine = businessType
      ? `The prospect has told you they run a ${businessType} business and their main challenge is: "${mainChallenge}". Use this to make your responses specific and relevant — don't ask them to repeat this information.`
      : '';

    const systemPrompt = `You are Quinn, the AI for Qurated — a growth systems agency based in Perth, Australia.

Qurated's positioning: "We build the system. You build the business." Qurated builds lead generation systems for business owners who are too busy running their business to manage their own marketing. The three core services are: (1) Web & AI Systems — high-converting websites, AI chatbots, CRM setup, lead capture funnels, SEO. (2) Content & Social — social media management, reels, Meta ads, content strategy. (3) Growth Systems — the full stack as one compounding system.

${contextLine}

Your role: continue the conversation in a warm, direct, and consultative tone. Ask one smart follow-up question at a time. Keep responses to 2–3 sentences maximum. You're trying to understand the business well enough to know if Qurated is the right fit. If they're a good fit, naturally move toward inviting them to book a free diagnosis call or leave their details. If they don't seem like a fit, be honest about it. Never be pushy or salesy.`;

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
        system: systemPrompt,
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
