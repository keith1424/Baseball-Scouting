import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { transcript, opponent } = body
  const prompt = `A college baseball coach recorded a voice scouting note about ${opponent || 'an upcoming opponent'}. Content: "${transcript}". Write structured scout notes with sections: TRANSCRIPT, OFFENSIVE TENDENCIES, PITCHING NOTES, DEFENSIVE NOTES, BULLPEN MAP, PER-PLAYER OBSERVATIONS.`
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 900, messages: [{ role: 'user', content: prompt }] })
  })
  const data = await response.json()
  const text = data.content?.filter((b: {type:string}) => b.type === 'text').map((b: {text:string}) => b.text).join('') || 'Error.'
  return NextResponse.json({ result: text })
}
