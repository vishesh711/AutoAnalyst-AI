#!/usr/bin/env python3

import requests
import json
import time
import sys
from typing import Dict, Any

class AutoAnalystDemo:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session_id = "demo_session_001"
    
    def test_connection(self) -> bool:
        """Test if the AutoAnalyst API is running"""
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                print("✅ AutoAnalyst AI is running!")
                return True
            else:
                print(f"❌ Server returned status code: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to AutoAnalyst AI. Make sure the server is running at http://localhost:8000")
            return False
        except Exception as e:
            print(f"❌ Error connecting to server: {e}")
            return False
    
    def ask_question(self, query: str) -> Dict[str, Any]:
        """Send a question to AutoAnalyst AI"""
        try:
            print(f"\n🤔 Asking: {query}")
            
            response = requests.post(
                f"{self.base_url}/api/ask",
                json={
                    "query": query,
                    "session_id": self.session_id
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"🤖 Response: {result['answer'][:200]}...")
                
                if result.get('sources'):
                    print(f"📚 Sources found: {len(result['sources'])}")
                
                if result.get('charts'):
                    print(f"📊 Charts generated: {len(result['charts'])}")
                
                print(f"🔍 Query type: {result.get('query_type', 'unknown')}")
                return result
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
                return {}
                
        except Exception as e:
            print(f"❌ Error asking question: {e}")
            return {}
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get system health status"""
        try:
            response = requests.get(f"{self.base_url}/api/health")
            if response.status_code == 200:
                return response.json()
            else:
                return {"status": "error", "message": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def run_demo(self):
        """Run a comprehensive demo of AutoAnalyst AI capabilities"""
        print("🚀 AutoAnalyst AI Demo Starting...")
        print("=" * 50)
        
        # Test connection
        if not self.test_connection():
            print("\n💡 To start AutoAnalyst AI:")
            print("1. Make sure you have set your OpenAI API key in backend/.env")
            print("2. Run: python run_project.py")
            return
        
        # Check health
        print("\n📊 System Health Check:")
        health = self.get_health_status()
        if health.get("status") == "healthy":
            print("✅ All services are healthy")
        else:
            print(f"⚠️  System status: {health}")
        
        print("\n" + "=" * 50)
        print("🧪 Testing Different Query Types")
        print("=" * 50)
        
        # Test SQL Analytics
        print("\n📊 SQL Analytics Demo:")
        sql_queries = [
            "What are the top 5 customers by revenue?",
            "Show me monthly sales trends",
            "Which products have the highest profit margins?",
        ]
        
        for query in sql_queries:
            result = self.ask_question(query)
            time.sleep(2)  # Be nice to the API
        
        # Test RAG (will work once documents are uploaded)
        print("\n📚 Document Research Demo:")
        rag_queries = [
            "What documents are currently available?",
            "Summarize any uploaded research papers",
        ]
        
        for query in rag_queries:
            result = self.ask_question(query)
            time.sleep(2)
        
        # Test Web Search
        print("\n🌐 Web Search Demo:")
        web_queries = [
            "What are the latest developments in AI transformers?",
            "Recent trends in business analytics",
        ]
        
        for query in web_queries:
            result = self.ask_question(query)
            time.sleep(2)
        
        print("\n" + "=" * 50)
        print("✨ Demo Complete!")
        print("=" * 50)
        print(f"🔗 View API docs: {self.base_url}/docs")
        print(f"🖥️  Backend: {self.base_url}")
        print("\n💡 Try your own queries:")
        print("- Upload a PDF and ask questions about it")
        print("- Ask for data visualizations")
        print("- Request specific business metrics")
        print("- Export your conversation to PDF")

def main():
    """Main demo function"""
    demo = AutoAnalystDemo()
    
    if len(sys.argv) > 1:
        # Interactive mode - ask a single question
        query = " ".join(sys.argv[1:])
        if demo.test_connection():
            demo.ask_question(query)
    else:
        # Full demo mode
        demo.run_demo()

if __name__ == "__main__":
    main() 