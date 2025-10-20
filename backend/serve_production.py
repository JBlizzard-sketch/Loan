from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
from datetime import datetime
import os

app = FastAPI(title="Kechita Intelligence Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BranchMetrics(BaseModel):
    branch: str
    total_disbursements: float
    total_collections: float
    total_arrears: float
    collection_rate: float
    customer_count: int

sample_data = [
    {"branch": "Nairobi Central", "disbursements": 5000000, "collections": 4200000, "arrears": 800000, "customer_count": 150},
    {"branch": "Mombasa", "disbursements": 3500000, "collections": 3100000, "arrears": 400000, "customer_count": 120},
    {"branch": "Kisumu", "disbursements": 2800000, "collections": 2600000, "arrears": 200000, "customer_count": 95},
    {"branch": "Nakuru", "disbursements": 4200000, "collections": 3800000, "arrears": 400000, "customer_count": 135},
    {"branch": "Eldoret", "disbursements": 3100000, "collections": 2900000, "arrears": 200000, "customer_count": 100},
]

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/branches", response_model=List[BranchMetrics])
def get_branches():
    df = pd.DataFrame(sample_data)
    df['collection_rate'] = (df['collections'] / df['disbursements'] * 100).round(2)
    
    metrics = []
    for _, row in df.iterrows():
        metrics.append(BranchMetrics(
            branch=row['branch'],
            total_disbursements=row['disbursements'],
            total_collections=row['collections'],
            total_arrears=row['arrears'],
            collection_rate=row['collection_rate'],
            customer_count=row['customer_count']
        ))
    
    return metrics

@app.get("/api/summary")
def get_summary():
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
def get_top_performers():
    df = pd.DataFrame(sample_data)
    df['collection_rate'] = (df['collections'] / df['disbursements'] * 100).round(2)
    df = df.sort_values('collection_rate', ascending=False)
    
    return df.head(3).to_dict(orient='records')

@app.get("/api/ai/insights")
def get_ai_insights():
    df = pd.DataFrame(sample_data)
    df['collection_rate'] = (df['collections'] / df['disbursements'] * 100).round(2)
    
    best_branch = df.loc[df['collection_rate'].idxmax()]
    worst_branch = df.loc[df['collection_rate'].idxmin()]
    
    insights = [
        f"Top performing branch: {best_branch['branch']} with {best_branch['collection_rate']:.1f}% collection rate",
        f"Branch requiring attention: {worst_branch['branch']} with {worst_branch['collection_rate']:.1f}% collection rate",
        f"Average arrears across all branches: KES {df['arrears'].mean():,.0f}",
        f"Total customer base: {df['customer_count'].sum()} clients across {len(df)} branches"
    ]
    
    return {"insights": insights}

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
