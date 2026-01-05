console.log("Stripe key loaded:", !!process.env.STRIPE_SECRET_KEY)
export default async function handler(req, res) {
  // Enable CORS
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
    const { role, jobDescription, cvText } = req.body;

    if (!role || !jobDescription || !cvText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Construct the prompt for Claude
    const systemPrompt = `You are an expert career coach and ATS optimization specialist. Your job is to analyze CVs and job descriptions, then provide tailored recommendations.

When analyzing, you must return EXACTLY four sections:

1. OPTIMIZED CV BULLETS: Rewrite the user's CV bullet points to match the job description. Use action verbs, quantify achievements, and include relevant keywords.

2. KEYWORDS TO INCLUDE: List 10-15 specific keywords and phrases from the job description that should appear in the CV. Focus on technical skills, tools, and role-specific terms.

3. RECRUITER FEEDBACK: Write 3-4 sentences explaining what stands out positively about this candidate for this specific role.

4. GAPS & WEAKNESSES: Identify 3-5 missing skills, experiences, or qualifications that the job requires but the CV lacks or doesn't emphasize enough.

Be direct, actionable, and specific. Format your response clearly with headers for each section.`;

    const userPrompt = `TARGET ROLE: ${role}

JOB DESCRIPTION:
${jobDescription}

USER'S CV:
${cvText}

Please analyze this CV against the job description and provide:
1. Optimized CV bullets
2. Keywords to include
3. Recruiter feedback
4. Gaps & weaknesses`;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
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
    const fullText = data.content[0].text;

    // Parse the response into sections
    const sections = parseResponse(fullText);

    return res.status(200).json(sections);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function parseResponse(text) {
  // Simple parser to extract sections
  const sections = {
    optimizedBullets: '',
    keywords: '',
    feedback: '',
    gaps: ''
  };

  const lines = text.split('\n');
  let currentSection = null;

  for (const line of lines) {
    const lower = line.toLowerCase();
    
    if (lower.includes('optimized') || lower.includes('bullet')) {
      currentSection = 'optimizedBullets';
      continue;
    } else if (lower.includes('keyword')) {
      currentSection = 'keywords';
      continue;
    } else if (lower.includes('recruiter') || lower.includes('feedback')) {
      currentSection = 'feedback';
      continue;
    } else if (lower.includes('gap') || lower.includes('weak')) {
      currentSection = 'gaps';
      continue;
    }

    if (currentSection && line.trim()) {
      sections[currentSection] += line + '\n';
    }
  }

  return sections;
}