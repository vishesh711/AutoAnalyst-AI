# AutoAnalyst AI

An intelligent research and data analysis platform powered by AI. AutoAnalyst AI combines document search, business analytics, and real-time information retrieval in a beautiful, modern interface.

## 🚀 Quick Start

### 1. Start the Backend Server

From the project root directory, run:

```bash
# Set your GROQ API key
export GROQ_API_KEY=your_groq_api_key_here

# Start the backend server
cd backend
export TOKENIZERS_PARALLELISM=false
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

For convenience, you can use this one-liner:

```bash
cd backend && export GROQ_API_KEY=your_groq_api_key_here && export TOKENIZERS_PARALLELISM=false && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start the Frontend (Development)

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## ✨ Features

### 🔍 Document Research & Analysis
- Upload and search PDFs, documents, and research papers
- RAG (Retrieval Augmented Generation) for intelligent document search
- Source citations and references

### 📊 Data Analytics & Business Intelligence  
- Natural language to SQL conversion
- Business analytics with sample data (customers, sales, products)
- Automatic chart generation (bar, line, pie charts)
- KPI dashboards and performance reports

### 🌐 Real-time Information Retrieval
- Web search capabilities for current events
- Latest trends and up-to-date information
- Multi-source information aggregation

### 🎨 Beautiful UI with Vetra Theme
- Modern, professional design
- Deep violet, mustard gold, and subtle tan color scheme
- Responsive layout for all devices
- Dark/light theme support

## 🛠️ Technical Stack

### Backend
- **FastAPI** - Modern Python web framework
- **LangChain** - LLM orchestration and agent framework
- **Groq** - Fast LLM inference (llama3-8b-8192)
- **FAISS** - Vector similarity search
- **SQLite** - Local database with business sample data
- **Sentence Transformers** - Local embeddings

### Frontend
- **Next.js 13** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Markdown** - Rich text rendering

## 🏗️ Architecture

```
AutoAnalyst AI
├── Backend (FastAPI)
│   ├── Query Planner (ReAct Agent)
│   ├── RAG Tool (Document Search)
│   ├── SQL Tool (Data Analytics) 
│   └── Web Tool (Real-time Search)
└── Frontend (Next.js)
    ├── Chat Interface
    ├── Document Upload
    └── System Statistics
```

## 📦 Sample Data

The system includes business sample data:
- **10 customers** across different tiers (Basic, Premium, Enterprise)
- **8 products** in software and service categories  
- **500 sales records** spanning 12 months
- **4 marketing campaigns** with performance metrics

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
DATABASE_URL=sqlite:///./data/autoanalyst.db
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
LLM_MODEL=llama3-8b-8192
```

### API Keys Required
- **Groq API Key**: Get from https://console.groq.com/

## 🚦 Troubleshooting

### Common Issues

1. **ModuleNotFoundError: No module named 'app'**
   - Make sure you're running the server from the `backend/` directory
   - Use the provided command with the correct working directory

2. **'Config' object has no attribute 'CHUNK_SIZE' or 'UPLOAD_PATH'**
   - This is a configuration issue. Add the following lines to your `backend/app/config.py` file in the `Config` class:
   ```python
   CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1000"))
   UPLOAD_PATH: str = os.getenv("UPLOAD_PATH", str(BASE_DIR / "data" / "uploads"))
   ```
   
3. **GROQ_API_KEY environment variable is required**
   - Make sure to set the GROQ API key as shown in the Quick Start section
   - Verify the key is correctly set with: `echo $GROQ_API_KEY`

4. **Tokenizer Warnings**
   - Set `export TOKENIZERS_PARALLELISM=false`
   - This is handled automatically in the startup commands

5. **Server Won't Start**
   - Check if port 8000 is available: `lsof -i :8000`
   - Kill existing processes: `pkill -f uvicorn`

6. **Frontend Build Issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

### Health Check

Visit http://localhost:8000/api/health to check system status.

## 🎯 Usage Examples

### Business Analytics
```
"Show me top customers by revenue"
"Create a chart of monthly sales trends"  
"Which products have the highest profit margins?"
"Compare marketing campaign performance"
```

### Document Research
```
"Search my documents for information about machine learning"
"Summarize the key findings from the uploaded report"
"What does the document say about market trends?"
```

### Real-time Information
```
"Latest news about artificial intelligence"
"Current trends in data analytics"
"Recent developments in LLM technology"
```

## 🔄 Development

### Backend Development

```bash
cd backend
# Install dependencies
pip install -r requirements.txt

# Run with hot reload
python -m uvicorn app.main:app --reload

# Run tests
python -m pytest tests/
```

### Frontend Development

```bash
cd frontend
# Install dependencies  
npm install

# Development server
npm run dev

# Build for production
npm run build
npm start
```

## 📚 API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **LangChain** for the agent framework
- **Groq** for fast LLM inference
- **Vercel** for Next.js framework
- **Tailwind CSS** for beautiful styling