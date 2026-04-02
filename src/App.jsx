import { useState } from 'react'

const SAMPLE_COMPANIES = [
  {
    name: "Nordic Transport Solutions AB",
    industry: "Fleet Logistics",
    revenue: "€42.5M",
    ebitda: "€6.8M",
    totalDebt: "€18.2M",
    cashFlow: "€4.1M",
    yearsInBusiness: 12,
    employees: 285,
    requestedFinancing: "€3.5M",
    financingPurpose: "Fleet expansion — 25 new Scania trucks",
    collateral: "Vehicle fleet (book value €12M)",
    paymentHistory: "No defaults, 2 late payments in 5 years",
    region: "Sweden / Nordics",
  },
  {
    name: "Müller Spedition GmbH",
    industry: "Freight & Distribution",
    revenue: "€28.1M",
    ebitda: "€3.2M",
    totalDebt: "€14.7M",
    cashFlow: "€1.9M",
    yearsInBusiness: 6,
    employees: 120,
    requestedFinancing: "€5.0M",
    financingPurpose: "Acquisition of regional competitor",
    collateral: "Real estate (€4M) + Fleet (€6M)",
    paymentHistory: "1 restructured loan in 2023",
    region: "Germany / DACH",
  },
  {
    name: "Transporte Ibérico S.L.",
    industry: "Cold Chain Logistics",
    revenue: "€15.8M",
    ebitda: "€1.1M",
    totalDebt: "€9.3M",
    cashFlow: "€0.6M",
    yearsInBusiness: 4,
    employees: 68,
    requestedFinancing: "€2.8M",
    financingPurpose: "Refrigerated trailer fleet renewal",
    collateral: "Existing fleet (book value €3.5M)",
    paymentHistory: "Clean record, limited history",
    region: "Spain / Southern Europe",
  },
]

function parseRiskLevel(text) {
  const match = text.match(
    /(?:overall|risk)\s*(?:risk)?\s*(?:rating|level)?[\s:]*\*?\*?(Low-Medium|Medium-High|Low|Medium|High)\*?\*?/i
  )
  return match ? match[1] : "Medium"
}

function parseSection(text, sectionName) {
  const regex = new RegExp(
    `(?:#{1,3}\\s*)?(?:\\*\\*)?${sectionName}(?:\\*\\*)?[:\\s]*([\\s\\S]*?)(?=(?:#{1,3}\\s|$))`,
    "i"
  )
  const match = text.match(regex)
  return match ? match[1].trim() : ""
}

const RISK_COLORS = {
  "Low": "#22c55e",
  "Low-Medium": "#84cc16",
  "Medium": "#eab308",
  "Medium-High": "#f97316",
  "High": "#ef4444",
}

function RiskGauge({ level }) {
  const levels = ["Low", "Low-Medium", "Medium", "Medium-High", "High"]
  const idx = levels.indexOf(level)
  const pct = idx >= 0 ? (idx / (levels.length - 1)) * 100 : 50
  const color = RISK_COLORS[level] || "#eab308"

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <svg viewBox="0 0 200 110" width="200" height="110">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#1e293b"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 251.2} 251.2`}
          style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
        />
      </svg>
      <span style={{
        fontSize: 16,
        fontWeight: 700,
        color: color,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: 1,
      }}>
        {level.toUpperCase()} RISK
      </span>
    </div>
  )
}

function CleanText({ text }) {
  if (!text) return null

  const parts = text.split(/(\*\*.*?\*\*)/)

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} style={{ color: '#f1f5f9' }}>
              {part.slice(2, -2)}
            </strong>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

function App() {
  // useState creates a variable that React "watches".
  // When it changes, React automatically re-renders the screen.
  // selectedCompany starts as null (nothing selected).
  // setSelectedCompany is the function we call to change it.
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("summary")
  const runAnalysis = async () => {
    if (selectedCompany === null) return

    const data = SAMPLE_COMPANIES[selectedCompany]

    setLoading(true)
    setError(null)
    setAnalysis(null)

    const prompt = `You are a senior credit risk analyst at a commercial vehicle financial services company. Analyze this financing application and produce a structured credit risk assessment.

APPLICANT DATA:
- Company: ${data.name}
- Industry: ${data.industry}
- Annual Revenue: ${data.revenue}
- EBITDA: ${data.ebitda}
- Total Debt: ${data.totalDebt}
- Operating Cash Flow: ${data.cashFlow}
- Years in Business: ${data.yearsInBusiness}
- Employees: ${data.employees}
- Requested Financing: ${data.requestedFinancing}
- Purpose: ${data.financingPurpose}
- Collateral: ${data.collateral}
- Payment History: ${data.paymentHistory}
- Region: ${data.region}

Provide your assessment in this exact format:

## Overall Risk Rating
[One of: Low, Low-Medium, Medium, Medium-High, High]

## Executive Summary
[2-3 sentence summary of the credit assessment]

## Financial Analysis
[Key financial metrics analysis with specific calculations]

## Risk Factors
[Bullet the key risks identified]

## Mitigating Factors
[Bullet the positive factors]

## Recommendation
[Clear financing recommendation with any conditions]

## Suggested Terms
[Recommended loan structure, interest rate range, tenor, and covenants]`

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      })

      const result = await response.json()
    
      const text = result.content?.map(c => c.text || "").join("\n") || ""

      setAnalysis(text)
    } catch (err) {
      setError("Analysis failed. Please check your API key and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      <header style={{
        borderBottom: '1px solid #1e293b',
        padding: '20px 32px',
        background: '#0f172a',
      }}>
        <h1 style={{
          fontSize: 20,
          fontFamily: "'Playfair Display', serif",
          color: '#f8fafc',
          margin: 0,
        }}>
          AI Credit Analyst
        </h1>
        <span style={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 2,
          color: '#c9a227',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          GenAI-Powered Risk Assessment
        </span>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

        {SAMPLE_COMPANIES.map((company, index) => (
          <button
            key={index}
            onClick={() => setSelectedCompany(index)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              padding: '16px 20px',
              marginBottom: 10,
              borderRadius: 10,
              border: '1px solid',
              borderColor: selectedCompany === index ? '#c9a227' : '#1e293b',
              background: selectedCompany === index
                ? '#c9a22718'
                : '#0f172a',
              cursor: 'pointer',
              textAlign: 'left',
              color: '#e2e8f0',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                {company.name}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {company.industry} · {company.region} · Revenue {company.revenue}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#c9a227',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {company.requestedFinancing}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                requested
              </div>
            </div>
          </button>
        ))}

        <button
          onClick={runAnalysis}
          disabled={loading || selectedCompany === null}
          style={{
            width: '100%',
            padding: 14,
            marginTop: 20,
            borderRadius: 10,
            border: 'none',
            background: loading || selectedCompany === null
              ? '#1e293b'
              : 'linear-gradient(135deg, #c9a227, #a37e1c)',
            color: loading || selectedCompany === null
              ? '#475569'
              : '#020617',
            fontSize: 14,
            fontWeight: 700,
            cursor: loading || selectedCompany === null
              ? 'not-allowed'
              : 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {loading ? '⟳ Analyzing Credit Risk with AI...' : '▸ Run AI Credit Analysis'}
        </button>

        {error && (
          <div style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 10,
            background: '#450a0a',
            border: '1px solid #7f1d1d',
            color: '#fca5a5',
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {analysis && (() => {
          const riskLevel = parseRiskLevel(analysis)
          const company = SAMPLE_COMPANIES[selectedCompany]
          return (
            <div style={{ marginTop: 24 }}>

              {/* Company Summary + Risk Gauge */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 24,
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 12,
                padding: 28,
                marginBottom: 20,
              }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#f8fafc' }}>
                    {company.name}
                  </div>
                  <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                    {[
                      ["Industry", company.industry],
                      ["Region", company.region],
                      ["Request", company.requestedFinancing],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div style={{
                          fontSize: 10,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          color: '#64748b',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1' }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
                    {parseSection(analysis, "Executive Summary")}
                  </p>
                </div>
                <RiskGauge level={riskLevel} />
              </div>

              {/* Tabs */}
              <div style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #1e293b' }}>
                  {[
                    ["summary", "Financial Analysis"],
                    ["risks", "Risk Factors"],
                    ["recommendation", "Recommendation"],
                    ["terms", "Suggested Terms"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      style={{
                        flex: 1,
                        padding: '12px 8px',
                        border: 'none',
                        borderBottom: activeTab === key ? '2px solid #c9a227' : '2px solid transparent',
                        background: 'transparent',
                        color: activeTab === key ? '#c9a227' : '#64748b',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ padding: 24, minHeight: 140, fontSize: 14, color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {activeTab === "summary" && <CleanText text={parseSection(analysis, "Financial Analysis")} />}
                  {activeTab === "risks" && (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <h4 style={{ color: '#ef4444', fontSize: 13, margin: '0 0 8px', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: 1 }}>
                          Risk Factors
                        </h4>
                        <CleanText text={parseSection(analysis, "Risk Factors")} />
                      </div>
                      <div>
                        <h4 style={{ color: '#22c55e', fontSize: 13, margin: '0 0 8px', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: 1 }}>
                          Mitigating Factors
                        </h4>
                        <CleanText text={parseSection(analysis, "Mitigating Factors")} />
                      </div>
                    </>
                  )}
                  {activeTab === "recommendation" && <CleanText text={parseSection(analysis, "Recommendation")} />}
                  {activeTab === "terms" && <CleanText text={parseSection(analysis, "Suggested Terms")} />}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                marginTop: 16,
                padding: '12px 20px',
                fontSize: 11,
                color: '#475569',
                fontFamily: "'JetBrains Mono', monospace",
                textAlign: 'center',
              }}>
                AI-GENERATED ASSESSMENT · FOR DECISION SUPPORT ONLY · NOT FINANCIAL ADVICE
              </div>

            </div>
          )
        })()}

      </main>
    </div>
  )
}
export default App