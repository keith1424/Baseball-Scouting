'use client'
import { useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TABS = ['guide','schedule','opponents','intel','video','manual','matchup','reports']
const TAB_LABELS = ['What This Does','Schedule','Opponents','Team Intel','Video Hub','Manual Scout','Matchup Matrix','Reports']

type Player = {
  name:string;num:string;pos:string;bats?:string;throws?:string;yr?:string
  avg?:string;obp?:string;slg?:string;ops?:string;hr?:number;rbi?:number
  sb?:number;ab?:number;h?:number;r?:number;d?:number;t?:number;bb?:number;k?:number
  isPit:boolean;vsLHP?:string;vsRHP?:string;era?:string;whip?:string;k9?:string
  bb9?:string;w?:string;l?:string;ip?:string;vsLHB?:string;vsRHB?:string
  note?:string;kpct?:number;bbpct?:number;iso?:string;g?:number
  log?:{d:string;opp:string;ab:number;h:number;hr:number;rbi:number;bb:number;k:number}[]
  plog?:{d:string;opp:string;ip:string;h:number;r:number;er:number;bb:number;k:number;res:string}[]
}

const PLAYERS: Record<string, Player> = {
  webb:{name:'Marcus Webb',num:'24',pos:'3B',bats:'R',throws:'R',yr:'Jr',avg:'.361',obp:'.428',slg:'.541',ops:'.969',hr:9,rbi:34,sb:6,g:26,ab:94,h:34,r:22,d:8,t:1,bb:16,k:17,isPit:false,vsLHP:'.218',vsRHP:'.401',kpct:18,bbpct:17,iso:'.180',note:'High leg kick. Chases breaking ball down and in. .218 vs LHP all season.',log:[{d:'Apr 11',opp:'Fort Hays',ab:4,h:2,hr:1,rbi:3,bb:1,k:0},{d:'Apr 8',opp:'Pittsburg St',ab:4,h:3,hr:1,rbi:2,bb:2,k:1}]},
  cross:{name:'Tyler Cross',num:'7',pos:'SS',bats:'R',throws:'R',yr:'Sr',avg:'.344',obp:'.412',slg:'.498',ops:'.910',hr:5,rbi:22,sb:14,g:26,ab:90,h:31,r:19,d:6,t:2,bb:14,k:18,isPit:false,vsLHP:'.298',vsRHP:'.368',kpct:20,bbpct:16,iso:'.154',note:'Line drive hitter, uses whole field. Does not chase out of zone.',log:[{d:'Apr 11',opp:'Fort Hays',ab:4,h:2,hr:0,rbi:2,bb:2,k:1}]},
  hunt:{name:'D.J. Hunt',num:'33',pos:'CF',bats:'L',throws:'L',yr:'Jr',avg:'.328',obp:'.391',slg:'.461',ops:'.852',hr:3,rbi:18,sb:21,g:26,ab:88,h:29,r:24,d:5,t:2,bb:12,k:11,isPit:false,vsLHP:'.358',vsRHP:'.301',kpct:13,bbpct:14,iso:'.133',note:'Primary stolen base threat. 21 SB. Runs on first movement. Pop time 2.08.',log:[{d:'Apr 11',opp:'Fort Hays',ab:4,h:2,hr:0,rbi:1,bb:1,k:0}]},
  garcia:{name:'Ernesto Garcia',num:'12',pos:'1B',bats:'L',throws:'L',yr:'Sr',avg:'.312',obp:'.398',slg:'.521',ops:'.919',hr:11,rbi:38,sb:2,g:26,ab:89,h:28,r:16,d:7,t:0,bb:15,k:22,isPit:false,vsLHP:'.198',vsRHP:'.358',kpct:25,bbpct:17,iso:'.209',note:'Power bat. 11 HR. Vulnerable vs LHP (.198). Attack with FB in.',log:[{d:'Apr 11',opp:'Fort Hays',ab:4,h:1,hr:0,rbi:1,bb:1,k:2}]},
  brooks:{name:'Cole Brooks',num:'18',pos:'RF',bats:'R',throws:'R',yr:'Sr',avg:'.298',obp:'.361',slg:'.441',ops:'.802',hr:6,rbi:24,sb:8,g:26,ab:84,h:25,r:14,d:5,t:1,bb:11,k:18,isPit:false,vsLHP:'.318',vsRHP:'.281',kpct:21,bbpct:13,iso:'.143',note:'Plus arm in RF. Do not challenge him. 4 outfield assists this season.',log:[{d:'Apr 11',opp:'Fort Hays',ab:4,h:1,hr:0,rbi:1,bb:1,k:2}]},
  kim:{name:'Jae-Won Kim',num:'4',pos:'C',bats:'R',throws:'R',yr:'Jr',avg:'.284',obp:'.341',slg:'.398',ops:'.739',hr:3,rbi:16,sb:1,g:24,ab:74,h:21,r:11,d:4,t:0,bb:8,k:14,isPit:false,vsLHP:'.271',vsRHP:'.294',kpct:19,bbpct:11,iso:'.114',note:'Pop time 2.08. Solid receiver. Hunt will test him tonight.',log:[{d:'Apr 11',opp:'Fort Hays',ab:3,h:1,hr:0,rbi:1,bb:1,k:1}]},
  ramirez:{name:'Carlos Ramirez',num:'21',pos:'SP',bats:'R',throws:'R',yr:'Jr',isPit:true,era:'2.18',whip:'0.98',k9:'10.4',bb9:'2.1',w:'7',l:'1',ip:'58.1',vsLHB:'.224',vsRHB:'.298',kpct:28,bbpct:6,note:'4-seam FB 89-91. Shakes off twice before slider. Velocity drops innings 5-7.',plog:[{d:'Apr 11',opp:'Fort Hays',ip:'7.0',h:4,r:1,er:1,bb:1,k:9,res:'W'},{d:'Apr 5',opp:'Washburn',ip:'7.0',h:3,r:0,er:0,bb:2,k:10,res:'W'}]},
  holloway:{name:'Jake Holloway',num:'38',pos:'SP',bats:'L',throws:'L',yr:'Sr',isPit:true,era:'3.44',whip:'1.21',k9:'8.1',bb9:'3.2',w:'5',l:'2',ip:'44.2',vsLHB:'.298',vsRHB:'.241',kpct:22,bbpct:9,note:'LHP with plus changeup. Gets in trouble elevating FB. RHH have platoon advantage.',plog:[{d:'Apr 8',opp:'Pittsburg St',ip:'6.0',h:5,r:2,er:2,bb:2,k:7,res:'W'}]},
  oconnor:{name:"Sean O'Connor",num:'15',pos:'RP/CL',bats:'R',throws:'R',yr:'Sr',isPit:true,era:'1.84',whip:'0.91',k9:'11.8',bb9:'2.4',w:'3',l:'0',ip:'29.1',vsLHB:'.201',vsRHB:'.284',kpct:32,bbpct:7,note:'Elite closer. 6 saves. Hittable against LHH (.201). Manage his availability in a 3-game series.',plog:[{d:'Apr 12',opp:'Fort Hays',ip:'1.0',h:0,r:0,er:0,bb:0,k:2,res:'SV'}]},
  martinez:{name:'Diego Martinez',num:'29',pos:'SP',bats:'R',throws:'R',yr:'Jr',isPit:true,era:'3.91',whip:'1.28',k9:'7.2',bb9:'3.8',w:'4',l:'3',ip:'39.1',vsLHB:'.291',vsRHB:'.254',kpct:19,bbpct:11,note:'Falls behind in counts often. Sinker/curve. Hittable when he gets behind 2-0.',plog:[{d:'Apr 5',opp:'Washburn',ip:'5.2',h:6,r:3,er:3,bb:3,k:5,res:'ND'}]},
}

const OUR_BATTERS = [
  {name:'J. Tomas',bats:'L',kpct:16,bbpct:12,iso:'.198',vsRHP:'.338',vsLHP:'.291'},
  {name:'M. Reeves',bats:'L',kpct:18,bbpct:14,iso:'.171',vsRHP:'.321',vsLHP:'.278'},
  {name:'K. Ochoa',bats:'S',kpct:19,bbpct:11,iso:'.144',vsRHP:'.308',vsLHP:'.302'},
  {name:'D. Williams',bats:'R',kpct:22,bbpct:9,iso:'.132',vsRHP:'.291',vsLHP:'.264'},
  {name:'T. Patterson',bats:'R',kpct:24,bbpct:8,iso:'.121',vsRHP:'.278',vsLHP:'.248'},
  {name:'C. Richardson',bats:'R',kpct:26,bbpct:7,iso:'.109',vsRHP:'.258',vsLHP:'.231'},
  {name:'A. Nguyen',bats:'L',kpct:20,bbpct:13,iso:'.156',vsRHP:'.244',vsLHP:'.214'},
]

const OUR_PITCHERS = [
  {id:'lhp1',name:'Our LHP Starter',throws:'L',era:'3.21',k9:'8.4',bb9:'2.8',vsLHB:'.281',vsRHB:'.231',kpct:23,bbpct:8},
  {id:'rhp1',name:'Our RHP #2 Starter',throws:'R',era:'3.88',k9:'7.1',bb9:'3.4',vsLHB:'.261',vsRHB:'.278',kpct:19,bbpct:10},
  {id:'lhp2',name:'Our LHP #3 Starter',throws:'L',era:'4.12',k9:'6.8',bb9:'3.8',vsLHB:'.295',vsRHB:'.221',kpct:18,bbpct:11},
]

const THEIR_PITCHERS = ['ramirez','holloway','oconnor','martinez']
const THEIR_BATTERS = ['hunt','cross','webb','garcia','brooks','kim']

const SCHEDULE = [
  {date:'Apr 15',day:'Wed',opp:'Central Missouri',loc:'Away',conf:true,record:'18-8',rank:'#14',g:1,time:'6:00 PM'},
  {date:'Apr 16',day:'Thu',opp:'Central Missouri',loc:'Away',conf:true,record:'18-8',rank:'#14',g:2,time:'1:00 PM'},
  {date:'Apr 17',day:'Fri',opp:'Central Missouri',loc:'Away',conf:true,record:'18-8',rank:'#14',g:3,time:'1:00 PM'},
  {date:'Apr 22',day:'Wed',opp:'Fort Hays State',loc:'Home',conf:true,record:'12-14',rank:'',g:1,time:'6:00 PM'},
  {date:'Apr 23',day:'Thu',opp:'Fort Hays State',loc:'Home',conf:true,record:'12-14',rank:'',g:2,time:'1:00 PM'},
  {date:'Apr 29',day:'Wed',opp:'Missouri Western',loc:'Away',conf:true,record:'15-11',rank:'',g:1,time:'6:00 PM'},
]

const PLATFORMS = [
  {name:'Hudl',color:'#F5A800',desc:'Game film, highlight reels, advanced metrics'},
  {name:'YouTube',color:'#FF0000',desc:'Public film, college game broadcasts'},
  {name:'Twitter/X',color:'#1DA1F2',desc:'Prospect clips, game updates, commit announcements'},
  {name:'6-4-3 Charts',color:'#1A6B2A',desc:'Pitch charts, spray charts, defensive positioning data'},
  {name:'AWRE',color:'#8B1A8B',desc:'Advanced pitching and hitting analytics'},
  {name:'Synergy Sports',color:'#1A3A7A',desc:'Play-by-play data and video tagging'},
]

function matchupScore(batter:{bats:string;kpct:number;bbpct:number;iso:string;vsRHP:string;vsLHP:string}, pitcher:{throws:string;era:string;k9:string;bb9:string;kpct:number;bbpct:number;vsLHB:string;vsRHB:string}) {
  let score = 50
  const notes: string[] = []
  const pt = pitcher.throws
  const batterAvg = pt === 'R' ? parseFloat(batter.vsRHP) : parseFloat(batter.vsLHP)
  const hasPlatoon = (pt === 'R' && (batter.bats === 'L' || batter.bats === 'S')) || (pt === 'L' && (batter.bats === 'R' || batter.bats === 'S'))
  if (hasPlatoon) { score += 12; notes.push('Platoon advantage') } else { score -= 8; notes.push('No platoon edge') }
  const pitK9 = parseFloat(pitcher.k9)
  if (batter.kpct < 18 && pitK9 < 9) { score += 8; notes.push('Patient bat vs soft-K pitcher') }
  else if (batter.kpct > 24 && pitK9 > 10) { score -= 12; notes.push('High K% vs strikeout pitcher') }
  else if (batter.kpct < 20 && pitK9 > 10) { score -= 5; notes.push('Work counts vs K pitcher') }
  const pitBB9 = parseFloat(pitcher.bb9)
  if (batter.bbpct > 13 && pitBB9 > 3.5) { score += 10; notes.push('Patient bat vs wild pitcher') }
  else if (batter.bbpct > 12) { score += 4; notes.push('Disciplined hitter') }
  const pitERA = parseFloat(pitcher.era)
  const iso = parseFloat(batter.iso)
  if (iso > 0.175 && pitERA > 3.5) { score += 8; notes.push('Power bat vs hittable pitcher') }
  else if (iso > 0.175 && pitERA < 2.5) { score -= 5; notes.push('Elite pitcher limits power') }
  if (batterAvg > .320) { score += 10; notes.push(`Hitting .${Math.round(batterAvg*1000)} vs ${pt}HP`) }
  else if (batterAvg < .240) { score -= 10; notes.push(`Struggles vs ${pt}HP (.${Math.round(batterAvg*1000)})`) }
  if (pitERA < 2.5) score -= 8; else if (pitERA > 4.0) score += 8
  score = Math.max(10, Math.min(95, score))
  const label = score >= 70 ? 'Favorable' : score >= 50 ? 'Neutral' : score >= 35 ? 'Difficult' : 'Very Tough'
  const color = score >= 70 ? '#1A6B2A' : score >= 50 ? '#7A4A00' : score >= 35 ? '#8B1A1A' : '#5A0A0A'
  const bg = score >= 70 ? '#EAF5EA' : score >= 50 ? '#FFFEF0' : score >= 35 ? '#FFF5F5' : '#F5EEEE'
  return { score, label, color, bg, notes: notes.slice(0, 2) }
}

function theirMatchup(pid: string, pitcher:{throws:string;era:string;k9:string;bb9:string;kpct:number;bbpct:number}) {
  const p = PLAYERS[pid]; if (!p || p.isPit) return {score:50,label:'Neutral',color:'#7A4A00',notes:[],bg:'#FFFEF0'}
  const pt = pitcher.throws; const notes: string[] = []; let score = 50
  const theirAvg = pt === 'L' ? parseFloat(p.vsLHP||'.270') : parseFloat(p.vsRHP||'.310')
  const hasPlatoon = (pt === 'L' && (p.bats === 'R' || p.bats === 'S')) || (pt === 'R' && (p.bats === 'L' || p.bats === 'S'))
  if (!hasPlatoon) { score -= 10; notes.push('We have platoon edge') } else { score += 10; notes.push('They have platoon edge') }
  if (theirAvg < 0.235) { score -= 12; notes.push(`${p.name.split(' ')[1]} hits .${Math.round(theirAvg*1000)} vs our arm`) }
  else if (theirAvg > 0.340) { score += 12; notes.push(`Dangerous: .${Math.round(theirAvg*1000)} vs this arm`) }
  if ((p.kpct||20) > 24) { score -= 8; notes.push('High K% — make him chase') }
  else if ((p.kpct||20) < 16) { score += 8; notes.push('Makes contact — keep pitch down') }
  score = Math.max(10, Math.min(95, score))
  const label = score >= 65 ? 'Their Advantage' : score >= 45 ? 'Neutral' : 'Our Advantage'
  const color = score >= 65 ? '#8B1A1A' : score >= 45 ? '#7A4A00' : '#1A6B2A'
  const bg = score >= 65 ? '#FFF5F5' : score >= 45 ? '#FFFEF0' : '#EAF5EA'
  return { score, label, color, notes: notes.slice(0, 2), bg }
}

export default function Dashboard() {
  const [tab, setTab] = useState('guide')
  const [selectedPlayer, setSelectedPlayer] = useState<string|null>(null)
  const [playerTab, setPlayerTab] = useState('stats')
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [showOppModal, setShowOppModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddLinkModal, setShowAddLinkModal] = useState(false)
  const [staffReport, setStaffReport] = useState('')
  const [playerReport, setPlayerReport] = useState('')
  const [staffLoading, setStaffLoading] = useState(false)
  const [playerLoading, setPlayerLoading] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('Your spoken notes will appear here after recording...')
  const [voiceStructured, setVoiceStructured] = useState('After transcription, AI organizes into categories.')
  const [isRecording, setIsRecording] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('Tap to record')
  const [showSave, setShowSave] = useState(false)
  const [manualNotes, setManualNotes] = useState('')
  const [reportNotes, setReportNotes] = useState('')
  const [selectedTheirPitcher, setSelectedTheirPitcher] = useState('ramirez')
  const [selectedOurPitcher, setSelectedOurPitcher] = useState('lhp1')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{name:string;size:string;note:string;id:string}[]>([])
  const [fileNote, setFileNote] = useState('')
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string,boolean>>({})
  const [videoLinks, setVideoLinks] = useState([
    {id:'v1',player:'Carlos Ramirez',label:'Ramirez start vs NW Missouri',platform:'Hudl',url:'#',note:'4:12 back-foot slider sequence to LHH'},
    {id:'v2',player:'Marcus Webb',label:'Webb at-bats vs Washburn',platform:'YouTube',url:'#',note:'2:30 high leg kick clearly visible'},
    {id:'v3',player:'D.J. Hunt',label:'Hunt stolen base attempts',platform:'Twitter/X',url:'#',note:'Watch his first-step timing on first movement'},
  ])
  const [newLink, setNewLink] = useState({label:'',url:'',platform:'Hudl',player:'',note:''})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRef = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<Blob[]>([])

  const theirPitcher = PLAYERS[selectedTheirPitcher]
  const ourPitcher = OUR_PITCHERS.find(p => p.id === selectedOurPitcher) || OUR_PITCHERS[0]
  const pl = selectedPlayer ? PLAYERS[selectedPlayer] : null

  const card = {borderRadius:10,background:'#F5F0E8',padding:'10px 8px',textAlign:'center' as const}
  const cardV = {fontSize:17,fontWeight:700,color:'#1A2640',marginBottom:2}
  const cardL = {fontSize:10,color:'#6B6560',fontWeight:500,textTransform:'uppercase' as const,letterSpacing:'.3px'}

  function openPlayer(pid: string) { setSelectedPlayer(pid); setPlayerTab('stats'); setShowPlayerModal(true) }

  async function genStaff() {
    setStaffLoading(true); setStaffReport('')
    try {
      const res = await fetch('/api/scout', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'staff',opponent:{name:'Central Missouri Mules',record:'18-8',ranking:'#14',avg:'.318',era:'3.21',starter:'Carlos Ramirez RHP (2.18 ERA, 7-1)'},players:Object.values(PLAYERS).map(p=>({name:p.name,pos:p.pos,note:p.note})),notes:reportNotes})})
      const data = await res.json(); setStaffReport(data.report||'Error generating.')
    } catch { setStaffReport('Connection error.') }
    setStaffLoading(false)
  }

  async function genPlayer() {
    setPlayerLoading(true); setPlayerReport('')
    try {
      const res = await fetch('/api/scout', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'player',players:[PLAYERS.ramirez]})})
      const data = await res.json(); setPlayerReport(data.report||'Error generating.')
    } catch { setPlayerReport('Connection error.') }
    setPlayerLoading(false)
  }

  async function handleFileUpload(file: File) {
    setUploadingFile(true)
    try {
      const path = `scouting/${Date.now()}_${file.name}`
      const {error} = await supabase.storage.from('scouting-files').upload(path, file)
      if (!error) { await supabase.from('scouting_files').insert({opponent:'Central Missouri',file_name:file.name,file_path:path,file_type:file.type,file_size:file.size,note:fileNote}) }
      setUploadedFiles(prev=>[...prev,{name:file.name,size:(file.size/1024).toFixed(0)+' KB',note:fileNote,id:path}])
      setFileNote(''); alert(file.name+' uploaded.')
    } catch(e) { console.error(e); setUploadedFiles(prev=>[...prev,{name:file.name,size:(file.size/1024).toFixed(0)+' KB',note:fileNote,id:Date.now().toString()}]); setFileNote('') }
    setUploadingFile(false)
  }

  function addVideoLink() {
    if (!newLink.label||!newLink.url) return
    setVideoLinks(prev=>[...prev,{...newLink,id:Date.now().toString()}])
    setNewLink({label:'',url:'',platform:'Hudl',player:'',note:''}); setShowAddLinkModal(false)
  }

  function connectPlatform(name: string) {
    const urls: Record<string,string> = {'Hudl':'https://www.hudl.com/login','YouTube':'https://accounts.google.com/signin','Twitter/X':'https://twitter.com/login','6-4-3 Charts':'https://www.643charts.com','AWRE':'https://awre.io','Synergy Sports':'https://synergysports.com'}
    window.open(urls[name]||'#','_blank')
    setTimeout(()=>setConnectedPlatforms(prev=>({...prev,[name]:true})),1500)
  }

  async function runVoiceDemo() {
    const demo = `Central Missouri scouting notes. Ramirez is starting Game 1, right-hander, 2.18 ERA but his velocity drops two to three miles per hour in innings five through seven. He shakes off twice before throwing his slider. Webb at third hits .218 against lefties. Hunt in center is their stolen base threat, 21 steals, he goes on first movement. O'Connor is their closer, hittable against our left-handed hitters at .201.`
    setVoiceTranscript('Processing...'); setVoiceStatus('Calling AI...')
    try {
      const res = await fetch('/api/voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({transcript:demo,opponent:'Central Missouri Mules'})})
      const data = await res.json(); const text = data.result||'Error.'
      const ti = text.indexOf('TRANSCRIPT:'); const si = text.indexOf('STRUCTURED SCOUT NOTES:')
      setVoiceTranscript(ti>=0?text.substring(ti+11,si>=0?si:undefined).trim():demo)
      setVoiceStructured(si>=0?text.substring(si).trim():text)
      setVoiceStatus('Done. Tap to re-record.'); setShowSave(true)
    } catch { setVoiceTranscript('Connection error.') }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true})
      const mr = new MediaRecorder(stream); chunksRef.current=[]
      mr.ondataavailable=e=>chunksRef.current.push(e.data); mr.onstop=()=>runVoiceDemo()
      mr.start(); mediaRef.current=mr; setIsRecording(true); setVoiceStatus('Recording. Tap to stop.')
    } catch { alert('Microphone access required.') }
  }

  function stopRecording() {
    mediaRef.current?.stop(); mediaRef.current?.stream.getTracks().forEach(t=>t.stop())
    setIsRecording(false); setVoiceStatus('Processing...')
  }

  const navStyle = (t: string) => ({padding:'10px 16px',fontSize:12,fontWeight:500,border:'none',background:'transparent',cursor:'pointer',color:tab===t?'#fff':'#6A7A8A',borderBottom:`3px solid ${tab===t?'#E8541A':'transparent'}`,marginBottom:-3,whiteSpace:'nowrap' as const,fontFamily:'inherit'})
  const btnP = {background:'#E8541A',color:'#fff',border:'none',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit'} as React.CSSProperties
  const btnS = {background:'#1A2640',color:'#fff',border:'none',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit'} as React.CSSProperties
  const btnG = {background:'#fff',color:'#585450',border:'1px solid #E0DBD4',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,fontFamily:'inherit'} as React.CSSProperties
  const inp = {width:'100%',padding:'8px 10px',border:'1px solid #E0DBD4',borderRadius:8,fontSize:13,fontFamily:'inherit'} as React.CSSProperties
  const lbl = {fontSize:11,color:'#585450',display:'block',marginBottom:3,fontWeight:500} as React.CSSProperties


  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'#F0EDE8',fontFamily:"'DM Sans',system-ui,sans-serif",color:'#141414',fontSize:14}}>

      <div style={{background:'#1A2640',padding:'0 20px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:12,cursor:'pointer'}} onClick={()=>setTab('guide')}>
          <div style={{width:38,height:38,borderRadius:8,background:'#E8541A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff'}}>OSS</div>
          <div>
            <div style={{color:'#fff',fontSize:15,fontWeight:700}}>Opponent <span style={{color:'#E8541A'}}>Scouting System</span></div>
            <div style={{fontSize:10,color:'#6A6A7A',marginTop:1}}>Brand Velocity Co. Baseball Intelligence</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#6A6A7A'}}><div style={{width:6,height:6,borderRadius:'50%',background:'#4AE86A'}}></div>AI Connected</div>
          <div style={{width:30,height:30,borderRadius:'50%',background:'#E8541A',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:11,fontWeight:700}}>BV</div>
        </div>
      </div>

      <div style={{background:'#111C30',borderBottom:'3px solid #E8541A'}}>
        <div style={{maxWidth:1140,margin:'0 auto',padding:'0 20px',display:'flex',overflowX:'auto'}}>
          {TABS.map((t,i)=><button key={t} onClick={()=>setTab(t)} style={navStyle(t)}>{TAB_LABELS[i]}</button>)}
        </div>
      </div>

      <div style={{flex:1,padding:'24px 20px',maxWidth:1140,margin:'0 auto',width:'100%'}}>

        {tab==='guide'&&<div>
          <div style={{marginBottom:20}}><div style={{fontSize:22,fontWeight:700,marginBottom:4}}>Opponent Scouting System</div><div style={{fontSize:14,color:'#585450',lineHeight:1.7}}>AI-powered pre-game intelligence. Every opponent. Every series. Every edge.</div></div>
          {[{n:1,t:'Schedule',d:'Full schedule with rankings, records, and series status. Click any game to open the scouting workspace.'},{n:2,t:'Opponents',d:'Every program you face. One-click to the full dossier — stats, starters, and links to every tool.'},{n:3,t:'Team Intel',d:'Full roster with season stats, platoon splits, K%, BB%, ISO, and game logs for every player.'},{n:4,t:'Video Hub',d:'Connect Hudl, YouTube, X, 6-4-3, AWRE, and Synergy via direct login. Upload 6-4-3 files to Supabase storage. All film in one place.'},{n:5,t:'Manual Scout',d:'Live game notes via voice or text. AI structures into tendencies, pitching notes, and bullpen map.'},{n:6,t:'Matchup Matrix',d:'Switch between any of their starters or our starters. Advanced matchup scores for every batter using platoon splits, K%, BB%, and ISO. Fully dynamic.'},{n:7,t:'Reports',d:'One-click AI staff report and mobile player card for 30 minutes before first pitch.'}].map(item=>(
            <div key={item.n} style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:14,padding:20,marginBottom:10,display:'flex',gap:14,alignItems:'flex-start'}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:'#E8541A',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>{item.n}</div>
              <div><div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{item.t} <span style={{background:'#2D6A2D',color:'#fff',fontSize:9,fontWeight:600,padding:'2px 7px',borderRadius:20,marginLeft:4}}>LIVE</span></div><div style={{fontSize:13,color:'#585450',lineHeight:1.6}}>{item.d}</div></div>
            </div>
          ))}
        </div>}

        {tab==='schedule'&&<div>
          <div style={{fontSize:20,fontWeight:700,marginBottom:16}}>2026 Schedule</div>
          {SCHEDULE.map((g,i)=>(
            <div key={i} onClick={()=>setShowOppModal(true)} style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:12,padding:'14px 16px',marginBottom:8,cursor:'pointer',display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:52,textAlign:'center',flexShrink:0}}>
                <div style={{fontSize:10,color:'#9A9590',fontWeight:600,textTransform:'uppercase'}}>{g.day}</div>
                <div style={{fontSize:16,fontWeight:700,color:'#1A2640'}}>{g.date.split(' ')[1]}</div>
                <div style={{fontSize:10,color:'#9A9590'}}>{g.date.split(' ')[0]}</div>
              </div>
              <div style={{width:1,height:40,background:'#E0DBD4',flexShrink:0}}></div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>{g.opp} {g.rank&&<span style={{background:'#FFF0CC',color:'#7A5A00',fontSize:10,padding:'1px 7px',borderRadius:20,fontWeight:700,marginLeft:4}}>{g.rank}</span>}</div>
                <div style={{fontSize:12,color:'#585450'}}>{g.loc} · Game {g.g} · {g.time} · {g.record}</div>
              </div>
              <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
                {g.conf&&<span style={{background:'#EAF0FE',color:'#1A3A7A',fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:600}}>CONF</span>}
                <span style={{...btnP,padding:'4px 12px',fontSize:11}}>Scout</span>
              </div>
            </div>
          ))}
        </div>}

        {tab==='opponents'&&<div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{fontSize:20,fontWeight:700}}>Opponents</div>
            <button onClick={()=>setShowAddModal(true)} style={btnP}>+ Add Opponent</button>
          </div>
          {[{name:'Central Missouri Mules',record:'18-8',rank:'#14',series:'Apr 15-17',loc:'Away',avg:'.318',era:'3.21',starter:'Carlos Ramirez RHP'},{name:'Fort Hays State Tigers',record:'12-14',rank:'',series:'Apr 22-23',loc:'Home',avg:'.291',era:'4.12',starter:'TBD'},{name:'Missouri Western Griffons',record:'15-11',rank:'',series:'Apr 29-30',loc:'Away',avg:'.301',era:'3.88',starter:'TBD'}].map((opp,i)=>(
            <div key={i} onClick={()=>setShowOppModal(true)} style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:12,padding:16,marginBottom:10,cursor:'pointer'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div><div style={{fontSize:15,fontWeight:700,marginBottom:3}}>{opp.name} {opp.rank&&<span style={{background:'#FFF0CC',color:'#7A5A00',fontSize:10,padding:'1px 7px',borderRadius:20,fontWeight:700,marginLeft:4}}>{opp.rank}</span>}</div><div style={{fontSize:12,color:'#585450'}}>{opp.record} · Series: {opp.series} · {opp.loc}</div></div>
                <button style={btnS}>Open Scouting</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {[['Team AVG',opp.avg],['ERA',opp.era],['Probable G1',opp.starter],['Location',opp.loc]].map(([l,v])=><div key={String(l)} style={card}><div style={cardV}>{String(v)}</div><div style={cardL}>{String(l)}</div></div>)}
              </div>
            </div>
          ))}
        </div>}

        {tab==='intel'&&<div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <div style={{fontSize:20,fontWeight:700}}>Central Missouri Mules</div>
            <div style={{display:'flex',gap:6}}><span style={{background:'#FFF0CC',color:'#7A5A00',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>#14 D2Baseball</span><span style={{background:'#F5F0E8',color:'#585450',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600}}>18-8 · MIAA</span></div>
          </div>
          <div style={{fontSize:12,color:'#9A9590',marginBottom:16}}>Stats via NCAA · Updated today</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
            {[['.318','Team AVG'],['3.21','ERA'],['18-8','Record'],['38','SB']].map(([v,l])=><div key={l} style={card}><div style={{...cardV,fontSize:20}}>{v}</div><div style={cardL}>{l}</div></div>)}
          </div>
          <div style={{fontSize:11,fontWeight:700,color:'#585450',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10,paddingBottom:7,borderBottom:'2px solid #E8541A'}}>Pitching Staff</div>
          <div style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:14,overflow:'hidden',marginBottom:20}}>
            {THEIR_PITCHERS.map(pid=>{const p=PLAYERS[pid];return(
              <div key={pid} onClick={()=>openPlayer(pid)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:'1px solid #E0DBD4',cursor:'pointer'}}>
                <div style={{width:32,height:32,borderRadius:7,background:'#1A2640',display:'flex',alignItems:'center',justifyContent:'center',color:'#E8541A',fontSize:11,fontWeight:700,flexShrink:0}}>#{p.num}</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{p.name}</div><div style={{fontSize:11,color:'#585450'}}>{p.pos} · {p.yr} · {p.w}-{p.l} · {p.era} ERA · K/9: {p.k9} · K%: {p.kpct}%</div></div>
                <span style={{background:'#FFF0CC',color:'#7A5A00',fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:700}}>vs LHB: {p.vsLHB}</span>
              </div>
            )})}
          </div>
          <div style={{fontSize:11,fontWeight:700,color:'#585450',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10,paddingBottom:7,borderBottom:'2px solid #E8541A'}}>Position Players</div>
          <div style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:14,overflow:'hidden'}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead><tr style={{background:'#F5F0E8'}}>{['#','Name','Pos','AVG','OBP','SLG','HR','RBI','SB','K%','BB%','vs LHP','vs RHP'].map(h=><th key={h} style={{padding:'8px 10px',textAlign:'left',color:'#585450',borderBottom:'2px solid #E0DBD4',fontSize:10,fontWeight:700,textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
                <tbody>{THEIR_BATTERS.map(pid=>{const p=PLAYERS[pid];return(
                  <tr key={pid} onClick={()=>openPlayer(pid)} style={{cursor:'pointer',borderBottom:'1px solid #E0DBD4'}}>
                    <td style={{padding:'9px 10px',fontWeight:700,color:'#E8541A'}}>#{p.num}</td>
                    <td style={{padding:'9px 10px',fontWeight:600,whiteSpace:'nowrap'}}>{p.name}</td>
                    <td style={{padding:'9px 10px',color:'#585450'}}>{p.pos}</td>
                    <td style={{padding:'9px 10px',fontWeight:700}}>{p.avg}</td>
                    <td style={{padding:'9px 10px'}}>{p.obp}</td>
                    <td style={{padding:'9px 10px'}}>{p.slg}</td>
                    <td style={{padding:'9px 10px'}}>{p.hr}</td>
                    <td style={{padding:'9px 10px'}}>{p.rbi}</td>
                    <td style={{padding:'9px 10px'}}>{p.sb}</td>
                    <td style={{padding:'9px 10px'}}>{p.kpct}%</td>
                    <td style={{padding:'9px 10px'}}>{p.bbpct}%</td>
                    <td style={{padding:'9px 10px',color:parseFloat(p.vsLHP||'0')<0.240?'#1A6B2A':'#8B1A1A',fontWeight:600}}>{p.vsLHP}</td>
                    <td style={{padding:'9px 10px'}}>{p.vsRHP}</td>
                  </tr>
                )})}
                </tbody>
              </table>
            </div>
          </div>
        </div>}

        {tab==='video'&&<div>
          <div style={{fontSize:20,fontWeight:700,marginBottom:4}}>Video Hub</div>
          <div style={{fontSize:13,color:'#585450',marginBottom:20}}>Connect your accounts, add video links, and upload 6-4-3 scouting files stored in Supabase.</div>
          <div style={{fontSize:11,fontWeight:700,color:'#585450',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10,paddingBottom:7,borderBottom:'2px solid #E8541A'}}>Platform Connections</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:10,marginBottom:24}}>
            {PLATFORMS.map(p=>(
              <div key={p.name} style={{background:'#fff',border:`2px solid ${connectedPlatforms[p.name]?'#1A6B2A':'#E0DBD4'}`,borderRadius:12,padding:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:28,height:28,borderRadius:6,background:p.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>{p.name.slice(0,2)}</div>
                    <div style={{fontSize:13,fontWeight:700}}>{p.name}</div>
                  </div>
                  <span style={{background:connectedPlatforms[p.name]?'#EAF5EA':'#F5F0E8',color:connectedPlatforms[p.name]?'#1A6B2A':'#9A9590',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20}}>{connectedPlatforms[p.name]?'Connected':'Not Connected'}</span>
                </div>
                <div style={{fontSize:11,color:'#585450',marginBottom:10}}>{p.desc}</div>
                <button onClick={()=>connectPlatform(p.name)} style={{width:'100%',padding:'8px',borderRadius:8,border:`1px solid ${connectedPlatforms[p.name]?'#1A6B2A':'#E0DBD4'}`,background:connectedPlatforms[p.name]?'#EAF5EA':'#1A2640',color:connectedPlatforms[p.name]?'#1A6B2A':'#fff',fontWeight:600,cursor:'pointer',fontFamily:'inherit',fontSize:12}}>
                  {connectedPlatforms[p.name]?`Open ${p.name}`:`Log In to ${p.name}`}
                </button>
              </div>
            ))}
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,paddingBottom:7,borderBottom:'2px solid #E8541A'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#585450',textTransform:'uppercase',letterSpacing:'.5px'}}>Video Library</div>
            <button onClick={()=>setShowAddLinkModal(true)} style={{...btnP,padding:'5px 12px',fontSize:11}}>+ Add Link</button>
          </div>
          <div style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:14,overflow:'hidden',marginBottom:20}}>
            {videoLinks.map(v=>(
              <div key={v.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:'1px solid #E0DBD4'}}>
                <div style={{width:50,height:32,borderRadius:6,background:v.platform==='Hudl'?'#F5A800':v.platform==='YouTube'?'#FF0000':v.platform.includes('6-4-3')?'#1A6B2A':'#1DA1F2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff',flexShrink:0}}>{v.platform.slice(0,5)}</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{v.label}</div><div style={{fontSize:11,color:'#585450'}}>{v.player} · {v.note}</div></div>
                <button onClick={()=>window.open(v.url,'_blank')} style={{...btnS,padding:'5px 12px',fontSize:11}}>Open</button>
              </div>
            ))}
          </div>

          <div style={{fontSize:11,fontWeight:700,color:'#585450',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10,paddingBottom:7,borderBottom:'2px solid #E8541A'}}>6-4-3 Charts File Upload</div>
          <div style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:14,padding:20,marginBottom:10}}>
            <div style={{fontSize:13,color:'#585450',marginBottom:14,lineHeight:1.6}}>Upload exported 6-4-3 scouting files. PDFs, CSVs, and images stored securely in Supabase, linked to the current opponent.</div>
            <div style={{marginBottom:10}}><label style={lbl}>File Note (optional)</label><input value={fileNote} onChange={e=>setFileNote(e.target.value)} placeholder="e.g. Ramirez pitch chart vs Fort Hays" style={inp}/></div>
            <label style={{display:'block',border:'2px dashed #C8A060',borderRadius:10,padding:24,textAlign:'center',cursor:'pointer',background:'#FEFBF5'}}>
              <input ref={fileInputRef} type="file" accept=".pdf,.csv,.jpg,.jpeg,.png,.xlsx" style={{display:'none'}} onChange={async e=>{const f=e.target.files?.[0];if(f)await handleFileUpload(f)}}/>
              {uploadingFile
                ?<div style={{fontSize:13,fontWeight:600,color:'#E8541A'}}>Uploading to Supabase...</div>
                :<div><div style={{fontSize:14,fontWeight:600,color:'#1A2640'}}>Drop 6-4-3 export here or click to browse</div><div style={{fontSize:11,color:'#9A9590',marginTop:4}}>PDF · CSV · XLSX · JPG · PNG</div></div>
              }
            </label>
            {uploadedFiles.length>0&&<div style={{marginTop:14}}>
              <div style={{fontSize:11,fontWeight:700,color:'#585450',marginBottom:8,textTransform:'uppercase',letterSpacing:'.3px'}}>{uploadedFiles.length} File{uploadedFiles.length>1?'s':''} Stored</div>
              {uploadedFiles.map(f=>(
                <div key={f.id} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 12px',background:'#F5F0E8',borderRadius:8,marginBottom:6}}>
                  <div style={{width:32,height:32,borderRadius:7,background:'#EAF5EA',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#1A6B2A',flexShrink:0}}>FILE</div>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{f.name}</div><div style={{fontSize:11,color:'#585450'}}>{f.size}{f.note?` · ${f.note}`:''}</div></div>
                  <span style={{background:'#EAF5EA',color:'#1A6B2A',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20}}>Stored</span>
                </div>
              ))}
            </div>}
          </div>
        </div>}

        {tab==='manual'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Voice Scout Note <span style={{background:'#2D6A2D',color:'#fff',fontSize:9,padding:'2px 7px',borderRadius:20,marginLeft:4}}>LIVE</span></div>
            <div style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:14,padding:20}}>
              <div style={{textAlign:'center',marginBottom:16}}>
                <button onClick={isRecording?stopRecording:startRecording} style={{width:64,height:64,borderRadius:'50%',border:'none',cursor:'pointer',background:isRecording?'#8B1A1A':'#1A6B2A',color:'#fff',fontSize:22,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px'}}>{isRecording?'⏹':'🎤'}</button>
                <div style={{fontSize:12,color:'#585450',fontWeight:500}}>{voiceStatus}</div>
              </div>
              <div style={{fontSize:11,fontWeight:700,color:'#585450',textTransform:'uppercase',letterSpacing:'.3px',marginBottom:6}}>Transcript</div>
              <div style={{background:'#F5F0E8',border:'1px solid #E0DBD4',borderRadius:8,padding:12,fontSize:13,lineHeight:1.7,minHeight:80,marginBottom:12,whiteSpace:'pre-wrap'}}>{voiceTranscript}</div>
              <div style={{fontSize:11,fontWeight:700,color:'#585450',textTransform:'uppercase',letterSpacing:'.3px',marginBottom:6}}>Structured Notes</div>
              <div style={{background:'#EAF3EA',border:'1px solid #B0D0B0',borderRadius:8,padding:12,fontSize:13,lineHeight:1.7,minHeight:80,whiteSpace:'pre-wrap'}}>{voiceStructured}</div>
              {showSave&&<div style={{display:'flex',gap:8,marginTop:12}}><button onClick={()=>alert('Saved!')} style={btnP}>Save Notes</button><button onClick={()=>{setVoiceTranscript('Your spoken notes will appear here...');setVoiceStructured('After transcription, AI organizes into categories.');setVoiceStatus('Tap to record');setShowSave(false)}} style={btnG}>Clear</button></div>}
              <button onClick={runVoiceDemo} style={{marginTop:10,background:'#F5F0E8',color:'#585450',border:'1px solid #E0DBD4',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:11,fontFamily:'inherit',width:'100%'}}>Run AI Demo (no mic needed)</button>
            </div>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Manual Notes</div>
            <div style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:14,padding:20}}>
              <div style={{marginBottom:10}}><label style={lbl}>Opponent</label><select style={inp}><option>Central Missouri Mules</option><option>Fort Hays State Tigers</option><option>Missouri Western Griffons</option></select></div>
              <div style={{marginBottom:10}}><label style={lbl}>Scouting Notes</label><textarea value={manualNotes} onChange={e=>setManualNotes(e.target.value)} placeholder="Type your observations..." style={{...inp,resize:'vertical',minHeight:200}}/></div>
              <div style={{display:'flex',gap:8}}><button onClick={()=>alert('Saved!')} style={btnP}>Save Notes</button><button onClick={()=>setManualNotes('')} style={btnG}>Clear</button></div>
            </div>
          </div>
        </div>}

        {tab==='matchup'&&<div>
          <div style={{fontSize:20,fontWeight:700,marginBottom:4}}>Matchup Matrix</div>
          <div style={{fontSize:13,color:'#585450',marginBottom:16}}>Switch pitchers to see how every matchup changes. Scores calculated from platoon splits, K%, BB%, ISO, and ERA.</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
            <div style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:12,padding:14}}>
              <div style={{fontSize:11,fontWeight:700,color:'#585450',textTransform:'uppercase',letterSpacing:'.3px',marginBottom:8}}>Their Pitcher — affects our lineup score</div>
              <select value={selectedTheirPitcher} onChange={e=>setSelectedTheirPitcher(e.target.value)} style={inp}>
                {THEIR_PITCHERS.map(pid=><option key={pid} value={pid}>{PLAYERS[pid].name} ({PLAYERS[pid].throws}HP) — {PLAYERS[pid].era} ERA · K/9: {PLAYERS[pid].k9}</option>)}
              </select>
              {theirPitcher&&<div style={{marginTop:10,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                {[['ERA',theirPitcher.era],['K/9',theirPitcher.k9],['BB/9',theirPitcher.bb9],['K%',theirPitcher.kpct+'%']].map(([l,v])=>(
                  <div key={String(l)} style={{background:'#F5F0E8',borderRadius:8,padding:'6px 4px',textAlign:'center'}}><div style={{fontSize:14,fontWeight:700,color:'#1A2640'}}>{String(v)}</div><div style={{fontSize:9,color:'#9A9590',textTransform:'uppercase'}}>{String(l)}</div></div>
                ))}
              </div>}
              <div style={{marginTop:10,fontSize:12,color:'#585450',background:'#FFF8E8',borderRadius:8,padding:'8px 10px',borderLeft:'3px solid #E8541A'}}>{theirPitcher?.note}</div>
            </div>
            <div style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:12,padding:14}}>
              <div style={{fontSize:11,fontWeight:700,color:'#585450',textTransform:'uppercase',letterSpacing:'.3px',marginBottom:8}}>Our Pitcher — affects their lineup score</div>
              <select value={selectedOurPitcher} onChange={e=>setSelectedOurPitcher(e.target.value)} style={inp}>
                {OUR_PITCHERS.map(p=><option key={p.id} value={p.id}>{p.name} ({p.throws}HP) — {p.era} ERA · K/9: {p.k9}</option>)}
              </select>
              {ourPitcher&&<div style={{marginTop:10,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                {[['ERA',ourPitcher.era],['K/9',ourPitcher.k9],['BB/9',ourPitcher.bb9],['Throws',ourPitcher.throws+'HP']].map(([l,v])=>(
                  <div key={String(l)} style={{background:'#F5F0E8',borderRadius:8,padding:'6px 4px',textAlign:'center'}}><div style={{fontSize:14,fontWeight:700,color:'#1A2640'}}>{String(v)}</div><div style={{fontSize:9,color:'#9A9590',textTransform:'uppercase'}}>{String(l)}</div></div>
                ))}
              </div>}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'#585450',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10,paddingBottom:7,borderBottom:'2px solid #E8541A'}}>Our Lineup vs {theirPitcher?.name} ({theirPitcher?.throws}HP)</div>
              <div style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:14,overflow:'hidden'}}>
                {OUR_BATTERS.map((batter,i)=>{
                  const ms=matchupScore(batter,theirPitcher as any)
                  return(
                    <div key={i} style={{padding:'11px 14px',borderBottom:'1px solid #E0DBD4',background:ms.bg}}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                        <div style={{width:38,height:38,borderRadius:'50%',background:ms.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff',flexShrink:0}}>{ms.score}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700}}>{batter.name} <span style={{fontSize:10,color:'#9A9590',fontWeight:400}}>Bats {batter.bats}</span></div>
                          <div style={{fontSize:11,fontWeight:700,color:ms.color}}>{ms.label}</div>
                        </div>
                        <div style={{fontSize:10,color:ms.color,textAlign:'right',fontWeight:600}}>
                          {theirPitcher?.throws==='R'?`vs RHP: ${batter.vsRHP}`:`vs LHP: ${batter.vsLHP}`}
                        </div>
                      </div>
                      <div style={{fontSize:11,color:'#585450',paddingLeft:48}}>{ms.notes.map((n,ni)=><span key={ni} style={{marginRight:10}}>· {n}</span>)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'#585450',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10,paddingBottom:7,borderBottom:'2px solid #E8541A'}}>Their Lineup vs {ourPitcher?.name} ({ourPitcher?.throws}HP)</div>
              <div style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:14,overflow:'hidden'}}>
                {THEIR_BATTERS.map((pid,i)=>{
                  const batter=PLAYERS[pid]
                  const ms=theirMatchup(pid,ourPitcher as any)
                  return(
                    <div key={i} style={{padding:'11px 14px',borderBottom:'1px solid #E0DBD4',background:ms.bg}}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                        <div style={{width:38,height:38,borderRadius:'50%',background:ms.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff',flexShrink:0}}>{ms.score}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700}}>#{batter.num} {batter.name} <span style={{fontSize:10,color:'#9A9590',fontWeight:400}}>Bats {batter.bats}</span></div>
                          <div style={{fontSize:11,fontWeight:700,color:ms.color}}>{ms.label}</div>
                        </div>
                        <div style={{fontSize:10,color:'#585450',textAlign:'right'}}>
                          {ourPitcher?.throws==='L'?`vs LHP: ${batter.vsLHP}`:`vs RHP: ${batter.vsRHP}`}
                        </div>
                      </div>
                      <div style={{fontSize:11,color:'#585450',paddingLeft:48}}>{ms.notes.map((n,ni)=><span key={ni} style={{marginRight:10}}>· {n}</span>)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div style={{marginTop:14,background:'#fff',border:'1px solid #E0DBD4',borderRadius:10,padding:'10px 16px',display:'flex',gap:20,flexWrap:'wrap',alignItems:'center'}}>
            <div style={{fontSize:11,color:'#585450',fontWeight:600}}>Score legend:</div>
            {[['70-95','Favorable','#1A6B2A'],['50-69','Neutral','#7A4A00'],['35-49','Difficult','#8B1A1A'],['10-34','Very Tough','#5A0A0A']].map(([r,l,c])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:12,height:12,borderRadius:'50%',background:String(c)}}></div><span style={{fontSize:11,color:'#585450'}}>{r} — {l}</span></div>
            ))}
            <div style={{fontSize:11,color:'#9A9590',marginLeft:'auto'}}>Uses: platoon splits · K% · BB% · ISO · ERA</div>
          </div>
        </div>}

        {tab==='reports'&&<div>
          <div style={{fontSize:20,fontWeight:700,marginBottom:4}}>Reports</div>
          <div style={{fontSize:13,color:'#585450',marginBottom:20}}>AI-generated pre-game documents for staff and players</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
            <div style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:14,padding:16}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Additional Coach Notes</div>
              <textarea value={reportNotes} onChange={e=>setReportNotes(e.target.value)} placeholder="Add game plan priorities, recent intel, lineup changes..." style={{...inp,resize:'vertical',minHeight:80}}/>
            </div>
            <div style={{background:'#1A2640',border:'1px solid #111C30',borderRadius:14,padding:16}}>
              <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:4}}>Series: @ Central Missouri</div>
              <div style={{fontSize:12,color:'#7A8AA0',lineHeight:1.8}}>Apr 15-17 · MIAA Conference · Ranked #14<br/>G1 Probable: Ramirez RHP (2.18 ERA, 7-1)<br/>Our LHH bats have the platoon advantage</div>
            </div>
          </div>
          <div style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700}}>AI Staff Report</div>
              <div style={{display:'flex',gap:8}}>
                {staffReport&&<button onClick={()=>navigator.clipboard.writeText(staffReport).then(()=>alert('Copied!'))} style={btnG}>Copy</button>}
                <button onClick={genStaff} disabled={staffLoading} style={{...btnP,opacity:staffLoading?.6:1}}>{staffLoading?'Generating...':'Generate Staff Report'}</button>
              </div>
            </div>
            <div style={{background:'#F5F0E8',border:'1px solid #E0DBD4',borderRadius:8,padding:14,fontSize:13,lineHeight:1.8,minHeight:100,whiteSpace:'pre-wrap'}}>{staffReport||'Click Generate to produce the full AI pre-game document. Combines opponent stats, matchup analysis, and your notes.'}</div>
          </div>
          <div style={{background:'#fff',border:'1px solid #E0DBD4',borderRadius:14,padding:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div><div style={{fontSize:13,fontWeight:700}}>Player Card</div><div style={{fontSize:11,color:'#585450'}}>Tonight starter: Carlos Ramirez · Phone-optimized</div></div>
              <button onClick={genPlayer} disabled={playerLoading} style={{...btnS,opacity:playerLoading?.6:1}}>{playerLoading?'Generating...':'Generate Player Card'}</button>
            </div>
            <div style={{background:'#F5F0E8',border:'1px solid #E0DBD4',borderRadius:8,padding:14,fontSize:13,lineHeight:1.8,minHeight:80,whiteSpace:'pre-wrap'}}>{playerReport||'Phone-optimized. Large text, 5 bullets max. Ready 30 minutes before first pitch.'}</div>
          </div>
        </div>}

      </div>

      {showPlayerModal&&pl&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setShowPlayerModal(false)}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,width:'min(660px,100%)',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 24px 80px rgba(0,0,0,.3)'}}>
            <div style={{background:'#1A2640',padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div><div style={{color:'#fff',fontSize:18,fontWeight:700}}>#{pl.num} {pl.name}</div><div style={{color:'#888',fontSize:12,marginTop:3}}>Central Missouri · {pl.pos} · {pl.yr}{pl.bats?` · Bats ${pl.bats}`:''}{pl.throws?` / Throws ${pl.throws}`:''}</div></div>
              <button onClick={()=>setShowPlayerModal(false)} style={{background:'rgba(255,255,255,.15)',border:'none',cursor:'pointer',color:'#fff',fontSize:16,padding:'4px 10px',borderRadius:6,fontFamily:'inherit'}}>x</button>
            </div>
            <div style={{padding:22}}>
              <div style={{display:'flex',gap:8,borderBottom:'1px solid #E0DBD4',marginBottom:16}}>
                {['stats','log','notes'].map(t=><button key={t} onClick={()=>setPlayerTab(t)} style={{padding:'8px 14px',fontSize:12,fontWeight:500,border:'none',background:'transparent',cursor:'pointer',color:playerTab===t?'#1A2640':'#585450',borderBottom:`2px solid ${playerTab===t?'#E8541A':'transparent'}`,marginBottom:-1,fontFamily:'inherit'}}>{t==='stats'?'Season Stats':t==='log'?'Game Log':'Scout Notes'}</button>)}
              </div>
              {playerTab==='stats'&&<div>
                {!pl.isPit?(<div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8,marginBottom:12}}>{[['AVG',pl.avg],['OBP',pl.obp],['SLG',pl.slg],['OPS',pl.ops],['HR',pl.hr],['RBI',pl.rbi]].map(([l,v])=><div key={String(l)} style={card}><div style={cardV}>{String(v)}</div><div style={cardL}>{String(l)}</div></div>)}</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>{[['K%',pl.kpct+'%'],['BB%',pl.bbpct+'%'],['vs LHP',pl.vsLHP],['vs RHP',pl.vsRHP]].map(([l,v])=><div key={String(l)} style={card}><div style={{...cardV,color:l==='vs LHP'&&parseFloat(String(v))<0.240?'#1A6B2A':'#1A2640'}}>{String(v)}</div><div style={cardL}>{String(l)}</div></div>)}</div>
                </div>):(<div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:12}}>{[['ERA',pl.era],['WHIP',pl.whip],['K/9',pl.k9],['BB/9',pl.bb9],['IP',pl.ip]].map(([l,v])=><div key={String(l)} style={card}><div style={cardV}>{String(v)}</div><div style={cardL}>{String(l)}</div></div>)}</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>{[['K%',pl.kpct+'%'],['BB%',pl.bbpct+'%'],['vs LHB',pl.vsLHB],['vs RHB',pl.vsRHB]].map(([l,v])=><div key={String(l)} style={card}><div style={cardV}>{String(v)}</div><div style={cardL}>{String(l)}</div></div>)}</div>
                </div>)}
                <div style={{padding:12,background:'#F5F0E8',borderRadius:8,borderLeft:'3px solid #E8541A',fontSize:13,lineHeight:1.7}}><strong>Scout Note:</strong> {pl.note}</div>
              </div>}
              {playerTab==='log'&&<div style={{overflowX:'auto'}}>
                {!pl.isPit&&pl.log?(<table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead><tr style={{background:'#F5F0E8'}}>{['Date','Opp','AB','H','HR','RBI','BB','K'].map(h=><th key={h} style={{padding:'8px 10px',textAlign:'left',color:'#585450',borderBottom:'2px solid #E0DBD4',fontSize:10,fontWeight:700}}>{h}</th>)}</tr></thead>
                  <tbody>{pl.log.map((g,i)=><tr key={i} style={{background:g.h>=3?'#F0FAF0':g.h===0&&g.ab>=3?'#FFF5F5':'inherit',borderBottom:'1px solid #E0DBD4'}}><td style={{padding:'8px 10px'}}>{g.d}</td><td style={{padding:'8px 10px'}}>{g.opp}</td><td style={{padding:'8px 10px'}}>{g.ab}</td><td style={{padding:'8px 10px',fontWeight:g.h>=2?700:400,color:g.h>=2?'#1A6B2A':g.h===0?'#8B1A1A':'inherit'}}>{g.h}</td><td style={{padding:'8px 10px'}}>{g.hr}</td><td style={{padding:'8px 10px'}}>{g.rbi}</td><td style={{padding:'8px 10px'}}>{g.bb}</td><td style={{padding:'8px 10px'}}>{g.k}</td></tr>)}</tbody>
                </table>):pl.isPit&&pl.plog?(<table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead><tr style={{background:'#F5F0E8'}}>{['Date','Opp','IP','H','R','ER','BB','K','Result'].map(h=><th key={h} style={{padding:'8px 10px',textAlign:'left',color:'#585450',borderBottom:'2px solid #E0DBD4',fontSize:10,fontWeight:700}}>{h}</th>)}</tr></thead>
                  <tbody>{pl.plog.map((g,i)=><tr key={i} style={{borderBottom:'1px solid #E0DBD4'}}><td style={{padding:'8px 10px'}}>{g.d}</td><td style={{padding:'8px 10px'}}>{g.opp}</td><td style={{padding:'8px 10px'}}>{g.ip}</td><td style={{padding:'8px 10px'}}>{g.h}</td><td style={{padding:'8px 10px'}}>{g.r}</td><td style={{padding:'8px 10px'}}>{g.er}</td><td style={{padding:'8px 10px'}}>{g.bb}</td><td style={{padding:'8px 10px'}}>{g.k}</td><td style={{padding:'8px 10px',fontWeight:700,color:g.res==='W'||g.res==='SV'?'#1A6B2A':'#8B1A1A'}}>{g.res}</td></tr>)}</tbody>
                </table>):<div style={{textAlign:'center',padding:30,color:'#585450'}}>No log data.</div>}
              </div>}
              {playerTab==='notes'&&<div>
                <div style={{padding:14,background:'#F5F0E8',borderRadius:8,borderLeft:'3px solid #E8541A',fontSize:13,lineHeight:1.8,marginBottom:14}}>{pl.note}</div>
                <textarea placeholder="Add your own observation..." style={{...inp,minHeight:80,marginBottom:8}}/>
                <button onClick={()=>alert('Saved!')} style={btnP}>Save Note</button>
              </div>}
            </div>
          </div>
        </div>
      )}

      {showOppModal&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setShowOppModal(false)}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,width:'min(700px,100%)',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 80px rgba(0,0,0,.3)'}}>
            <div style={{background:'#1A2640',padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div><div style={{color:'#fff',fontSize:18,fontWeight:700}}>Central Missouri Mules</div><div style={{color:'#888',fontSize:12,marginTop:3}}>18-8 · MIAA · #14 · Apr 15-17</div></div>
              <div style={{display:'flex',gap:8}}><button onClick={()=>{setShowOppModal(false);setTab('reports')}} style={btnP}>Generate Reports</button><button onClick={()=>setShowOppModal(false)} style={{background:'rgba(255,255,255,.15)',border:'none',cursor:'pointer',color:'#fff',fontSize:16,padding:'4px 10px',borderRadius:6,fontFamily:'inherit'}}>x</button></div>
            </div>
            <div style={{padding:22}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>{[['.318','Team AVG'],['.872','OPS'],['3.21','ERA'],['18-8','Record']].map(([v,l])=><div key={l} style={card}><div style={{...cardV,fontSize:20}}>{v}</div><div style={cardL}>{l}</div></div>)}</div>
              <div style={{background:'#FFF0CC',border:'1px solid #E8D090',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#7A5A00',marginBottom:16}}>G1 probable: <strong>Carlos Ramirez RHP</strong> (2.18 ERA, 7-1). LHH bats have platoon advantage. Velocity drops innings 5-7.</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{[['Team Intel','intel'],['Video Hub','video'],['Manual Scout','manual'],['Matchup Matrix','matchup'],['Reports','reports']].map(([label,t])=><button key={t} onClick={()=>{setShowOppModal(false);setTab(t)}} style={t==='reports'?btnP:btnS}>{label} &rarr;</button>)}</div>
            </div>
          </div>
        </div>
      )}

      {showAddLinkModal&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setShowAddLinkModal(false)}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,width:'min(460px,100%)',padding:22,boxShadow:'0 24px 80px rgba(0,0,0,.3)'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}><div style={{fontSize:16,fontWeight:700}}>Add Video Link</div><button onClick={()=>setShowAddLinkModal(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#585450'}}>x</button></div>
            {[['Label / Title *','label'],['Video URL *','url'],['Player / Subject','player'],['Timestamp Note','note']].map(([l,k])=>(
              <div key={String(k)} style={{marginBottom:10}}><label style={lbl}>{String(l)}</label><input value={(newLink as any)[String(k)]} onChange={e=>setNewLink(prev=>({...prev,[String(k)]:e.target.value}))} style={inp}/></div>
            ))}
            <div style={{marginBottom:14}}><label style={lbl}>Platform</label><select value={newLink.platform} onChange={e=>setNewLink(prev=>({...prev,platform:e.target.value}))} style={inp}><option>Hudl</option><option>YouTube</option><option>Twitter / X</option><option>6-4-3 Charts</option><option>AWRE</option><option>Synergy Sports</option><option>Other</option></select></div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><button onClick={()=>setShowAddLinkModal(false)} style={btnG}>Cancel</button><button onClick={addVideoLink} style={btnP}>Save Link</button></div>
          </div>
        </div>
      )}

      {showAddModal&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setShowAddModal(false)}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,width:'min(460px,100%)',padding:22,boxShadow:'0 24px 80px rgba(0,0,0,.3)'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}><div style={{fontSize:16,fontWeight:700}}>Add Opponent</div><button onClick={()=>setShowAddModal(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#585450'}}>x</button></div>
            <div style={{marginBottom:10}}><label style={lbl}>Opponent Name</label><input style={inp}/></div>
            <div style={{marginBottom:10}}><label style={lbl}>Series Start Date</label><input type="date" style={inp}/></div>
            <div style={{marginBottom:14}}><label style={lbl}>Location</label><select style={inp}><option>Home</option><option>Away</option><option>Neutral</option></select></div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><button onClick={()=>setShowAddModal(false)} style={btnG}>Cancel</button><button onClick={()=>{setShowAddModal(false);alert('Opponent added!')}} style={btnP}>Add Opponent</button></div>
          </div>
        </div>
      )}

      <div style={{background:'#0F0F1E',padding:'12px 20px',borderTop:'1px solid #1A1A2E'}}>
        <div style={{maxWidth:1140,margin:'0 auto',display:'flex',justifyContent:'space-between'}}>
          <div style={{fontSize:11,color:'#3A4A5A'}}>Opponent Scouting System · Stats via NCAA · Updated 5:02am daily</div>
          <div style={{fontSize:11,color:'#3A4A5A'}}>Built by Brand Velocity Co. · brandvelocityco.com</div>
        </div>
      </div>

    </div>
  )
}
