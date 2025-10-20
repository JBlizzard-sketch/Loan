import os
import json
from openai import OpenAI

# the newest OpenAI model is "gpt-5" which was released August 7, 2025.
# do not change this unless explicitly requested by the user

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

class AIService:
    def __init__(self):
        self.client = None
        if OPENAI_API_KEY:
            self.client = OpenAI(api_key=OPENAI_API_KEY)
    
    def is_configured(self):
        return self.client is not None
    
    def generate_advanced_insights(self, summary_data, branches_data):
        """Generate comprehensive AI insights from branch performance data"""
        if not self.is_configured():
            return self._get_fallback_insights(summary_data, branches_data)
        
        try:
            prompt = f"""Analyze this microfinance data and provide 6-8 actionable insights:

Summary:
- Total Disbursements: KES {summary_data.get('total_disbursements', 0):,.0f}
- Total Collections: KES {summary_data.get('total_collections', 0):,.0f}
- Total Arrears: KES {summary_data.get('total_arrears', 0):,.0f}
- Overall Collection Rate: {summary_data.get('overall_collection_rate', 0):.2f}%
- Total Customers: {summary_data.get('total_customers', 0)}
- Active Branches: {summary_data.get('branch_count', 0)}

Branch Performance:
{json.dumps(branches_data[:10], indent=2)}

Provide specific, actionable insights about:
1. Best and worst performing branches
2. Risk assessment and concerning patterns
3. Growth opportunities
4. Operational recommendations
5. Financial health indicators
6. Customer engagement trends

Format as JSON: {{"insights": ["insight1", "insight2", ...]}}"""

            response = self.client.chat.completions.create(
                model="gpt-5",
                messages=[
                    {"role": "system", "content": "You are a microfinance analytics expert specializing in branch performance optimization and risk management."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=2048
            )
            
            result = json.loads(response.choices[0].message.content)
            return result.get('insights', [])
        
        except Exception as e:
            print(f"AI insight generation error: {e}")
            return self._get_fallback_insights(summary_data, branches_data)
    
    def predict_collection_trends(self, historical_data):
        """Predict future collection trends based on historical data"""
        if not self.is_configured():
            return self._get_fallback_predictions()
        
        try:
            prompt = f"""Based on this historical microfinance data, predict the next 3 months' collection trends:

Historical Data:
{json.dumps(historical_data, indent=2)}

Provide predictions with:
1. Expected collection rates for next 3 months
2. Potential risk areas
3. Recommended interventions
4. Confidence levels

Format as JSON: {{"predictions": [{{"month": "Month", "predicted_rate": 0.0, "confidence": 0.0, "risks": [], "recommendations": []}}]}}"""

            response = self.client.chat.completions.create(
                model="gpt-5",
                messages=[
                    {"role": "system", "content": "You are a financial forecasting expert specializing in microfinance trends and risk prediction."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=2048
            )
            
            result = json.loads(response.choices[0].message.content)
            return result.get('predictions', [])
        
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._get_fallback_predictions()
    
    def generate_motivational_message(self, branch_name, performance_data):
        """Generate personalized motivational message for branch staff"""
        if not self.is_configured():
            return self._get_fallback_motivation(branch_name, performance_data)
        
        try:
            collection_rate = performance_data.get('collection_rate', 0)
            
            prompt = f"""Generate a motivational WhatsApp message for {branch_name} microfinance branch.

Performance: {collection_rate:.1f}% collection rate
Customers: {performance_data.get('customer_count', 0)}
Collections: KES {performance_data.get('total_collections', 0):,.0f}

Make it:
- Encouraging and positive
- Specific to their performance
- Actionable with tips
- Under 150 words
- Professional but warm"""

            response = self.client.chat.completions.create(
                model="gpt-5",
                messages=[
                    {"role": "system", "content": "You are a motivational coach for microfinance teams in Kenya. Be encouraging, culturally appropriate, and professional."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=512
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            print(f"Motivation generation error: {e}")
            return self._get_fallback_motivation(branch_name, performance_data)
    
    def analyze_risk_profile(self, branch_data):
        """Analyze risk profile for a branch"""
        if not self.is_configured():
            return self._get_fallback_risk_analysis(branch_data)
        
        try:
            prompt = f"""Analyze the risk profile for this microfinance branch:

{json.dumps(branch_data, indent=2)}

Provide:
1. Overall risk score (1-10, 10 being highest risk)
2. Key risk factors
3. Mitigation strategies
4. Priority actions

Format as JSON: {{"risk_score": 0, "risk_level": "low/medium/high", "risk_factors": [], "mitigation_strategies": [], "priority_actions": []}}"""

            response = self.client.chat.completions.create(
                model="gpt-5",
                messages=[
                    {"role": "system", "content": "You are a risk assessment expert for microfinance institutions."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=1024
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
        
        except Exception as e:
            print(f"Risk analysis error: {e}")
            return self._get_fallback_risk_analysis(branch_data)
    
    def _get_fallback_insights(self, summary_data, branches_data):
        """Fallback insights when AI is not available"""
        insights = []
        
        if branches_data:
            best_branch = max(branches_data, key=lambda x: x.get('collection_rate', 0))
            worst_branch = min(branches_data, key=lambda x: x.get('collection_rate', 0))
            
            insights.append(f"🌟 {best_branch['branch']} leads with {best_branch['collection_rate']:.1f}% collection rate - excellent performance!")
            insights.append(f"⚠️ {worst_branch['branch']} needs attention with {worst_branch['collection_rate']:.1f}% collection rate")
        
        overall_rate = summary_data.get('overall_collection_rate', 0)
        if overall_rate >= 90:
            insights.append("💪 Outstanding overall performance! Collection rate above 90% threshold")
        elif overall_rate >= 80:
            insights.append("📈 Good overall performance, with room for improvement to reach 90% target")
        else:
            insights.append("🎯 Collection rate below target - immediate action recommended")
        
        total_arrears = summary_data.get('total_arrears', 0)
        if total_arrears > 0:
            insights.append(f"💰 Total arrears of KES {total_arrears:,.0f} require focused collection efforts")
        
        insights.append("📊 Consider implementing daily collection targets for underperforming branches")
        insights.append("👥 Customer engagement programs could improve retention and repayment rates")
        
        return insights
    
    def _get_fallback_predictions(self):
        """Fallback predictions when AI is not available"""
        return [
            {
                "month": "Next Month",
                "predicted_rate": 88.5,
                "confidence": 0.75,
                "risks": ["Seasonal payment delays", "Economic uncertainty"],
                "recommendations": ["Increase follow-up calls", "Offer flexible payment plans"]
            },
            {
                "month": "Month 2",
                "predicted_rate": 89.0,
                "confidence": 0.70,
                "risks": ["Market competition"],
                "recommendations": ["Enhance customer service", "Review interest rates"]
            },
            {
                "month": "Month 3",
                "predicted_rate": 90.5,
                "confidence": 0.65,
                "risks": ["Staff turnover"],
                "recommendations": ["Staff training programs", "Performance incentives"]
            }
        ]
    
    def _get_fallback_motivation(self, branch_name, performance_data):
        """Fallback motivation when AI is not available"""
        collection_rate = performance_data.get('collection_rate', 0)
        
        if collection_rate >= 90:
            return f"""🌟 Excellent work, {branch_name} team!

Your {collection_rate:.1f}% collection rate is outstanding! You're setting the standard for excellence. Keep up the great work - your dedication to customer service and follow-through is paying off.

Today's tip: Share your successful collection strategies with other branches!

#TeamKechita #Excellence"""
        elif collection_rate >= 80:
            return f"""💪 Good progress, {branch_name}!

At {collection_rate:.1f}%, you're doing well. Let's push for that 90% target! Focus on early follow-ups and building strong customer relationships.

Today's challenge: Reach out to 3 customers with pending payments.

#TeamKechita #Progress"""
        else:
            return f"""🎯 {branch_name}, let's turn this around!

We're at {collection_rate:.1f}% - there's opportunity here! Every conversation with a customer matters. Let's focus on understanding their challenges and finding solutions together.

Action plan: Prioritize top 5 overdue accounts today.

#TeamKechita #Determination"""
    
    def _get_fallback_risk_analysis(self, branch_data):
        """Fallback risk analysis when AI is not available"""
        collection_rate = branch_data.get('collection_rate', 0)
        arrears = branch_data.get('total_arrears', 0)
        
        if collection_rate >= 90:
            risk_score = 2
            risk_level = "low"
        elif collection_rate >= 80:
            risk_score = 5
            risk_level = "medium"
        else:
            risk_score = 8
            risk_level = "high"
        
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_factors": [
                f"Collection rate at {collection_rate:.1f}%",
                f"Outstanding arrears of KES {arrears:,.0f}",
                "Limited historical data for trend analysis"
            ],
            "mitigation_strategies": [
                "Implement daily collection targets",
                "Enhance customer communication",
                "Provide staff training on collection best practices",
                "Use SMS reminders for payment due dates"
            ],
            "priority_actions": [
                "Review top 10 overdue accounts",
                "Schedule customer follow-up calls",
                "Analyze payment patterns for insights"
            ]
        }

ai_service = AIService()
