"""
Enhanced WhatsApp Bot Integration using Twilio API
Sends automated rich-formatted messages to staff about KPIs and performance metrics
"""

import os
from datetime import datetime
from typing import Dict, List
from dotenv import load_dotenv

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

class WhatsAppBot:
    def __init__(self):
        self.configured = TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
        
        if self.configured:
            try:
                from twilio.rest import Client
                self.client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            except ImportError:
                print("⚠️ Twilio not installed. Run: pip install twilio")
                self.configured = False
    
    def send_message(self, to_number: str, message: str) -> Dict:
        """Send WhatsApp message to a phone number"""
        if not self.configured:
            return {
                "status": "error",
                "message": "WhatsApp bot not configured. Please set Twilio credentials in Replit Secrets."
            }
        
        try:
            if not to_number.startswith("whatsapp:"):
                to_number = f"whatsapp:{to_number}"
            
            message_obj = self.client.messages.create(
                body=message,
                from_=TWILIO_WHATSAPP_NUMBER,
                to=to_number
            )
            
            return {
                "status": "success",
                "message_sid": message_obj.sid,
                "to": to_number,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def send_daily_summary(self, to_number: str, summary_data: Dict) -> Dict:
        """Send beautifully formatted daily summary message with KPIs"""
        message = f"""
🏦 *KECHITA MICROFINANCE*
━━━━━━━━━━━━━━━━━━━━
📅 Daily Performance Report
{datetime.now().strftime('%A, %B %d, %Y')}

📊 *OVERALL PERFORMANCE*
━━━━━━━━━━━━━━━━━━━━
💰 *Disbursements:* KES {summary_data.get('total_disbursements', 0):,.0f}
✅ *Collections:* KES {summary_data.get('total_collections', 0):,.0f}
⚠️ *Arrears:* KES {summary_data.get('total_arrears', 0):,.0f}

📈 *COLLECTION RATE*
━━━━━━━━━━━━━━━━━━━━
🎯 *{summary_data.get('overall_collection_rate', 0):.1f}%*

{'🌟 EXCELLENT PERFORMANCE! 🌟' if summary_data.get('overall_collection_rate', 0) >= 90 else '💪 Keep pushing for 90%+' if summary_data.get('overall_collection_rate', 0) >= 80 else '⚡ Action needed to improve!'}

👥 *CUSTOMER BASE*
━━━━━━━━━━━━━━━━━━━━
Total Customers: {summary_data.get('total_customers', 0):,}
Active Branches: {summary_data.get('branch_count', 0)}

━━━━━━━━━━━━━━━━━━━━
✨ Together we achieve more!
━━━━━━━━━━━━━━━━━━━━
        """.strip()
        
        return self.send_message(to_number, message)
    
    def send_branch_performance(self, to_number: str, branch_data: Dict) -> Dict:
        """Send branch-specific performance message with motivational content"""
        collection_rate = branch_data['collection_rate']
        
        if collection_rate >= 90:
            emoji = "🌟"
            performance_msg = "OUTSTANDING PERFORMANCE!"
            action = "You're setting the standard! Keep it up! 🎊"
        elif collection_rate >= 80:
            emoji = "💪"
            performance_msg = "GREAT WORK!"
            action = "Just a little more to reach excellence (90%+)!"
        else:
            emoji = "⚡"
            performance_msg = "ACTION NEEDED"
            action = "Focus on collections - you can do this! 💪"
        
        message = f"""
{emoji} *{branch_data['branch'].upper()}* {emoji}
━━━━━━━━━━━━━━━━━━━━
📅 {datetime.now().strftime('%B %d, %Y')}

📊 *PERFORMANCE STATUS*
━━━━━━━━━━━━━━━━━━━━
{performance_msg}

💰 *DISBURSEMENTS*
KES {branch_data['total_disbursements']:,.0f}

✅ *COLLECTIONS*
KES {branch_data['total_collections']:,.0f}

⚠️ *ARREARS*
KES {branch_data['total_arrears']:,.0f}

📈 *COLLECTION RATE*
━━━━━━━━━━━━━━━━━━━━
🎯 *{collection_rate:.1f}%*

{'█' * int(collection_rate/10)}{'░' * (10-int(collection_rate/10))}

👥 *CUSTOMER COUNT*
{branch_data['customer_count']:,} active customers

💡 *ACTION ITEM*
━━━━━━━━━━━━━━━━━━━━
{action}

━━━━━━━━━━━━━━━━━━━━
🏆 Excellence is our standard!
━━━━━━━━━━━━━━━━━━━━
        """.strip()
        
        return self.send_message(to_number, message)
    
    def send_motivational_message(self, to_number: str, branch_name: str = None) -> Dict:
        """Send motivational message to inspire staff"""
        messages = [
            "💫 Every customer you serve is a life you impact!",
            "🌟 Your dedication makes dreams come true!",
            "💪 Together we build stronger communities!",
            "🎯 Excellence is not an act, it's a habit!",
            "✨ Your work today shapes tomorrow's success!",
            "🏆 Champions are made through consistent effort!",
            "🚀 Push boundaries, exceed expectations!",
            "💡 Innovation starts with you!",
        ]
        
        import random
        motivational_text = random.choice(messages)
        
        message = f"""
🏦 *KECHITA MICROFINANCE*
━━━━━━━━━━━━━━━━━━━━

{motivational_text}

{f'📍 {branch_name}' if branch_name else ''}

Keep up the amazing work! 💪

━━━━━━━━━━━━━━━━━━━━
{datetime.now().strftime('%A, %B %d, %Y')}
━━━━━━━━━━━━━━━━━━━━
        """.strip()
        
        return self.send_message(to_number, message)
    
    def send_alert(self, to_number: str, alert_type: str, details: Dict) -> Dict:
        """Send urgent alerts for critical situations"""
        icons = {
            "arrears": "⚠️",
            "target": "🎯",
            "achievement": "🏆",
            "urgent": "🚨"
        }
        
        icon = icons.get(alert_type, "📢")
        
        message = f"""
{icon} *IMPORTANT ALERT* {icon}
━━━━━━━━━━━━━━━━━━━━
{datetime.now().strftime('%B %d, %Y - %I:%M %p')}

*SUBJECT:* {details.get('subject', 'Notification')}

*DETAILS:*
{details.get('message', 'No details provided')}

*ACTION REQUIRED:*
{details.get('action', 'Review and respond')}

━━━━━━━━━━━━━━━━━━━━
📱 Reply or call HQ for support
━━━━━━━━━━━━━━━━━━━━
        """.strip()
        
        return self.send_message(to_number, message)
    
    def send_bulk_messages(self, recipients: List[Dict[str, str]], message: str) -> List[Dict]:
        """Send same message to multiple recipients"""
        results = []
        for recipient in recipients:
            result = self.send_message(recipient['phone'], message)
            result['recipient'] = recipient.get('name', recipient['phone'])
            results.append(result)
        
        return results
    
    def send_weekly_report(self, to_number: str, weekly_data: Dict) -> Dict:
        """Send comprehensive weekly performance report"""
        message = f"""
📊 *WEEKLY PERFORMANCE REPORT*
━━━━━━━━━━━━━━━━━━━━
📅 Week of {weekly_data.get('week_start', 'N/A')} to {weekly_data.get('week_end', 'N/A')}

🏦 *KECHITA MICROFINANCE*

*WEEKLY HIGHLIGHTS*
━━━━━━━━━━━━━━━━━━━━
💰 Total Disbursed: KES {weekly_data.get('total_disbursed', 0):,.0f}
✅ Total Collected: KES {weekly_data.get('total_collected', 0):,.0f}
📈 Collection Rate: {weekly_data.get('collection_rate', 0):.1f}%

*TOP PERFORMERS* 🌟
━━━━━━━━━━━━━━━━━━━━
{weekly_data.get('top_performers', 'Data not available')}

*AREAS FOR IMPROVEMENT* 💪
━━━━━━━━━━━━━━━━━━━━
{weekly_data.get('improvement_areas', 'Keep up the good work!')}

*NEXT WEEK'S TARGETS* 🎯
━━━━━━━━━━━━━━━━━━━━
{weekly_data.get('targets', 'Maintain excellence')}

━━━━━━━━━━━━━━━━━━━━
Let's make next week even better! 🚀
━━━━━━━━━━━━━━━━━━━━
        """.strip()
        
        return self.send_message(to_number, message)

# Singleton instance
whatsapp_bot = WhatsAppBot()
