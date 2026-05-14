import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transcript, opponent } = body

    const prompt = `A college baseball coach recorded a voice scouting note about ${opponent || 'an upcoming opponent'}. Content:

"${transcript}"

Write:

TRANSCRIPT:
[the spoken words naturally as a paragraph]

STRUCTURED SCOUT NOTES:

OFFENSIVE TENDENCIES:
- [bullet]
- [bullet]

PITCHING NOTES:
- [bullet]
- [bullet]
- [bullet]

DEFENSIVE NOTES:
- [bullet]
- [bullet]

BULLPEN MAP:
- [bullet]
- [bullet]

PER-PLAYER OBSERVATIONS:
- [bullet]
- [bullet]
- [bullet]

Concise and actionable. No em dashes.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 900,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const text = data.content?.filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('') || 'Error.'
    return NextResponse.json({ result: text })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
