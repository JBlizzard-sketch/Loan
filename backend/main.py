from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
from dotenv import load_dotenv
import pandas as pd
from datetime import datetime
import io

from database import get_db, Branch, Loan, Collection, Customer
from bots.whatsapp_bot import whatsapp_bot
from bots.telegram_bot import telegram_bot
from ai_service import ai_service
from settings_service import settings_service
from data_generator import get_enhanced_sample_data, generate_realistic_loan_data
from credit_scoring import credit_scoring_engine

load_dotenv()

app = FastAPI(title="Kechita Intelligence Platform API")

# Mount static files for production
if os.path.exists("frontend/dist"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")
    
    @app.get("/")
    async def serve_frontend():
        from fastapi.responses import FileResponse
        return FileResponse("frontend/dist/index.html")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoanData(BaseModel):
    branch: str
    disbursements: float
    collections: float
    arrears: float
    customer_count: int

class BranchMetrics(BaseModel):
    branch: str
    total_disbursements: float
    total_collections: float
    total_arrears: float
    collection_rate: float
    customer_count: int

# Enhanced sample data with 100+ branches
sample_data = get_enhanced_sample_data(num_branches=100)
enhanced_full_data = generate_realistic_loan_data(num_branches=100)

def use_database():
    """Check if DATABASE_URL is configured"""
    return os.getenv("DATABASE_URL") is not None

@app.get("/")
def read_root():
    return {
        "message": "Kechita Intelligence Platform API",
        "version": "2.0.0",
        "status": "running",
        "database": "connected" if use_database() else "sample_data"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "connected" if use_database() else "sample_data"
    }

@app.get("/api/branches", response_model=List[BranchMetrics])
def get_branches(db: Session = Depends(get_db)):
    # Try database first, fall back to sample data if tables don't exist
    try:
        if use_database():
            # Use database
            branches = db.query(Branch).all()
            metrics = []
            
            for branch in branches:
                total_disbursements = db.query(func.sum(Loan.disbursement_amount)).filter(
                    Loan.branch_id == branch.id
                ).scalar() or 0
                
                total_collections = db.query(func.sum(Collection.amount)).filter(
                    Collection.branch_id == branch.id
                ).scalar() or 0
                
                total_arrears = total_disbursements - total_collections
                collection_rate = (total_collections / total_disbursements * 100) if total_disbursements > 0 else 0
                
                customer_count = db.query(func.count(Customer.id)).filter(
                    Customer.branch_id == branch.id
                ).scalar() or 0
                
                metrics.append(BranchMetrics(
                    branch=branch.name,
                    total_disbursements=float(total_disbursements),
                    total_collections=float(total_collections),
                    total_arrears=float(total_arrears),
                    collection_rate=round(collection_rate, 2),
                    customer_count=customer_count
                ))
            
            return metrics
    except Exception:
        # Fall back to sample data if database query fails
        pass
    
    # Fallback to sample data
    df = pd.DataFrame(sample_data)
    df['collection_rate'] = (df['collections'] / df['disbursements'] * 100).round(2)
    
    metrics = []
    for _, row in df.iterrows():
        metrics.append(BranchMetrics(
            branch=str(row['branch']),
            total_disbursements=float(row['disbursements']),
            total_collections=float(row['collections']),
            total_arrears=float(row['arrears']),
            collection_rate=float(row['collection_rate']),
            customer_count=int(row['customer_count'])
        ))
    return metrics

@app.get("/api/summary")
def get_summary(db: Session = Depends(get_db)):
    # Try database first, fall back to sample data if tables don't exist
    try:
        if use_database():
            # Use database
            total_disbursements = db.query(func.sum(Loan.disbursement_amount)).scalar() or 0
            total_collections = db.query(func.sum(Collection.amount)).scalar() or 0
            total_arrears = total_disbursements - total_collections
            total_customers = db.query(func.count(Customer.id)).scalar() or 0
            branch_count = db.query(func.count(Branch.id)).scalar() or 0
            overall_collection_rate = (total_collections / total_disbursements * 100) if total_disbursements > 0 else 0
            
            return {
                "total_disbursements": float(total_disbursements),
                "total_collections": float(total_collections),
                "total_arrears": float(total_arrears),
                "total_customers": total_customers,
                "overall_collection_rate": round(overall_collection_rate, 2),
                "branch_count": branch_count
            }
    except Exception:
        # Fall back to sample data if database query fails
        pass
    
    # Fallback to sample data
    df = pd.DataFrame(sample_data)
    total_disbursements = float(df['disbursements'].sum())
    total_collections = float(df['collections'].sum())
    total_arrears = float(df['arrears'].sum())
    total_customers = int(df['customer_count'].sum())
    overall_collection_rate = round(total_collections / total_disbursements * 100, 2)
    
    return {
        "total_disbursements": total_disbursements,
        "total_collections": total_collections,
        "total_arrears": total_arrears,
        "total_customers": total_customers,
        "overall_collection_rate": overall_collection_rate,
        "branch_count": len(sample_data)
    }

@app.get("/api/top-performers")
def get_top_performers(db: Session = Depends(get_db)):
    if not use_database():
        # Fallback to sample data
        df = pd.DataFrame(sample_data)
        df['collection_rate'] = (df['collections'] / df['disbursements'] * 100).round(2)
        df = df.sort_values('collection_rate', ascending=False)
        return df.head(3).to_dict(orient='records')
    
    # Use database
    branches = get_branches(db)
    sorted_branches = sorted(branches, key=lambda x: x.collection_rate, reverse=True)
    
    return [
        {
            "branch": b.branch,
            "disbursements": b.total_disbursements,
            "collections": b.total_collections,
            "arrears": b.total_arrears,
            "collection_rate": b.collection_rate,
            "customer_count": b.customer_count
        }
        for b in sorted_branches[:3]
    ]

@app.get("/api/ai/insights")
def get_ai_insights(db: Session = Depends(get_db)):
    # Get summary and branches data
    summary = get_summary(db)
    branches = get_branches(db)
    
    if not branches:
        return {"insights": ["No data available yet. Please upload loan data to get insights."]}
    
    # Convert to dict format for AI service
    summary_dict = summary if isinstance(summary, dict) else summary
    branches_dict = [b.model_dump() if hasattr(b, 'model_dump') else b for b in branches]
    
    # Use AI service for advanced insights
    insights = ai_service.generate_advanced_insights(summary_dict, branches_dict)
    
    return {"insights": insights}

@app.get("/api/ai/predictions")
def get_predictions(db: Session = Depends(get_db)):
    """Get AI-powered collection trend predictions"""
    branches = get_branches(db)
    
    if not branches:
        return {"predictions": []}
    
    # Prepare historical data
    historical_data = [
        {
            "branch": b.branch if hasattr(b, 'branch') else b['branch'],
            "collection_rate": b.collection_rate if hasattr(b, 'collection_rate') else b['collection_rate'],
            "total_collections": b.total_collections if hasattr(b, 'total_collections') else b['total_collections'],
            "total_disbursements": b.total_disbursements if hasattr(b, 'total_disbursements') else b['total_disbursements']
        }
        for b in branches
    ]
    
    predictions = ai_service.predict_collection_trends(historical_data)
    return {"predictions": predictions}

@app.get("/api/ai/risk-analysis/{branch_name}")
def get_risk_analysis(branch_name: str, db: Session = Depends(get_db)):
    """Get AI-powered risk analysis for a specific branch"""
    branches = get_branches(db)
    
    # Find the branch
    branch_data = None
    for b in branches:
        b_name = b.branch if hasattr(b, 'branch') else b['branch']
        if b_name == branch_name:
            branch_data = b.model_dump() if hasattr(b, 'model_dump') else b
            break
    
    if not branch_data:
        raise HTTPException(status_code=404, detail=f"Branch '{branch_name}' not found")
    
    risk_analysis = ai_service.analyze_risk_profile(branch_data)
    return risk_analysis

@app.get("/api/ai/motivation/{branch_name}")
def get_motivation(branch_name: str, db: Session = Depends(get_db)):
    """Generate motivational message for a branch"""
    branches = get_branches(db)
    
    # Find the branch
    branch_data = None
    for b in branches:
        b_name = b.branch if hasattr(b, 'branch') else b['branch']
        if b_name == branch_name:
            branch_data = b.model_dump() if hasattr(b, 'model_dump') else b
            break
    
    if not branch_data:
        raise HTTPException(status_code=404, detail=f"Branch '{branch_name}' not found")
    
    message = ai_service.generate_motivational_message(branch_name, branch_data)
    return {"branch": branch_name, "message": message}

@app.get("/api/analytics/trends")
def get_trends(db: Session = Depends(get_db)):
    """Get trending analytics and performance patterns"""
    branches = get_branches(db)
    summary = get_summary(db)
    
    if not branches:
        return {"trends": {}}
    
    # Calculate trends
    collection_rates = [
        b.collection_rate if hasattr(b, 'collection_rate') else b['collection_rate']
        for b in branches
    ]
    
    avg_rate = sum(collection_rates) / len(collection_rates)
    high_performers = [b for b in branches if (b.collection_rate if hasattr(b, 'collection_rate') else b['collection_rate']) >= 90]
    at_risk = [b for b in branches if (b.collection_rate if hasattr(b, 'collection_rate') else b['collection_rate']) < 80]
    
    return {
        "trends": {
            "average_collection_rate": round(avg_rate, 2),
            "high_performers_count": len(high_performers),
            "at_risk_branches_count": len(at_risk),
            "total_arrears_trend": summary.get('total_arrears', 0),
            "customer_growth": summary.get('total_customers', 0),
            "branch_performance_distribution": {
                "excellent": len([b for b in branches if (b.collection_rate if hasattr(b, 'collection_rate') else b['collection_rate']) >= 90]),
                "good": len([b for b in branches if 80 <= (b.collection_rate if hasattr(b, 'collection_rate') else b['collection_rate']) < 90]),
                "needs_improvement": len([b for b in branches if (b.collection_rate if hasattr(b, 'collection_rate') else b['collection_rate']) < 80])
            }
        },
        "high_performers": [
            (b.branch if hasattr(b, 'branch') else b['branch'])
            for b in high_performers[:5]
        ],
        "at_risk_branches": [
            (b.branch if hasattr(b, 'branch') else b['branch'])
            for b in at_risk
        ]
    }

@app.post("/api/upload/csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload CSV file with loan data.
    Expected columns: branch, customer_id, customer_name, loan_id, disbursement_amount, collection_amount, disbursement_date
    """
    if not use_database():
        raise HTTPException(
            status_code=503, 
            detail="Database not configured. Please create a PostgreSQL database first."
        )
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        required_columns = ['branch', 'customer_id', 'customer_name', 'loan_id', 'disbursement_amount', 'collection_amount']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        records_added = 0
        
        for _, row in df.iterrows():
            # Create or get branch
            branch = db.query(Branch).filter(Branch.name == row['branch']).first()
            if not branch:
                branch = Branch(name=row['branch'])
                db.add(branch)
                db.commit()
                db.refresh(branch)
            
            # Create or get customer
            customer = db.query(Customer).filter(Customer.customer_id == row['customer_id']).first()
            if not customer:
                customer = Customer(
                    customer_id=row['customer_id'],
                    name=row['customer_name'],
                    branch_id=branch.id
                )
                db.add(customer)
                db.commit()
                db.refresh(customer)
            
            # Create loan if it doesn't exist
            loan = db.query(Loan).filter(Loan.loan_id == row['loan_id']).first()
            if not loan:
                loan = Loan(
                    loan_id=row['loan_id'],
                    customer_id=customer.id,
                    branch_id=branch.id,
                    disbursement_amount=float(row['disbursement_amount']),
                    disbursement_date=pd.to_datetime(row.get('disbursement_date', datetime.now())),
                    status='active'
                )
                db.add(loan)
                db.commit()
                db.refresh(loan)
            
            # Add collection
            if row['collection_amount'] > 0:
                collection = Collection(
                    loan_id=loan.id,
                    branch_id=branch.id,
                    amount=float(row['collection_amount']),
                    collection_date=pd.to_datetime(row.get('collection_date', datetime.now()))
                )
                db.add(collection)
            
            records_added += 1
        
        db.commit()
        
        return {
            "message": "Data uploaded successfully",
            "records_processed": records_added,
            "filename": file.filename
        }
        
    except pd.errors.ParserError:
        raise HTTPException(status_code=400, detail="Invalid CSV file format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/api/messaging/whatsapp/send")
def send_whatsapp_message(to_number: str, message: str):
    """Send WhatsApp message via Twilio"""
    result = whatsapp_bot.send_message(to_number, message)
    if result['status'] == 'error':
        raise HTTPException(status_code=500, detail=result['message'])
    return result

@app.post("/api/messaging/whatsapp/daily-summary")
def send_whatsapp_daily_summary(to_number: str, db: Session = Depends(get_db)):
    """Send daily summary via WhatsApp"""
    summary = get_summary(db)
    result = whatsapp_bot.send_daily_summary(to_number, summary)
    if result['status'] == 'error':
        raise HTTPException(status_code=500, detail=result['message'])
    return result

@app.post("/api/messaging/whatsapp/branch-performance")
def send_whatsapp_branch_performance(to_number: str, branch_name: str, db: Session = Depends(get_db)):
    """Send branch performance via WhatsApp"""
    branches = get_branches(db)
    branch_data = next((b for b in branches if b.branch == branch_name), None)
    
    if not branch_data:
        raise HTTPException(status_code=404, detail=f"Branch '{branch_name}' not found")
    
    result = whatsapp_bot.send_branch_performance(to_number, branch_data.model_dump())
    if result['status'] == 'error':
        raise HTTPException(status_code=500, detail=result['message'])
    return result

@app.post("/api/messaging/whatsapp/motivational")
def send_whatsapp_motivational(to_number: str, branch_name: str = None):
    """Send motivational message via WhatsApp"""
    result = whatsapp_bot.send_motivational_message(to_number, branch_name)
    if result['status'] == 'error':
        raise HTTPException(status_code=500, detail=result['message'])
    return result

@app.post("/api/messaging/whatsapp/alert")
def send_whatsapp_alert(to_number: str, alert_type: str, subject: str, message: str, action: str):
    """Send alert via WhatsApp"""
    details = {
        "subject": subject,
        "message": message,
        "action": action
    }
    result = whatsapp_bot.send_alert(to_number, alert_type, details)
    if result['status'] == 'error':
        raise HTTPException(status_code=500, detail=result['message'])
    return result

@app.get("/api/messaging/status")
def get_messaging_status():
    """Check status of messaging integrations"""
    return {
        "whatsapp": {
            "configured": whatsapp_bot.configured,
            "status": "ready" if whatsapp_bot.configured else "not_configured",
            "features": [
                "Daily summaries",
                "Branch performance reports",
                "Motivational messages",
                "Alerts and notifications",
                "Weekly reports",
                "Bulk messaging"
            ]
        },
        "telegram": {
            "configured": telegram_bot.configured,
            "status": "ready" if telegram_bot.configured else "not_configured",
            "features": [
                "Daily summaries",
                "Branch performance reports",
                "AI insights delivery",
                "Alerts and notifications",
                "Weekly reports",
                "Motivational quotes"
            ]
        }
    }

@app.get("/api/settings/status")
def get_settings_status():
    """Get the status of configured API keys"""
    return settings_service.get_settings_status()

@app.post("/api/settings/update")
def update_settings(settings: dict):
    """Update API configuration settings"""
    try:
        success = settings_service.update_settings(settings)
        if success:
            # Reload bots with new settings
            whatsapp_bot.__init__()
            telegram_bot.__init__()
            ai_service.__init__()
            return {"message": "Settings updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update settings")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/customers")
def get_customers(branch: Optional[str] = None, limit: int = 100, offset: int = 0):
    """Get customers with optional filtering"""
    customers_df = enhanced_full_data["customers"]
    
    if branch:
        customers_df = customers_df[customers_df["branch"] == branch]
    
    customers = customers_df.iloc[offset:offset+limit].to_dict(orient="records")
    total = len(customers_df)
    
    return {
        "customers": customers,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@app.get("/api/customers/{customer_id}")
def get_customer_details(customer_id: str):
    """Get detailed customer information including credit score"""
    customers_df = enhanced_full_data["customers"]
    loans_df = enhanced_full_data["loans"]
    collections_df = enhanced_full_data["collections"]
    
    customer = customers_df[customers_df["customer_id"] == customer_id]
    if customer.empty:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer_data = customer.iloc[0].to_dict()
    
    customer_loans = loans_df[loans_df["customer_id"] == customer_id].to_dict(orient="records")
    customer_collections = collections_df[collections_df["customer_id"] == customer_id].to_dict(orient="records")
    
    features = credit_scoring_engine.extract_features(customer_data, customer_loans, customer_collections)
    credit_score = credit_scoring_engine.calculate_credit_score(features)
    recommendation = credit_scoring_engine.get_recommendation(credit_score, features)
    
    return {
        "customer": customer_data,
        "loans": customer_loans,
        "collections": customer_collections,
        "credit_score": credit_score,
        "risk_category": recommendation["risk_category"],
        "recommendation": recommendation
    }

@app.get("/api/loans")
def get_loans(branch: Optional[str] = None, status: Optional[str] = None, limit: int = 100, offset: int = 0):
    """Get loans with optional filtering"""
    loans_df = enhanced_full_data["loans"]
    
    if branch:
        loans_df = loans_df[loans_df["branch"] == branch]
    
    if status:
        loans_df = loans_df[loans_df["status"] == status]
    
    loans = loans_df.iloc[offset:offset+limit].to_dict(orient="records")
    total = len(loans_df)
    
    return {
        "loans": loans,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@app.get("/api/loans/{loan_id}")
def get_loan_details(loan_id: str):
    """Get detailed loan information"""
    loans_df = enhanced_full_data["loans"]
    collections_df = enhanced_full_data["collections"]
    
    loan = loans_df[loans_df["loan_id"] == loan_id]
    if loan.empty:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    loan_data = loan.iloc[0].to_dict()
    loan_collections = collections_df[collections_df["loan_id"] == loan_id].to_dict(orient="records")
    
    total_collected = sum(c["amount"] for c in loan_collections)
    collection_rate = (total_collected / loan_data["disbursement_amount"] * 100) if loan_data["disbursement_amount"] > 0 else 0
    
    return {
        "loan": loan_data,
        "collections": loan_collections,
        "total_collected": total_collected,
        "collection_rate": round(collection_rate, 2),
        "outstanding": loan_data["disbursement_amount"] - total_collected
    }

@app.post("/api/credit-score/calculate")
def calculate_credit_score(customer_id: str):
    """Calculate credit score for a customer"""
    customers_df = enhanced_full_data["customers"]
    loans_df = enhanced_full_data["loans"]
    collections_df = enhanced_full_data["collections"]
    
    customer = customers_df[customers_df["customer_id"] == customer_id]
    if customer.empty:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer_data = customer.iloc[0].to_dict()
    customer_loans = loans_df[loans_df["customer_id"] == customer_id].to_dict(orient="records")
    customer_collections = collections_df[collections_df["customer_id"] == customer_id].to_dict(orient="records")
    
    features = credit_scoring_engine.extract_features(customer_data, customer_loans, customer_collections)
    credit_score = credit_scoring_engine.calculate_credit_score(features)
    recommendation = credit_scoring_engine.get_recommendation(credit_score, features)
    
    return {
        "customer_id": customer_id,
        "customer_name": customer_data["name"],
        "credit_score": credit_score,
        "risk_category": recommendation["risk_category"],
        "features": features,
        "recommendation": recommendation
    }

@app.get("/api/reports/portfolio-analysis")
def get_portfolio_analysis():
    """Get comprehensive portfolio analysis"""
    loans_df = enhanced_full_data["loans"]
    collections_df = enhanced_full_data["collections"]
    branches_df = enhanced_full_data["branches"]
    
    total_portfolio = loans_df["disbursement_amount"].sum()
    total_collected = collections_df["amount"].sum()
    portfolio_at_risk = loans_df[loans_df["status"] == "overdue"]["disbursement_amount"].sum()
    
    by_status = loans_df.groupby("status").agg({
        "disbursement_amount": "sum",
        "loan_id": "count"
    }).to_dict()
    
    by_region = loans_df.groupby("region").agg({
        "disbursement_amount": "sum",
        "loan_id": "count"
    }).to_dict()
    
    return {
        "total_portfolio_value": float(total_portfolio),
        "total_collected": float(total_collected),
        "portfolio_at_risk": float(portfolio_at_risk),
        "par_ratio": round(portfolio_at_risk / total_portfolio * 100, 2) if total_portfolio > 0 else 0,
        "collection_rate": round(total_collected / total_portfolio * 100, 2) if total_portfolio > 0 else 0,
        "by_status": by_status,
        "by_region": by_region,
        "total_branches": len(branches_df),
        "total_loans": len(loans_df)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
