from langchain.tools import BaseTool
from typing import Dict, List, Any, Optional
import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import matplotlib.dates as mdates
from datetime import datetime, timedelta
import os
import json
import logging
import io
import base64

from app.llm.factory import create_llm
from app.config import config

logger = logging.getLogger(__name__)

class SQLTool(BaseTool):
    """Tool for SQL analytics and business intelligence with chart generation"""
    
    name: str = "sql_analytics"
    description: str = """Use this tool for business analytics, data analysis, and generating charts from SQL queries.
    
    This tool is best for:
    - Business analytics and KPI questions
    - Sales data analysis and reporting
    - Customer segmentation and analysis
    - Product performance metrics
    - Revenue and financial analysis
    - Marketing campaign performance
    - Creating charts and visualizations (bar charts, line charts, pie charts)
    - Comparative analysis and trends
    
    Input should describe what business data or analysis you want, such as:
    - "Show me top customers by revenue"
    - "Create a chart of monthly sales trends"
    - "Which products have the highest profit margins?"
    - "Compare marketing campaign performance"
    """
    
    class Config:
        arbitrary_types_allowed = True
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        object.__setattr__(self, 'db_path', None)
        object.__setattr__(self, 'llm', None)
        
    async def initialize(self):
        """Initialize the SQL tool with database and sample data"""
        try:
            # Set database path
            db_path = config.DATABASE_URL.replace("sqlite:///", "").replace("sqlite://", "")
            object.__setattr__(self, 'db_path', db_path)
            
            # Initialize LLM
            object.__setattr__(self, 'llm', create_llm())
            
            # Ensure database exists with sample data
            await self._ensure_sample_data()
            
            logger.info("SQL tool initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing SQL tool: {str(e)}")
            raise
    
    async def _ensure_sample_data(self):
        """Create database and populate with sample business data"""
        try:
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Create tables
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS customers (
                        customer_id INTEGER PRIMARY KEY,
                        name TEXT NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        tier TEXT NOT NULL,
                        signup_date DATE NOT NULL,
                        country TEXT NOT NULL
                    )
                """)
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS products (
                        product_id INTEGER PRIMARY KEY,
                        name TEXT NOT NULL,
                        category TEXT NOT NULL,
                        price DECIMAL(10,2) NOT NULL,
                        cost DECIMAL(10,2) NOT NULL,
                        launch_date DATE NOT NULL
                    )
                """)
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS sales (
                        sale_id INTEGER PRIMARY KEY,
                        customer_id INTEGER,
                        product_id INTEGER,
                        quantity INTEGER NOT NULL,
                        unit_price DECIMAL(10,2) NOT NULL,
                        total_amount DECIMAL(10,2) NOT NULL,
                        sale_date DATE NOT NULL,
                        region TEXT NOT NULL,
                        FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
                        FOREIGN KEY (product_id) REFERENCES products (product_id)
                    )
                """)
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS campaigns (
                        campaign_id INTEGER PRIMARY KEY,
                        name TEXT NOT NULL,
                        start_date DATE NOT NULL,
                        end_date DATE NOT NULL,
                        budget DECIMAL(10,2) NOT NULL,
                        spend DECIMAL(10,2) NOT NULL,
                        impressions INTEGER NOT NULL,
                        clicks INTEGER NOT NULL,
                        conversions INTEGER NOT NULL
                    )
                """)
                
                # Check if data already exists
                cursor.execute("SELECT COUNT(*) FROM customers")
                if cursor.fetchone()[0] == 0:
                    await self._populate_sample_data(cursor)
                
                conn.commit()
                logger.info("Sample data ensured in database")
                
        except Exception as e:
            logger.error(f"Error ensuring sample data: {str(e)}")
            raise
    
    async def _populate_sample_data(self, cursor):
        """Populate database with comprehensive sample business data"""
        
        # Sample customers
        customers = [
            (1, "Acme Corp", "contact@acme.com", "Enterprise", "2023-01-15", "USA"),
            (2, "Global Tech", "info@globaltech.com", "Premium", "2023-02-20", "UK"),
            (3, "StartupXYZ", "hello@startupxyz.com", "Basic", "2023-03-10", "Canada"),
            (4, "MegaCorp Industries", "sales@megacorp.com", "Enterprise", "2023-01-25", "Germany"),
            (5, "Innovation Labs", "team@innovationlabs.com", "Premium", "2023-04-05", "France"),
            (6, "TechSolutions", "contact@techsolutions.com", "Basic", "2023-05-12", "Australia"),
            (7, "DataDriven Inc", "info@datadriven.com", "Enterprise", "2023-02-08", "USA"),
            (8, "CloudFirst", "hello@cloudfirst.com", "Premium", "2023-06-15", "Singapore"),
            (9, "AgileWorks", "team@agileworks.com", "Basic", "2023-07-20", "Netherlands"),
            (10, "ScaleUp Ltd", "contact@scaleup.com", "Premium", "2023-03-30", "Sweden")
        ]
        
        cursor.executemany("""
            INSERT INTO customers (customer_id, name, email, tier, signup_date, country)
            VALUES (?, ?, ?, ?, ?, ?)
        """, customers)
        
        # Sample products
        products = [
            (1, "Analytics Pro", "Software", 299.99, 50.00, "2022-06-01"),
            (2, "Data Insights Basic", "Software", 99.99, 20.00, "2022-08-15"),
            (3, "Enterprise Dashboard", "Software", 599.99, 100.00, "2022-05-20"),
            (4, "ML Toolkit", "Software", 199.99, 40.00, "2022-09-10"),
            (5, "Consulting Hours", "Service", 150.00, 80.00, "2022-01-01"),
            (6, "Premium Support", "Service", 49.99, 15.00, "2022-03-01"),
            (7, "Custom Integration", "Service", 999.99, 300.00, "2022-07-01"),
            (8, "Training Program", "Service", 299.99, 100.00, "2022-10-01")
        ]
        
        cursor.executemany("""
            INSERT INTO products (product_id, name, category, price, cost, launch_date)
            VALUES (?, ?, ?, ?, ?, ?)
        """, products)
        
        # Generate comprehensive sales data (500 records)
        import random
        from datetime import date, timedelta
        
        sales_data = []
        base_date = date(2023, 1, 1)
        regions = ["North America", "Europe", "Asia-Pacific", "Latin America"]
        
        for i in range(1, 501):
            customer_id = random.randint(1, 10)
            product_id = random.randint(1, 8)
            quantity = random.randint(1, 10)
            
            # Get product price
            product_prices = {1: 299.99, 2: 99.99, 3: 599.99, 4: 199.99, 5: 150.00, 6: 49.99, 7: 999.99, 8: 299.99}
            unit_price = product_prices[product_id]
            
            # Add some price variation
            unit_price *= random.uniform(0.9, 1.1)
            total_amount = quantity * unit_price
            
            # Random date in 2023
            days_offset = random.randint(0, 300)
            sale_date = base_date + timedelta(days=days_offset)
            
            region = random.choice(regions)
            
            sales_data.append((i, customer_id, product_id, quantity, round(unit_price, 2), 
                             round(total_amount, 2), sale_date.strftime("%Y-%m-%d"), region))
        
        cursor.executemany("""
            INSERT INTO sales (sale_id, customer_id, product_id, quantity, unit_price, total_amount, sale_date, region)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, sales_data)
        
        # Sample marketing campaigns
        campaigns = [
            (1, "Q1 Product Launch", "2023-01-01", "2023-03-31", 50000.00, 48500.00, 500000, 25000, 1250),
            (2, "Summer Analytics Push", "2023-06-01", "2023-08-31", 30000.00, 29800.00, 300000, 18000, 900),
            (3, "Enterprise Outreach", "2023-04-01", "2023-06-30", 75000.00, 72000.00, 200000, 15000, 2100),
            (4, "Year-End Special", "2023-10-01", "2023-12-31", 40000.00, 38000.00, 400000, 32000, 1600)
        ]
        
        cursor.executemany("""
            INSERT INTO campaigns (campaign_id, name, start_date, end_date, budget, spend, impressions, clicks, conversions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, campaigns)
    
    def _run(self, query: str) -> Dict[str, Any]:
        """Synchronous run method (required by BaseTool)"""
        import asyncio
        return asyncio.run(self._arun(query))
    
    async def _arun(self, query: str) -> Dict[str, Any]:
        """Analyze business data based on natural language query"""
        try:
            if not self.db_path or not os.path.exists(self.db_path):
                return {
                    "answer": "Database not available. Please initialize the system first.",
                    "charts": [],
                    "data": {}
                }
            
            # Generate SQL query from natural language
            sql_query = await self._generate_sql_query(query)
            
            if not sql_query:
                return {
                    "answer": "I couldn't generate a SQL query for your request. Please be more specific about what business data you'd like to analyze.",
                    "charts": [],
                    "data": {}
                }
            
            # Execute query and get results
            results = await self._execute_query(sql_query)
            
            if results["success"]:
                # Generate analysis and charts
                analysis = await self._analyze_results(query, results["data"], sql_query)
                charts = await self._generate_charts(query, results["data"])
                
                return {
                    "answer": analysis,
                    "charts": charts,
                    "data": results["data"][:20],  # Limit data returned
                    "sql_query": sql_query
                }
            else:
                return {
                    "answer": f"Error executing query: {results['error']}",
                    "charts": [],
                    "data": {}
                }
                
        except Exception as e:
            logger.error(f"Error in SQL analytics: {str(e)}")
            return {
                "answer": f"An error occurred during analysis: {str(e)}",
                "charts": [],
                "data": {}
            }
    
    async def _generate_sql_query(self, query: str) -> str:
        """Generate SQL query from natural language using LLM"""
        try:
            # Database schema context
            schema_context = """
Available tables and their schemas:

1. customers (customer_id, name, email, tier [Basic/Premium/Enterprise], signup_date, country)
2. products (product_id, name, category [Software/Service], price, cost, launch_date)  
3. sales (sale_id, customer_id, product_id, quantity, unit_price, total_amount, sale_date, region)
4. campaigns (campaign_id, name, start_date, end_date, budget, spend, impressions, clicks, conversions)

Key relationships:
- sales.customer_id → customers.customer_id
- sales.product_id → products.product_id
"""
            
            prompt = f"""Given the following database schema and user query, generate a SQL query that will answer the user's question.

{schema_context}

User Query: {query}

Guidelines:
- Use proper SQL syntax for SQLite
- Include relevant JOINs when needed
- Use appropriate aggregations (SUM, COUNT, AVG, etc.)
- Add ORDER BY for rankings
- Use LIMIT for top/bottom queries
- Calculate profit as (price - cost) * quantity where relevant
- For date queries, use DATE() function
- For monthly/quarterly analysis, use strftime() function

Return only the SQL query without any explanations:"""

            # Get response from LLM
            if hasattr(self.llm, 'ainvoke'):
                response = await self.llm.ainvoke(prompt)
                sql_query = response.content if hasattr(response, 'content') else str(response)
            else:
                sql_query = await self.llm._acall(prompt)
            
            # Clean up the response
            sql_query = sql_query.strip()
            if sql_query.startswith('```sql'):
                sql_query = sql_query[6:]
            if sql_query.endswith('```'):
                sql_query = sql_query[:-3]
            
            return sql_query.strip()
            
        except Exception as e:
            logger.error(f"Error generating SQL query: {str(e)}")
            return ""
    
    async def _execute_query(self, sql_query: str) -> Dict[str, Any]:
        """Execute SQL query and return results"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Enable row factory for dict-like access
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                
                cursor.execute(sql_query)
                rows = cursor.fetchall()
                
                # Convert to list of dictionaries
                data = [dict(row) for row in rows]
                
                return {
                    "success": True,
                    "data": data,
                    "row_count": len(data)
                }
                
        except Exception as e:
            logger.error(f"Error executing SQL query: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "data": []
            }
    
    async def _analyze_results(self, original_query: str, data: List[Dict], sql_query: str) -> str:
        """Generate analysis of the query results"""
        try:
            if not data:
                return "No data found matching your criteria."
            
            # Create data summary
            data_summary = f"Found {len(data)} records. "
            
            if len(data) > 0:
                # Sample some key insights
                first_row = data[0]
                columns = list(first_row.keys())
                
                # Add column information
                data_summary += f"Data includes: {', '.join(columns[:5])}{'...' if len(columns) > 5 else ''}. "
                
                # Add some basic statistics for numeric columns
                numeric_insights = []
                for col in columns:
                    try:
                        values = [float(row[col]) for row in data if row[col] is not None and str(row[col]).replace('.', '').replace('-', '').isdigit()]
                        if values:
                            avg_val = sum(values) / len(values)
                            max_val = max(values)
                            min_val = min(values)
                            numeric_insights.append(f"{col}: avg {avg_val:.2f}, max {max_val:.2f}, min {min_val:.2f}")
                    except:
                        continue
                
                if numeric_insights:
                    data_summary += f"Key metrics: {'; '.join(numeric_insights[:3])}."
            
            # Generate contextual analysis using LLM
            analysis_prompt = f"""Based on the following business data query and results, provide a clear, insightful analysis:

Original Query: {original_query}
SQL Query Used: {sql_query}
Results Summary: {data_summary}
Sample Data: {str(data[:3]) if len(data) > 0 else 'No data'}

Provide a business-focused analysis that:
1. Directly answers the user's question
2. Highlights key findings and insights
3. Mentions important trends or patterns
4. Suggests actionable next steps if relevant
5. Keep it concise but informative (2-3 paragraphs max)
"""

            if hasattr(self.llm, 'ainvoke'):
                response = await self.llm.ainvoke(analysis_prompt)
                analysis = response.content if hasattr(response, 'content') else str(response)
            else:
                analysis = await self.llm._acall(analysis_prompt)
            
            return analysis.strip()
            
        except Exception as e:
            logger.error(f"Error analyzing results: {str(e)}")
            return f"Analysis completed. {data_summary}"
    
    async def _generate_charts(self, query: str, data: List[Dict]) -> List[Dict[str, Any]]:
        """Generate charts based on query and data"""
        try:
            if not data or len(data) < 2:
                return []
            
            # Convert to pandas DataFrame
            df = pd.DataFrame(data)
            
            # Create output directory if it doesn't exist
            os.makedirs(config.CHART_OUTPUT_DIR, exist_ok=True)
            
            charts = []
            
            # Determine chart types based on data and query
            chart_types = self._determine_chart_types(query, df)
            
            for chart_type, columns in chart_types:
                try:
                    chart_path = None
                    
                    if chart_type == "bar" and len(columns) >= 2:
                        chart_path = await self._create_bar_chart(df, columns[0], columns[1], config.CHART_OUTPUT_DIR)
                    
                    elif chart_type == "line" and len(columns) >= 2:
                        chart_path = await self._create_time_series(df, columns[0], columns[1], config.CHART_OUTPUT_DIR)
                    
                    elif chart_type == "pie" and len(columns) >= 1:
                        chart_path = await self._create_pie_chart(df, columns[0], config.CHART_OUTPUT_DIR)
                    
                    elif chart_type == "scatter" and len(columns) >= 2:
                        chart_path = await self._create_scatter_plot(df, columns[0], columns[1], config.CHART_OUTPUT_DIR)
                    
                    if chart_path:
                        # Convert the chart to base64 for frontend display
                        with open(chart_path, "rb") as image_file:
                            base64_image = base64.b64encode(image_file.read()).decode("utf-8")
                        
                        charts.append({
                            "type": chart_type,
                            "title": f"{chart_type.title()} Chart: {columns[0]} vs {columns[1]}" if len(columns) > 1 else f"{chart_type.title()} Chart: {columns[0]}",
                            "image_path": chart_path,
                            "base64": base64_image
                        })
                
                except Exception as e:
                    logger.error(f"Error creating {chart_type} chart: {str(e)}")
            
            return charts
            
        except Exception as e:
            logger.error(f"Error generating charts: {str(e)}")
            return []
    
    async def _create_bar_chart(self, df: pd.DataFrame, x_col: str, y_col: str, output_dir: str) -> Optional[str]:
        """Create a bar chart"""
        try:
            # Set style
            plt.style.use('seaborn-v0_8-darkgrid')
            
            # Create figure
            fig, ax = plt.subplots(figsize=config.CHART_FIGSIZE)
            
            # Create bar chart
            sns.barplot(data=df, x=x_col, y=y_col, ax=ax, palette='viridis')
            
            # Customize appearance
            ax.set_title(f'{y_col} by {x_col}', fontsize=16, pad=20)
            ax.set_xlabel(x_col, fontsize=12, labelpad=10)
            ax.set_ylabel(y_col, fontsize=12, labelpad=10)
            
            # Rotate x labels if there are many categories
            if len(df[x_col].unique()) > 5:
                plt.xticks(rotation=45, ha='right')
            
            # Tight layout
            plt.tight_layout()
            
            # Save chart
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"bar_chart_{timestamp}.png"
            filepath = os.path.join(output_dir, filename)
            plt.savefig(filepath, dpi=config.CHART_DPI)
            plt.close()
            
            return filepath
            
        except Exception as e:
            logger.error(f"Error creating bar chart: {str(e)}")
            plt.close()
            return None
    
    async def _create_scatter_plot(self, df: pd.DataFrame, x_col: str, y_col: str, output_dir: str) -> Optional[str]:
        """Create a scatter plot"""
        try:
            # Set style
            plt.style.use('seaborn-v0_8-darkgrid')
            
            # Create figure
            fig, ax = plt.subplots(figsize=config.CHART_FIGSIZE)
            
            # Create scatter plot
            sns.scatterplot(data=df, x=x_col, y=y_col, ax=ax, alpha=0.7)
            
            # Add trend line
            sns.regplot(data=df, x=x_col, y=y_col, scatter=False, ax=ax, line_kws={"color": "red"})
            
            # Customize appearance
            ax.set_title(f'{y_col} vs {x_col}', fontsize=16, pad=20)
            ax.set_xlabel(x_col, fontsize=12, labelpad=10)
            ax.set_ylabel(y_col, fontsize=12, labelpad=10)
            
            # Tight layout
            plt.tight_layout()
            
            # Save chart
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"scatter_plot_{timestamp}.png"
            filepath = os.path.join(output_dir, filename)
            plt.savefig(filepath, dpi=config.CHART_DPI)
            plt.close()
            
            return filepath
            
        except Exception as e:
            logger.error(f"Error creating scatter plot: {str(e)}")
            plt.close()
            return None
    
    async def _create_time_series(self, df: pd.DataFrame, date_col: str, value_col: str, output_dir: str) -> Optional[str]:
        """Create a time series chart"""
        try:
            # Set style
            plt.style.use('seaborn-v0_8-darkgrid')
            
            # Create figure
            fig, ax = plt.subplots(figsize=config.CHART_FIGSIZE)
            
            # Convert date column to datetime if it's not already
            if not pd.api.types.is_datetime64_any_dtype(df[date_col]):
                df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            
            # Sort by date
            df = df.sort_values(by=date_col)
            
            # Plot time series
            sns.lineplot(data=df, x=date_col, y=value_col, marker='o', ax=ax)
            
            # Format x-axis dates
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
            plt.xticks(rotation=45, ha='right')
            
            # Customize appearance
            ax.set_title(f'{value_col} Over Time', fontsize=16, pad=20)
            ax.set_xlabel('Date', fontsize=12, labelpad=10)
            ax.set_ylabel(value_col, fontsize=12, labelpad=10)
            
            # Add grid
            ax.grid(True, linestyle='--', alpha=0.7)
            
            # Tight layout
            plt.tight_layout()
            
            # Save chart
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"time_series_{timestamp}.png"
            filepath = os.path.join(output_dir, filename)
            plt.savefig(filepath, dpi=config.CHART_DPI)
            plt.close()
            
            return filepath
            
        except Exception as e:
            logger.error(f"Error creating time series chart: {str(e)}")
            plt.close()
            return None
    
    async def _create_pie_chart(self, df: pd.DataFrame, category_col: str, output_dir: str) -> Optional[str]:
        """Create a pie chart"""
        try:
            # Set style
            plt.style.use('seaborn-v0_8-pastel')
            
            # Create figure
            fig, ax = plt.subplots(figsize=config.CHART_FIGSIZE)
            
            # Get value counts for category column
            counts = df[category_col].value_counts()
            
            # If too many categories, group smaller ones into "Other"
            if len(counts) > 8:
                top_counts = counts.head(7)
                other_count = counts[7:].sum()
                counts = pd.concat([top_counts, pd.Series({"Other": other_count})])
            
            # Create pie chart
            wedges, texts, autotexts = ax.pie(
                counts, 
                labels=counts.index, 
                autopct='%1.1f%%',
                startangle=90,
                shadow=False,
                textprops={'fontsize': 10}
            )
            
            # Equal aspect ratio ensures that pie is drawn as a circle
            ax.axis('equal')
            
            # Add title
            plt.title(f'Distribution by {category_col}', fontsize=16, pad=20)
            
            # Add legend
            plt.legend(wedges, counts.index, title=category_col, loc="center left", bbox_to_anchor=(1, 0, 0.5, 1))
            
            # Tight layout
            plt.tight_layout()
            
            # Save chart
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"pie_chart_{timestamp}.png"
            filepath = os.path.join(output_dir, filename)
            plt.savefig(filepath, dpi=config.CHART_DPI, bbox_inches='tight')
            plt.close()
            
            return filepath
            
        except Exception as e:
            logger.error(f"Error creating pie chart: {str(e)}")
            plt.close()
            return None
    
    def _determine_chart_types(self, query: str, df: pd.DataFrame) -> List[tuple]:
        """Determine appropriate chart types and columns based on data and query"""
        chart_types = []
        
        # Identify column types
        numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
        string_cols = df.select_dtypes(include=['object', 'string']).columns.tolist()
        date_cols = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
        
        # Match query keywords to chart types
        query_lower = query.lower()
        
        # Check for explicit chart requests
        if 'bar chart' in query_lower or 'barchart' in query_lower:
            if string_cols and numeric_cols:
                chart_types.append(('bar', [string_cols[0], numeric_cols[0]]))
                
        elif 'pie chart' in query_lower or 'piechart' in query_lower:
            if string_cols:
                chart_types.append(('pie', [string_cols[0]]))
                
        elif 'line chart' in query_lower or 'linechart' in query_lower or 'trend' in query_lower:
            if date_cols and numeric_cols:
                chart_types.append(('line', [date_cols[0], numeric_cols[0]]))
                
        elif 'scatter plot' in query_lower or 'scatterplot' in query_lower:
            if len(numeric_cols) >= 2:
                chart_types.append(('scatter', [numeric_cols[0], numeric_cols[1]]))
        
        # If no explicit chart type mentioned, suggest based on data
        if not chart_types:
            # For time series data
            if date_cols and numeric_cols:
                chart_types.append(('line', [date_cols[0], numeric_cols[0]]))
            
            # For categorical vs numeric data
            if string_cols and numeric_cols:
                chart_types.append(('bar', [string_cols[0], numeric_cols[0]]))
            
            # For distributions of categorical data
            if string_cols and len(df) <= 20:
                chart_types.append(('pie', [string_cols[0]]))
            
            # For numeric vs numeric data
            if len(numeric_cols) >= 2:
                chart_types.append(('scatter', [numeric_cols[0], numeric_cols[1]]))
        
        return chart_types
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of the SQL tool"""
        try:
            # Test database connection
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM customers")
                customer_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM sales")
                sales_count = cursor.fetchone()[0]
            
            return {
                "status": "healthy",
                "database_connected": True,
                "customers_count": customer_count,
                "sales_count": sales_count,
                "llm_initialized": self.llm is not None
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "database_connected": False
            } 