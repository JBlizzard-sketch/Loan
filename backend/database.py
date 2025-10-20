from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kechita.db")

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Branch(Base):
    __tablename__ = "branches"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    region = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    loans = relationship("Loan", back_populates="branch")
    collections = relationship("Collection", back_populates="branch")

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    loans = relationship("Loan", back_populates="customer")

class Loan(Base):
    __tablename__ = "loans"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(String(50), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    disbursement_amount = Column(Float, nullable=False)
    disbursement_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="loans")
    branch = relationship("Branch", back_populates="loans")
    collections = relationship("Collection", back_populates="loan")

class Collection(Base):
    __tablename__ = "collections"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    amount = Column(Float, nullable=False)
    collection_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    loan = relationship("Loan", back_populates="collections")
    branch = relationship("Branch", back_populates="collections")

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

def seed_sample_data():
    """Seed database with sample data for testing"""
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Branch).count() > 0:
            print("Database already has data. Skipping seed.")
            return
        
        # Create branches
        branches_data = [
            {"name": "Nairobi Central", "region": "Nairobi"},
            {"name": "Mombasa", "region": "Coast"},
            {"name": "Kisumu", "region": "Nyanza"},
            {"name": "Nakuru", "region": "Rift Valley"},
            {"name": "Eldoret", "region": "Rift Valley"},
        ]
        
        branches = []
        for branch_data in branches_data:
            branch = Branch(**branch_data)
            db.add(branch)
            branches.append(branch)
        
        db.commit()
        
        # Create sample customers and loans for each branch
        customer_counts = [150, 120, 95, 135, 100]
        disbursements = [5000000, 3500000, 2800000, 4200000, 3100000]
        collections = [4200000, 3100000, 2600000, 3800000, 2900000]
        
        for i, branch in enumerate(branches):
            # Create customers
            for j in range(customer_counts[i]):
                customer = Customer(
                    customer_id=f"{branch.name[:3].upper()}{1000 + j}",
                    name=f"Customer {j+1}",
                    phone=f"+2547{10000000 + i*100000 + j}"
                )
                customer.branch_id = branch.id
                db.add(customer)
                
                if j < customer_counts[i] // 2:  # Half the customers have loans
                    loan = Loan(
                        loan_id=f"LN{branch.name[:3].upper()}{2000 + j}",
                        disbursement_amount=disbursements[i] / (customer_counts[i] // 2),
                        disbursement_date=datetime(2024, 1, 1),
                        due_date=datetime(2024, 12, 31),
                        status="active"
                    )
                    # Use relationships instead of IDs so SQLAlchemy handles FK assignment
                    loan.customer = customer
                    loan.branch = branch
                    db.add(loan)
                    
                    # Add collection for this loan
                    collection = Collection(
                        amount=collections[i] / (customer_counts[i] // 2),
                        collection_date=datetime(2024, 6, 1)
                    )
                    # Use relationships instead of IDs
                    collection.loan = loan
                    collection.branch = branch
                    db.add(collection)
        
        db.commit()
        print("Sample data seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()
