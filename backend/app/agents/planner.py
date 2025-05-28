from langchain.agents import create_react_agent, AgentExecutor
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.schema import BaseMessage, HumanMessage, AIMessage
from typing import Dict, List, Any, Optional
import logging
import asyncio
from datetime import datetime

from app.llm.factory import create_llm
from app.agents.tools.rag_tool import RAGTool
from app.agents.tools.sql_tool import SQLTool
from app.agents.tools.web_tool import WebTool
from app.config import config

logger = logging.getLogger(__name__)

class QueryPlanner:
    """Main query planner using ReAct agent to route queries to appropriate tools"""
    
    def __init__(self):
        self.llm = None
        self.tools = []
        self.agent = None
        self.agent_executor = None
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        self.sessions = {}
        
    async def initialize(self):
        """Initialize the query planner with LLM and tools"""
        try:
            # Initialize LLM
            self.llm = create_llm()
            
            # Initialize tools
            await self._initialize_tools()
            
            # Create agent
            await self._create_agent()
            
            logger.info("Query planner initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing query planner: {str(e)}")
            raise
    
    async def _initialize_tools(self):
        """Initialize all available tools"""
        try:
            # RAG Tool for document search
            rag_tool = RAGTool()
            await rag_tool.initialize()
            
            # SQL Tool for data analytics
            sql_tool = SQLTool()
            await sql_tool.initialize()
            
            # Web Tool for real-time search
            web_tool = WebTool()
            
            self.tools = [rag_tool, sql_tool, web_tool]
            
            logger.info(f"Initialized {len(self.tools)} tools")
            
        except Exception as e:
            logger.error(f"Error initializing tools: {str(e)}")
            raise
    
    async def _create_agent(self):
        """Create the ReAct agent"""
        try:
            # Define the ReAct prompt template
            react_prompt = PromptTemplate.from_template("""
You are AutoAnalyst AI, an intelligent research and data analysis assistant. You have access to several tools to help answer user questions.

Available tools:
{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Guidelines:
1. For questions about uploaded documents, research papers, or specific content, use rag_search
2. For questions about business data, sales, customers, analytics, or requesting charts, use sql_analytics  
3. For questions about current events, latest news, or real-time information, use web_search
4. Always provide detailed, helpful answers
5. When using sql_analytics, be specific about what data or charts you want
6. Cite sources when available

Begin!

Question: {input}
Thought: {agent_scratchpad}
""")
            
            # Create the agent
            self.agent = create_react_agent(
                llm=self.llm,
                tools=self.tools,
                prompt=react_prompt
            )
            
            # Create agent executor
            self.agent_executor = AgentExecutor(
                agent=self.agent,
                tools=self.tools,
                verbose=True,
                handle_parsing_errors=True,
                max_iterations=config.AGENT_MAX_ITERATIONS,
                return_intermediate_steps=True
            )
            
            logger.info("Agent created successfully")
            
        except Exception as e:
            logger.error(f"Error creating agent: {str(e)}")
            raise
    
    async def process_query(self, query: str, session_id: str = "default") -> Dict[str, Any]:
        """Process a user query using the agent"""
        try:
            # Initialize if not already done
            if not self.agent_executor:
                await self.initialize()
            
            # Get or create session memory
            if session_id not in self.sessions:
                self.sessions[session_id] = {
                    "memory": ConversationBufferMemory(
                        memory_key="chat_history",
                        return_messages=True
                    ),
                    "messages": []
                }
            
            session_memory = self.sessions[session_id]["memory"]
            
            # Add user message to session
            user_message = HumanMessage(content=query)
            self.sessions[session_id]["messages"].append({
                "type": "user",
                "content": query,
                "timestamp": datetime.now().isoformat()
            })
            
            # Run the agent
            result = await self._run_agent(query, session_memory)
            
            # Add assistant response to session
            self.sessions[session_id]["messages"].append({
                "type": "assistant", 
                "content": result["answer"],
                "timestamp": datetime.now().isoformat(),
                "sources": result.get("sources", []),
                "charts": result.get("charts", []),
                "query_type": result.get("query_type", "general")
            })
            
            # Update memory
            session_memory.chat_memory.add_user_message(query)
            session_memory.chat_memory.add_ai_message(result["answer"])
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return {
                "answer": f"I apologize, but I encountered an error while processing your query: {str(e)}",
                "sources": [],
                "charts": [],
                "query_type": "error"
            }
    
    async def _run_agent(self, query: str, memory: ConversationBufferMemory) -> Dict[str, Any]:
        """Run the agent with the given query"""
        try:
            # Prepare input with memory
            chat_history = memory.chat_memory.messages
            history_text = ""
            
            for msg in chat_history[-6:]:  # Last 3 exchanges
                if isinstance(msg, HumanMessage):
                    history_text += f"Human: {msg.content}\n"
                elif isinstance(msg, AIMessage):
                    history_text += f"Assistant: {msg.content}\n"
            
            # Run the agent
            agent_input = {
                "input": query,
                "chat_history": history_text
            }
            
            result = await self.agent_executor.ainvoke(agent_input)
            
            # Extract information from result
            answer = result.get("output", "I couldn't generate a response.")
            intermediate_steps = result.get("intermediate_steps", [])
            
            # Determine query type and extract additional data
            query_type = self._determine_query_type(query, intermediate_steps)
            sources = self._extract_sources(intermediate_steps)
            charts = self._extract_charts(intermediate_steps)
            
            return {
                "answer": answer,
                "sources": sources,
                "charts": charts,
                "query_type": query_type,
                "intermediate_steps": intermediate_steps
            }
            
        except Exception as e:
            logger.error(f"Error running agent: {str(e)}")
            raise
    
    def _determine_query_type(self, query: str, steps: List) -> str:
        """Determine the type of query based on tools used"""
        tools_used = []
        
        for step in steps:
            if len(step) >= 2:
                action = step[0]
                if hasattr(action, 'tool'):
                    tools_used.append(action.tool)
        
        if "rag_search" in tools_used:
            return "rag_search"
        elif "sql_analytics" in tools_used:
            return "sql_analytics"
        elif "web_search" in tools_used:
            return "web_search"
        else:
            return "general"
    
    def _extract_sources(self, steps: List) -> List[Dict[str, Any]]:
        """Extract sources from intermediate steps"""
        sources = []
        
        for step in steps:
            if len(step) >= 2:
                observation = step[1]
                
                # Handle different response types
                if isinstance(observation, dict):
                    if "sources" in observation:
                        sources.extend(observation["sources"])
                elif isinstance(observation, str):
                    # Try to parse JSON response
                    try:
                        import json
                        parsed = json.loads(observation)
                        if isinstance(parsed, dict) and "sources" in parsed:
                            sources.extend(parsed["sources"])
                    except:
                        pass
        
        return sources
    
    def _extract_charts(self, steps: List) -> List[Dict[str, Any]]:
        """Extract charts from intermediate steps"""
        charts = []
        
        for step in steps:
            if len(step) >= 2:
                observation = step[1]
                
                # Handle different response types
                if isinstance(observation, dict):
                    if "charts" in observation:
                        charts.extend(observation["charts"])
                elif isinstance(observation, str):
                    # Try to parse JSON response
                    try:
                        import json
                        parsed = json.loads(observation)
                        if isinstance(parsed, dict) and "charts" in parsed:
                            charts.extend(parsed["charts"])
                    except:
                        pass
        
        return charts
    
    async def get_session_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Get chat history for a session"""
        if session_id in self.sessions:
            return self.sessions[session_id]["messages"]
        return []
    
    async def clear_session(self, session_id: str) -> bool:
        """Clear a session's history"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of the query planner"""
        tool_status = {}
        
        for tool in self.tools:
            try:
                if hasattr(tool, 'health_check'):
                    tool_status[tool.name] = await tool.health_check()
                else:
                    tool_status[tool.name] = {"status": "available"}
            except Exception as e:
                tool_status[tool.name] = {"status": "error", "error": str(e)}
        
        return {
            "status": "healthy" if self.agent_executor else "not_initialized",
            "llm_initialized": self.llm is not None,
            "tools_count": len(self.tools),
            "tools": tool_status,
            "active_sessions": len(self.sessions)
        } 