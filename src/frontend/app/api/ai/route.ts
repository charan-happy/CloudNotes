// Server-side AI assist proxy. The Anthropic API key stays on the server and is
// never exposed to the browser. Degrades gracefully when no key is configured.

const MODEL = process.env.AI_MODEL || 'claude-sonnet-4-6'

type Action =
  | 'improve'
  | 'rephrase'
  | 'shorter'
  | 'longer'
  | 'grammar'
  | 'summarize'
  | 'professional'
  | 'casual'
  | 'bullets'

const PROMPTS: Record<Action, string> = {
  improve: 'Improve the clarity, flow, and word choice of the text. Keep the original meaning and language.',
  rephrase: 'Rephrase the text so it says the same thing in a fresh way.',
  shorter: 'Make the text more concise without losing key information.',
  longer: 'Expand the text with more detail and supporting points.',
  grammar: 'Fix spelling, grammar, and punctuation. Change nothing else.',
  summarize: 'Summarize the text into a short, clear summary.',
  professional: 'Rewrite the text in a professional, formal tone.',
  casual: 'Rewrite the text in a friendly, casual tone.',
  bullets: 'Convert the text into a clear bulleted list (use "- " for each point).',
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'AI assist is not configured. Set ANTHROPIC_API_KEY on the server to enable it.' },
      { status: 503 },
    )
  }

  let body: { action?: Action; text?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { action, text } = body
  if (!action || !PROMPTS[action]) {
    return Response.json({ error: 'Unknown action' }, { status: 400 })
  }
  if (!text || text.trim().length === 0) {
    return Response.json({ error: 'Select some text first' }, { status: 400 })
  }
  if (text.length > 8000) {
    return Response.json({ error: 'Selection is too long (max ~8000 characters)' }, { status: 400 })
  }

  const system =
    'You are a writing assistant embedded in a note-taking app. ' +
    PROMPTS[action] +
    ' Return ONLY the resulting text with no preamble, quotes, or explanation.'

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        system,
        messages: [{ role: 'user', content: text }],
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      return Response.json(
        { error: 'The AI service returned an error. Please try again.', detail: detail.slice(0, 300) },
        { status: 502 },
      )
    }

    const data = await res.json()
    const result = (data.content?.[0]?.text ?? '').trim()
    return Response.json({ result })
  } catch {
    return Response.json({ error: 'Could not reach the AI service.' }, { status: 502 })
  }
}
