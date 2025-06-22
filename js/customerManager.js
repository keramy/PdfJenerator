class CustomerManager {
    constructor() {
        this.currentCustomer = null;
        this.editingCustomerId = null;
        this.currentFilters = {};
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Wait for DOM to be ready
        setTimeout(() => {
            this.initializeCustomersTab();
        }, 100);
    }

    initializeCustomersTab() {
        const customersTab = document.getElementById('customers-tab');
        if (!customersTab) {
            console.error('Customers tab not found');
            return;
        }

        // Create customers interface
        customersTab.innerHTML = `
            <div class="customers-container">
                <div class="customers-header">
                    <h2>Customer Management</h2>
                    <div class="customers-actions">
                        <button class="btn btn-primary" onclick="customerManager.showAddCustomerDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" "/>
                            </svg>
                            Add Customer
                        </button>
                        <button class="btn btn-secondary" onclick="customerManager.exportCustomers()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 2v9m0 0l-3-3m3 3l3-3M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2h-4" "/>
                            </svg>
                            Export
                        </button>
                        <button class="btn btn-secondary" onclick="customerManager.showImportDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 14v7m0 0l-3-3m3 3l3-3M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" "/>
                            </svg>
                            Import
                        </button>
                    </div>
                </div>

                <div class="customers-filters">
                    <div class="filter-group">
                        <input type="text" id="customer-search" placeholder="Search customers..." class="form-control">
                    </div>
                    <div class="filter-group">
                        <select id="customer-filter-tags" class="form-control">
                            <option value="">All Tags</option>
                            <option value="VIP">VIP</option>
                            <option value="Regular">Regular</option>
                            <option value="New">New</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="customerManager.applyFilters()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" "/>
                        </svg>
                        Filter
                    </button>
                    <button class="btn btn-secondary" onclick="customerManager.clearFilters()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" "/>
                        </svg>
                        Clear
                    </button>
                </div>

                <div class="customers-stats" id="customers-stats">
                    <!-- Stats will be loaded here -->
                </div>

                <div class="customers-grid" id="customers-grid">
                    <!-- Customers will be loaded here -->
                </div>
            </div>
        `;

        this.setupSearchListeners();
        this.loadCustomers();
        this.updateStats();
    }

    setupSearchListeners() {
        const searchInput = document.getElementById('customer-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.applyFilters();
                }, 300);
            });
        }
    }

    loadCustomers() {
        const grid = document.getElementById('customers-grid');
        if (!grid) return;

        const customers = this.getFilteredCustomers();
        
        if (customers.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8z" "/>
                    </svg>
                    <p>No customers found</p>
                    <button class="btn btn-primary" onclick="customerManager.showAddCustomerDialog()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" "/>
                        </svg>
                        Add First Customer
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = customers.map(customer => this.renderCustomerCard(customer)).join('');
    }

    renderCustomerCard(customer) {
        const address = customer.address;
        const fullAddress = [address.street, address.city, address.state, address.zip]
            .filter(part => part && part.trim())
            .join(', ');

        return `
            <div class="customer-card" data-customer-id="${customer.id}">
                <div class="customer-card-header">
                    <div class="customer-info">
                        <h3 class="customer-name">${customer.name}</h3>
                        <p class="customer-code">${customer.code}</p>
                    </div>
                    <div class="customer-actions">
                        <button class="btn-icon" onclick="customerManager.viewCustomerHistory('${customer.id}')" title="View Orders">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" "/>
                            </svg>
                        </button>
                        <button class="btn-icon" onclick="customerManager.editCustomer('${customer.id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" "/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="customerManager.deleteCustomer('${customer.id}')" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" "/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="customer-card-body">
                    ${customer.email ? `<p class="customer-email"><strong>Email:</strong> ${customer.email}</p>` : ''}
                    ${customer.phone ? `<p class="customer-phone"><strong>Phone:</strong> ${customer.phone}</p>` : ''}
                    ${fullAddress ? `<p class="customer-address"><strong>Address:</strong> ${fullAddress}</p>` : ''}
                    ${customer.notes ? `<p class="customer-notes"><strong>Notes:</strong> ${customer.notes}</p>` : ''}
                    <div class="customer-stats">
                        <span class="stat"><strong>Orders:</strong> ${customer.orderCount}</span>
                        <span class="stat"><strong>Since:</strong> ${customer.createdDate}</span>
                    </div>
                    ${customer.tags.length > 0 ? `
                        <div class="customer-tags">
                            ${customer.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getFilteredCustomers() {
        let customers = customerDatabase.getAllCustomers();

        // Apply search filter
        const searchTerm = document.getElementById('customer-search')?.value.trim();
        if (searchTerm) {
            customers = customers.filter(customer => 
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm)
            );
        }

        // Apply tag filter
        const tagFilter = document.getElementById('customer-filter-tags')?.value;
        if (tagFilter) {
            customers = customers.filter(customer => customer.tags.includes(tagFilter));
        }

        return customers;
    }

    applyFilters() {
        this.loadCustomers();
        this.updateStats();
    }

    clearFilters() {
        document.getElementById('customer-search').value = '';
        document.getElementById('customer-filter-tags').value = '';
        this.loadCustomers();
        this.updateStats();
    }

    updateStats() {
        const statsContainer = document.getElementById('customers-stats');
        if (!statsContainer) return;

        const stats = customerDatabase.getStatistics();
        const filteredCustomers = this.getFilteredCustomers();

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${filteredCustomers.length}</div>
                    <div class="stat-label">Showing</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalCustomers}</div>
                    <div class="stat-label">Total Customers</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.customersWithOrders}</div>
                    <div class="stat-label">With Orders</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.recentCustomers}</div>
                    <div class="stat-label">New (30 days)</div>
                </div>
            </div>
        `;
    }

    showAddCustomerDialog() {
        this.editingCustomerId = null;
        this.showCustomerDialog();
    }

    editCustomer(customerId) {
        this.editingCustomerId = customerId;
        const customer = customerDatabase.getCustomerById(customerId);
        if (customer) {
            this.showCustomerDialog(customer);
        }
    }

    showCustomerDialog(customer = null) {
        const isEditing = customer !== null;
        const title = isEditing ? 'Edit Customer' : 'Add Customer';
        
        const modalHtml = `
            <div class="modal-overlay" onclick="customerManager.closeCustomerDialog()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="customerManager.closeCustomerDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" "/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="customer-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Customer Name *</label>
                                    <input type="text" id="modal-customer-name" class="form-control" value="${customer?.name || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Customer Code</label>
                                    <input type="text" id="modal-customer-code" class="form-control" value="${customer?.code || ''}" placeholder="Auto-generated if empty">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" id="modal-customer-email" class="form-control" value="${customer?.email || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Phone</label>
                                    <input type="tel" id="modal-customer-phone" class="form-control" value="${customer?.phone || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Street Address</label>
                                    <input type="text" id="modal-customer-street" class="form-control" value="${customer?.address?.street || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">City</label>
                                    <input type="text" id="modal-customer-city" class="form-control" value="${customer?.address?.city || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">State</label>
                                    <input type="text" id="modal-customer-state" class="form-control" value="${customer?.address?.state || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">ZIP Code</label>
                                    <input type="text" id="modal-customer-zip" class="form-control" value="${customer?.address?.zip || ''}">
                                </div>
                                <div class="form-group full-width">
                                    <label class="form-label">Notes</label>
                                    <textarea id="modal-customer-notes" class="form-control" rows="3">${customer?.notes || ''}</textarea>
                                </div>
                                <div class="form-group full-width">
                                    <label class="form-label">Tags (comma-separated)</label>
                                    <input type="text" id="modal-customer-tags" class="form-control" value="${customer?.tags?.join(', ') || ''}" placeholder="VIP, Regular, etc.">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="customerManager.closeCustomerDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" "/>
                            </svg>
                            Cancel
                        </button>
                        <button class="btn btn-primary" onclick="customerManager.saveCustomer()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 6L9 17l-5-5" "/>
                            </svg>
                            ${isEditing ? 'Update' : 'Add'} Customer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('modal-customer-name').focus();
    }

    closeCustomerDialog() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    saveCustomer() {
        try {
            const customerData = {
                name: document.getElementById('modal-customer-name').value,
                code: document.getElementById('modal-customer-code').value,
                email: document.getElementById('modal-customer-email').value,
                phone: document.getElementById('modal-customer-phone').value,
                address: {
                    street: document.getElementById('modal-customer-street').value,
                    city: document.getElementById('modal-customer-city').value,
                    state: document.getElementById('modal-customer-state').value,
                    zip: document.getElementById('modal-customer-zip').value,
                    country: 'USA' // Default
                },
                notes: document.getElementById('modal-customer-notes').value,
                tags: document.getElementById('modal-customer-tags').value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag)
            };

            if (this.editingCustomerId) {
                customerDatabase.updateCustomer(this.editingCustomerId, customerData);
                this.showSuccess('Customer updated successfully');
            } else {
                customerDatabase.addCustomer(customerData);
                this.showSuccess('Customer added successfully');
            }

            this.closeCustomerDialog();
            this.loadCustomers();
            this.updateStats();
        } catch (error) {
            this.showError(error.message);
        }
    }

    deleteCustomer(customerId) {
        const customer = customerDatabase.getCustomerById(customerId);
        if (!customer) return;

        if (confirm(`Are you sure you want to delete customer "${customer.name}"? This action cannot be undone.`)) {
            try {
                customerDatabase.deleteCustomer(customerId);
                this.showSuccess('Customer deleted successfully');
                this.loadCustomers();
                this.updateStats();
            } catch (error) {
                this.showError(error.message);
            }
        }
    }

    viewCustomerHistory(customerId) {
        const customer = customerDatabase.getCustomerById(customerId);
        if (!customer) return;

        // Switch to history tab and filter by customer
        const historyTab = document.querySelector('[data-tab="history"]');
        if (historyTab) {
            historyTab.click();
            setTimeout(() => {
                const searchInput = document.getElementById('history-search');
                if (searchInput) {
                    searchInput.value = customer.name;
                    if (window.historyView) {
                        window.historyView.applyFilters();
                    }
                }
            }, 100);
        }
    }

    exportCustomers() {
        try {
            const exportData = customerDatabase.exportCustomers();
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `customers-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccess('Customers exported successfully');
        } catch (error) {
            this.showError('Error exporting customers: ' + error.message);
        }
    }

    showImportDialog() {
        const modalHtml = `
            <div class="modal-overlay" onclick="customerManager.closeImportDialog()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Import Customers</h3>
                        <button class="modal-close" onclick="customerManager.closeImportDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" "/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Select a JSON file containing customer data to import:</p>
                        <input type="file" id="customer-import-file" accept=".json" class="form-control">
                        <div class="import-info">
                            <p><strong>Note:</strong> Customers with duplicate names will be skipped.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="customerManager.closeImportDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" "/>
                            </svg>
                            Cancel
                        </button>
                        <button class="btn btn-primary" onclick="customerManager.importCustomers()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 14v7m0 0l-3-3m3 3l3-3M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" "/>
                            </svg>
                            Import
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    closeImportDialog() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    importCustomers() {
        const fileInput = document.getElementById('customer-import-file');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showError('Please select a file to import');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const customersData = data.customers || data;
                
                const result = customerDatabase.importCustomers(customersData);
                this.showSuccess(`Import completed: ${result.imported} imported, ${result.skipped} skipped`);
                
                this.closeImportDialog();
                this.loadCustomers();
                this.updateStats();
            } catch (error) {
                this.showError('Error importing customers: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    }

    getCustomerSuggestions(input) {
        return customerDatabase.getCustomerSuggestions(input);
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize global customer manager
window.customerManager = new CustomerManager();