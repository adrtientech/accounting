from flask import Flask, render_template, request, jsonify, session
from collections import defaultdict
import datetime
import os

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'financial_accounting_secret_key_2024')

# Translation dictionary
translations = {
    "en": {
        "title": "Financial Accounting Application",
        "home": "Home",
        "language": "Language",
        "financial_statement": "FINANCIAL STATEMENT OF COMPANY",
        "income": "Income",
        "expenses": "Expenses",
        "beginning_balance": "Beginning Balance",
        "product_list": "Product List",
        "share_capital": "Share Capital",
        "payables_receivables": "Payables and Receivables",
        "equipment_purchase": "Equipment Purchase",
        "charity": "Charity",
        "investment": "Investment",
        "journal_entry": "Journal Entry",
        "general_ledger": "General Ledger",
        "trial_balance": "Trial Balance",
        "income_statement": "Income Statement",
        "balance_sheet": "Balance Sheet",
        "closing_entry": "Closing Entry",
        "product_stocking": "Product Stocking",
        "date": "Date",
        "product_name": "Product's Name",
        "initial_quantity": "Initial Quantity",
        "purchase_price": "Purchase Price",
        "total_purchase_price": "Total Purchase Price",
        "selling_price": "Selling Price",
        "save": "Save",
        "quantity_update": "Quantity Update",
        "total_price": "Total Price",
        "add": "Add",
        "quantity_addition": "Quantity Addition",
        "add_quantity": "Add Quantity",
        "sales": "Sales",
        "customer": "Customer",
        "price": "Price",
        "quantity": "Quantity",
        "payment": "Payment",
        "cash": "Cash",
        "receivable": "Receivable",
        "record": "Record",
        "sales_return": "Sales Return",
        "settlement": "Settlement",
        "transaction_date": "Transaction Date",
        "return": "Return",
        "settlement_amount": "Settlement Amount",
        "lending": "Lending",
        "borrowing": "Borrowing",
        "form_filling": "Form Filling",
        "borrower_name": "Borrower's Name",
        "nominal": "Nominal",
        "receivables_payment": "Receivables Payment",
        "debtors_list": "Debtors List",
        "debt_payment": "Debt Payment",
        "creditors_list": "Creditors List",
        "lender": "Lender",
        "option": "Option",
        "equipment": "Equipment",
        "building": "Building",
        "vehicle": "Vehicle",
        "depreciation_entry": "Depreciation Entry (End Period)",
        "price_at_purchase": "Price at Purchase",
        "useful_life": "Useful Life (years)",
        "current_year_depreciation": "Current Year Depreciation",
        "expense_entry": "Expense Entry",
        "expense": "Expense",
        "destination": "Destination",
        "type_of_investment": "Type of Investment",
        "buy": "Buy",
        "sell": "Sell",
        "investment_selling": "Investment Selling",
        "company_name": "Company's Name",
        "sell_date": "Sell Date",
        "final_value": "Final Value",
        "gain_loss": "Gain/Loss",
        "submit_update": "Submit Update",
        "paid_up_capital": "Paid-up Capital",
        "account_title": "Account Title",
        "debit": "Debit",
        "credit": "Credit",
        "total": "Total",
        "account": "Account",
        "balance": "Balance",
        "revenue": "REVENUE",
        "gross_profit": "GROSS PROFIT",
        "operating_expenses": "OPERATING EXPENSES",
        "total_expenses": "TOTAL EXPENSES",
        "other_income_expenses": "OTHER INCOME AND EXPENSES",
        "net_income": "NET INCOME",
        "assets": "ASSETS",
        "liabilities": "LIABILITIES",
        "equity": "EQUITY",
        "total_assets": "TOTAL ASSETS",
        "total_liabilities_equity": "TOTAL LIABILITIES AND EQUITY",
        "warn_no_selection": "No item selected.",
        "warn_fill_fields": "Please fill all fields correctly.",
        "success_add": "Data added successfully!",
        "success_update": "Data updated successfully!",
    },
    "id": {
        "title": "Aplikasi Akuntansi Keuangan",
        "home": "Beranda",
        "language": "Bahasa",
        "financial_statement": "LAPORAN KEUANGAN PERUSAHAAN",
        "income": "Pendapatan",
        "expenses": "Beban",
        "beginning_balance": "Saldo Awal",
        "product_list": "Daftar Produk",
        "share_capital": "Modal Saham",
        "payables_receivables": "Utang dan Piutang",
        "equipment_purchase": "Pembelian Aset Tetap",
        "charity": "Amal",
        "investment": "Investasi",
        "journal_entry": "Jurnal Umum",
        "general_ledger": "Buku Besar",
        "trial_balance": "Neraca Saldo",
        "income_statement": "Laporan Laba Rugi",
        "balance_sheet": "Laporan Posisi Keuangan (Neraca)",
        "closing_entry": "Jurnal Penutup",
        "product_stocking": "Stok Produk Awal",
        "date": "Tanggal",
        "product_name": "Nama Produk",
        "initial_quantity": "Kuantitas Awal",
        "purchase_price": "Harga Beli",
        "total_purchase_price": "Total Harga Beli",
        "selling_price": "Harga Jual",
        "save": "Simpan",
        "quantity_update": "Kuantitas Terbaru",
        "total_price": "Total Harga",
        "add": "Tambah",
        "quantity_addition": "Penambahan Kuantitas",
        "add_quantity": "Jumlah Tambahan",
        "sales": "Penjualan",
        "customer": "Pelanggan",
        "price": "Harga",
        "quantity": "Kuantitas",
        "payment": "Pembayaran",
        "cash": "Tunai",
        "receivable": "Piutang",
        "record": "Catat",
        "sales_return": "Retur Penjualan",
        "settlement": "Pelunasan",
        "transaction_date": "Tanggal Transaksi",
        "return": "Retur",
        "settlement_amount": "Jumlah Pelunasan",
        "lending": "Pemberian Pinjaman",
        "borrowing": "Penerimaan Pinjaman",
        "form_filling": "Formulir Isian",
        "borrower_name": "Nama Peminjam",
        "nominal": "Nominal",
        "receivables_payment": "Pembayaran Piutang",
        "debtors_list": "Daftar Debitur",
        "debt_payment": "Pembayaran Utang",
        "creditors_list": "Daftar Kreditur",
        "lender": "Pemberi Pinjaman",
        "option": "Pilihan",
        "equipment": "Peralatan",
        "building": "Gedung",
        "vehicle": "Kendaraan",
        "depreciation_entry": "Entri Penyusutan (Akhir Periode)",
        "price_at_purchase": "Harga Beli",
        "useful_life": "Masa Manfaat (tahun)",
        "current_year_depreciation": "Penyusutan Tahun Berjalan",
        "expense_entry": "Entri Beban",
        "expense": "Beban",
        "destination": "Tujuan",
        "type_of_investment": "Jenis Investasi",
        "buy": "Beli",
        "sell": "Jual",
        "investment_selling": "Penjualan Investasi",
        "company_name": "Nama Perusahaan",
        "sell_date": "Tanggal Jual",
        "final_value": "Nilai Akhir",
        "gain_loss": "Laba/Rugi",
        "submit_update": "Kirim Pembaruan",
        "paid_up_capital": "Modal Disetor",
        "account_title": "Nama Akun",
        "debit": "Debit",
        "credit": "Kredit",
        "total": "Total",
        "account": "Akun",
        "balance": "Saldo",
        "revenue": "PENDAPATAN",
        "gross_profit": "LABA KOTOR",
        "operating_expenses": "BEBAN OPERASIONAL",
        "total_expenses": "TOTAL BEBAN",
        "other_income_expenses": "PENDAPATAN DAN BEBAN LAIN-LAIN",
        "net_income": "LABA BERSIH",
        "assets": "ASET",
        "liabilities": "LIABILITAS",
        "equity": "EKUITAS",
        "total_assets": "TOTAL ASET",
        "total_liabilities_equity": "TOTAL LIABILITAS DAN EKUITAS",
        "warn_no_selection": "Tidak ada item yang dipilih.",
        "warn_fill_fields": "Harap isi semua kolom dengan benar.",
        "success_add": "Data berhasil ditambahkan!",
        "success_update": "Data berhasil diperbarui!",
    }
}

# Expense types
expense_types = {
    "en": [
        "Freight-in (Purchase Shipping Cost)", "Employee Salaries", "Sales/Marketing Salaries",
        "Sales Commission", "Advertising and Promotion", "Freight-out (Sales Shipping Cost)",
        "Building/Store/Warehouse Rent", "Electricity", "Water", "Telephone and Internet",
        "Office Stationery", "Bank Administration Fees", "Loan Interest",
        "Consultant/Accountant/Legal Fees", "Business Taxes (Property Tax, Income Tax, etc.)",
        "Transportation and Fuel", "Cleaning", "Security", "Damaged or Lost Goods",
        "Late Penalty Fees", "Business Insurance", "Employee Training and Development",
        "Software/Application Subscription Fees", "Maintenance and Repair Costs",
        "Donations or CSR (Corporate Social Responsibility)", "Office Refreshments",
        "Business Guest Entertainment", "Miscellaneous Daily Operational", "Prive"
    ],
    "id": [
        "Beban Angkut Pembelian", "Gaji Karyawan", "Gaji Pemasaran/Penjualan",
        "Komisi Penjualan", "Iklan dan Promosi", "Beban Angkut Penjualan",
        "Sewa Gedung/Toko/Gudang", "Listrik", "Air", "Telepon dan Internet",
        "Alat Tulis Kantor", "Biaya Administrasi Bank", "Bunga Pinjaman",
        "Jasa Konsultan/Akuntan/Hukum", "Pajak Usaha (PBB, PPh, dll.)",
        "Transportasi dan Bahan Bakar", "Kebersihan", "Keamanan", "Barang Rusak atau Hilang",
        "Denda Keterlambatan", "Asuransi Usaha", "Pelatihan dan Pengembangan Karyawan",
        "Langganan Perangkat Lunak/Aplikasi", "Biaya Pemeliharaan dan Perbaikan",
        "Sumbangan atau CSR", "Konsumsi Kantor", "Hiburan Tamu Bisnis",
        "Operasional Harian Lain-lain", "Prive"
    ]
}

# Global data storage
app_data = {
    "product_list": [],
    "journal_entries": [],
    "sales_records": [],
    "debtor_list": [],
    "creditor_list": [],
    "fixed_assets": [],
    "investments": [],
    "share_capital": 0,
    "general_ledger": defaultdict(list),
    "account_balances": defaultdict(float)
}

def get_current_date():
    return datetime.datetime.now().strftime("%Y-%m-%d")

def create_journal_entry(date, description, debit_account, debit_amount, credit_account, credit_amount):
    """Create a journal entry and update general ledger"""
    entry = {
        "date": date,
        "description": description,
        "debit_account": debit_account,
        "debit_amount": float(debit_amount),
        "credit_account": credit_account,
        "credit_amount": float(credit_amount)
    }
    
    app_data["journal_entries"].append(entry)
    
    # Update general ledger
    app_data["general_ledger"][debit_account].append({
        "date": date,
        "description": description,
        "debit": float(debit_amount),
        "credit": 0
    })
    
    app_data["general_ledger"][credit_account].append({
        "date": date,
        "description": description,
        "debit": 0,
        "credit": float(credit_amount)
    })
    
    # Update account balances
    app_data["account_balances"][debit_account] += float(debit_amount)
    app_data["account_balances"][credit_account] -= float(credit_amount)
    
    return entry

@app.route('/')
def home():
    language = session.get('language', 'id')
    return render_template('index.html', translations=translations[language], language=language)

@app.route('/set_language', methods=['POST'])
def set_language():
    language = request.form.get('language', 'id')
    session['language'] = language
    return jsonify({"success": True, "language": language})

@app.route('/get_translations')
def get_translations():
    language = session.get('language', 'id')
    return jsonify(translations[language])

@app.route('/get_expense_types')
def get_expense_types():
    language = session.get('language', 'id')
    return jsonify(expense_types[language])

@app.route('/product_stocking', methods=['POST'])
def product_stocking():
    try:
        data = request.json
        
        product = {
            "date": data.get('date', get_current_date()),
            "name": data['product_name'],
            "initial_quantity": int(data['initial_quantity']),
            "current_quantity": int(data['initial_quantity']),
            "purchase_price": float(data['purchase_price']),
            "selling_price": float(data['selling_price']),
            "total_purchase_price": float(data['purchase_price']) * int(data['initial_quantity'])
        }
        
        app_data["product_list"].append(product)
        
        # Create journal entry for inventory purchase
        create_journal_entry(
            product["date"],
            f"Purchase of {product['name']}",
            "Inventory",
            product["total_purchase_price"],
            "Cash",
            product["total_purchase_price"]
        )
        
        return jsonify({"success": True, "message": "Product added successfully!"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/get_products')
def get_products():
    return jsonify(app_data["product_list"])

@app.route('/add_quantity', methods=['POST'])
def add_quantity():
    try:
        data = request.json
        product_name = data['product_name']
        additional_quantity = int(data['additional_quantity'])
        
        # Find and update product
        for product in app_data["product_list"]:
            if product['name'] == product_name:
                product['current_quantity'] += additional_quantity
                
                # Create journal entry for additional inventory
                total_cost = additional_quantity * product['purchase_price']
                create_journal_entry(
                    get_current_date(),
                    f"Additional inventory for {product_name}",
                    "Inventory",
                    total_cost,
                    "Cash",
                    total_cost
                )
                break
        
        return jsonify({"success": True, "message": "Quantity updated successfully!"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/record_sale', methods=['POST'])
def record_sale():
    try:
        data = request.json
        
        sale = {
            "date": data.get('date', get_current_date()),
            "customer": data['customer'],
            "product_name": data['product_name'],
            "quantity": int(data['quantity']),
            "price": float(data['price']),
            "total": float(data['price']) * int(data['quantity']),
            "payment_type": data['payment_type']
        }
        
        app_data["sales_records"].append(sale)
        
        # Update product inventory
        for product in app_data["product_list"]:
            if product['name'] == sale['product_name']:
                product['current_quantity'] -= sale['quantity']
                break
        
        # Create journal entries
        if sale['payment_type'] == 'cash':
            create_journal_entry(
                sale["date"],
                f"Sale to {sale['customer']}",
                "Cash",
                sale["total"],
                "Sales Revenue",
                sale["total"]
            )
        else:  # receivable
            create_journal_entry(
                sale["date"],
                f"Sale to {sale['customer']} (on account)",
                "Accounts Receivable",
                sale["total"],
                "Sales Revenue",
                sale["total"]
            )
            
            # Add to debtor list if not cash
            app_data["debtor_list"].append({
                "name": sale['customer'],
                "amount": sale["total"],
                "date": sale["date"],
                "type": "sales",
                "product": sale['product_name'],
                "quantity": sale['quantity']
            })
        
        return jsonify({"success": True, "message": "Sale recorded successfully!"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/get_sales')
def get_sales():
    return jsonify(app_data["sales_records"])

@app.route('/get_debtors')
def get_debtors():
    return jsonify(app_data["debtor_list"])

@app.route('/get_creditors')
def get_creditors():
    return jsonify(app_data["creditor_list"])

@app.route('/record_expense', methods=['POST'])
def record_expense():
    try:
        data = request.json
        
        expense_amount = float(data['amount'])
        expense_type = data['expense_type']
        destination = data.get('destination', '')
        
        create_journal_entry(
            get_current_date(),
            f"{expense_type} - {destination}",
            f"{expense_type} Expense",
            expense_amount,
            "Cash",
            expense_amount
        )
        
        return jsonify({"success": True, "message": "Expense recorded successfully!"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/record_charity', methods=['POST'])
def record_charity():
    try:
        data = request.json
        
        charity_amount = float(data['amount'])
        destination = data.get('destination', '')
        
        create_journal_entry(
            get_current_date(),
            f"Charity donation - {destination}",
            "Charity",
            charity_amount,
            "Cash",
            charity_amount
        )
        
        return jsonify({"success": True, "message": "Charity recorded successfully!"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/record_investment', methods=['POST'])
def record_investment():
    try:
        data = request.json
        
        investment_amount = float(data['amount'])
        investment_type = data['investment_type']
        company_name = data.get('company_name', '')
        
        investment = {
            "date": get_current_date(),
            "type": investment_type,
            "company": company_name,
            "amount": investment_amount,
            "current_value": investment_amount
        }
        
        app_data["investments"].append(investment)
        
        create_journal_entry(
            get_current_date(),
            f"Investment in {company_name} - {investment_type}",
            "Investment",
            investment_amount,
            "Cash",
            investment_amount
        )
        
        return jsonify({"success": True, "message": "Investment recorded successfully!"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/sell_investment', methods=['POST'])
def sell_investment():
    try:
        data = request.json
        
        investment_id = int(data['investment_id'])
        sell_amount = float(data['sell_amount'])
        
        if investment_id < len(app_data["investments"]):
            investment = app_data["investments"][investment_id]
            original_amount = investment["amount"]
            gain_loss = sell_amount - original_amount
            
            # Record sale
            create_journal_entry(
                get_current_date(),
                f"Sale of investment in {investment['company']}",
                "Cash",
                sell_amount,
                "Investment",
                original_amount
            )
            
            # Record gain or loss
            if gain_loss > 0:
                create_journal_entry(
                    get_current_date(),
                    f"Gain on sale of investment",
                    "Cash",
                    0,
                    "Investment Gain",
                    gain_loss
                )
            elif gain_loss < 0:
                create_journal_entry(
                    get_current_date(),
                    f"Loss on sale of investment",
                    "Investment Loss",
                    abs(gain_loss),
                    "Cash",
                    0
                )
            
            # Remove investment from list
            app_data["investments"].pop(investment_id)
            
            return jsonify({"success": True, "message": "Investment sold successfully!", "gain_loss": gain_loss})
        else:
            return jsonify({"success": False, "message": "Investment not found"}), 404
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/record_receivable_payment', methods=['POST'])
def record_receivable_payment():
    try:
        data = request.json
        
        debtor_name = data['debtor_name']
        payment_amount = float(data['payment_amount'])
        
        # Find and update debtor
        for i, debtor in enumerate(app_data["debtor_list"]):
            if debtor['name'] == debtor_name:
                if payment_amount <= debtor['amount']:
                    create_journal_entry(
                        get_current_date(),
                        f"Payment received from {debtor_name}",
                        "Cash",
                        payment_amount,
                        "Accounts Receivable",
                        payment_amount
                    )
                    
                    debtor['amount'] -= payment_amount
                    if debtor['amount'] == 0:
                        app_data["debtor_list"].pop(i)
                    
                    return jsonify({"success": True, "message": "Receivable payment recorded successfully!"})
                else:
                    return jsonify({"success": False, "message": "Payment amount exceeds receivable balance"}), 400
        
        return jsonify({"success": False, "message": "Debtor not found"}), 404
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/record_payable_payment', methods=['POST'])
def record_payable_payment():
    try:
        data = request.json
        
        creditor_name = data['creditor_name']
        payment_amount = float(data['payment_amount'])
        
        # Find and update creditor
        for i, creditor in enumerate(app_data["creditor_list"]):
            if creditor['name'] == creditor_name:
                if payment_amount <= creditor['amount']:
                    create_journal_entry(
                        get_current_date(),
                        f"Payment made to {creditor_name}",
                        "Accounts Payable",
                        payment_amount,
                        "Cash",
                        payment_amount
                    )
                    
                    creditor['amount'] -= payment_amount
                    if creditor['amount'] == 0:
                        app_data["creditor_list"].pop(i)
                    
                    return jsonify({"success": True, "message": "Payable payment recorded successfully!"})
                else:
                    return jsonify({"success": False, "message": "Payment amount exceeds payable balance"}), 400
        
        return jsonify({"success": False, "message": "Creditor not found"}), 404
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/create_receivable', methods=['POST'])
def create_receivable():
    try:
        data = request.json
        
        debtor_name = data['debtor_name']
        amount = float(data['amount'])
        description = data.get('description', 'Other receivable')
        
        receivable = {
            "name": debtor_name,
            "amount": amount,
            "date": get_current_date(),
            "description": description
        }
        
        app_data["debtor_list"].append(receivable)
        
        create_journal_entry(
            get_current_date(),
            f"Receivable from {debtor_name} - {description}",
            "Accounts Receivable",
            amount,
            "Other Income",
            amount
        )
        
        return jsonify({"success": True, "message": "Receivable created successfully!"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/create_payable', methods=['POST'])
def create_payable():
    try:
        data = request.json
        
        creditor_name = data['creditor_name']
        amount = float(data['amount'])
        description = data.get('description', 'Other payable')
        
        payable = {
            "name": creditor_name,
            "amount": amount,
            "date": get_current_date(),
            "description": description
        }
        
        app_data["creditor_list"].append(payable)
        
        create_journal_entry(
            get_current_date(),
            f"Payable to {creditor_name} - {description}",
            "Equipment" if "equipment" in description.lower() else "Other Expense",
            amount,
            "Accounts Payable",
            amount
        )
        
        return jsonify({"success": True, "message": "Payable created successfully!"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/get_investments')
def get_investments():
    return jsonify(app_data["investments"])

@app.route('/set_share_capital', methods=['POST'])
def set_share_capital():
    try:
        data = request.json
        capital_amount = float(data['amount'])
        
        app_data["share_capital"] = capital_amount
        
        create_journal_entry(
            get_current_date(),
            "Initial share capital investment",
            "Cash",
            capital_amount,
            "Share Capital - Ordinary",
            capital_amount
        )
        
        return jsonify({"success": True, "message": "Share capital set successfully!"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/get_journal_entries')
def get_journal_entries():
    return jsonify(app_data["journal_entries"])

@app.route('/get_general_ledger')
def get_general_ledger():
    ledger_data = {}
    for account, entries in app_data["general_ledger"].items():
        ledger_data[account] = {
            "entries": entries,
            "balance": app_data["account_balances"][account]
        }
    return jsonify(ledger_data)

@app.route('/get_trial_balance')
def get_trial_balance():
    # Define all account categories with specific accounts
    all_accounts = {
        "assets": [
            "Cash", "Inventory", "Accounts Receivable", "Equipment", 
            "Building", "Vehicle", "Accumulated Depreciation - Equipment", 
            "Accumulated Depreciation - Building", "Accumulated Depreciation - Vehicle",
            "Charity", "Investment"
        ],
        "liabilities": ["Accounts Payable"],
        "equity": ["Share Capital - Ordinary", "Prive"]
    }
    
    trial_balance = []
    total_debit = 0
    total_credit = 0
    
    # Process all predefined accounts
    for category, accounts in all_accounts.items():
        for account in accounts:
            balance = app_data["account_balances"].get(account, 0)
            
            # Determine normal balance side for each account type
            if category == "assets":
                # Assets have normal debit balance (except accumulated depreciation which is credit)
                if "Accumulated Depreciation" in account:
                    # Accumulated depreciation accounts have credit normal balance
                    trial_balance.append({
                        "account": account,
                        "debit": 0,
                        "credit": abs(balance) if balance != 0 else 0
                    })
                    if balance != 0:
                        total_credit += abs(balance)
                else:
                    # Regular assets
                    if balance >= 0:
                        trial_balance.append({
                            "account": account,
                            "debit": balance,
                            "credit": 0
                        })
                        total_debit += balance
                    else:
                        trial_balance.append({
                            "account": account,
                            "debit": 0,
                            "credit": abs(balance)
                        })
                        total_credit += abs(balance)
            
            elif category == "liabilities":
                # Liabilities have normal credit balance
                trial_balance.append({
                    "account": account,
                    "debit": 0,
                    "credit": abs(balance) if balance != 0 else 0
                })
                if balance != 0:
                    total_credit += abs(balance)
            
            elif category == "equity":
                # Equity has normal credit balance (except Prive which is debit)
                if account == "Prive":
                    trial_balance.append({
                        "account": account,
                        "debit": abs(balance) if balance != 0 else 0,
                        "credit": 0
                    })
                    if balance != 0:
                        total_debit += abs(balance)
                else:
                    # Share Capital
                    trial_balance.append({
                        "account": account,
                        "debit": 0,
                        "credit": abs(balance) if balance != 0 else 0
                    })
                    if balance != 0:
                        total_credit += abs(balance)
    
    # Add any other accounts that exist in the system but not in our predefined list
    for account, balance in app_data["account_balances"].items():
        # Check if this account is already included
        account_exists = False
        for category_accounts in all_accounts.values():
            if account in category_accounts:
                account_exists = True
                break
        
        if not account_exists and balance != 0:
            if balance > 0:
                trial_balance.append({
                    "account": account,
                    "debit": balance,
                    "credit": 0
                })
                total_debit += balance
            else:
                trial_balance.append({
                    "account": account,
                    "debit": 0,
                    "credit": abs(balance)
                })
                total_credit += abs(balance)
    
    return jsonify({
        "accounts": trial_balance,
        "total_debit": total_debit,
        "total_credit": total_credit
    })

@app.route('/get_income_statement')
def get_income_statement():
    revenue = 0
    expenses = 0
    other_income = 0
    other_expenses = 0
    
    for account, balance in app_data["account_balances"].items():
        if "Revenue" in account or "Sales Revenue" in account:
            revenue += abs(balance)
        elif "Expense" in account:
            expenses += abs(balance)
        elif "Investment Gain" in account or "Other Income" in account:
            other_income += abs(balance)
        elif "Investment Loss" in account:
            other_expenses += abs(balance)
    
    gross_income = revenue
    operating_income = gross_income - expenses
    net_income = operating_income + other_income - other_expenses
    
    return jsonify({
        "revenue": revenue,
        "expenses": expenses,
        "other_income": other_income,
        "other_expenses": other_expenses,
        "gross_income": gross_income,
        "operating_income": operating_income,
        "net_income": net_income
    })

@app.route('/get_balance_sheet')
def get_balance_sheet():
    # Calculate Net Income first
    revenue = 0
    expenses = 0
    
    for account, balance in app_data["account_balances"].items():
        if "Revenue" in account or "Sales" in account:
            revenue += abs(balance)
        elif "Expense" in account or any(expense in account for expense in expense_types["en"]):
            expenses += abs(balance)
    
    net_income = revenue - expenses
    
    # Define detailed account structure
    asset_accounts = {
        "Cash": app_data["account_balances"].get("Cash", 0),
        "Inventory": app_data["account_balances"].get("Inventory", 0),
        "Accounts Receivable": app_data["account_balances"].get("Accounts Receivable", 0),
        "Equipment": app_data["account_balances"].get("Equipment", 0),
        "Building": app_data["account_balances"].get("Building", 0),
        "Vehicle": app_data["account_balances"].get("Vehicle", 0),
        "Accumulated Depreciation - Equipment": app_data["account_balances"].get("Accumulated Depreciation - Equipment", 0),
        "Accumulated Depreciation - Building": app_data["account_balances"].get("Accumulated Depreciation - Building", 0),
        "Accumulated Depreciation - Vehicle": app_data["account_balances"].get("Accumulated Depreciation - Vehicle", 0),
        "Charity": app_data["account_balances"].get("Charity", 0),
        "Investment": app_data["account_balances"].get("Investment", 0)
    }
    
    liability_accounts = {
        "Accounts Payable": app_data["account_balances"].get("Accounts Payable", 0)
    }
    
    # Share Capital - Ordinary includes Net Income/Loss
    share_capital_ordinary = app_data["account_balances"].get("Share Capital - Ordinary", 0) + net_income
    prive = app_data["account_balances"].get("Prive", 0)
    
    equity_accounts = {
        "Share Capital - Ordinary": share_capital_ordinary,
        "Prive": prive
    }
    
    # Calculate totals
    total_assets = 0
    for account, balance in asset_accounts.items():
        if "Accumulated Depreciation" in account:
            # Accumulated depreciation reduces total assets
            total_assets -= abs(balance)
        else:
            total_assets += abs(balance)
    
    total_liabilities = sum(abs(balance) for balance in liability_accounts.values())
    total_equity = share_capital_ordinary - abs(prive)  # Prive reduces equity
    
    return jsonify({
        "asset_accounts": asset_accounts,
        "liability_accounts": liability_accounts,
        "equity_accounts": equity_accounts,
        "net_income": net_income,
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "total_equity": total_equity,
        "total_liabilities_equity": total_liabilities + total_equity
    })

@app.route('/record_lending', methods=['POST'])
def record_lending():
    try:
        data = request.json
        borrower_name = data['borrower_name']
        amount = float(data['amount'])
        description = data.get('description', '')
        date = get_current_date()
        
        # Journal entry: Dr. Loans Receivable, Cr. Cash
        create_journal_entry(
            date=date,
            description=f"Loan given to {borrower_name}: {description}",
            debit_account=f"Loans Receivable - {borrower_name}",
            debit_amount=amount,
            credit_account="Cash",
            credit_amount=amount
        )
        
        # Add to debtors list (loans given)
        app_data["debtor_list"].append({
            'name': borrower_name,
            'amount': amount,
            'date': date,
            'type': 'loan',
            'description': description
        })
        
        return jsonify({
            'success': True,
            'message': f'Loan of {amount:,.2f} given to {borrower_name} recorded successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/record_borrowing', methods=['POST'])
def record_borrowing():
    try:
        data = request.json
        lender_name = data['lender_name']
        amount = float(data['amount'])
        description = data.get('description', '')
        date = get_current_date()
        
        # Journal entry: Dr. Cash, Cr. Loans Payable
        create_journal_entry(
            date=date,
            description=f"Loan received from {lender_name}: {description}",
            debit_account="Cash",
            debit_amount=amount,
            credit_account=f"Loans Payable - {lender_name}",
            credit_amount=amount
        )
        
        # Add to creditors list (loans received)
        app_data["creditor_list"].append({
            'name': lender_name,
            'amount': amount,
            'date': date,
            'type': 'loan',
            'description': description
        })
        
        return jsonify({
            'success': True,
            'message': f'Loan of {amount:,.2f} received from {lender_name} recorded successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/record_loan_payment', methods=['POST'])
def record_loan_payment():
    try:
        data = request.json
        borrower_name = data['borrower_name']
        payment_amount = float(data['payment_amount'])
        purchase_description = data.get('purchase_description', '')
        date = get_current_date()
        
        # Find borrower
        borrower = None
        for i, debtor in enumerate(app_data["debtor_list"]):
            if debtor['name'] == borrower_name and debtor.get('type') == 'loan':
                borrower = debtor
                break
        
        if not borrower:
            return jsonify({'success': False, 'message': 'Borrower not found'})
        
        if payment_amount > borrower['amount']:
            return jsonify({'success': False, 'message': 'Payment amount exceeds loan balance'})
        
        # Journal entry for loan payment
        if purchase_description:
            # If there's a purchase with receivable
            create_journal_entry(
                date=date,
                description=f"Loan payment from {borrower_name} used for: {purchase_description}",
                debit_account="Inventory" if "inventory" in purchase_description.lower() else "Equipment",
                debit_amount=payment_amount,
                credit_account=f"Loans Receivable - {borrower_name}",
                credit_amount=payment_amount
            )
        else:
            # Regular cash payment
            create_journal_entry(
                date=date,
                description=f"Loan payment received from {borrower_name}",
                debit_account="Cash",
                debit_amount=payment_amount,
                credit_account=f"Loans Receivable - {borrower_name}",
                credit_amount=payment_amount
            )
        
        # Update borrower balance
        borrower['amount'] -= payment_amount
        if borrower['amount'] <= 0:
            app_data["debtor_list"].remove(borrower)
        
        return jsonify({
            'success': True,
            'message': f'Loan payment of {payment_amount:,.2f} from {borrower_name} recorded successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/record_debt_repayment', methods=['POST'])
def record_debt_repayment():
    try:
        data = request.json
        lender_name = data['lender_name']
        payment_amount = float(data['payment_amount'])
        date = get_current_date()
        
        # Find lender
        lender = None
        for i, creditor in enumerate(app_data["creditor_list"]):
            if creditor['name'] == lender_name and creditor.get('type') == 'loan':
                lender = creditor
                break
        
        if not lender:
            return jsonify({'success': False, 'message': 'Lender not found'})
        
        if payment_amount > lender['amount']:
            return jsonify({'success': False, 'message': 'Payment amount exceeds debt balance'})
        
        # Journal entry: Dr. Loans Payable, Cr. Cash
        create_journal_entry(
            date=date,
            description=f"Debt payment to {lender_name}",
            debit_account=f"Loans Payable - {lender_name}",
            debit_amount=payment_amount,
            credit_account="Cash",
            credit_amount=payment_amount
        )
        
        # Update lender balance
        lender['amount'] -= payment_amount
        if lender['amount'] <= 0:
            app_data["creditor_list"].remove(lender)
        
        return jsonify({
            'success': True,
            'message': f'Debt payment of {payment_amount:,.2f} to {lender_name} recorded successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/get_loans_given')
def get_loans_given():
    loans_given = [debtor for debtor in app_data["debtor_list"] if debtor.get('type') == 'loan']
    return jsonify(loans_given)

@app.route('/get_loans_received')
def get_loans_received():
    loans_received = [creditor for creditor in app_data["creditor_list"] if creditor.get('type') == 'loan']
    return jsonify(loans_received)

@app.route('/get_sales_receivables')
def get_sales_receivables():
    sales_receivables = [debtor for debtor in app_data["debtor_list"] if debtor.get('type') == 'sales']
    return jsonify(sales_receivables)

@app.route('/record_sales_receivable_payment', methods=['POST'])
def record_sales_receivable_payment():
    try:
        data = request.json
        customer_name = data['customer_name']
        payment_amount = float(data['payment_amount'])
        purchase_description = data.get('purchase_description', '')
        date = get_current_date()
        
        # Find customer
        customer = None
        for i, debtor in enumerate(app_data["debtor_list"]):
            if debtor['name'] == customer_name and debtor.get('type') == 'sales':
                customer = debtor
                break
        
        if not customer:
            return jsonify({'success': False, 'message': 'Customer not found'})
        
        if payment_amount > customer['amount']:
            return jsonify({'success': False, 'message': 'Payment amount exceeds receivable balance'})
        
        # Journal entry for receivable payment
        if purchase_description:
            # If there's a purchase with receivable settlement
            create_journal_entry(
                date=date,
                description=f"Sales receivable payment from {customer_name} used for: {purchase_description}",
                debit_account="Inventory" if "inventory" in purchase_description.lower() else "Equipment",
                debit_amount=payment_amount,
                credit_account="Accounts Receivable",
                credit_amount=payment_amount
            )
        else:
            # Regular cash payment
            create_journal_entry(
                date=date,
                description=f"Sales receivable payment received from {customer_name}",
                debit_account="Cash",
                debit_amount=payment_amount,
                credit_account="Accounts Receivable",
                credit_amount=payment_amount
            )
        
        # Update customer balance
        customer['amount'] -= payment_amount
        if customer['amount'] <= 0:
            app_data["debtor_list"].remove(customer)
        
        return jsonify({
            'success': True,
            'message': f'Sales receivable payment of {payment_amount:,.2f} from {customer_name} recorded successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
