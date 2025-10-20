"""
Database initialization script for Kechita Intelligence Platform

This script initializes the database tables and optionally seeds sample data.
Run this script after creating the PostgreSQL database in Replit.

Usage:
    python backend/init_db.py
"""

from database import init_db, seed_sample_data
import sys

def main():
    print("Initializing Kechita Intelligence Platform database...")
    
    try:
        # Create tables
        print("Creating database tables...")
        init_db()
        print("✓ Tables created successfully!")
        
        # Seed sample data
        print("\nSeeding sample data...")
        seed_sample_data()
        print("✓ Sample data seeded successfully!")
        
        print("\n✓ Database initialization complete!")
        print("\nYou can now start the application with:")
        print("  bash start_all.sh")
        
    except Exception as e:
        print(f"\n✗ Error initializing database: {e}")
        print("\nMake sure you have:")
        print("  1. Created a PostgreSQL database in Replit")
        print("  2. The DATABASE_URL environment variable is set")
        sys.exit(1)

if __name__ == "__main__":
    main()
