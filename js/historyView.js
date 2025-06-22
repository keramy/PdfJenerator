class HistoryView {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilters = {};
        this.sortField = 'date';
        this.sortDirection = 'desc';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Wait for DOM to be ready
        setTimeout(() => {
            this.initializeHistoryTab();
        }, 100);
    }

    initializeHistoryTab() {
        const historyTab = document.getElementById('history-tab');
        if (!historyTab) {
            console.error('History tab not found');
            return;
        }

        // Create history interface
        historyTab.innerHTML = `
            <div class="history-container">
                <div class="history-header">
                    <h2>Order History</h2>
                    <div class="history-actions">
                        <button class="btn btn-secondary" onclick="historyView.exportHistory()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 2v9m0 0l-3-3m3 3l3-3M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2h-4" "/>
                            </svg>
                            Export
                        </button>
                        <button class="btn btn-secondary" onclick="historyView.showImportDialog()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 14v7m0 0l-3-3m3 3l3-3M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" "/>
                            </svg>
                            Import
                        </button>
                        <button class="btn btn-primary" onclick="historyView.refreshHistory()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" "/>
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                <div class="history-filters">
                    <div class="filter-group">
                        <input type="text" id="history-search" placeholder="Search by order #, customer, or product..." class="form-control">
                    </div>
                    <div class="filter-group">
                        <input type="date" id="filter-date-from" class="form-control" placeholder="From date">
                    </div>
                    <div class="filter-group">
                        <input type="date" id="filter-date-to" class="form-control" placeholder="To date">
                    </div>
                    <div class="filter-group">
                        <select id="filter-status" class="form-control">
                            <option value="">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="historyView.applyFilters()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" "/>
                        </svg>
                        Filter
                    </button>
                    <button class="btn btn-secondary" onclick="historyView.clearFilters()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" "/>
                        </svg>
                        Clear
                    </button>
                </div>

                <div class="history-stats" id="history-stats">
                    <!-- Stats will be loaded here -->
                </div>

                <div class="consumption-stats-card">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Material Consumption Summary</h3>
                            <p class="card-subtitle">Total materials consumed across all completed orders</p>
                        </div>
                        <div class="card-content">
                            <div id="consumption-stats" class="consumption-stats">
                                <!-- Consumption stats will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="history-table-container">
                    <table class="history-table">
                        <thead>
                            <tr>
                                <th onclick="historyView.sortBy('orderNumber')">Order # <span class="sort-icon">↕</span></th>
                                <th onclick="historyView.sortBy('date')">Date <span class="sort-icon">↕</span></th>
                                <th onclick="historyView.sortBy('customerName')">Customer <span class="sort-icon">↕</span></th>
                                <th>Items</th>
                                <th onclick="historyView.sortBy('totalWeight')">Weight <span class="sort-icon">↕</span></th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="history-table-body">
                            <!-- Orders will be loaded here -->
                        </tbody>
                    </table>
                </div>

                <div class="history-pagination" id="history-pagination">
                    <!-- Pagination will be loaded here -->
                </div>
            </div>

            <!-- Import Dialog (hidden by default) -->
            <div id="import-dialog" class="modal" style="display: none;">
                <div class="modal-content">
                    <h3>Import Orders</h3>
                    <div class="import-options">
                        <label>
                            <input type="file" id="import-file" accept=".json" />
                            <p>Select a JSON file containing order data</p>
                        </label>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="historyView.importOrders()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 14v7m0 0l-3-3m3 3l3-3M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" "/>
                            </svg>
                            Import
                        </button>
                        <button class="btn btn-secondary" onclick="historyView.closeImportDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" "/>
                            </svg>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Set up event listeners for filters
        this.setupFilterListeners();
        
        // Load initial data
        this.loadHistory();
    }

    setupFilterListeners() {
        const searchInput = document.getElementById('history-search');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.applyFilters();
                }
            });
        }
    }

    loadHistory() {
        if (typeof orderHistory === 'undefined') {
            console.error('Order history not available');
            return;
        }

        // Load stats
        this.loadStats();

        // Get filtered orders
        let orders = this.getFilteredOrders();

        // Sort orders
        orders = this.sortOrders(orders);

        // Paginate
        const totalPages = Math.ceil(orders.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedOrders = orders.slice(startIndex, startIndex + this.itemsPerPage);

        // Render table
        this.renderTable(paginatedOrders);

        // Render pagination
        this.renderPagination(totalPages, orders.length);
    }

    loadStats() {
        const stats = orderHistory.getOrderStats();
        const statsContainer = document.getElementById('history-stats');
        
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${stats.totalOrders}</div>
                    <div class="stat-label">Total Orders</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalItems}</div>
                    <div class="stat-label">Total Items</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalWeight.toFixed(2)}g</div>
                    <div class="stat-label">Total Weight</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.topCustomers[0]?.name || 'N/A'}</div>
                    <div class="stat-label">Top Customer</div>
                </div>
            `;
        }

        // Load consumption stats
        const consumptionContainer = document.getElementById('consumption-stats');
        if (consumptionContainer) {
            consumptionContainer.innerHTML = `
                <div class="consumption-grid">
                    <div class="consumption-item metal">
                        <div class="consumption-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                            </svg>
                        </div>
                        <div class="consumption-details">
                            <div class="consumption-value">${stats.totalMetalWeight.toFixed(2)}g</div>
                            <div class="consumption-label">Total Metal Consumed</div>
                            <div class="consumption-sublabel">Across ${stats.totalOrders} orders</div>
                        </div>
                    </div>
                    <div class="consumption-item stone">
                        <div class="consumption-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 3h12l4 6-10 13L2 9l4-6z"/>
                            </svg>
                        </div>
                        <div class="consumption-details">
                            <div class="consumption-value">${stats.totalStoneWeight.toFixed(2)}g</div>
                            <div class="consumption-label">Total Stones Consumed</div>
                            <div class="consumption-sublabel">Across ${stats.totalOrders} orders</div>
                        </div>
                    </div>
                    <div class="consumption-item combined">
                        <div class="consumption-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                            </svg>
                        </div>
                        <div class="consumption-details">
                            <div class="consumption-value">${stats.totalWeight.toFixed(2)}g</div>
                            <div class="consumption-label">Total Material Weight</div>
                            <div class="consumption-sublabel">Metal + Stones combined</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    getFilteredOrders() {
        const searchTerm = document.getElementById('history-search')?.value || '';
        
        if (searchTerm) {
            return orderHistory.searchOrders(searchTerm);
        }

        const filters = {
            dateFrom: document.getElementById('filter-date-from')?.value || '',
            dateTo: document.getElementById('filter-date-to')?.value || '',
            status: document.getElementById('filter-status')?.value || ''
        };

        if (Object.values(filters).some(v => v)) {
            return orderHistory.filterOrders(filters);
        }

        return orderHistory.getAllOrders();
    }

    sortOrders(orders) {
        return orders.sort((a, b) => {
            let aVal = a[this.sortField];
            let bVal = b[this.sortField];

            if (this.sortField === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    renderTable(orders) {
        const tbody = document.getElementById('history-table-body');
        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <p>No orders found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>${order.orderNumber}</strong></td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>${order.customerName || 'N/A'}</td>
                <td>
                    <span class="item-count">${order.totalItems} items</span>
                    <div class="item-details">
                        ${order.items.slice(0, 3).map(item => 
                            `<small>${item.code} (${item.quantity})</small>`
                        ).join(', ')}
                        ${order.items.length > 3 ? `<small>+${order.items.length - 3} more</small>` : ''}
                    </div>
                </td>
                <td>${order.totalWeight.toFixed(2)}g</td>
                <td>
                    <span class="status-badge status-${order.status || 'completed'}">
                        ${order.status || 'completed'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="historyView.viewOrderDetails('${order.id}')" title="View details">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                        </button>
                        <button class="btn-icon" onclick="historyView.duplicateOrder('${order.id}')" title="Duplicate order">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" "/>
                            </svg>
                        </button>
                        <button class="btn-icon" onclick="historyView.reprintOrder('${order.id}')" title="Reprint PDF">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" "/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="historyView.deleteOrder('${order.id}')" title="Delete order">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" "/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderPagination(totalPages, totalItems) {
        const paginationContainer = document.getElementById('history-pagination');
        if (!paginationContainer) return;

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <div class="pagination-info">
                Showing ${((this.currentPage - 1) * this.itemsPerPage) + 1}-${Math.min(this.currentPage * this.itemsPerPage, totalItems)} of ${totalItems} orders
            </div>
            <div class="pagination-controls">
        `;

        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button onclick="historyView.goToPage(${this.currentPage - 1})">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 18l-6-6 6-6" "/>
                </svg>
                Previous
            </button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="active">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `<button onclick="historyView.goToPage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<span>...</span>`;
            }
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button onclick="historyView.goToPage(${this.currentPage + 1})">
                Next
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18l6-6-6-6" "/>
                </svg>
            </button>`;
        }

        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadHistory();
    }

    sortBy(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'desc';
        }
        this.loadHistory();
    }

    applyFilters() {
        this.currentPage = 1;
        this.loadHistory();
    }

    clearFilters() {
        document.getElementById('history-search').value = '';
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        document.getElementById('filter-status').value = '';
        this.currentPage = 1;
        this.loadHistory();
    }

    refreshHistory() {
        this.loadHistory();
        if (window.orderManager) {
            window.orderManager.showSuccess('History refreshed');
        }
    }

    viewOrderDetails(orderId) {
        const order = orderHistory.getOrder(orderId);
        if (!order) return;

        // Create a modal to show order details
        const modal = document.createElement('div');
        modal.className = 'modal order-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Order Details - ${order.orderNumber}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" "/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="order-info">
                        <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                        <p><strong>Customer:</strong> ${order.customerName || 'N/A'}</p>
                        <p><strong>Status:</strong> ${order.status || 'completed'}</p>
                        <p><strong>Total Items:</strong> ${order.totalItems}</p>
                        <p><strong>Metal Weight:</strong> ${(order.totalMetalWeight || order.totalWeight || 0).toFixed(2)}g</p>
                        <p><strong>Stone Weight:</strong> ${(order.totalStoneWeight || 0).toFixed(2)}g</p>
                        <p><strong>Total Weight:</strong> ${order.totalWeight.toFixed(2)}g</p>
                    </div>
                    <h4>Items:</h4>
                    <div class="order-items-list">
                        ${order.items.map(item => `
                            <div class="order-item-detail">
                                <div class="item-code">${item.code}</div>
                                <div class="item-desc">${item.description}</div>
                                <div class="item-specs">
                                    <span>Qty: ${item.quantity}</span>
                                    <span>Metal: ${item.metalWeight || item.weight || 0}g</span>
                                    <span>Stone: ${item.stoneWeight ? item.stoneWeight + 'g' : 'None'}</span>
                                    <span>Total: ${((item.totalWeight || item.weight || 0) * item.quantity).toFixed(2)}g</span>
                                </div>
                                ${item.notes ? `<div class="item-notes">Notes: ${item.notes}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="historyView.duplicateOrder('${order.id}'); this.closest('.modal').remove()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" "/>
                        </svg>
                        Duplicate Order
                    </button>
                    <button class="btn btn-secondary" onclick="historyView.reprintOrder('${order.id}'); this.closest('.modal').remove()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" "/>
                        </svg>
                        Reprint PDF
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" "/>
                        </svg>
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    duplicateOrder(orderId) {
        if (window.orderManager) {
            window.orderManager.loadOrderFromHistory(orderId);
        }
    }

    reprintOrder(orderId) {
        const order = orderHistory.getOrder(orderId);
        if (!order) return;

        if (typeof window.jsPDF !== 'undefined') {
            try {
                const pdfGenerator = new PDFGenerator();
                pdfGenerator.generateWorkOrder(order);
                if (window.orderManager) {
                    window.orderManager.showSuccess('PDF regenerated successfully');
                }
            } catch (error) {
                console.error('PDF generation error:', error);
                if (window.orderManager) {
                    window.orderManager.showError('Failed to generate PDF');
                }
            }
        }
    }

    deleteOrder(orderId) {
        if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            if (orderHistory.deleteOrder(orderId)) {
                this.loadHistory();
                if (window.orderManager) {
                    window.orderManager.showSuccess('Order deleted');
                }
            }
        }
    }

    exportHistory() {
        const format = confirm('Export as CSV? (OK = CSV, Cancel = JSON)') ? 'csv' : 'json';
        const data = orderHistory.exportOrders(format);
        
        const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order-history-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        
        if (window.orderManager) {
            window.orderManager.showSuccess(`History exported as ${format.toUpperCase()}`);
        }
    }

    showImportDialog() {
        const dialog = document.getElementById('import-dialog');
        if (dialog) {
            dialog.style.display = 'flex';
        }
    }

    closeImportDialog() {
        const dialog = document.getElementById('import-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
        document.getElementById('import-file').value = '';
    }

    importOrders() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const count = orderHistory.importOrders(e.target.result, 'json');
                this.closeImportDialog();
                this.loadHistory();
                if (window.orderManager) {
                    window.orderManager.showSuccess(`Imported ${count} orders`);
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Failed to import orders. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize history view
const historyView = new HistoryView();