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

    const contextLine = businessType
      ? `The prospect runs a ${businessType} business. Their main challenge is: "${mainChallenge}". You already have the context you need — do not ask more qualifying questions.`
      : '';

    const systemPrompt = `You are Quinn, the AI for Qurated — a growth systems agency in Perth, Australia that builds lead generation systems (website, AI automation, CRM, content) for business owners.

${contextLine}

RULES — follow these strictly:
1. Maximum 2 sentences per response. Never more.
2. Do not ask qualifying questions — you already have the context.
3. Every response must end with a natural nudge toward booking a call or leaving details.
4. Be direct and confident, not salesy. Sound like a person, not a bot.
5. If they ask about pricing, say it depends on the scope and the free diagnosis call is where that gets worked out.
6. If they are not a fit, say so honestly and briefly.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
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
      body: JSON.stringify({ reply: "Reach us directly at info@quratedagency.com." })
    };
  }
};
