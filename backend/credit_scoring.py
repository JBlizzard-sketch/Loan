import numpy as np
import xgboost as xgb
from sklearn.preprocessing import StandardScaler
from datetime import datetime
import pandas as pd

class CreditScoringEngine:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = None
        self.is_trained = False
        
    def extract_features(self, customer_data, loan_history, collection_history):
        features = {}
        
        if not loan_history:
            return self._default_features()
        
        total_loans = len(loan_history)
        total_disbursed = sum(loan.get('disbursement_amount', 0) for loan in loan_history)
        total_collected = sum(coll.get('amount', 0) for coll in collection_history)
        
        features['total_loans'] = total_loans
        features['total_disbursed'] = total_disbursed
        features['total_collected'] = total_collected
        features['overall_collection_rate'] = (total_collected / total_disbursed * 100) if total_disbursed > 0 else 0
        features['total_arrears'] = total_disbursed - total_collected
        
        active_loans = [l for l in loan_history if l.get('status') == 'active']
        features['active_loans_count'] = len(active_loans)
        
        overdue_loans = [l for l in loan_history if l.get('status') == 'overdue']
        features['overdue_loans_count'] = len(overdue_loans)
        
        completed_loans = [l for l in loan_history if l.get('status') == 'completed']
        features['completed_loans_count'] = len(completed_loans)
        
        if total_loans > 0:
            features['loan_completion_rate'] = (len(completed_loans) / total_loans) * 100
        else:
            features['loan_completion_rate'] = 0
        
        if loan_history:
            avg_loan_size = sum(l.get('disbursement_amount', 0) for l in loan_history) / len(loan_history)
            features['avg_loan_size'] = avg_loan_size
        else:
            features['avg_loan_size'] = 0
        
        if collection_history:
            payment_dates = [datetime.strptime(c.get('collection_date'), '%Y-%m-%d') for c in collection_history if c.get('collection_date')]
            if len(payment_dates) > 1:
                payment_dates.sort()
                intervals = [(payment_dates[i+1] - payment_dates[i]).days for i in range(len(payment_dates)-1)]
                features['avg_payment_interval'] = sum(intervals) / len(intervals) if intervals else 30
            else:
                features['avg_payment_interval'] = 30
            
            features['total_payments'] = len(collection_history)
            features['avg_payment_amount'] = total_collected / len(collection_history) if collection_history else 0
        else:
            features['avg_payment_interval'] = 0
            features['total_payments'] = 0
            features['avg_payment_amount'] = 0
        
        if customer_data.get('registration_date'):
            try:
                reg_date = datetime.strptime(customer_data['registration_date'], '%Y-%m-%d')
                days_as_customer = (datetime.now() - reg_date).days
                features['customer_tenure_days'] = days_as_customer
            except:
                features['customer_tenure_days'] = 0
        else:
            features['customer_tenure_days'] = 0
        
        recent_loans = [l for l in loan_history if l.get('disbursement_date')]
        if recent_loans:
            try:
                recent_dates = [datetime.strptime(l['disbursement_date'], '%Y-%m-%d') for l in recent_loans]
                most_recent = max(recent_dates)
                features['days_since_last_loan'] = (datetime.now() - most_recent).days
            except:
                features['days_since_last_loan'] = 365
        else:
            features['days_since_last_loan'] = 365
        
        features['arrears_ratio'] = (features['total_arrears'] / total_disbursed) if total_disbursed > 0 else 0
        
        return features
    
    def _default_features(self):
        return {
            'total_loans': 0,
            'total_disbursed': 0,
            'total_collected': 0,
            'overall_collection_rate': 0,
            'total_arrears': 0,
            'active_loans_count': 0,
            'overdue_loans_count': 0,
            'completed_loans_count': 0,
            'loan_completion_rate': 0,
            'avg_loan_size': 0,
            'avg_payment_interval': 0,
            'total_payments': 0,
            'avg_payment_amount': 0,
            'customer_tenure_days': 0,
            'days_since_last_loan': 365,
            'arrears_ratio': 0
        }
    
    def calculate_credit_score(self, features):
        weights = {
            'overall_collection_rate': 0.30,
            'loan_completion_rate': 0.20,
            'customer_tenure_days': 0.10,
            'total_payments': 0.10,
            'arrears_ratio': -0.20,
            'overdue_loans_count': -0.10
        }
        
        score = 300
        
        score += (features.get('overall_collection_rate', 0) / 100) * 300 * weights['overall_collection_rate']
        score += (features.get('loan_completion_rate', 0) / 100) * 300 * weights['loan_completion_rate']
        score += min(features.get('customer_tenure_days', 0) / 730, 1.0) * 300 * weights['customer_tenure_days']
        score += min(features.get('total_payments', 0) / 20, 1.0) * 300 * weights['total_payments']
        score += features.get('arrears_ratio', 0) * 300 * weights['arrears_ratio']
        score += min(features.get('overdue_loans_count', 0) / 5, 1.0) * 300 * weights['overdue_loans_count']
        
        score = max(300, min(850, score))
        
        return round(score)
    
    def get_risk_category(self, credit_score):
        if credit_score >= 750:
            return "Excellent"
        elif credit_score >= 650:
            return "Good"
        elif credit_score >= 550:
            return "Fair"
        elif credit_score >= 450:
            return "Poor"
        else:
            return "High Risk"
    
    def get_recommendation(self, credit_score, features):
        risk_category = self.get_risk_category(credit_score)
        
        recommendations = {
            "score": credit_score,
            "risk_category": risk_category,
            "max_loan_amount": 0,
            "recommended_interest_rate": 0,
            "approval_likelihood": "Low",
            "suggestions": []
        }
        
        if risk_category == "Excellent":
            recommendations['max_loan_amount'] = min(features.get('avg_loan_size', 0) * 2, 500000)
            recommendations['recommended_interest_rate'] = 12.0
            recommendations['approval_likelihood'] = "Very High"
            recommendations['suggestions'] = [
                "Customer has excellent payment history",
                "Consider offering premium products",
                "Low risk for higher loan amounts"
            ]
        elif risk_category == "Good":
            recommendations['max_loan_amount'] = min(features.get('avg_loan_size', 0) * 1.5, 300000)
            recommendations['recommended_interest_rate'] = 15.0
            recommendations['approval_likelihood'] = "High"
            recommendations['suggestions'] = [
                "Customer has good payment behavior",
                "Standard loan terms recommended",
                "Monitor for continued good performance"
            ]
        elif risk_category == "Fair":
            recommendations['max_loan_amount'] = min(features.get('avg_loan_size', 0), 150000)
            recommendations['recommended_interest_rate'] = 18.0
            recommendations['approval_likelihood'] = "Moderate"
            recommendations['suggestions'] = [
                "Review payment history carefully",
                "Consider requiring guarantor",
                "Monitor closely during loan period"
            ]
        elif risk_category == "Poor":
            recommendations['max_loan_amount'] = min(features.get('avg_loan_size', 0) * 0.5, 50000)
            recommendations['recommended_interest_rate'] = 22.0
            recommendations['approval_likelihood'] = "Low"
            recommendations['suggestions'] = [
                "High risk customer",
                "Require guarantor and collateral",
                "Consider loan restructuring for existing loans",
                "Implement strict monitoring"
            ]
        else:
            recommendations['max_loan_amount'] = 0
            recommendations['recommended_interest_rate'] = 25.0
            recommendations['approval_likelihood'] = "Very Low"
            recommendations['suggestions'] = [
                "Not recommended for new loans",
                "Focus on collecting existing arrears",
                "Consider debt restructuring",
                "Require full collateral if loan must be issued"
            ]
        
        if features.get('overdue_loans_count', 0) > 0:
            recommendations['suggestions'].append(
                f"Customer has {features['overdue_loans_count']} overdue loan(s)"
            )
        
        if features.get('arrears_ratio', 0) > 0.3:
            recommendations['suggestions'].append(
                "High arrears ratio - caution advised"
            )
        
        return recommendations

credit_scoring_engine = CreditScoringEngine()
