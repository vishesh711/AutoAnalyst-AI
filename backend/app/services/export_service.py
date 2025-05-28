from typing import Dict, List, Any, Optional
import os
import base64
import logging
from datetime import datetime
from io import BytesIO

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from app.config import get_settings

logger = logging.getLogger(__name__)

class ExportService:
    """Service for exporting query results and conversations to PDF reports"""
    
    def __init__(self):
        self.settings = get_settings()
        self.export_dir = "./exports"
        self.session_data = {}  # Store session data for export
        
    async def initialize(self):
        """Initialize the export service"""
        try:
            # Create export directory
            os.makedirs(self.export_dir, exist_ok=True)
            
            logger.info("Export service initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing export service: {str(e)}")
            raise
    
    async def store_session_data(self, session_id: str, query: str, response: Dict[str, Any]):
        """Store session data for later export"""
        try:
            if session_id not in self.session_data:
                self.session_data[session_id] = {
                    "created_at": datetime.now(),
                    "queries": []
                }
            
            self.session_data[session_id]["queries"].append({
                "timestamp": datetime.now(),
                "query": query,
                "response": response
            })
            
        except Exception as e:
            logger.error(f"Error storing session data: {str(e)}")
    
    async def generate_pdf_report(self, session_id: str) -> str:
        """Generate a comprehensive PDF report for a session"""
        try:
            if session_id not in self.session_data:
                raise ValueError(f"No data found for session {session_id}")
            
            session_info = self.session_data[session_id]
            
            # Create PDF filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"autoanalyst_report_{session_id[:8]}_{timestamp}.pdf"
            filepath = os.path.join(self.export_dir, filename)
            
            # Create PDF document
            doc = SimpleDocTemplate(
                filepath,
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            # Build PDF content
            story = []
            styles = getSampleStyleSheet()
            
            # Add custom styles
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                spaceAfter=30,
                alignment=TA_CENTER,
                textColor=colors.darkblue
            )
            
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=16,
                spaceAfter=12,
                spaceBefore=20,
                textColor=colors.darkblue
            )
            
            # Title page
            story.append(Paragraph("AutoAnalyst AI Report", title_style))
            story.append(Spacer(1, 20))
            
            # Session info
            session_info_data = [
                ["Session ID:", session_id],
                ["Generated:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
                ["Session Created:", session_info["created_at"].strftime("%Y-%m-%d %H:%M:%S")],
                ["Total Queries:", str(len(session_info["queries"]))]
            ]
            
            session_table = Table(session_info_data, colWidths=[2*inch, 4*inch])
            session_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(session_table)
            story.append(Spacer(1, 30))
            
            # Executive Summary
            story.append(Paragraph("Executive Summary", heading_style))
            
            # Generate summary based on query types
            summary = self._generate_executive_summary(session_info["queries"])
            story.append(Paragraph(summary, styles['Normal']))
            story.append(Spacer(1, 20))
            
            # Query Details
            story.append(Paragraph("Query Analysis Details", heading_style))
            
            for i, query_data in enumerate(session_info["queries"], 1):
                # Query section
                story.append(Paragraph(f"Query #{i}", styles['Heading3']))
                story.append(Paragraph(f"<b>Asked:</b> {query_data['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
                story.append(Paragraph(f"<b>Question:</b> {query_data['query']}", styles['Normal']))
                story.append(Spacer(1, 10))
                
                response = query_data['response']
                
                # Answer
                story.append(Paragraph("<b>Answer:</b>", styles['Normal']))
                answer_text = self._clean_text_for_pdf(response.get('answer', 'No answer provided'))
                story.append(Paragraph(answer_text, styles['Normal']))
                story.append(Spacer(1, 10))
                
                # Query type and tools used
                query_type = response.get('query_type', 'general')
                story.append(Paragraph(f"<b>Analysis Type:</b> {query_type.title()}", styles['Normal']))
                
                # Sources
                sources = response.get('sources', [])
                if sources:
                    story.append(Paragraph("<b>Sources:</b>", styles['Normal']))
                    for j, source in enumerate(sources[:5], 1):  # Limit to 5 sources
                        if isinstance(source, dict):
                            source_text = source.get('content', source.get('snippet', 'No content'))
                            source_name = source.get('source', source.get('title', f'Source {j}'))
                            story.append(Paragraph(f"{j}. <i>{source_name}</i>: {self._clean_text_for_pdf(source_text[:200])}...", styles['Normal']))
                
                # Charts
                charts = response.get('charts', [])
                if charts:
                    story.append(Paragraph("<b>Visualizations:</b>", styles['Normal']))
                    for chart in charts:
                        if 'image' in chart and chart['image']:
                            # Add chart image
                            try:
                                image_data = chart['image'].split(',')[1]  # Remove data:image/png;base64,
                                image_bytes = base64.b64decode(image_data)
                                
                                img = Image(BytesIO(image_bytes))
                                img.drawHeight = 3*inch
                                img.drawWidth = 5*inch
                                
                                story.append(img)
                                story.append(Paragraph(f"Chart: {chart.get('title', 'Visualization')}", styles['Caption']))
                            except Exception as e:
                                logger.warning(f"Could not add chart to PDF: {str(e)}")
                                story.append(Paragraph(f"Chart: {chart.get('title', 'Visualization')} (Image could not be embedded)", styles['Normal']))
                
                story.append(Spacer(1, 20))
            
            # Build PDF
            doc.build(story)
            
            logger.info(f"Generated PDF report: {filename}")
            return filepath
            
        except Exception as e:
            logger.error(f"Error generating PDF report: {str(e)}")
            raise
    
    def _generate_executive_summary(self, queries: List[Dict[str, Any]]) -> str:
        """Generate an executive summary based on the queries and responses"""
        try:
            total_queries = len(queries)
            
            # Analyze query types
            query_types = {}
            for query_data in queries:
                qtype = query_data['response'].get('query_type', 'general')
                query_types[qtype] = query_types.get(qtype, 0) + 1
            
            # Count sources and charts
            total_sources = sum(len(q['response'].get('sources', [])) for q in queries)
            total_charts = sum(len(q['response'].get('charts', [])) for q in queries)
            
            summary = f"""This report contains the analysis of {total_queries} queries processed during this AutoAnalyst AI session. """
            
            if query_types:
                type_breakdown = ", ".join([f"{count} {qtype}" for qtype, count in query_types.items()])
                summary += f"The queries included: {type_breakdown}. "
            
            if total_sources > 0:
                summary += f"A total of {total_sources} sources were consulted across all queries. "
            
            if total_charts > 0:
                summary += f"{total_charts} visualizations were generated to support the analysis. "
            
            summary += "This report provides a comprehensive overview of the questions asked and the intelligent responses provided by AutoAnalyst AI's multi-modal approach combining document retrieval, data analysis, and web search capabilities."
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating executive summary: {str(e)}")
            return "This report contains the analysis results from an AutoAnalyst AI session."
    
    def _clean_text_for_pdf(self, text: str) -> str:
        """Clean text for PDF rendering"""
        if not text:
            return ""
        
        # Replace problematic characters
        text = str(text)
        text = text.replace('&', '&amp;')
        text = text.replace('<', '&lt;')
        text = text.replace('>', '&gt;')
        
        # Limit length for readability
        if len(text) > 1000:
            text = text[:1000] + "..."
        
        return text
    
    async def export_query_result(self, query: str, response: Dict[str, Any]) -> str:
        """Export a single query result to PDF"""
        try:
            # Create a temporary session for single query export
            temp_session_id = f"single_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            await self.store_session_data(temp_session_id, query, response)
            
            # Generate PDF
            filepath = await self.generate_pdf_report(temp_session_id)
            
            # Clean up temporary session data
            if temp_session_id in self.session_data:
                del self.session_data[temp_session_id]
            
            return filepath
            
        except Exception as e:
            logger.error(f"Error exporting single query result: {str(e)}")
            raise
    
    async def list_exported_reports(self) -> List[Dict[str, Any]]:
        """List all exported PDF reports"""
        try:
            reports = []
            
            if os.path.exists(self.export_dir):
                for filename in os.listdir(self.export_dir):
                    if filename.endswith('.pdf'):
                        filepath = os.path.join(self.export_dir, filename)
                        reports.append({
                            "filename": filename,
                            "filepath": filepath,
                            "size": os.path.getsize(filepath),
                            "created": datetime.fromtimestamp(
                                os.path.getctime(filepath)
                            ).isoformat()
                        })
            
            # Sort by creation time (newest first)
            reports.sort(key=lambda x: x["created"], reverse=True)
            
            return reports
            
        except Exception as e:
            logger.error(f"Error listing exported reports: {str(e)}")
            return []
    
    async def delete_report(self, filename: str) -> bool:
        """Delete an exported report"""
        try:
            filepath = os.path.join(self.export_dir, filename)
            
            if os.path.exists(filepath) and filename.endswith('.pdf'):
                os.remove(filepath)
                logger.info(f"Deleted report: {filename}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting report: {str(e)}")
            return False
    
    async def cleanup_old_reports(self, days_old: int = 30) -> int:
        """Clean up reports older than specified days"""
        try:
            cutoff_time = datetime.now().timestamp() - (days_old * 24 * 60 * 60)
            deleted_count = 0
            
            if os.path.exists(self.export_dir):
                for filename in os.listdir(self.export_dir):
                    if filename.endswith('.pdf'):
                        filepath = os.path.join(self.export_dir, filename)
                        if os.path.getctime(filepath) < cutoff_time:
                            os.remove(filepath)
                            deleted_count += 1
            
            logger.info(f"Cleaned up {deleted_count} old reports")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning up old reports: {str(e)}")
            return 0
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of the export service"""
        try:
            return {
                "status": "healthy",
                "export_directory_exists": os.path.exists(self.export_dir),
                "export_directory_writable": os.access(self.export_dir, os.W_OK),
                "active_sessions": len(self.session_data),
                "available_reports": len(await self.list_exported_reports())
            }
            
        except Exception as e:
            logger.error(f"Export service health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e)
            } 