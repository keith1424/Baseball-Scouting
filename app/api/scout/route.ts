import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, opponent, players, notes } = body

    let prompt = ''

    if (type === 'staff') {
      prompt = `You are a college baseball coach. Write a professional pre-game scouting report.
Opponent: ${opponent?.name || 'Unknown'} | Record: ${opponent?.record || ''} | Ranking: ${opponent?.ranking || 'Unranked'}
Team AVG: ${opponent?.avg || ''} | Team ERA: ${opponent?.era || ''}
Game 1 Starter: ${opponent?.starter || 'Unknown'}
Key Players: ${JSON.stringify(players || [])}
Coach Notes: ${notes || ''}

Format:
GAME PLAN (3 bold bullets)
OFFENSIVE APPROACH
PITCHING GAME PLAN
BULLPEN NOTES

Under 400 words. Direct and actionable. No em dashes.`
    } else if (type === 'player') {
      const p = players?.[0] || {}
      prompt = `Write a mobile-friendly player scouting card for a college baseball game.
Player: ${p.name || 'Unknown'} | #${p.num || ''} | ${p.pos || ''} | ${p.isPit ? 'Pitcher' : 'Hitter'}
Stats: ${JSON.stringify(p)}
Scout Note: ${p.note || ''}

Format EXACTLY:
TONIGHT: [Name, number, role - one key thing]
THE EDGE: [Most important thing to know]
WHAT TO LOOK FOR:
- [5 bullets max, punchy, actionable]
${p.isPit ? 'YOUR ADVANTAGE IF YOU BAT LEFT:\n[One sentence for LHH]' : 'APPROACH:\n[One sentence game plan]'}

Simple. Phone readable. No jargon. No em dashes.`
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const text = data.content?.filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('') || 'Error generating report.'
    return NextResponse.json({ report: text })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
