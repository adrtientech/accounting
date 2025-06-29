// Global variables
let currentLanguage = 'id';
let translations = {};
let expenseTypes = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadTranslations();
    loadExpenseTypes();
    showPage('home');
});

// Initialize application
function initializeApp() {
    // Set current date for date inputs
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Language selector
    document.getElementById('language-select').addEventListener('change', function() {
        changeLanguage(this.value);
    });

    // Form submissions
    setupFormListeners();
}

// Setup form listeners
function setupFormListeners() {
    // Product stocking form
    document.getElementById('product-stocking-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitProductStocking();
    });

    // Share capital form
    document.getElementById('share-capital-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitShareCapital();
    });

    // Quantity addition form
    document.getElementById('quantity-addition-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitQuantityAddition();
    });

    // Sales form
    document.getElementById('sales-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitSales();
    });

    // Expense form
    document.getElementById('expense-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitExpense();
    });

    // Charity form
    document.getElementById('charity-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitCharity();
    });

    // Investment forms
    document.getElementById('investment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitInvestment();
    });

    document.getElementById('sell-investment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitSellInvestment();
    });

    // Receivable/Payable forms
    document.getElementById('receivable-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitReceivable();
    });

    document.getElementById('payable-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitPayable();
    });

    // Payment forms
    document.getElementById('receivable-payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitReceivablePayment();
    });

    document.getElementById('payable-payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitPayablePayment();
    });

    // Lending/Borrowing forms
    document.getElementById('lending-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitLending();
    });

    document.getElementById('borrowing-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitBorrowing();
    });

    document.getElementById('loan-payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitLoanPayment();
    });

    document.getElementById('debt-repayment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitDebtRepayment();
    });

    // Sales receivable payment form
    document.getElementById('sales-receivable-payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitSalesReceivablePayment();
    });
}

// Language management
function changeLanguage(language) {
    currentLanguage = language;
    
    fetch('/set_language', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `language=${language}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload(); // Reload to get new translations
        }
    });
}

function loadTranslations() {
    fetch('/get_translations')
    .then(response => response.json())
    .then(data => {
        translations = data;
    });
}

function loadExpenseTypes() {
    fetch('/get_expense_types')
    .then(response => response.json())
    .then(data => {
        expenseTypes = data;
        populateExpenseSelect();
    });
}

function populateExpenseSelect() {
    const select = document.querySelector('select[name="expense_type"]');
    select.innerHTML = '<option value="">Select Expense Type</option>';
    
    expenseTypes.forEach(expense => {
        const option = document.createElement('option');
        option.value = expense;
        option.textContent = expense;
        select.appendChild(option);
    });
}

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load page-specific data
        loadPageData(pageId);
    }
}

// Load page-specific data
function loadPageData(pageId) {
    switch(pageId) {
        case 'product-list':
            loadProducts();
            break;
        case 'quantity-addition':
            loadProductsForSelection();
            break;
        case 'sales':
            loadProductsForSales();
            break;
        case 'payables-receivables':
            loadDebtorsAndCreditors();
            loadDebtorCreditorSelects();
            loadSalesReceivables();
            loadSalesReceivableSelects();
            break;
        case 'charity':
            // No specific data to load
            break;
        case 'investment':
            loadInvestments();
            loadInvestmentSelects();
            break;
        case 'lending-borrowing':
            loadLoansGiven();
            loadLoansReceived();
            loadLoanSelects();
            break;
        case 'journal-entry':
            loadJournalEntries();
            break;
        case 'general-ledger':
            loadGeneralLedger();
            break;
        case 'trial-balance':
            loadTrialBalance();
            break;
        case 'income-statement':
            loadIncomeStatement();
            break;
        case 'balance-sheet':
            loadBalanceSheet();
            break;
    }
}

// Form submission functions
function submitProductStocking() {
    const formData = new FormData(document.getElementById('product-stocking-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/product_stocking', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('product-stocking-form').reset();
            // Set current date
            document.querySelector('#product-stocking-form input[name="date"]').value = new Date().toISOString().split('T')[0];
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitShareCapital() {
    const formData = new FormData(document.getElementById('share-capital-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/set_share_capital', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('share-capital-form').reset();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitQuantityAddition() {
    const formData = new FormData(document.getElementById('quantity-addition-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/add_quantity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('quantity-addition-form').reset();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitSales() {
    const formData = new FormData(document.getElementById('sales-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/record_sale', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('sales-form').reset();
            // Set current date
            document.querySelector('#sales-form input[name="date"]').value = new Date().toISOString().split('T')[0];
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitExpense() {
    const formData = new FormData(document.getElementById('expense-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/record_expense', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('expense-form').reset();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitCharity() {
    const formData = new FormData(document.getElementById('charity-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/record_charity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('charity-form').reset();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitInvestment() {
    const formData = new FormData(document.getElementById('investment-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/record_investment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('investment-form').reset();
            loadInvestments();
            loadInvestmentSelects();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitSellInvestment() {
    const formData = new FormData(document.getElementById('sell-investment-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/sell_investment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const gainLossText = data.gain_loss >= 0 ? `Gain: ${formatCurrency(data.gain_loss)}` : `Loss: ${formatCurrency(Math.abs(data.gain_loss))}`;
            showMessage(`${data.message} ${gainLossText}`, 'success');
            document.getElementById('sell-investment-form').reset();
            loadInvestments();
            loadInvestmentSelects();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitReceivable() {
    const formData = new FormData(document.getElementById('receivable-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/create_receivable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('receivable-form').reset();
            loadDebtorsAndCreditors();
            loadDebtorCreditorSelects();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitPayable() {
    const formData = new FormData(document.getElementById('payable-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/create_payable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('payable-form').reset();
            loadDebtorsAndCreditors();
            loadDebtorCreditorSelects();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitReceivablePayment() {
    const formData = new FormData(document.getElementById('receivable-payment-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/record_receivable_payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('receivable-payment-form').reset();
            loadDebtorsAndCreditors();
            loadDebtorCreditorSelects();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitPayablePayment() {
    const formData = new FormData(document.getElementById('payable-payment-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/record_payable_payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('payable-payment-form').reset();
            loadDebtorsAndCreditors();
            loadDebtorCreditorSelects();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

// Data loading functions
function loadProducts() {
    fetch('/get_products')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('product-list-tbody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
            return;
        }
        
        data.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.initial_quantity}</td>
                <td>${product.current_quantity}</td>
                <td>${formatCurrency(product.purchase_price)}</td>
                <td>${formatCurrency(product.selling_price)}</td>
                <td>${formatCurrency(product.total_purchase_price)}</td>
            `;
            tbody.appendChild(row);
        });
    });
}

function loadProductsForSelection() {
    fetch('/get_products')
    .then(response => response.json())
    .then(data => {
        const select = document.querySelector('#quantity-addition-form select[name="product_name"]');
        select.innerHTML = '<option value="">Select Product</option>';
        
        data.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = product.name;
            select.appendChild(option);
        });
    });
}

function loadProductsForSales() {
    fetch('/get_products')
    .then(response => response.json())
    .then(data => {
        const select = document.querySelector('#sales-form select[name="product_name"]');
        select.innerHTML = '<option value="">Select Product</option>';
        
        data.forEach(product => {
            if (product.current_quantity > 0) {
                const option = document.createElement('option');
                option.value = product.name;
                option.textContent = `${product.name} (Stock: ${product.current_quantity})`;
                option.setAttribute('data-price', product.selling_price);
                select.appendChild(option);
            }
        });
        
        // Auto-fill price when product is selected
        select.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const priceInput = document.querySelector('#sales-form input[name="price"]');
            if (selectedOption.dataset.price) {
                priceInput.value = selectedOption.dataset.price;
            }
        });
    });
}

function loadDebtorsAndCreditors() {
    // Load debtors
    fetch('/get_debtors')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('debtors-tbody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No debtors found</td></tr>';
            return;
        }
        
        // Filter out sales and loan receivables to show only other debtors
        const otherDebtors = data.filter(debtor => debtor.type !== 'sales' && debtor.type !== 'loan');
        
        if (otherDebtors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No other debtors found</td></tr>';
            return;
        }
        
        otherDebtors.forEach(debtor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${debtor.name}</td>
                <td>${formatCurrency(debtor.amount)}</td>
                <td>${debtor.date}</td>
            `;
            tbody.appendChild(row);
        });
    });

    // Load creditors
    fetch('/get_creditors')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('creditors-tbody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No creditors found</td></tr>';
            return;
        }
        
        data.forEach(creditor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${creditor.name}</td>
                <td>${formatCurrency(creditor.amount)}</td>
                <td>${creditor.date}</td>
            `;
            tbody.appendChild(row);
        });
    });
}

function loadJournalEntries() {
    fetch('/get_journal_entries')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('journal-entries-tbody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No journal entries found</td></tr>';
            return;
        }
        
        data.forEach(entry => {
            // Debit entry row
            const debitRow = document.createElement('tr');
            debitRow.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.debit_account}</td>
                <td>${formatCurrency(entry.debit_amount)}</td>
                <td>-</td>
            `;
            tbody.appendChild(debitRow);
            
            // Credit entry row
            const creditRow = document.createElement('tr');
            creditRow.innerHTML = `
                <td></td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;${entry.credit_account}</td>
                <td>-</td>
                <td>${formatCurrency(entry.credit_amount)}</td>
            `;
            tbody.appendChild(creditRow);
            
            // Description row
            const descRow = document.createElement('tr');
            descRow.innerHTML = `
                <td></td>
                <td colspan="3"><em>${entry.description}</em></td>
            `;
            tbody.appendChild(descRow);
            
            // Empty row for spacing
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="4">&nbsp;</td>';
            tbody.appendChild(emptyRow);
        });
    });
}

function loadGeneralLedger() {
    fetch('/get_general_ledger')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('general-ledger-content');
        container.innerHTML = '';
        
        if (Object.keys(data).length === 0) {
            container.innerHTML = '<p class="text-center">No ledger entries found</p>';
            return;
        }
        
        Object.entries(data).forEach(([account, accountData]) => {
            const accountDiv = document.createElement('div');
            accountDiv.className = 'ledger-account';
            
            let entriesHtml = '';
            accountData.entries.forEach(entry => {
                entriesHtml += `
                    <div class="statement-item">
                        <span>${entry.date} - ${entry.description}</span>
                        <span>
                            ${entry.debit > 0 ? formatCurrency(entry.debit) + ' DR' : ''}
                            ${entry.credit > 0 ? formatCurrency(entry.credit) + ' CR' : ''}
                        </span>
                    </div>
                `;
            });
            
            accountDiv.innerHTML = `
                <h5>${account}</h5>
                ${entriesHtml}
                <div class="balance">
                    Balance: ${formatCurrency(Math.abs(accountData.balance))} 
                    ${accountData.balance >= 0 ? 'DR' : 'CR'}
                </div>
            `;
            
            container.appendChild(accountDiv);
        });
    });
}

function loadTrialBalance() {
    fetch('/get_trial_balance')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('trial-balance-tbody');
        tbody.innerHTML = '';
        
        if (data.accounts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No trial balance data found</td></tr>';
            return;
        }
        
        data.accounts.forEach(account => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${account.account}</td>
                <td>${account.debit > 0 ? formatCurrency(account.debit) : '-'}</td>
                <td>${account.credit > 0 ? formatCurrency(account.credit) : '-'}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.className = 'table-success fw-bold';
        totalRow.innerHTML = `
            <td><strong>TOTAL</strong></td>
            <td><strong>${formatCurrency(data.total_debit)}</strong></td>
            <td><strong>${formatCurrency(data.total_credit)}</strong></td>
        `;
        tbody.appendChild(totalRow);
    });
}

function loadIncomeStatement() {
    fetch('/get_income_statement')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('income-statement-content');
        
        container.innerHTML = `
            <div class="financial-statement">
                <h4>INCOME STATEMENT</h4>
                
                <div class="statement-section">
                    <div class="statement-title">REVENUE</div>
                    <div class="statement-item">
                        <span>Sales Revenue</span>
                        <span>${formatCurrency(data.revenue)}</span>
                    </div>
                    <div class="statement-total">
                        <div class="statement-item">
                            <span><strong>GROSS INCOME</strong></span>
                            <span><strong>${formatCurrency(data.gross_income)}</strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="statement-section">
                    <div class="statement-title">OPERATING EXPENSES</div>
                    <div class="statement-item">
                        <span>Total Operating Expenses</span>
                        <span>${formatCurrency(data.expenses)}</span>
                    </div>
                    <div class="statement-total">
                        <div class="statement-item">
                            <span><strong>OPERATING INCOME</strong></span>
                            <span><strong>${formatCurrency(data.operating_income)}</strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="statement-section">
                    <div class="statement-title">OTHER INCOME AND EXPENSES</div>
                    ${data.other_income > 0 ? `
                        <div class="statement-item">
                            <span>Other Income</span>
                            <span>${formatCurrency(data.other_income)}</span>
                        </div>
                    ` : ''}
                    ${data.other_expenses > 0 ? `
                        <div class="statement-item">
                            <span>Other Expenses</span>
                            <span>(${formatCurrency(data.other_expenses)})</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="statement-total">
                    <div class="statement-item">
                        <span><strong>NET INCOME</strong></span>
                        <span><strong>${formatCurrency(data.net_income)}</strong></span>
                    </div>
                </div>
            </div>
        `;
    });
}

function loadBalanceSheet() {
    fetch('/get_balance_sheet')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('balance-sheet-content');
        
        // Build assets section
        let assetsHtml = '';
        Object.entries(data.asset_accounts).forEach(([account, balance]) => {
            if (balance !== 0 || account === 'Cash' || account === 'Inventory' || account === 'Accounts Receivable') {
                const displayBalance = account.includes('Accumulated Depreciation') 
                    ? `(${formatCurrency(Math.abs(balance))})` 
                    : formatCurrency(Math.abs(balance));
                assetsHtml += `
                    <div class="statement-item">
                        <span>${account}</span>
                        <span>${displayBalance}</span>
                    </div>
                `;
            }
        });
        
        // Build liabilities section
        let liabilitiesHtml = '';
        Object.entries(data.liability_accounts).forEach(([account, balance]) => {
            liabilitiesHtml += `
                <div class="statement-item">
                    <span>${account}</span>
                    <span>${formatCurrency(Math.abs(balance))}</span>
                </div>
            `;
        });
        
        // Build equity section
        let equityHtml = '';
        Object.entries(data.equity_accounts).forEach(([account, balance]) => {
            if (account === 'Share Capital - Ordinary') {
                equityHtml += `
                    <div class="statement-item">
                        <span>${account}</span>
                        <span>${formatCurrency(Math.abs(balance))}</span>
                    </div>
                `;
                if (data.net_income !== 0) {
                    equityHtml += `
                        <div class="statement-item">
                            <span>&nbsp;&nbsp;&nbsp;&nbsp;Net Income/Loss</span>
                            <span>${formatCurrency(data.net_income)}</span>
                        </div>
                    `;
                }
            } else if (account === 'Prive' && balance !== 0) {
                equityHtml += `
                    <div class="statement-item">
                        <span>${account}</span>
                        <span>(${formatCurrency(Math.abs(balance))})</span>
                    </div>
                `;
            }
        });
        
        container.innerHTML = `
            <div class="financial-statement">
                <h4>BALANCE SHEET</h4>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="statement-section">
                            <div class="statement-title">ASSETS</div>
                            ${assetsHtml}
                            <div class="statement-total">
                                <div class="statement-item">
                                    <span><strong>TOTAL ASSETS</strong></span>
                                    <span><strong>${formatCurrency(data.total_assets)}</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="statement-section">
                            <div class="statement-title">LIABILITIES</div>
                            ${liabilitiesHtml}
                            <div class="statement-total">
                                <div class="statement-item">
                                    <span><strong>TOTAL LIABILITIES</strong></span>
                                    <span><strong>${formatCurrency(data.total_liabilities)}</strong></span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="statement-section">
                            <div class="statement-title">EQUITY</div>
                            ${equityHtml}
                            <div class="statement-total">
                                <div class="statement-item">
                                    <span><strong>TOTAL EQUITY</strong></span>
                                    <span><strong>${formatCurrency(data.total_equity)}</strong></span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="statement-total">
                            <div class="statement-item">
                                <span><strong>TOTAL LIABILITIES & EQUITY</strong></span>
                                <span><strong>${formatCurrency(data.total_liabilities_equity)}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

function submitLending() {
    const formData = new FormData(document.getElementById('lending-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/record_lending', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('lending-form').reset();
            loadLoansGiven();
            loadLoanSelects();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitBorrowing() {
    const formData = new FormData(document.getElementById('borrowing-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/record_borrowing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('borrowing-form').reset();
            loadLoansReceived();
            loadLoanSelects();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitLoanPayment() {
    const formData = new FormData(document.getElementById('loan-payment-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/record_loan_payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('loan-payment-form').reset();
            loadLoansGiven();
            loadLoanSelects();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

function submitDebtRepayment() {
    const formData = new FormData(document.getElementById('debt-repayment-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/record_debt_repayment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('debt-repayment-form').reset();
            loadLoansReceived();
            loadLoanSelects();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

// Investment functions
function loadInvestments() {
    fetch('/get_investments')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('investments-tbody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No investments found</td></tr>';
            return;
        }
        
        data.forEach(investment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${investment.company}</td>
                <td>${investment.type}</td>
                <td>${investment.date}</td>
                <td>${formatCurrency(investment.amount)}</td>
            `;
            tbody.appendChild(row);
        });
    });
}

function loadInvestmentSelects() {
    fetch('/get_investments')
    .then(response => response.json())
    .then(data => {
        const select = document.querySelector('#sell-investment-form select[name="investment_id"]');
        select.innerHTML = '<option value="">Select Investment</option>';
        
        data.forEach((investment, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${investment.company} - ${investment.type} (${formatCurrency(investment.amount)})`;
            select.appendChild(option);
        });
    });
}

function loadDebtorCreditorSelects() {
    // Load debtors for payment form
    fetch('/get_debtors')
    .then(response => response.json())
    .then(data => {
        const select = document.querySelector('#receivable-payment-form select[name="debtor_name"]');
        select.innerHTML = '<option value="">Select Debtor</option>';
        
        // Filter out sales and loan receivables
        const otherDebtors = data.filter(debtor => debtor.type !== 'sales' && debtor.type !== 'loan');
        
        otherDebtors.forEach(debtor => {
            const option = document.createElement('option');
            option.value = debtor.name;
            option.textContent = `${debtor.name} (${formatCurrency(debtor.amount)})`;
            select.appendChild(option);
        });
    });

    // Load creditors for payment form
    fetch('/get_creditors')
    .then(response => response.json())
    .then(data => {
        const select = document.querySelector('#payable-payment-form select[name="creditor_name"]');
        select.innerHTML = '<option value="">Select Creditor</option>';
        
        data.forEach(creditor => {
            const option = document.createElement('option');
            option.value = creditor.name;
            option.textContent = `${creditor.name} (${formatCurrency(creditor.amount)})`;
            select.appendChild(option);
        });
    });
}

function submitSalesReceivablePayment() {
    const formData = new FormData(document.getElementById('sales-receivable-payment-form'));
    const data = Object.fromEntries(formData.entries());
    
    fetch('/record_sales_receivable_payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            document.getElementById('sales-receivable-payment-form').reset();
            loadSalesReceivables();
            loadSalesReceivableSelects();
            loadDebtorsAndCreditors();
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        showMessage('An error occurred: ' + error.message, 'error');
    });
}

// Lending/Borrowing functions
function loadLoansGiven() {
    fetch('/get_loans_given')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('loans-given-tbody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No loans given</td></tr>';
            return;
        }
        
        data.forEach(loan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${loan.name}</td>
                <td>${formatCurrency(loan.amount)}</td>
                <td>${loan.date}</td>
            `;
            tbody.appendChild(row);
        });
    });
}

function loadLoansReceived() {
    fetch('/get_loans_received')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('loans-received-tbody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No loans received</td></tr>';
            return;
        }
        
        data.forEach(loan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${loan.name}</td>
                <td>${formatCurrency(loan.amount)}</td>
                <td>${loan.date}</td>
            `;
            tbody.appendChild(row);
        });
    });
}

function loadLoanSelects() {
    // Load borrowers for loan payment form
    fetch('/get_loans_given')
    .then(response => response.json())
    .then(data => {
        const select = document.querySelector('#loan-payment-form select[name="borrower_name"]');
        select.innerHTML = '<option value="">Select Borrower</option>';
        
        data.forEach(loan => {
            const option = document.createElement('option');
            option.value = loan.name;
            option.textContent = `${loan.name} (${formatCurrency(loan.amount)})`;
            select.appendChild(option);
        });
    });

    // Load lenders for debt repayment form
    fetch('/get_loans_received')
    .then(response => response.json())
    .then(data => {
        const select = document.querySelector('#debt-repayment-form select[name="lender_name"]');
        select.innerHTML = '<option value="">Select Lender</option>';
        
        data.forEach(loan => {
            const option = document.createElement('option');
            option.value = loan.name;
            option.textContent = `${loan.name} (${formatCurrency(loan.amount)})`;
            select.appendChild(option);
        });
    });
}

function loadSalesReceivables() {
    fetch('/get_sales_receivables')
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('sales-receivables-tbody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No sales receivables</td></tr>';
            return;
        }
        
        data.forEach(receivable => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${receivable.name}</td>
                <td>${formatCurrency(receivable.amount)}</td>
                <td>${receivable.product || '-'}</td>
                <td>${receivable.quantity || '-'}</td>
                <td>${receivable.date}</td>
            `;
            tbody.appendChild(row);
        });
    });
}

function loadSalesReceivableSelects() {
    fetch('/get_sales_receivables')
    .then(response => response.json())
    .then(data => {
        const select = document.querySelector('#sales-receivable-payment-form select[name="customer_name"]');
        select.innerHTML = '<option value="">Select Customer</option>';
        
        data.forEach(receivable => {
            const option = document.createElement('option');
            option.value = receivable.name;
            option.textContent = `${receivable.name} (${formatCurrency(receivable.amount)}) - ${receivable.product}`;
            select.appendChild(option);
        });
    });
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function showMessage(message, type) {
    const container = document.getElementById('message-container');
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="${icon}"></i> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Helper function to validate forms
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}
