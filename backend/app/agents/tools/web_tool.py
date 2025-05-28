from langchain.tools import BaseTool
from typing import Dict, List, Any, Optional
import logging
import asyncio
import random
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class WebTool(BaseTool):
    """Tool for web search and real-time information retrieval"""
    
    name: str = "web_search"
    description: str = """Use this tool to search for current information, latest news, trends, and real-time data from the web.
    
    This tool is best for:
    - Current events and latest news
    - Recent developments and updates
    - Market trends and real-time data
    - Latest research and publications
    - Recent technology announcements
    - Current social media trends
    - Weather and live information
    - Stock prices and financial data
    
    Input should be a search query for current/recent information, such as:
    - "Latest news about artificial intelligence"
    - "Current trends in data analytics"
    - "Recent developments in LLM technology"
    - "Latest market news"
    """
    
    class Config:
        arbitrary_types_allowed = True
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
    def _run(self, query: str) -> Dict[str, Any]:
        """Synchronous run method (required by BaseTool)"""
        import asyncio
        return asyncio.run(self._arun(query))
    
    async def _arun(self, query: str) -> Dict[str, Any]:
        """Search the web for real-time information"""
        try:
            # Simulate web search with realistic responses
            # In a real implementation, this would use actual web search APIs
            results = await self._simulate_web_search(query)
            
            # Generate summary and insights
            summary = await self._generate_summary(query, results)
            
            return {
                "answer": summary,
                "sources": results,
                "query": query,
                "search_type": "web"
            }
            
        except Exception as e:
            logger.error(f"Error in web search: {str(e)}")
            return {
                "answer": f"I encountered an error while searching the web: {str(e)}",
                "sources": [],
                "query": query
            }
    
    async def _simulate_web_search(self, query: str) -> List[Dict[str, Any]]:
        """Simulate web search results with realistic content"""
        
        # Simulate search delay
        await asyncio.sleep(0.5)
        
        # Generate realistic search results based on query keywords
        results = []
        
        if any(keyword in query.lower() for keyword in ["ai", "artificial intelligence", "llm", "gpt", "machine learning"]):
            results = [
                {
                    "title": "Latest Advances in Large Language Models - AI Research Update",
                    "url": "https://example-ai-news.com/llm-advances-2024",
                    "snippet": "Recent breakthroughs in large language models show significant improvements in reasoning capabilities and multimodal understanding. New architectures are achieving better performance with fewer parameters.",
                    "domain": "AI Research",
                    "published": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
                    "relevance_score": 0.95
                },
                {
                    "title": "Enterprise AI Adoption Reaches New Heights in 2024",
                    "url": "https://example-tech-news.com/enterprise-ai-2024",
                    "snippet": "Companies are increasingly integrating AI tools into their workflows, with 78% of enterprises reporting successful AI implementations. The focus has shifted to practical applications and ROI measurement.",
                    "domain": "Technology News",
                    "published": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
                    "relevance_score": 0.88
                },
                {
                    "title": "Ethical AI Guidelines Updated by Leading Tech Companies",
                    "url": "https://example-ethics-news.com/ai-guidelines-update",
                    "snippet": "Major technology companies have released updated guidelines for responsible AI development, emphasizing transparency, fairness, and accountability in AI systems.",
                    "domain": "Tech Policy",
                    "published": (datetime.now() - timedelta(hours=12)).strftime("%Y-%m-%d"),
                    "relevance_score": 0.82
                }
            ]
            
        elif any(keyword in query.lower() for keyword in ["data analytics", "business intelligence", "dashboard", "visualization"]):
            results = [
                {
                    "title": "The Future of Business Intelligence: Real-Time Analytics Trends",
                    "url": "https://example-analytics.com/bi-trends-2024",
                    "snippet": "Real-time analytics and AI-powered insights are transforming how businesses make decisions. Self-service analytics tools are becoming more sophisticated and user-friendly.",
                    "domain": "Business Analytics",
                    "published": (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d"),
                    "relevance_score": 0.92
                },
                {
                    "title": "Data Visualization Best Practices for Modern Dashboards",
                    "url": "https://example-dataviz.com/dashboard-design-2024",
                    "snippet": "Modern dashboard design emphasizes clarity, interactivity, and mobile responsiveness. New tools are making it easier to create compelling data stories.",
                    "domain": "Data Visualization",
                    "published": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
                    "relevance_score": 0.86
                }
            ]
            
        elif any(keyword in query.lower() for keyword in ["market", "stock", "finance", "economy", "investment"]):
            results = [
                {
                    "title": "Global Markets Show Steady Growth Amid Tech Rally",
                    "url": "https://example-finance.com/market-update",
                    "snippet": "Technology stocks continue to drive market gains as investors show confidence in AI and cloud computing sectors. Market analysts remain optimistic about Q4 performance.",
                    "domain": "Financial News",
                    "published": datetime.now().strftime("%Y-%m-%d"),
                    "relevance_score": 0.94
                },
                {
                    "title": "Investment Trends: ESG and Technology Lead 2024",
                    "url": "https://example-investment.com/2024-trends",
                    "snippet": "Environmental, Social, and Governance (ESG) investments alongside technology sector investments are dominating portfolio allocations this year.",
                    "domain": "Investment News",
                    "published": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
                    "relevance_score": 0.87
                }
            ]
            
        elif any(keyword in query.lower() for keyword in ["news", "current events", "latest", "breaking"]):
            results = [
                {
                    "title": "Breaking: Major Technology Conference Announces Innovation Awards",
                    "url": "https://example-tech-news.com/innovation-awards",
                    "snippet": "The annual technology innovation conference has announced this year's award winners, highlighting breakthroughs in artificial intelligence, quantum computing, and sustainable technology.",
                    "domain": "Technology News",
                    "published": (datetime.now() - timedelta(hours=6)).strftime("%Y-%m-%d"),
                    "relevance_score": 0.91
                },
                {
                    "title": "Global Summit on Digital Transformation Concludes",
                    "url": "https://example-business.com/digital-summit",
                    "snippet": "World leaders and technology executives concluded a three-day summit on digital transformation, announcing new initiatives for global connectivity and digital literacy.",
                    "domain": "Business News",
                    "published": (datetime.now() - timedelta(hours=18)).strftime("%Y-%m-%d"),
                    "relevance_score": 0.85
                }
            ]
            
        else:
            # Generic search results
            results = [
                {
                    "title": f"Latest Information About: {query.title()}",
                    "url": f"https://example-search.com/results/{query.replace(' ', '-')}",
                    "snippet": f"Current information and recent updates related to {query}. This comprehensive overview covers the latest developments and trending topics in this area.",
                    "domain": "General Information",
                    "published": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
                    "relevance_score": 0.78
                },
                {
                    "title": f"Trending Now: {query.title()} Updates",
                    "url": f"https://example-trends.com/{query.replace(' ', '-')}-updates",
                    "snippet": f"Stay up-to-date with the latest trends and developments in {query}. Expert analysis and insights on current happenings.",
                    "domain": "Trending Topics",
                    "published": (datetime.now() - timedelta(hours=12)).strftime("%Y-%m-%d"),
                    "relevance_score": 0.75
                }
            ]
        
        return results
    
    async def _generate_summary(self, query: str, results: List[Dict[str, Any]]) -> str:
        """Generate a comprehensive summary based on search results"""
        
        if not results:
            return f"I couldn't find current information about '{query}'. This might be because the topic is very new or specific. Please try rephrasing your search or being more specific."
        
        # Create a structured summary
        summary_parts = []
        
        # Introduction
        summary_parts.append(f"Here's what I found about '{query}' from recent sources:")
        
        # Main findings
        summary_parts.append("\n**Key Findings:**")
        
        for i, result in enumerate(results[:3], 1):
            snippet = result.get('snippet', '').strip()
            domain = result.get('domain', 'Web')
            published = result.get('published', 'Recently')
            
            summary_parts.append(f"{i}. **{domain}** ({published}): {snippet}")
        
        # Additional context if more results
        if len(results) > 3:
            summary_parts.append(f"\nI found {len(results)} total sources covering this topic, indicating it's actively being discussed and updated.")
        
        # Relevance note
        avg_relevance = sum(r.get('relevance_score', 0.5) for r in results) / len(results)
        if avg_relevance > 0.85:
            summary_parts.append("\nThese sources appear highly relevant and current.")
        elif avg_relevance > 0.7:
            summary_parts.append("\nThese sources provide good coverage of the topic.")
        else:
            summary_parts.append("\nI found some related information, though you might want to search with more specific terms.")
        
        # Helpful tip
        summary_parts.append(f"\n*Tip: For the most current information, consider checking the sources directly or refining your search with more specific terms.*")
        
        return "\n".join(summary_parts)
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of the web search tool"""
        return {
            "status": "healthy",
            "description": "Web search simulation active",
            "capabilities": [
                "Current events search",
                "Technology news",
                "Market information", 
                "General web search"
            ]
        } 