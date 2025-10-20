import random
from datetime import datetime, timedelta
import pandas as pd

KENYAN_COUNTIES = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Kitale", "Malindi",
    "Garissa", "Kakamega", "Nyeri", "Meru", "Embu", "Machakos", "Kitui", "Kilifi",
    "Bungoma", "Kericho", "Naivasha", "Nanyuki", "Kisii", "Homa Bay", "Migori", "Siaya",
    "Vihiga", "Busia", "Mumias", "Webuye", "Isiolo", "Marsabit", "Mandera", "Wajir",
    "Lamu", "Tana River", "Taita Taveta", "Kwale", "Makueni", "Kajiado", "Narok",
    "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi", "Baringo",
    "Laikipia", "West Pokot", "Turkana", "Bomet", "Murang'a", "Kiambu", "Kirinyaga",
    "Nyandarua", "Nyamira", "Tharaka Nithi"
]

KENYAN_FIRST_NAMES = [
    "John", "Mary", "David", "Grace", "Peter", "Jane", "James", "Faith", "Joseph", "Ruth",
    "Daniel", "Sarah", "Michael", "Rebecca", "Stephen", "Esther", "Paul", "Lucy", "Samuel", "Anne",
    "Isaac", "Rose", "Moses", "Catherine", "Francis", "Margaret", "Robert", "Joyce", "Patrick", "Mercy",
    "William", "Elizabeth", "Charles", "Christine", "Andrew", "Alice", "George", "Agnes", "Emmanuel", "Hannah",
    "Hassan", "Fatuma", "Ali", "Amina", "Ahmed", "Halima", "Omar", "Mariam", "Hamisi", "Zainab",
    "Kiprop", "Chepkorir", "Kibet", "Chepng'eno", "Korir", "Jepchirchir", "Rotich", "Chebet", "Kiptoo", "Kiplagat",
    "Kamau", "Wanjiku", "Mwangi", "Njeri", "Kariuki", "Wangari", "Mutua", "Muthoni", "Ochieng", "Akinyi",
    "Otieno", "Achieng", "Owino", "Adhiambo", "Omondi", "Atieno", "Wafula", "Nekesa", "Wekesa", "Naliaka"
]

KENYAN_LAST_NAMES = [
    "Kamau", "Wanjiku", "Mwangi", "Njeri", "Kariuki", "Wangari", "Mutua", "Muthoni",
    "Ochieng", "Akinyi", "Otieno", "Achieng", "Owino", "Adhiambo", "Omondi", "Atieno",
    "Kiprop", "Chepkorir", "Kibet", "Chepng'eno", "Korir", "Jepchirchir", "Rotich", "Chebet",
    "Ali", "Mohammed", "Hassan", "Abdalla", "Omar", "Ahmed", "Salim", "Rashid",
    "Wafula", "Nekesa", "Wekesa", "Naliaka", "Wasike", "Nafula", "Kiprono", "Jeptoo"
]

def generate_kenya_branches(num_branches=100):
    branches = []
    regions = ["Central", "Coast", "Eastern", "Nairobi", "North Eastern", "Nyanza", "Rift Valley", "Western"]
    branch_types = ["Main", "CBD", "Market", "Town", "Branch", "East", "West", "North", "South", "Central"]
    branch_subtypes = ["Plaza", "Centre", "Junction", "Mall", "Station", "Hub", "Point", "Corner", "Avenue"]
    
    branches_created = 0
    county_index = 0
    branch_variant = 0
    
    while branches_created < num_branches:
        county = KENYAN_COUNTIES[county_index % len(KENYAN_COUNTIES)]
        region = random.choice(regions)
        
        if branch_variant == 0:
            branch_name = f"{county} {random.choice(branch_types)}"
        elif branch_variant == 1:
            branch_name = f"{county} {random.choice(branch_subtypes)}"
        elif branch_variant == 2:
            branch_name = f"{county} {random.choice(branch_types)} {random.choice(branch_subtypes)}"
        else:
            location_num = (branch_variant - 2)
            branch_name = f"{county} Branch {location_num}"
        
        branches.append({
            "name": branch_name,
            "region": region,
            "county": county
        })
        
        branches_created += 1
        branch_variant += 1
        
        if branch_variant > 3:
            branch_variant = 0
            county_index += 1
    
    return branches

def generate_customer_name():
    first = random.choice(KENYAN_FIRST_NAMES)
    last = random.choice(KENYAN_LAST_NAMES)
    return f"{first} {last}"

def generate_phone_number():
    prefixes = ["0701", "0702", "0703", "0704", "0705", "0706", "0707", "0708", "0710", "0711", 
                "0712", "0713", "0714", "0715", "0720", "0721", "0722", "0723", "0724", "0725",
                "0726", "0727", "0728", "0729", "0740", "0741", "0742", "0743", "0745", "0746",
                "0748", "0757", "0758", "0759", "0768", "0769", "0790", "0791", "0792", "0793"]
    return f"{random.choice(prefixes)}{random.randint(100000, 999999)}"

def generate_realistic_loan_data(num_branches=100, customers_per_branch_range=(50, 200), loans_per_customer_range=(1, 3)):
    branches = generate_kenya_branches(num_branches)
    
    all_customers = []
    all_loans = []
    all_collections = []
    
    branch_id = 1
    customer_global_id = 1
    loan_global_id = 1
    
    for branch in branches:
        num_customers = random.randint(*customers_per_branch_range)
        
        for _ in range(num_customers):
            customer = {
                "id": customer_global_id,
                "customer_id": f"CUST{customer_global_id:06d}",
                "name": generate_customer_name(),
                "phone": generate_phone_number(),
                "branch": branch["name"],
                "branch_id": branch_id,
                "region": branch["region"],
                "county": branch["county"],
                "registration_date": (datetime.now() - timedelta(days=random.randint(30, 730))).strftime("%Y-%m-%d")
            }
            all_customers.append(customer)
            
            num_loans = random.randint(*loans_per_customer_range)
            
            for loan_num in range(num_loans):
                loan_amount = random.choice([
                    random.randint(5000, 50000),
                    random.randint(50000, 150000),
                    random.randint(150000, 500000)
                ])
                
                disbursement_date = datetime.now() - timedelta(days=random.randint(1, 365))
                due_date = disbursement_date + timedelta(days=random.choice([30, 60, 90, 120, 180]))
                
                payment_behavior = random.choices(
                    ["excellent", "good", "average", "poor", "defaulter"],
                    weights=[0.30, 0.35, 0.20, 0.10, 0.05]
                )[0]
                
                if payment_behavior == "excellent":
                    collection_rate = random.uniform(0.95, 1.0)
                    num_payments = random.randint(4, 8)
                elif payment_behavior == "good":
                    collection_rate = random.uniform(0.80, 0.94)
                    num_payments = random.randint(3, 6)
                elif payment_behavior == "average":
                    collection_rate = random.uniform(0.60, 0.79)
                    num_payments = random.randint(2, 5)
                elif payment_behavior == "poor":
                    collection_rate = random.uniform(0.30, 0.59)
                    num_payments = random.randint(1, 3)
                else:
                    collection_rate = random.uniform(0.0, 0.29)
                    num_payments = random.randint(0, 2)
                
                loan_status = "active" if (datetime.now() < due_date) else "completed" if collection_rate > 0.95 else "overdue"
                
                loan = {
                    "id": loan_global_id,
                    "loan_id": f"LOAN{loan_global_id:06d}",
                    "customer_id": customer["customer_id"],
                    "customer_name": customer["name"],
                    "branch": branch["name"],
                    "branch_id": branch_id,
                    "region": branch["region"],
                    "disbursement_amount": loan_amount,
                    "disbursement_date": disbursement_date.strftime("%Y-%m-%d"),
                    "due_date": due_date.strftime("%Y-%m-%d"),
                    "status": loan_status,
                    "payment_behavior": payment_behavior
                }
                all_loans.append(loan)
                
                total_collected = loan_amount * collection_rate
                if num_payments > 0:
                    for payment_num in range(num_payments):
                        payment_amount = total_collected / num_payments + random.uniform(-1000, 1000)
                        payment_amount = max(100, payment_amount)
                        
                        days_after_disbursement = random.randint(5, min(365, (due_date - disbursement_date).days))
                        collection_date = disbursement_date + timedelta(days=days_after_disbursement)
                        
                        collection = {
                            "loan_id": loan["loan_id"],
                            "customer_id": customer["customer_id"],
                            "branch": branch["name"],
                            "branch_id": branch_id,
                            "amount": round(payment_amount, 2),
                            "collection_date": collection_date.strftime("%Y-%m-%d")
                        }
                        all_collections.append(collection)
                
                loan_global_id += 1
            
            customer_global_id += 1
        
        branch_id += 1
    
    return {
        "branches": pd.DataFrame(branches),
        "customers": pd.DataFrame(all_customers),
        "loans": pd.DataFrame(all_loans),
        "collections": pd.DataFrame(all_collections)
    }

def get_enhanced_sample_data(num_branches=100):
    data = generate_realistic_loan_data(num_branches)
    
    branch_metrics = []
    for branch_name in data["branches"]["name"].unique():
        branch_loans = data["loans"][data["loans"]["branch"] == branch_name]
        branch_collections = data["collections"][data["collections"]["branch"] == branch_name]
        branch_customers = data["customers"][data["customers"]["branch"] == branch_name]
        
        total_disbursements = branch_loans["disbursement_amount"].sum()
        total_collections = branch_collections["amount"].sum()
        total_arrears = total_disbursements - total_collections
        collection_rate = (total_collections / total_disbursements * 100) if total_disbursements > 0 else 0
        customer_count = len(branch_customers)
        
        branch_info = data["branches"][data["branches"]["name"] == branch_name].iloc[0]
        
        branch_metrics.append({
            "branch": branch_name,
            "region": branch_info["region"],
            "disbursements": total_disbursements,
            "collections": total_collections,
            "arrears": total_arrears,
            "collection_rate": round(collection_rate, 2),
            "customer_count": customer_count
        })
    
    return branch_metrics

if __name__ == "__main__":
    data = generate_realistic_loan_data(100)
    print(f"Generated {len(data['branches'])} branches")
    print(f"Generated {len(data['customers'])} customers")
    print(f"Generated {len(data['loans'])} loans")
    print(f"Generated {len(data['collections'])} collections")
