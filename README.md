# AI Credit Analyst
Live Demo: https://ai-credit-analyst-mocha.vercel.app

### GenAI-Powered Credit Risk Assessment for Financial Services

An intelligent credit risk assessment tool that leverages Large Language Models to analyze financing applications and generate structured risk reports — built for commercial vehicle financial services.

## What It Does

- Ingests structured financial data from loan applications
- Analyzes credit risk using LLMs with domain-specific prompting
- Generates structured credit reports with risk ratings, financial analysis, and recommended terms
- Presents results in an interactive dashboard with risk gauge and tabbed report

## Tech Stack

- **Frontend:** React + Vite
- **AI Engine:** Anthropic Claude API (Sonnet 4)
- **Prompt Engineering:** Structured credit analysis prompts with financial domain context
- **Visualization:** Custom SVG risk gauge

## Running Locally
```bash
git clone https://github.com/faezehka/ai-credit-analyst.git
cd ai-credit-analyst
npm install
```

Create a `.env` file in the root:
```
VITE_API_KEY=your_anthropic_api_key_here
```

Then start the dev server:
```bash
npm run dev
```

## How It Works

1. Select a financing applicant or enter custom data
2. Click "Run AI Credit Analysis"
3. The LLM analyzes financial metrics, industry context, and risk indicators
4. A structured credit memo is generated with risk rating, analysis, and recommended terms

## Future Roadmap

- RAG integration with internal credit policy documents
- Backend API server (FastAPI) for production deployment
- Batch processing for application pipelines
- MLOps pipeline with prompt versioning and evaluation metrics
