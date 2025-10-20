"""
Enhanced Telegram Bot Integration
Sends automated rich-formatted notifications and interactive reports via Telegram
"""

import os
from datetime import datetime
from typing import Dict, List
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

class TelegramBot:
    def __init__(self):
        self.configured = TELEGRAM_BOT_TOKEN is not None
        self.bot_token = TELEGRAM_BOT_TOKEN
        
        if self.configured:
            try:
                from telegram import Bot
                self.bot = Bot(token=self.bot_token)
            except ImportError:
                print("⚠️ python-telegram-bot not installed. Run: pip install python-telegram-bot")
                self.configured = False
    
    async def send_message(self, chat_id: str, message: str, parse_mode: str = "Markdown") -> Dict:
        """Send message to a Telegram chat"""
        if not self.configured:
            return {
                "status": "error",
                "message": "Telegram bot not configured. Please set TELEGRAM_BOT_TOKEN in Replit Secrets."
            }
        
        try:
            result = await self.bot.send_message(
                chat_id=chat_id,
                text=message,
                parse_mode=parse_mode
            )
            
            return {
                "status": "success",
                "message_id": result.message_id,
                "chat_id": chat_id,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def send_daily_summary(self, chat_id: str, summary_data: Dict) -> Dict:
        """Send beautifully formatted daily summary message with KPIs"""
        collection_rate = summary_data.get('overall_collection_rate', 0)
        status_emoji = "🌟" if collection_rate >= 90 else "💪" if collection_rate >= 80 else "⚡"
        
        message = f"""
🏦 *KECHITA MICROFINANCE*
━━━━━━━━━━━━━━━━━━━━━━━

📅 *Daily Performance Report*
{datetime.now().strftime('%A, %B %d, %Y')}

📊 *OVERALL PERFORMANCE*
━━━━━━━━━━━━━━━━━━━━━━━
💰 *Disbursements:* KES {summary_data.get('total_disbursements', 0):,.0f}
✅ *Collections:* KES {summary_data.get('total_collections', 0):,.0f}
⚠️ *Arrears:* KES {summary_data.get('total_arrears', 0):,.0f}

📈 *Collection Rate:* {status_emoji} *{collection_rate:.1f}%*

👥 *Customer Metrics*
Total Customers: {summary_data.get('total_customers', 0):,}
Active Branches: {summary_data.get('branch_count', 0)}

━━━━━━━━━━━━━━━━━━━━━━━
✨ Excellence Through Unity! ✨
━━━━━━━━━━━━━━━━━━━━━━━
        """.strip()
        
        return await self.send_message(chat_id, message)
    
    async def send_branch_performance(self, chat_id: str, branch_data: Dict) -> Dict:
        """Send branch-specific performance message"""
        collection_rate = branch_data['collection_rate']
        
        if collection_rate >= 90:
            status = "🌟 EXCELLENT"
            bar = "█" * 10
        elif collection_rate >= 80:
            status = "💪 GOOD"
            bar = "█" * 8 + "░" * 2
        elif collection_rate >= 70:
            status = "⚡ FAIR"
            bar = "█" * 7 + "░" * 3
        else:
            status = "🚨 NEEDS ATTENTION"
            bar = "█" * int(collection_rate/10) + "░" * (10-int(collection_rate/10))
        
        message = f"""
📍 *{branch_data['branch'].upper()}*
━━━━━━━━━━━━━━━━━━━━━━━
📅 {datetime.now().strftime('%B %d, %Y')}

*Performance Status:* {status}

💼 *Financial Metrics*
━━━━━━━━━━━━━━━━━━━━━━━
💰 Disbursements: KES {branch_data['total_disbursements']:,.0f}
✅ Collections: KES {branch_data['total_collections']:,.0f}
⚠️ Arrears: KES {branch_data['total_arrears']:,.0f}

📊 *Collection Rate*
{bar} *{collection_rate:.1f}%*

👥 *Customer Base*
{branch_data['customer_count']:,} active customers

━━━━━━━━━━━━━━━━━━━━━━━
🎯 Keep striving for excellence!
━━━━━━━━━━━━━━━━━━━━━━━
        """.strip()
        
        return await self.send_message(chat_id, message)
    
    async def send_ai_insights(self, chat_id: str, insights: List[str]) -> Dict:
        """Send AI-generated insights with rich formatting"""
        insights_text = "\n\n".join([f"{i+1}️⃣ {insight}" for i, insight in enumerate(insights)])
        
        message = f"""
🤖 *AI-POWERED INSIGHTS*
━━━━━━━━━━━━━━━━━━━━━━━
📅 {datetime.now().strftime('%B %d, %Y at %I:%M %p')}

*Strategic Recommendations*
━━━━━━━━━━━━━━━━━━━━━━━

{insights_text}

━━━━━━━━━━━━━━━━━━━━━━━
💡 Powered by Advanced Analytics
━━━━━━━━━━━━━━━━━━━━━━━
        """.strip()
        
        return await self.send_message(chat_id, message)
    
    async def send_alert(self, chat_id: str, alert_type: str, details: Dict) -> Dict:
        """Send formatted alerts"""
        icons = {
            "critical": "🚨",
            "warning": "⚠️",
            "info": "ℹ️",
            "success": "✅",
            "achievement": "🏆"
        }
        
        icon = icons.get(alert_type, "📢")
        
        message = f"""
{icon} *ALERT: {details.get('title', 'Notification').upper()}* {icon}
━━━━━━━━━━━━━━━━━━━━━━━
⏰ {datetime.now().strftime('%B %d, %Y - %I:%M %p')}

*Details:*
{details.get('message', 'No details provided')}

*Recommended Action:*
{details.get('action', 'Please review and respond')}

━━━━━━━━━━━━━━━━━━━━━━━
        """.strip()
        
        return await self.send_message(chat_id, message)
    
    async def send_bulk_messages(self, chat_ids: List[str], message: str) -> List[Dict]:
        """Send same message to multiple chats"""
        results = []
        for chat_id in chat_ids:
            result = await self.send_message(chat_id, message)
            results.append(result)
        
        return results
    
    async def send_weekly_report(self, chat_id: str, report_data: Dict) -> Dict:
        """Send comprehensive weekly report"""
        message = f"""
📊 *WEEKLY PERFORMANCE REPORT*
━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏦 *Kechita Microfinance*

📅 *Period:* {report_data.get('week_start', 'N/A')} to {report_data.get('week_end', 'N/A')}

*WEEKLY SUMMARY*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Total Disbursed: KES {report_data.get('total_disbursed', 0):,.0f}
✅ Total Collected: KES {report_data.get('total_collected', 0):,.0f}
📈 Average Collection Rate: {report_data.get('avg_rate', 0):.1f}%

*🌟 TOP 3 PERFORMERS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
{report_data.get('top_branches', 'Data processing...')}

*📍 IMPROVEMENT AREAS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
{report_data.get('needs_improvement', 'All branches performing well!')}

*🎯 NEXT WEEK TARGETS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
{report_data.get('targets', 'Maintain current excellence')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Together we achieve more!
━━━━━━━━━━━━━━━━━━━━━━━━━━━
        """.strip()
        
        return await self.send_message(chat_id, message)
    
    async def send_motivational_quote(self, chat_id: str) -> Dict:
        """Send motivational quote to inspire team"""
        quotes = [
            "💫 *Success is the sum of small efforts repeated day in and day out.*",
            "🌟 *Excellence is not a destination; it is a continuous journey.*",
            "💪 *Your work is to discover your work and then give yourself to it.*",
            "🎯 *The only way to do great work is to love what you do.*",
            "✨ *Believe you can and you're halfway there.*",
            "🏆 *Champions keep playing until they get it right.*",
            "🚀 *The future depends on what you do today.*",
            "💡 *Innovation distinguishes between a leader and a follower.*"
        ]
        
        import random
        quote = random.choice(quotes)
        
        message = f"""
🏦 *KECHITA MICROFINANCE*
━━━━━━━━━━━━━━━━━━━━━━━

{quote}

━━━━━━━━━━━━━━━━━━━━━━━
📅 {datetime.now().strftime('%A, %B %d, %Y')}
━━━━━━━━━━━━━━━━━━━━━━━
        """.strip()
        
        return await self.send_message(chat_id, message)

# Singleton instance
telegram_bot = TelegramBot()
