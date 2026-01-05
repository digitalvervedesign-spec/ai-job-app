export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { role, jobDescription, experience } = req.body;

    if (!role || !jobDescription || !experience) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const systemPrompt = `You are an expert career coach specializing in cover letter writing. 

Your task: Write a compelling, personalized cover letter that:
- Is MAXIMUM 350 words
- Matches the tone of the job description
- Highlights relevant experience from the user's CV
- Shows genuine interest and cultural fit
- Uses specific examples, not generic statements
- Follows this structure: opening hook, 2-3 body paragraphs with examples, closing with call to action

CRITICAL: Do NOT include placeholder fields like [Your Name], [Company Name], or [Date]. Write as if the user will paste this directly into their application. Start with "Dear Hiring Manager," and end with "Sincerely,".

Write in a professional but warm tone. Be confident but not arrogant.`;

    const userPrompt = `TARGET ROLE: ${role}

JOB DESCRIPTION:
${jobDescription}

USER'S EXPERIENCE/CV:
${experience}

Write a complete cover letter (max 350 words) tailored to this job.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const coverLetter = data.content[0].text;

    return res.status(200).json({ coverLetter });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}