import type { ArchetypeDefinition, ETFRecord } from "./types";

export const ETF_DB: Record<string, ETFRecord> = {
  // ── High Income / Covered Call ─────────────────────────────────────────────
  JEPI: { ticker:"JEPI", price:58.1,  yield:0.087, cagr:0.060, name:"JPMorgan Equity Premium Income",   leveraged:false, payFreq:"monthly",   sparkline:[56.2,56.8,57.4,57.1,58.0,57.8,58.3,58.1,57.9,58.4,58.2,58.1], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  JEPQ: { ticker:"JEPQ", price:54.3,  yield:0.096, cagr:0.072, name:"JPMorgan Nasdaq Equity Premium",   leveraged:false, payFreq:"monthly",   sparkline:[51.2,52.1,53.0,52.7,53.8,54.0,54.5,54.3,54.1,54.4,54.2,54.3], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  QYLD: { ticker:"QYLD", price:17.8,  yield:0.120, cagr:0.030, name:"Global X Nasdaq 100 Covered Call", leveraged:false, payFreq:"monthly",   sparkline:[18.2,18.0,17.8,17.6,17.5,17.9,18.1,17.8,17.6,17.7,17.8,17.8], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  RYLD: { ticker:"RYLD", price:17.3,  yield:0.130, cagr:0.025, name:"Global X Russell 2000 Covered Call",leveraged:false,payFreq:"monthly",   sparkline:[17.8,17.6,17.4,17.2,17.0,17.3,17.5,17.3,17.1,17.2,17.3,17.3], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  XYLD: { ticker:"XYLD", price:44.2,  yield:0.105, cagr:0.035, name:"Global X S&P 500 Covered Call",    leveraged:false, payFreq:"monthly",   sparkline:[43.5,43.8,44.0,43.7,44.1,44.3,44.5,44.2,44.0,44.2,44.2,44.2], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  DIVO: { ticker:"DIVO", price:42.3,  yield:0.048, cagr:0.085, name:"Amplify CWP Enhanced Dividend",    leveraged:false, payFreq:"monthly",   sparkline:[40.1,40.8,41.2,41.6,42.0,41.8,42.3,42.5,42.1,42.4,42.2,42.3], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  SPHD: { ticker:"SPHD", price:44.1,  yield:0.042, cagr:0.073, name:"Invesco S&P 500 Hi Div Low Vol",   leveraged:false, payFreq:"monthly",   sparkline:[42.5,43.0,43.4,43.2,43.8,44.1,44.3,44.0,44.2,44.5,44.1,44.1], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  NUSI: { ticker:"NUSI", price:19.5,  yield:0.078, cagr:0.040, name:"Nationwide Risk-Managed Income",   leveraged:false, payFreq:"monthly",   sparkline:[19.8,19.6,19.4,19.2,19.3,19.5,19.7,19.5,19.3,19.4,19.5,19.5], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  PFF:  { ticker:"PFF",  price:32.4,  yield:0.059, cagr:0.012, name:"iShares Preferred & Income Secs",  leveraged:false, payFreq:"monthly",   sparkline:[33.1,32.8,32.6,32.4,32.2,32.5,32.7,32.4,32.2,32.3,32.4,32.4], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  PFFD: { ticker:"PFFD", price:22.1,  yield:0.062, cagr:0.015, name:"Global X US Preferred ETF",        leveraged:false, payFreq:"monthly",   sparkline:[22.5,22.3,22.1,21.9,22.0,22.2,22.4,22.1,21.9,22.0,22.1,22.1], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  // ── Core Dividend / Quality Income ─────────────────────────────────────────
  SCHD: { ticker:"SCHD", price:82.4,  yield:0.035, cagr:0.110, name:"Schwab US Dividend Equity",        leveraged:false, payFreq:"quarterly", sparkline:[79.1,80.3,81.2,80.8,82.1,81.9,82.4,83.1,82.8,83.5,82.9,82.4], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  VYM:  { ticker:"VYM",  price:118.9, yield:0.029, cagr:0.092, name:"Vanguard High Dividend Yield",     leveraged:false, payFreq:"quarterly", sparkline:[115.2,116.1,117.0,116.5,117.8,118.2,118.9,119.4,118.8,119.2,118.7,118.9], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  DVY:  { ticker:"DVY",  price:121.3, yield:0.038, cagr:0.075, name:"iShares Select Dividend",          leveraged:false, payFreq:"quarterly", sparkline:[118,119,120,119,120,121,122,121,121,122,121,121], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  HDV:  { ticker:"HDV",  price:108.7, yield:0.033, cagr:0.080, name:"iShares Core High Dividend",       leveraged:false, payFreq:"quarterly", sparkline:[105,106,107,106.5,107.5,108,108.7,109,108.5,109,108.7,108.7], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  DGRO: { ticker:"DGRO", price:58.9,  yield:0.025, cagr:0.102, name:"iShares Core Dividend Growth",     leveraged:false, payFreq:"quarterly", sparkline:[56.5,57.0,57.5,57.2,57.8,58.2,58.9,59.2,58.8,59.1,58.8,58.9], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  SDY:  { ticker:"SDY",  price:127.4, yield:0.026, cagr:0.089, name:"SPDR S&P Dividend ETF",            leveraged:false, payFreq:"quarterly", sparkline:[123,124,125,124.5,125.8,126.5,127.4,128,127.5,128,127.4,127.4], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  FDVV: { ticker:"FDVV", price:44.3,  yield:0.031, cagr:0.097, name:"Fidelity High Dividend ETF",       leveraged:false, payFreq:"quarterly", sparkline:[42.5,43.0,43.4,43.2,43.8,44.0,44.3,44.6,44.2,44.5,44.3,44.3], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  SPYD: { ticker:"SPYD", price:40.2,  yield:0.044, cagr:0.068, name:"SPDR Portfolio S&P 500 Hi Div",    leveraged:false, payFreq:"quarterly", sparkline:[38.5,39.0,39.5,39.2,39.8,40.0,40.2,40.5,40.1,40.4,40.2,40.2], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  VIG:  { ticker:"VIG",  price:188.2, yield:0.018, cagr:0.103, name:"Vanguard Dividend Appreciation",   leveraged:false, payFreq:"quarterly", sparkline:[183,184,185,185,186,187,188,189,188,189,188,188], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  NOBL: { ticker:"NOBL", price:104.6, yield:0.021, cagr:0.085, name:"ProShares S&P 500 Dividend Aristocrats", leveraged:false, payFreq:"quarterly", sparkline:[100.8,101.7,102.5,102.0,102.9,103.5,104.6,105.1,104.7,105.0,104.8,104.6], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  SCHY: { ticker:"SCHY", price:24.7,  yield:0.043, cagr:0.071, name:"Schwab International Dividend Equity ETF", leveraged:false, payFreq:"quarterly", sparkline:[23.3,23.6,23.9,24.0,24.2,24.4,24.7,24.9,24.6,24.8,24.7,24.7], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  JDIV: { ticker:"JDIV", price:38.4,  yield:0.036, cagr:0.064, name:"JPMorgan US Dividend ETF",         leveraged:false, payFreq:"quarterly", sparkline:[36.5,36.9,37.2,37.4,37.7,38.0,38.4,38.8,38.5,38.7,38.5,38.4], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  VYMI: { ticker:"VYMI", price:72.1,  yield:0.045, cagr:0.069, name:"Vanguard International High Dividend Yield ETF", leveraged:false, payFreq:"quarterly", sparkline:[68.8,69.4,70.0,70.4,70.9,71.4,72.1,72.6,72.2,72.4,72.2,72.1], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  VIGI: { ticker:"VIGI", price:86.7,  yield:0.019, cagr:0.084, name:"Vanguard International Dividend Appreciation ETF", leveraged:false, payFreq:"quarterly", sparkline:[82.5,83.1,83.9,84.4,85.0,85.6,86.7,87.3,86.8,87.0,86.8,86.7], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  IHDG: { ticker:"IHDG", price:53.2,  yield:0.038, cagr:0.061, name:"WisdomTree International Hedged Quality Dividend Growth Fund", leveraged:false, payFreq:"quarterly", sparkline:[50.7,51.1,51.5,51.8,52.1,52.6,53.2,53.7,53.4,53.5,53.3,53.2], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  QDVO: { ticker:"QDVO", price:30.6,  yield:0.062, cagr:0.079, name:"Amplify CWP Growth & Income ETF", leveraged:false, payFreq:"monthly", sparkline:[28.9,29.2,29.5,29.7,30.0,30.2,30.6,30.9,30.7,30.8,30.7,30.6], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  // ── Growth / Total Return ───────────────────────────────────────────────────
  QQQ:  { ticker:"QQQ",  price:448.2, yield:0.005, cagr:0.165, name:"Invesco QQQ Trust (Nasdaq 100)",   leveraged:false, payFreq:"quarterly", sparkline:[415,420,430,425,438,442,448,452,448,450,447,448], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  VOO:  { ticker:"VOO",  price:489.3, yield:0.013, cagr:0.128, name:"Vanguard S&P 500 ETF",             leveraged:false, payFreq:"quarterly", sparkline:[472,478,482,480,485,487,489,492,489,491,489,489], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  VUG:  { ticker:"VUG",  price:368.5, yield:0.006, cagr:0.145, name:"Vanguard Growth ETF",              leveraged:false, payFreq:"quarterly", sparkline:[350,355,360,358,363,365,368,372,368,370,368,368], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  IWF:  { ticker:"IWF",  price:312.8, yield:0.007, cagr:0.138, name:"iShares Russell 1000 Growth",      leveraged:false, payFreq:"quarterly", sparkline:[298,302,307,305,309,311,312,315,312,314,312,312], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  SPYG: { ticker:"SPYG", price:84.7,  yield:0.008, cagr:0.142, name:"SPDR Portfolio S&P 500 Growth",    leveraged:false, payFreq:"quarterly", sparkline:[80,81,82,81.5,83,84,84.7,85.5,84.5,85,84.7,84.7], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  MGK:  { ticker:"MGK",  price:278.4, yield:0.007, cagr:0.152, name:"Vanguard Mega Cap Growth ETF",     leveraged:false, payFreq:"quarterly", sparkline:[264,268,272,270,274,276,278,281,278,280,278,278], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  // ── Leveraged ───────────────────────────────────────────────────────────────
  TQQQ: { ticker:"TQQQ", price:62.5,  yield:0.000, cagr:0.220, name:"ProShares UltraPro QQQ (3x)",      leveraged:true,  payFreq:"quarterly", sparkline:[55.0,58.2,61.0,59.5,63.2,60.1,64.8,62.5,65.1,61.2,62.5,62.5], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  UPRO: { ticker:"UPRO", price:78.3,  yield:0.001, cagr:0.210, name:"ProShares UltraPro S&P 500 (3x)",  leveraged:true,  payFreq:"quarterly", sparkline:[70,73,76,74,78,76,79,78,80,77,78,78],               health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  SOXL: { ticker:"SOXL", price:35.8,  yield:0.002, cagr:0.250, name:"Direxion Daily Semis Bull 3X",     leveraged:true,  payFreq:"quarterly", sparkline:[28,30,33,31,36,33,37,35,38,33,35,35],               health:"CRITICAL",source:"local", lastUpdated:"2026-02-01", categories:[] },
  // ── YieldMax ────────────────────────────────────────────────────────────────
  TSLY: { ticker:"TSLY", price:14.2,  yield:0.180, cagr:0.050, name:"YieldMax TSLA Option Income",      leveraged:false, payFreq:"weekly",    sparkline:[15.1,14.8,14.5,14.2,13.9,14.1,14.4,14.3,14.1,14.0,14.2,14.2], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  MSFO: { ticker:"MSFO", price:22.1,  yield:0.150, cagr:0.040, name:"YieldMax MSFT Option Income",      leveraged:false, payFreq:"monthly",   sparkline:[23.0,22.8,22.5,22.2,22.0,22.3,22.5,22.2,22.0,22.1,22.1,22.1], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  NVDY: { ticker:"NVDY", price:19.8,  yield:0.200, cagr:0.045, name:"YieldMax NVDA Option Income",      leveraged:false, payFreq:"monthly",   sparkline:[21.5,21.0,20.5,20.0,19.5,19.8,20.1,19.8,19.5,19.7,19.8,19.8], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  AMZY: { ticker:"AMZY", price:18.3,  yield:0.145, cagr:0.038, name:"YieldMax AMZN Option Income",      leveraged:false, payFreq:"monthly",   sparkline:[19.5,19.2,18.9,18.6,18.3,18.5,18.7,18.4,18.2,18.3,18.3,18.3], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  GOOGY:{ ticker:"GOOGY",price:16.7,  yield:0.135, cagr:0.040, name:"YieldMax GOOGL Option Income",     leveraged:false, payFreq:"monthly",   sparkline:[17.8,17.5,17.2,17.0,16.8,16.9,17.1,16.8,16.6,16.7,16.7,16.7], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  APLY: { ticker:"APLY", price:20.4,  yield:0.160, cagr:0.042, name:"YieldMax AAPL Option Income",      leveraged:false, payFreq:"monthly",   sparkline:[21.8,21.5,21.2,20.9,20.5,20.6,20.8,20.5,20.3,20.4,20.4,20.4], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  // ── KURV / REX / GraniteShares YieldBOOST / TappAlpha LIFT ───────────────
  KQQQ: { ticker:"KQQQ", price:24.4,  yield:0.125, cagr:0.060, name:"KURV Nasdaq Income ETF",            leveraged:false, payFreq:"monthly",   sparkline:[22.9,23.2,23.5,23.7,24.0,24.2,24.4,24.6,24.3,24.5,24.4,24.4], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  KSPY: { ticker:"KSPY", price:23.1,  yield:0.118, cagr:0.058, name:"KURV S&P 500 Income ETF",           leveraged:false, payFreq:"monthly",   sparkline:[22.0,22.2,22.4,22.6,22.8,23.0,23.1,23.3,23.0,23.2,23.1,23.1], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  KYLD: { ticker:"KYLD", price:24.9,  yield:0.120, cagr:0.056, name:"KURV Synthetic Covered Call ETF",    leveraged:false, payFreq:"monthly",   sparkline:[23.5,23.8,24.1,24.3,24.5,24.7,24.9,25.1,24.8,25.0,24.9,24.9], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  KGLD: { ticker:"KGLD", price:23.6,  yield:0.102, cagr:0.054, name:"KURV Gold Income ETF",               leveraged:false, payFreq:"monthly",   sparkline:[22.4,22.6,22.9,23.1,23.3,23.4,23.6,23.8,23.5,23.7,23.6,23.6], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  KSLV: { ticker:"KSLV", price:22.8,  yield:0.099, cagr:0.050, name:"KURV Silver Income ETF",             leveraged:false, payFreq:"monthly",   sparkline:[21.6,21.9,22.1,22.3,22.5,22.6,22.8,23.0,22.7,22.9,22.8,22.8], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  KCOP: { ticker:"KCOP", price:21.2,  yield:0.094, cagr:0.048, name:"KURV Copper Income ETF",             leveraged:false, payFreq:"monthly",   sparkline:[20.3,20.5,20.7,20.8,21.0,21.1,21.2,21.4,21.1,21.3,21.2,21.2], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  AMZP: { ticker:"AMZP", price:19.6,  yield:0.116, cagr:0.052, name:"KURV AMZN Income ETF",               leveraged:false, payFreq:"monthly",   sparkline:[18.6,18.8,19.0,19.1,19.3,19.4,19.6,19.8,19.5,19.7,19.6,19.6], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  AAPY: { ticker:"AAPY", price:20.1,  yield:0.121, cagr:0.053, name:"KURV AAPL Income ETF",               leveraged:false, payFreq:"monthly",   sparkline:[19.2,19.4,19.6,19.7,19.9,20.0,20.1,20.3,20.0,20.2,20.1,20.1], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  GOOP: { ticker:"GOOP", price:18.4,  yield:0.114, cagr:0.051, name:"KURV GOOGL Income ETF",              leveraged:false, payFreq:"monthly",   sparkline:[17.5,17.7,17.9,18.0,18.2,18.3,18.4,18.6,18.3,18.5,18.4,18.4], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  MSFY: { ticker:"MSFY", price:21.8,  yield:0.118, cagr:0.055, name:"KURV MSFT Income ETF",               leveraged:false, payFreq:"monthly",   sparkline:[20.7,20.9,21.1,21.3,21.5,21.6,21.8,22.0,21.7,21.9,21.8,21.8], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  NFLP: { ticker:"NFLP", price:17.9,  yield:0.122, cagr:0.048, name:"KURV NFLX Income ETF",               leveraged:false, payFreq:"monthly",   sparkline:[17.0,17.2,17.4,17.5,17.7,17.8,17.9,18.1,17.8,18.0,17.9,17.9], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  TSLP: { ticker:"TSLP", price:18.7,  yield:0.128, cagr:0.049, name:"KURV TSLA Income ETF",               leveraged:false, payFreq:"monthly",   sparkline:[17.6,17.8,18.0,18.2,18.4,18.5,18.7,18.9,18.6,18.8,18.7,18.7], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  FEPI: { ticker:"FEPI", price:49.2,  yield:0.108, cagr:0.075, name:"REX FANG & Innovation Equity Income",leveraged:false,payFreq:"monthly",   sparkline:[46.8,47.1,47.8,48.2,48.7,49.0,49.2,49.8,49.4,49.6,49.3,49.2], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  AIPI: { ticker:"AIPI", price:51.5,  yield:0.112, cagr:0.082, name:"REX AI Equity Premium Income ETF",  leveraged:false, payFreq:"monthly",   sparkline:[48.4,48.9,49.5,49.9,50.5,50.9,51.5,52.1,51.6,51.9,51.7,51.5], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  CEPI: { ticker:"CEPI", price:25.9,  yield:0.115, cagr:0.070, name:"REX Crypto Equity Premium Income ETF",leveraged:false,payFreq:"monthly",  sparkline:[24.4,24.8,25.0,25.2,25.5,25.7,25.9,26.2,25.9,26.0,25.9,25.9], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  GIF:  { ticker:"GIF",  price:23.7,  yield:0.090, cagr:0.062, name:"REX Gold Income ETF",               leveraged:false, payFreq:"monthly",   sparkline:[22.5,22.8,23.0,23.2,23.4,23.5,23.7,23.9,23.6,23.8,23.7,23.7], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  NVII: { ticker:"NVII", price:20.6,  yield:0.126, cagr:0.055, name:"REX NVDA Income ETF",               leveraged:false, payFreq:"monthly",   sparkline:[19.4,19.7,19.9,20.1,20.3,20.4,20.6,20.9,20.5,20.7,20.6,20.6], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  TSII: { ticker:"TSII", price:19.9,  yield:0.124, cagr:0.053, name:"REX TSLA Income ETF",               leveraged:false, payFreq:"monthly",   sparkline:[18.8,19.0,19.2,19.3,19.5,19.7,19.9,20.1,19.8,20.0,19.9,19.9], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  TSYY: { ticker:"TSYY", price:20.8,  yield:0.132, cagr:0.052, name:"GraniteShares YieldBOOST TSLA",     leveraged:false, payFreq:"monthly",   sparkline:[19.6,19.8,20.1,20.3,20.5,20.7,20.8,21.0,20.7,20.9,20.8,20.8], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  NVYY: { ticker:"NVYY", price:22.7,  yield:0.138, cagr:0.057, name:"GraniteShares YieldBOOST NVDA",     leveraged:false, payFreq:"monthly",   sparkline:[21.0,21.3,21.6,21.9,22.2,22.5,22.7,23.1,22.8,22.9,22.8,22.7], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  YSPY: { ticker:"YSPY", price:21.4,  yield:0.109, cagr:0.060, name:"GraniteShares YieldBOOST S&P 500",  leveraged:false, payFreq:"monthly",   sparkline:[20.2,20.5,20.7,20.9,21.1,21.2,21.4,21.7,21.3,21.5,21.4,21.4], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  TQQY: { ticker:"TQQY", price:19.5,  yield:0.128, cagr:0.049, name:"GraniteShares YieldBOOST QQQ",      leveraged:false, payFreq:"monthly",   sparkline:[18.4,18.7,18.9,19.1,19.3,19.4,19.5,19.8,19.4,19.6,19.5,19.5], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  AMYY: { ticker:"AMYY", price:18.9,  yield:0.122, cagr:0.048, name:"GraniteShares YieldBOOST AMZN",     leveraged:false, payFreq:"monthly",   sparkline:[18.0,18.2,18.4,18.5,18.7,18.8,18.9,19.1,18.8,19.0,18.9,18.9], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  LIFT: { ticker:"LIFT", price:25.3,  yield:0.096, cagr:0.072, name:"TappAlpha LIFT Income ETF",         leveraged:false, payFreq:"monthly",   sparkline:[23.7,24.0,24.2,24.5,24.8,25.0,25.3,25.5,25.2,25.4,25.3,25.3], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  TSPY: { ticker:"TSPY", price:24.8,  yield:0.099, cagr:0.070, name:"TappAlpha TSPY Options Income ETF", leveraged:false, payFreq:"monthly",   sparkline:[23.5,23.7,24.0,24.2,24.4,24.6,24.8,25.1,24.7,24.9,24.8,24.8], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  TDAQ: { ticker:"TDAQ", price:23.9,  yield:0.103, cagr:0.073, name:"TappAlpha TDAQ Options Income ETF", leveraged:false, payFreq:"monthly",   sparkline:[22.6,22.9,23.1,23.3,23.5,23.7,23.9,24.2,23.8,24.0,23.9,23.9], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  TSYX: { ticker:"TSYX", price:22.3,  yield:0.112, cagr:0.062, name:"TappAlpha TSYX Income ETF",         leveraged:false, payFreq:"monthly",   sparkline:[21.1,21.3,21.6,21.8,22.0,22.1,22.3,22.5,22.2,22.4,22.3,22.3], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  TDAX: { ticker:"TDAX", price:21.7,  yield:0.108, cagr:0.060, name:"TappAlpha TDAX Income ETF",         leveraged:false, payFreq:"monthly",   sparkline:[20.5,20.7,21.0,21.2,21.3,21.5,21.7,22.0,21.6,21.8,21.7,21.7], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  // ── NEOS Income / Hedged Series ───────────────────────────────────────────
  SPYI: { ticker:"SPYI", price:50.8,  yield:0.120, cagr:0.068, name:"NEOS S&P 500 High Income ETF",      leveraged:false, payFreq:"monthly",   sparkline:[48.2,48.7,49.1,49.5,49.9,50.2,50.8,51.3,50.9,51.1,50.9,50.8], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  QQQI: { ticker:"QQQI", price:51.9,  yield:0.124, cagr:0.074, name:"NEOS Nasdaq-100 High Income ETF",   leveraged:false, payFreq:"monthly",   sparkline:[49.0,49.6,50.1,50.5,50.9,51.2,51.9,52.4,52.0,52.2,52.0,51.9], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  IWMI: { ticker:"IWMI", price:28.6,  yield:0.132, cagr:0.050, name:"NEOS Russell 2000 High Income ETF", leveraged:false, payFreq:"monthly",   sparkline:[27.1,27.4,27.7,27.9,28.1,28.4,28.6,28.9,28.5,28.7,28.6,28.6], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  NIHI: { ticker:"NIHI", price:25.1,  yield:0.102, cagr:0.062, name:"NEOS International High Income ETF",leveraged:false, payFreq:"monthly",   sparkline:[23.8,24.0,24.3,24.5,24.7,24.9,25.1,25.3,25.0,25.2,25.1,25.1], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  XSPI: { ticker:"XSPI", price:49.3,  yield:0.088, cagr:0.070, name:"NEOS S&P 500 Ex-Sector Income ETF",leveraged:false, payFreq:"monthly",   sparkline:[47.1,47.4,47.9,48.2,48.6,48.9,49.3,49.6,49.2,49.4,49.3,49.3], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  XQQI: { ticker:"XQQI", price:50.1,  yield:0.092, cagr:0.076, name:"NEOS Nasdaq Ex-Tech Income ETF",    leveraged:false, payFreq:"monthly",   sparkline:[47.8,48.2,48.7,49.0,49.4,49.7,50.1,50.5,50.0,50.3,50.2,50.1], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  XBCI: { ticker:"XBCI", price:27.4,  yield:0.085, cagr:0.058, name:"NEOS Broad Commodity Income ETF",   leveraged:false, payFreq:"monthly",   sparkline:[26.1,26.3,26.6,26.8,27.0,27.2,27.4,27.6,27.3,27.5,27.4,27.4], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  BTCI: { ticker:"BTCI", price:28.2,  yield:0.098, cagr:0.065, name:"NEOS Bitcoin Income ETF",           leveraged:false, payFreq:"monthly",   sparkline:[26.5,26.8,27.1,27.4,27.7,27.9,28.2,28.7,28.3,28.5,28.3,28.2], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  NEHI: { ticker:"NEHI", price:26.8,  yield:0.095, cagr:0.061, name:"NEOS Enhanced High Income ETF",     leveraged:false, payFreq:"monthly",   sparkline:[25.4,25.7,26.0,26.2,26.4,26.6,26.8,27.0,26.7,26.9,26.8,26.8], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  IYRI: { ticker:"IYRI", price:25.9,  yield:0.090, cagr:0.060, name:"NEOS Real Income ETF",              leveraged:false, payFreq:"monthly",   sparkline:[24.6,24.8,25.1,25.3,25.5,25.7,25.9,26.1,25.8,26.0,25.9,25.9], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  IAUI: { ticker:"IAUI", price:24.5,  yield:0.086, cagr:0.058, name:"NEOS Alternative Income ETF",       leveraged:false, payFreq:"monthly",   sparkline:[23.2,23.4,23.7,23.9,24.1,24.3,24.5,24.7,24.4,24.6,24.5,24.5], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  MLPI: { ticker:"MLPI", price:31.2,  yield:0.094, cagr:0.059, name:"NEOS MLP Income ETF",               leveraged:false, payFreq:"monthly",   sparkline:[29.7,30.0,30.3,30.6,30.8,31.0,31.2,31.5,31.1,31.3,31.2,31.2], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  QQQH: { ticker:"QQQH", price:52.7,  yield:0.040, cagr:0.120, name:"NEOS Nasdaq-100 Hedged ETF",        leveraged:false, payFreq:"quarterly", sparkline:[48.8,49.5,50.2,50.6,51.3,51.8,52.7,53.1,52.6,53.0,52.8,52.7], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  SPYH: { ticker:"SPYH", price:51.3,  yield:0.038, cagr:0.108, name:"NEOS S&P 500 Hedged ETF",           leveraged:false, payFreq:"quarterly", sparkline:[47.9,48.4,48.9,49.3,49.8,50.2,51.3,51.7,51.1,51.5,51.4,51.3], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  NLSI: { ticker:"NLSI", price:39.8,  yield:0.052, cagr:0.072, name:"NEOS Enhanced Income ETF",          leveraged:false, payFreq:"monthly",   sparkline:[37.5,37.9,38.3,38.6,39.0,39.3,39.8,40.1,39.7,40.0,39.9,39.8], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  CSHI: { ticker:"CSHI", price:50.0,  yield:0.058, cagr:0.020, name:"NEOS Enhanced Income Cash Alternative ETF",leveraged:false,payFreq:"monthly",sparkline:[49.8,49.8,49.9,49.9,49.9,50.0,50.0,50.0,50.0,50.0,50.0,50.0], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  TLTI: { ticker:"TLTI", price:47.7,  yield:0.064, cagr:0.028, name:"NEOS Enhanced 20+ Year Treasury Bond ETF",leveraged:false,payFreq:"monthly", sparkline:[46.9,47.0,47.1,47.2,47.3,47.5,47.7,47.8,47.6,47.7,47.7,47.7], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  BNDI: { ticker:"BNDI", price:49.1,  yield:0.066, cagr:0.030, name:"NEOS Enhanced Aggregate Bond ETF",  leveraged:false, payFreq:"monthly",   sparkline:[48.5,48.6,48.7,48.8,48.9,49.0,49.1,49.3,49.1,49.2,49.1,49.1], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  HYBI: { ticker:"HYBI", price:50.4,  yield:0.078, cagr:0.035, name:"NEOS Enhanced High Yield Bond ETF", leveraged:false, payFreq:"monthly",   sparkline:[49.2,49.4,49.6,49.8,50.0,50.2,50.4,50.7,50.3,50.5,50.4,50.4], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  // ── Closed-End Funds (long-running distribution funds with positive long-run return profiles) ──
  UTG:  { ticker:"UTG",  price:38.9,  yield:0.062, cagr:0.083, name:"Reaves Utility Income Fund",        leveraged:false, payFreq:"monthly",   sparkline:[34.8,35.3,35.9,36.4,36.9,37.5,38.9,39.6,39.1,39.3,39.1,38.9], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  UTF:  { ticker:"UTF",  price:28.7,  yield:0.071, cagr:0.078, name:"Cohen & Steers Infrastructure Fund", leveraged:false, payFreq:"monthly",   sparkline:[26.1,26.4,26.8,27.1,27.4,27.8,28.7,29.1,28.8,28.9,28.8,28.7], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  EVT:  { ticker:"EVT",  price:26.4,  yield:0.082, cagr:0.066, name:"Eaton Vance Tax-Advantaged Dividend Income Fund", leveraged:false, payFreq:"monthly", sparkline:[24.4,24.7,24.9,25.2,25.5,25.8,26.4,26.8,26.5,26.6,26.5,26.4], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  BST:  { ticker:"BST",  price:38.1,  yield:0.090, cagr:0.094, name:"BlackRock Science and Technology Trust", leveraged:false, payFreq:"monthly", sparkline:[34.5,35.1,35.9,36.4,36.9,37.4,38.1,38.8,38.4,38.6,38.4,38.1], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  BME:  { ticker:"BME",  price:45.6,  yield:0.061, cagr:0.076, name:"BlackRock Health Sciences Term Trust", leveraged:false, payFreq:"monthly", sparkline:[42.7,43.1,43.6,44.0,44.4,44.8,45.6,46.1,45.8,45.9,45.8,45.6], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  DNP:  { ticker:"DNP",  price:10.7,  yield:0.078, cagr:0.041, name:"DNP Select Income Fund",            leveraged:false, payFreq:"monthly",   sparkline:[9.9,10.0,10.1,10.2,10.3,10.4,10.7,10.8,10.7,10.8,10.7,10.7], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  AVK:  { ticker:"AVK",  price:12.7,  yield:0.111, cagr:0.067, name:"Advent Convertible and Income Fund", leveraged:false, payFreq:"monthly",   sparkline:[11.8,12.0,12.1,12.2,12.3,12.5,12.7,12.9,12.8,12.8,12.7,12.7], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  // ── Roundhill Income / WeeklyPay ──────────────────────────────────────────
  XDTE: { ticker:"XDTE", price:52.1,  yield:0.185, cagr:0.052, name:"Roundhill S&P 500 0DTE Covered Call Strategy ETF", leveraged:false, payFreq:"weekly", sparkline:[49.8,50.2,50.6,50.9,51.2,51.6,52.1,52.4,52.0,52.2,52.1,52.1], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  QDTE: { ticker:"QDTE", price:49.6,  yield:0.205, cagr:0.048, name:"Roundhill Innovation-100 0DTE Covered Call Strategy ETF", leveraged:false, payFreq:"weekly", sparkline:[46.8,47.2,47.7,48.1,48.5,49.0,49.6,50.0,49.7,49.8,49.7,49.6], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  RDTE: { ticker:"RDTE", price:47.9,  yield:0.172, cagr:0.046, name:"Roundhill Russell 2000 0DTE Covered Call Strategy ETF", leveraged:false, payFreq:"weekly", sparkline:[45.2,45.6,46.0,46.4,46.8,47.3,47.9,48.2,48.0,48.1,48.0,47.9], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  XPAY: { ticker:"XPAY", price:24.8,  yield:0.102, cagr:0.061, name:"Roundhill S&P 500 WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[23.6,23.8,24.0,24.2,24.4,24.6,24.8,25.0,24.8,24.9,24.8,24.8], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  YBTC: { ticker:"YBTC", price:43.7,  yield:0.118, cagr:0.082, name:"Roundhill Bitcoin Covered Call Strategy ETF", leveraged:false, payFreq:"weekly", sparkline:[40.5,41.0,41.6,42.1,42.6,43.1,43.7,44.2,43.9,44.0,43.9,43.7], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  YETH: { ticker:"YETH", price:39.4,  yield:0.115, cagr:0.078, name:"Roundhill Ether Covered Call Strategy ETF", leveraged:false, payFreq:"weekly", sparkline:[36.4,36.9,37.4,37.9,38.3,38.8,39.4,39.9,39.6,39.7,39.6,39.4], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  MAGY: { ticker:"MAGY", price:28.3,  yield:0.096, cagr:0.075, name:"Roundhill Magnificent Seven Covered Call ETF", leveraged:false, payFreq:"weekly", sparkline:[26.2,26.5,26.8,27.1,27.4,27.8,28.3,28.7,28.4,28.5,28.4,28.3], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  TPAY: { ticker:"TPAY", price:25.1,  yield:0.074, cagr:0.034, name:"Roundhill T-Bill & TIPS WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[24.8,24.8,24.9,24.9,25.0,25.0,25.1,25.1,25.1,25.1,25.1,25.1], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  AAPW: { ticker:"AAPW", price:20.2,  yield:0.132, cagr:0.051, name:"Roundhill AAPL WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[19.0,19.2,19.4,19.6,19.8,20.0,20.2,20.4,20.2,20.3,20.2,20.2], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  AMDW: { ticker:"AMDW", price:19.4,  yield:0.138, cagr:0.052, name:"Roundhill AMD WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[18.0,18.3,18.5,18.7,18.9,19.1,19.4,19.7,19.5,19.6,19.5,19.4], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  AMZW: { ticker:"AMZW", price:21.1,  yield:0.129, cagr:0.053, name:"Roundhill AMZN WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[19.8,20.1,20.3,20.5,20.7,20.9,21.1,21.4,21.2,21.3,21.2,21.1], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  AVGW: { ticker:"AVGW", price:21.8,  yield:0.127, cagr:0.055, name:"Roundhill AVGO WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[20.3,20.6,20.8,21.0,21.2,21.5,21.8,22.1,21.9,22.0,21.9,21.8], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  BRKW: { ticker:"BRKW", price:22.4,  yield:0.101, cagr:0.060, name:"Roundhill BRKB WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[21.0,21.2,21.5,21.7,21.9,22.1,22.4,22.6,22.5,22.5,22.4,22.4], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  COIW: { ticker:"COIW", price:18.8,  yield:0.154, cagr:0.046, name:"Roundhill COIN WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[17.2,17.4,17.7,17.9,18.1,18.5,18.8,19.1,18.9,19.0,18.9,18.8], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  GOOW: { ticker:"GOOW", price:20.6,  yield:0.123, cagr:0.054, name:"Roundhill GOOGL WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[19.3,19.5,19.7,19.9,20.1,20.3,20.6,20.8,20.7,20.7,20.6,20.6], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  HOOW: { ticker:"HOOW", price:18.5,  yield:0.110, cagr:0.058, name:"Roundhill HOOD WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[17.8,18.0,18.1,18.3,18.4,18.3,18.5,18.6,18.4,18.5,18.5,18.5], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  MSTW: { ticker:"MSTW", price:24.8,  yield:0.095, cagr:0.072, name:"Roundhill MSTR WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[23.5,23.8,24.1,24.3,24.6,24.5,24.8,24.9,24.7,24.8,24.8,24.8], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  MSFW: { ticker:"MSFW", price:22.6,  yield:0.118, cagr:0.056, name:"Roundhill MSFT WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[21.2,21.5,21.7,21.9,22.1,22.3,22.6,22.8,22.7,22.7,22.6,22.6], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  NFLW: { ticker:"NFLW", price:19.1,  yield:0.136, cagr:0.049, name:"Roundhill NFLX WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[17.8,18.0,18.2,18.4,18.6,18.8,19.1,19.3,19.2,19.2,19.1,19.1], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  NVDW: { ticker:"NVDW", price:23.4,  yield:0.145, cagr:0.058, name:"Roundhill NVDA WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[21.8,22.1,22.4,22.6,22.9,23.1,23.4,23.8,23.6,23.7,23.6,23.4], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  PLTW: { ticker:"PLTW", price:18.7,  yield:0.141, cagr:0.051, name:"Roundhill PLTR WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[17.4,17.6,17.8,18.0,18.2,18.5,18.7,19.0,18.8,18.9,18.8,18.7], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  TSLW: { ticker:"TSLW", price:19.8,  yield:0.148, cagr:0.047, name:"Roundhill TSLA WeeklyPay ETF", leveraged:false, payFreq:"weekly", sparkline:[18.2,18.4,18.7,18.9,19.1,19.4,19.8,20.1,19.9,20.0,19.9,19.8], health:"WARNING", source:"local", lastUpdated:"2026-02-01", categories:[] },
  WPAY: { ticker:"WPAY", price:25.6,  yield:0.094, cagr:0.063, name:"Roundhill WeeklyPay Universe ETF", leveraged:false, payFreq:"weekly", sparkline:[24.2,24.5,24.7,24.9,25.1,25.3,25.6,25.9,25.7,25.8,25.7,25.6], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  // ── Roundhill Thematic / Growth ───────────────────────────────────────────
  METV: { ticker:"METV", price:14.8,  yield:0.006, cagr:0.082, name:"Roundhill Metaverse ETF", leveraged:false, payFreq:"annual", sparkline:[13.2,13.5,13.8,14.0,14.2,14.5,14.8,15.0,14.9,14.9,14.8,14.8], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  MAGS: { ticker:"MAGS", price:44.7,  yield:0.004, cagr:0.168, name:"Roundhill Magnificent Seven ETF", leveraged:false, payFreq:"annual", sparkline:[39.4,40.2,41.0,41.8,42.6,43.5,44.7,45.4,45.0,45.1,44.9,44.7], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  CHAT: { ticker:"CHAT", price:34.2,  yield:0.003, cagr:0.121, name:"Roundhill Generative AI & Technology ETF", leveraged:false, payFreq:"annual", sparkline:[30.9,31.4,31.9,32.4,32.9,33.5,34.2,34.8,34.5,34.6,34.4,34.2], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  BETZ: { ticker:"BETZ", price:22.9,  yield:0.005, cagr:0.066, name:"Roundhill Sports Betting & iGaming ETF", leveraged:false, payFreq:"annual", sparkline:[21.3,21.5,21.8,22.0,22.2,22.5,22.9,23.2,23.0,23.1,23.0,22.9], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  NERD: { ticker:"NERD", price:28.7,  yield:0.004, cagr:0.074, name:"Roundhill Video Games ETF", leveraged:false, payFreq:"annual", sparkline:[26.8,27.0,27.2,27.5,27.7,28.1,28.7,29.0,28.9,28.9,28.8,28.7], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  OZEM: { ticker:"OZEM", price:27.4,  yield:0.002, cagr:0.094, name:"Roundhill GLP-1 & Weight Loss ETF", leveraged:false, payFreq:"annual", sparkline:[24.9,25.3,25.7,26.0,26.4,26.9,27.4,27.8,27.6,27.7,27.5,27.4], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  WEED: { ticker:"WEED", price:12.6,  yield:0.000, cagr:0.028, name:"Roundhill Cannabis ETF", leveraged:false, payFreq:"annual", sparkline:[11.8,11.9,12.0,12.1,12.2,12.4,12.6,12.8,12.7,12.7,12.6,12.6], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  MAGC: { ticker:"MAGC", price:24.1,  yield:0.003, cagr:0.088, name:"Roundhill China Magnificent Seven ETF", leveraged:false, payFreq:"annual", sparkline:[22.0,22.3,22.6,22.9,23.2,23.6,24.1,24.4,24.3,24.3,24.2,24.1], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  UX:   { ticker:"UX",   price:18.3,  yield:0.001, cagr:0.071, name:"Roundhill Uranium & Nuclear ETF", leveraged:false, payFreq:"annual", sparkline:[16.8,17.0,17.2,17.4,17.6,17.9,18.3,18.6,18.5,18.5,18.4,18.3], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  HUMN: { ticker:"HUMN", price:20.7,  yield:0.002, cagr:0.078, name:"Roundhill Humanoid Robotics ETF", leveraged:false, payFreq:"annual", sparkline:[18.9,19.2,19.5,19.8,20.0,20.3,20.7,21.0,20.9,20.9,20.8,20.7], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  MEME: { ticker:"MEME", price:31.6,  yield:0.001, cagr:0.086, name:"Roundhill MEME ETF", leveraged:false, payFreq:"annual", sparkline:[28.7,29.1,29.5,29.9,30.3,30.9,31.6,32.0,31.8,31.9,31.7,31.6], health:"NEUTRAL", source:"local", lastUpdated:"2026-02-01", categories:[] },
  CABZ: { ticker:"CABZ", price:26.1,  yield:0.007, cagr:0.064, name:"Roundhill Corporate Bond & Income ETF", leveraged:false, payFreq:"monthly", sparkline:[24.8,25.0,25.2,25.4,25.6,25.8,26.1,26.3,26.2,26.2,26.1,26.1], health:"STABLE", source:"local", lastUpdated:"2026-02-01", categories:[] },
  // ── Bond / Fixed Income ─────────────────────────────────────────────────────
  AGG:  { ticker:"AGG",  price:96.8,  yield:0.035, cagr:0.018, name:"iShares Core US Aggregate Bond",   leveraged:false, payFreq:"monthly",   sparkline:[95.5,96.0,96.2,96.0,96.5,96.7,96.8,97.0,96.7,96.9,96.8,96.8], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  BND:  { ticker:"BND",  price:73.2,  yield:0.033, cagr:0.015, name:"Vanguard Total Bond Market",       leveraged:false, payFreq:"monthly",   sparkline:[72.0,72.4,72.6,72.4,72.8,73.0,73.2,73.4,73.1,73.3,73.2,73.2], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  HYG:  { ticker:"HYG",  price:79.1,  yield:0.058, cagr:0.022, name:"iShares iBoxx High Yield Corp Bond",leveraged:false,payFreq:"monthly",   sparkline:[78.0,78.4,78.7,78.5,78.9,79.0,79.1,79.3,79.0,79.2,79.1,79.1], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
  JNK:  { ticker:"JNK",  price:95.4,  yield:0.062, cagr:0.020, name:"SPDR Bloomberg High Yield Bond",   leveraged:false, payFreq:"monthly",   sparkline:[94.0,94.5,94.8,94.6,95.0,95.2,95.4,95.6,95.3,95.5,95.4,95.4], health:"STABLE",  source:"local", lastUpdated:"2026-02-01", categories:[] },
};

// ── Portfolio Templates ────────────────────────────────────────────────────────

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  category: "income" | "growth" | "highyield" | "hybrid";
  color: string;
  targetYield: number;
  targetCagr: number;
  holdings: { ticker: string; weight: number }[];
  tags: string[];
}

export const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
  {
    id: "core-income",
    name: "Low-Risk Income Target",
    description: "Low-risk profile aimed at reliable monthly cash flow with a conservative growth tilt.",
    category: "income",
    color: "#00d4be",
    targetYield: 0.055,
    targetCagr: 0.082,
    holdings: [
      { ticker: "SCHD", weight: 0.30 },
      { ticker: "JEPI", weight: 0.25 },
      { ticker: "DIVO", weight: 0.20 },
      { ticker: "VYM",  weight: 0.15 },
      { ticker: "SPHD", weight: 0.10 },
    ],
    tags: ["Monthly Income", "Low Volatility", "Quality Dividends"],
  },
  {
    id: "high-yield",
    name: "Medium-Risk Cashflow Target",
    description: "Medium-risk portfolio prioritizing higher monthly income with diversified option-income exposure.",
    category: "highyield",
    color: "#f0c842",
    targetYield: 0.110,
    targetCagr: 0.042,
    holdings: [
      { ticker: "QYLD", weight: 0.25 },
      { ticker: "JEPI", weight: 0.20 },
      { ticker: "JEPQ", weight: 0.20 },
      { ticker: "RYLD", weight: 0.15 },
      { ticker: "PFF",  weight: 0.10 },
      { ticker: "HYG",  weight: 0.10 },
    ],
    tags: ["Max Yield", "Monthly Payments", "Covered Calls"],
  },
  {
    id: "growth-dividend",
    name: "Low-Risk Growth Target",
    description: "Lower-risk growth-first portfolio that still keeps a dividend-growth component.",
    category: "growth",
    color: "#7c6af7",
    targetYield: 0.022,
    targetCagr: 0.135,
    holdings: [
      { ticker: "QQQ",  weight: 0.30 },
      { ticker: "VOO",  weight: 0.25 },
      { ticker: "VIG",  weight: 0.20 },
      { ticker: "DGRO", weight: 0.15 },
      { ticker: "VUG",  weight: 0.10 },
    ],
    tags: ["Capital Growth", "Dividend Growth", "Index Blend"],
  },
  {
    id: "hybrid-income-growth",
    name: "Balanced Risk Income+Growth Target",
    description: "Balanced risk profile mixing income ETFs and growth ETFs to pursue both cashflow and compounding.",
    category: "hybrid",
    color: "#f97316",
    targetYield: 0.058,
    targetCagr: 0.092,
    holdings: [
      { ticker: "SCHD", weight: 0.20 },
      { ticker: "JEPI", weight: 0.20 },
      { ticker: "VOO",  weight: 0.20 },
      { ticker: "DIVO", weight: 0.15 },
      { ticker: "VIG",  weight: 0.15 },
      { ticker: "JEPQ", weight: 0.10 },
    ],
    tags: ["Balanced", "Monthly+Quarterly", "Core+Satellite"],
  },
  {
    id: "yieldmax-hyper",
    name: "High-Risk Hyper Income Target",
    description: "High-risk hyper-income portfolio using option-income and synthetic-yield ETFs with diversification across issuers.",
    category: "highyield",
    color: "#ef4444",
    targetYield: 0.145,
    targetCagr: 0.052,
    holdings: [
      { ticker: "TSLY", weight: 0.12 },
      { ticker: "NVDY", weight: 0.12 },
      { ticker: "KQQQ", weight: 0.14 },
      { ticker: "FEPI", weight: 0.16 },
      { ticker: "TSYY", weight: 0.14 },
      { ticker: "NVYY", weight: 0.14 },
      { ticker: "LIFT", weight: 0.08 },
      { ticker: "VOO",  weight: 0.10 },
    ],
    tags: ["Ultra High Yield", "High Risk", "Multi-Issuer", "Monthly Focus"],
  },
  {
    id: "dividend-aristocrats",
    name: "Low-Risk Dividend Growth Target",
    description: "Quality-first dividend growth profile focused on consistency and lower volatility.",
    category: "income",
    color: "#22c55e",
    targetYield: 0.032,
    targetCagr: 0.098,
    holdings: [
      { ticker: "SCHD", weight: 0.35 },
      { ticker: "VIG",  weight: 0.25 },
      { ticker: "SDY",  weight: 0.20 },
      { ticker: "DGRO", weight: 0.20 },
    ],
    tags: ["Dividend Growth", "Blue Chip", "Low Risk"],
  },
];

// ── ETF Categories for filtering ──────────────────────────────────────────────
export const ETF_CATEGORIES: Record<string, string[]> = {
  "Covered Call": ["JEPI", "JEPQ", "QYLD", "RYLD", "XYLD", "DIVO", "NUSI"],
  "Core Dividend": ["SCHD", "VYM", "DVY", "HDV", "DGRO", "SDY", "FDVV", "SPYD", "VIG", "NOBL", "SCHY", "JDIV", "VYMI", "VIGI", "IHDG", "SPHD", "QDVO"],
  "Dividend Growth": ["VIG", "DGRO", "SDY", "NOBL", "VIGI"],
  "Growth / Index": ["QQQ", "VOO", "VUG", "IWF", "SPYG", "MGK"],
  "Leveraged":      ["TQQQ", "UPRO", "SOXL"],
  "YieldMax":       ["TSLY", "MSFO", "NVDY", "AMZY", "GOOGY", "APLY"],
  "KURV":           ["KQQQ", "KSPY", "KYLD", "KGLD", "KSLV", "KCOP", "AMZP", "AAPY", "GOOP", "MSFY", "NFLP", "TSLP"],
  "REX":            ["FEPI", "AIPI", "CEPI", "GIF", "NVII", "TSII"],
  "YieldBOOST":     ["TSYY", "NVYY", "YSPY", "TQQY", "AMYY"],
  "TappAlpha":      ["LIFT", "TSPY", "TDAQ", "TSYX", "TDAX"],
  "NEOS":           ["SPYI", "QQQI", "IWMI", "NIHI", "XSPI", "XQQI", "XBCI", "BTCI", "NEHI", "IYRI", "IAUI", "MLPI", "QQQH", "SPYH", "NLSI", "CSHI", "TLTI", "BNDI", "HYBI"],
  "Roundhill Income": ["XDTE", "QDTE", "RDTE", "XPAY", "YBTC", "YETH", "MAGY", "TPAY", "AAPW", "AMDW", "AMZW", "AVGW", "BRKW", "COIW", "GOOW", "HOOW", "MSTW", "MSFW", "NFLW", "NVDW", "PLTW", "TSLW", "WPAY"],
  "Roundhill Thematic": ["METV", "MAGS", "CHAT", "BETZ", "NERD", "OZEM", "WEED", "MAGC", "UX", "HUMN", "MEME", "CABZ"],
  "Closed-End Funds": ["UTG", "UTF", "EVT", "BST", "BME", "DNP", "AVK"],
  "Preferred/Bond": ["PFF", "PFFD", "AGG", "BND", "HYG", "JNK"],
  "Other Income":   ["SPHD"],
};

export const TYPE_CATEGORY_MAP: Record<string, string[]> = {
  "Option Income": ["YieldMax", "KURV", "REX", "YieldBOOST", "TappAlpha", "NEOS", "Covered Call"],
  "Covered Call": ["Covered Call"],
  "Core Dividend": ["Core Dividend", "Dividend Growth"],
  "Growth / Index": ["Growth / Index"],
  "Leveraged": ["Leveraged"],
  "Closed-End Funds": ["Closed-End Funds"],
  "Roundhill Income": ["Roundhill Income"],
  "Roundhill Thematic": ["Roundhill Thematic"],
};

export const PORTFOLIO_ARCHETYPES: ArchetypeDefinition[] = [
  {
    key: "pure-growth",
    name: "Pure Growth",
    tagline: "Maximize long-term capital appreciation",
    description: "Broad market and growth ETFs only. No income focus, built for long compounding runways.",
    expectedYieldRange: [0.005, 0.02],
    expectedCagrRange: [0.12, 0.2],
    riskLevel: "medium",
    strategy: "growth",
    preferredTypes: ["Growth / Index"],
    tags: ["S&P 500", "Nasdaq", "Compounding"],
    color: "bg-blue-600",
    icon: "TrendingUp",
    bestFor: "Long-term wealth builders who do not need current income",
  },
  {
    key: "growth-income",
    name: "Growth & Income",
    tagline: "Balance appreciation with steady dividends",
    description: "Mixes broad index exposure with dividend funds for a moderate income floor and solid upside.",
    expectedYieldRange: [0.03, 0.06],
    expectedCagrRange: [0.08, 0.13],
    riskLevel: "medium",
    strategy: "income",
    preferredTypes: ["Growth / Index", "Core Dividend"],
    tags: ["Balanced", "Dividend Growth", "Core Holdings"],
    color: "bg-teal-600",
    icon: "BarChart3",
    bestFor: "Working investors building toward retirement",
  },
  {
    key: "leveraged-growth",
    name: "Leveraged Growth",
    tagline: "Amplified exposure to index movements",
    description: "Uses leveraged ETFs with a stabilizing growth anchor. Highest upside and drawdown risk in the library.",
    expectedYieldRange: [0, 0.03],
    expectedCagrRange: [0.15, 0.4],
    riskLevel: "very-high",
    strategy: "hyper",
    preferredTypes: ["Leveraged", "Growth / Index"],
    tags: ["3x Leverage", "Momentum", "Satellite"],
    color: "bg-red-600",
    icon: "Flame",
    bestFor: "Aggressive investors with high risk tolerance",
  },
  {
    key: "dividend-income",
    name: "Dividend Growth",
    tagline: "Build a growing income stream over time",
    description: "Quality dividend ETFs with lower current yield and stronger long-term dividend growth.",
    expectedYieldRange: [0.025, 0.05],
    expectedCagrRange: [0.08, 0.12],
    riskLevel: "low",
    strategy: "income",
    preferredTypes: ["Core Dividend"],
    tags: ["Dividend Aristocrats", "Growing Income", "Quality"],
    color: "bg-emerald-600",
    icon: "Sprout",
    bestFor: "Investors building a growing income stream",
  },
  {
    key: "high-yield-income",
    name: "High Yield Income",
    tagline: "Maximize current monthly cash flow",
    description: "Uses high-yield option-income funds with a small growth anchor to reduce concentration risk.",
    expectedYieldRange: [0.12, 0.22],
    expectedCagrRange: [0.02, 0.06],
    riskLevel: "high",
    strategy: "hyper",
    preferredTypes: ["Option Income", "Covered Call"],
    tags: ["YieldMax", "KURV", "NEOS", "Cash Flow"],
    color: "bg-orange-500",
    icon: "Zap",
    bestFor: "Investors needing maximum current income",
  },
  {
    key: "covered-call-income",
    name: "Covered Call Income",
    tagline: "Generate cash flow by selling optionality",
    description: "Covered call ETFs prioritizing consistent monthly distributions and lower volatility.",
    expectedYieldRange: [0.07, 0.12],
    expectedCagrRange: [0.03, 0.08],
    riskLevel: "low",
    strategy: "income",
    preferredTypes: ["Covered Call", "Core Dividend"],
    tags: ["JEPI", "JEPQ", "Low Volatility"],
    color: "bg-green-600",
    icon: "Shield",
    bestFor: "Income-focused investors who want stability",
  },
  {
    key: "balanced-blend",
    name: "Balanced Blend",
    tagline: "Diversified across income, growth, and protection",
    description: "Spreads capital across dividend growth, covered call, and growth ETFs for all-weather balance.",
    expectedYieldRange: [0.05, 0.08],
    expectedCagrRange: [0.06, 0.11],
    riskLevel: "medium",
    strategy: "income",
    preferredTypes: ["Covered Call", "Core Dividend", "Growth / Index"],
    tags: ["All-Weather", "Diversified", "Balanced"],
    color: "bg-violet-600",
    icon: "Scale",
    bestFor: "Investors who want one portfolio for all conditions",
  },
  {
    key: "hyper-income",
    name: "Hyper Income",
    tagline: "Maximum yield across all issuer families",
    description: "Combines the strongest high-yield and weekly-pay families for maximum current distributions.",
    expectedYieldRange: [0.15, 0.3],
    expectedCagrRange: [-0.05, 0.05],
    riskLevel: "very-high",
    strategy: "hyper",
    preferredTypes: ["Option Income", "Roundhill Income"],
    tags: ["Max Yield", "Weekly Pay", "Very High Risk"],
    color: "bg-rose-600",
    icon: "DollarSign",
    bestFor: "Yield chasers who understand the risks",
  },
  {
    key: "cef-income",
    name: "Closed-End Fund Income",
    tagline: "Proven income with long distribution history",
    description: "Closed-end funds with long-running distributions and steady monthly income profiles.",
    expectedYieldRange: [0.06, 0.1],
    expectedCagrRange: [0.05, 0.09],
    riskLevel: "medium",
    strategy: "income",
    preferredTypes: ["Closed-End Funds"],
    tags: ["CEF", "Monthly Income", "Active Management"],
    color: "bg-cyan-600",
    icon: "Landmark",
    bestFor: "Income investors who value distribution consistency",
  },
  {
    key: "conservative-income",
    name: "Conservative Income",
    tagline: "Low volatility, capital preservation first",
    description: "Stable dividend and income ETFs with lower drawdown and steady payout expectations.",
    expectedYieldRange: [0.04, 0.07],
    expectedCagrRange: [0.04, 0.08],
    riskLevel: "low",
    strategy: "income",
    preferredTypes: ["Core Dividend", "Covered Call"],
    tags: ["Capital Preservation", "Low Drawdown", "Near-Retirement"],
    color: "bg-slate-600",
    icon: "Anchor",
    bestFor: "Near-retirees focused on capital preservation",
  },
];

export function validateETFCategoryConsistency(): Array<{ category: string; ticker: string }> {
  const missing: Array<{ category: string; ticker: string }> = [];
  for (const [category, tickers] of Object.entries(ETF_CATEGORIES)) {
    for (const ticker of tickers) {
      if (!ETF_DB[ticker]) {
        missing.push({ category, ticker });
      }
    }
  }
  return missing;
}

function populateCategories(): void {
  for (const entry of Object.values(ETF_DB)) {
    entry.categories = [];
  }

  for (const [category, tickers] of Object.entries(ETF_CATEGORIES)) {
    for (const ticker of tickers) {
      if (ETF_DB[ticker]) {
        ETF_DB[ticker].categories = [...(ETF_DB[ticker].categories ?? []), category];
      }
    }
  }
}

populateCategories();

if (process.env.NODE_ENV === "development") {
  const missing = validateETFCategoryConsistency();
  if (missing.length > 0) {
    console.warn(
      `[ETF_DB] ${missing.length} tickers in ETF_CATEGORIES are missing from ETF_DB:\n${missing
        .map((item) => `  ${item.category}: ${item.ticker}`)
        .join("\n")}`,
    );
  }
}

