class OrderManager {
    constructor() {
        this.currentOrder = {
            items: [],
            orderNumber: this.generateOrderNumber(),
            date: new Date().toLocaleDateString(),
            customerName: '',
            totalWeight: 0,
            totalItems: 0
        };
        this.loadDraftOrder();
        this.setupCustomerNameListener();
    }

    generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
        return `WO-${year}${month}${day}-${time}`;
    }

    setupCustomerNameListener() {
        const customerNameInput = document.getElementById('customer-name');
        if (customerNameInput) {
            // Create customer search results container
            const searchWrapper = customerNameInput.parentElement;
            if (!searchWrapper.querySelector('.customer-search-results')) {
                const resultsDiv = document.createElement('div');
                resultsDiv.id = 'customer-search-results';
                resultsDiv.className = 'search-results customer-search-results';
                searchWrapper.appendChild(resultsDiv);
            }

            customerNameInput.addEventListener('input', (e) => {
                this.currentOrder.customerName = e.target.value.trim();
                this.updateOrderSummary();
                this.saveDraftOrder();
                this.showCustomerSuggestions(e.target.value.trim());
            });

            customerNameInput.addEventListener('focus', (e) => {
                if (e.target.value.trim()) {
                    this.showCustomerSuggestions(e.target.value.trim());
                }
            });

            // Close suggestions when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchWrapper.contains(e.target)) {
                    this.hideCustomerSuggestions();
                }
            });
        }
    }

    showCustomerSuggestions(input) {
        const resultsContainer = document.getElementById('customer-search-results');
        if (!resultsContainer || !window.customerDatabase) {
            return;
        }

        if (!input || input.length < 1) {
            resultsContainer.style.display = 'none';
            return;
        }

        const suggestions = customerDatabase.getCustomerSuggestions(input);
        
        if (suggestions.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-result-item no-results">
                    <p>No customers found</p>
                    <button class="btn btn-sm btn-primary" onclick="orderManager.addNewCustomer('${input}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" "/>
                        </svg>
                        Add "${input}" as new customer
                    </button>
                </div>
            `;
            resultsContainer.style.display = 'block';
            return;
        }

        resultsContainer.innerHTML = suggestions.map(customer => `
            <div class="search-result-item customer-result" onclick="orderManager.selectCustomer('${customer.id}')">
                <div class="customer-result-info">
                    <div class="customer-result-name">${customer.name}</div>
                    <div class="customer-result-details">
                        Code: ${customer.code} | Orders: ${customer.orderCount}
                        ${customer.email ? ` | ${customer.email}` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        resultsContainer.style.display = 'block';
    }

    hideCustomerSuggestions() {
        const resultsContainer = document.getElementById('customer-search-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    }

    selectCustomer(customerId) {
        const customer = customerDatabase.getCustomerById(customerId);
        if (customer) {
            const customerNameInput = document.getElementById('customer-name');
            customerNameInput.value = customer.name;
            this.currentOrder.customerName = customer.name;
            this.currentOrder.customerId = customer.id; // Store customer ID for reference
            this.updateOrderSummary();
            this.saveDraftOrder();
            this.hideCustomerSuggestions();
            
            // Update customer stats
            customerDatabase.updateCustomerStats(customer.name);
        }
    }

    addNewCustomer(name) {
        this.hideCustomerSuggestions();
        
        // Pre-fill the customer name in the add customer dialog
        if (window.customerManager) {
            customerManager.showAddCustomerDialog();
            setTimeout(() => {
                const nameInput = document.getElementById('modal-customer-name');
                if (nameInput) {
                    nameInput.value = name;
                }
            }, 100);
        }
    }

    addItem() {
        const productSearch = document.getElementById('product-search');
        const quantity = document.getElementById('quantity');
        const notes = document.getElementById('item-notes');

        const productCode = productSearch.value.trim();
        const qty = parseInt(quantity.value);
        const itemNotes = notes.value.trim();

        if (!productCode) {
            this.showError('Please enter a product code');
            return;
        }

        const product = productDatabase.searchByCode(productCode);
        if (!product) {
            this.showError('Product code not found');
            return;
        }

        if (qty < 1 || qty > 999) {
            this.showError('Quantity must be between 1 and 999');
            return;
        }

        const existingItemIndex = this.currentOrder.items.findIndex(item => item.code === product.code);
        if (existingItemIndex > -1) {
            this.currentOrder.items[existingItemIndex].quantity += qty;
            this.currentOrder.items[existingItemIndex].notes = itemNotes || this.currentOrder.items[existingItemIndex].notes;
        } else {
            this.currentOrder.items.push({
                code: product.code,
                description: product.description,
                metalWeight: parseFloat(product.metalWeight || product.weight || 0),
                stoneWeight: parseFloat(product.stoneWeight || 0),
                totalWeight: parseFloat(product.totalWeight || product.weight || 0),
                material: product.material,
                type: product.type,
                quantity: qty,
                notes: itemNotes,
                imageRef: product.image_ref,
                imageData: product.imageData || null
            });
        }

        this.updateOrderSummary();
        this.renderOrderItems();
        this.clearForm();
        this.saveDraftOrder();
        this.showSuccess(`Added ${qty}x ${product.code} to order`);
    }

    removeItem(productCode) {
        this.currentOrder.items = this.currentOrder.items.filter(item => item.code !== productCode);
        this.updateOrderSummary();
        this.renderOrderItems();
        this.saveDraftOrder();
        this.showSuccess('Item removed from order');
    }

    updateQuantity(productCode, newQuantity) {
        const item = this.currentOrder.items.find(item => item.code === productCode);
        if (item && newQuantity > 0 && newQuantity <= 999) {
            item.quantity = newQuantity;
            this.updateOrderSummary();
            this.renderOrderItems();
            this.saveDraftOrder();
        }
    }

    updateOrderSummary() {
        this.currentOrder.totalItems = this.currentOrder.items.reduce((sum, item) => sum + item.quantity, 0);
        this.currentOrder.totalWeight = this.currentOrder.items.reduce((sum, item) => sum + ((item.totalWeight || item.weight || 0) * item.quantity), 0);
        this.currentOrder.totalMetalWeight = this.currentOrder.items.reduce((sum, item) => sum + ((item.metalWeight || item.weight || 0) * item.quantity), 0);
        this.currentOrder.totalStoneWeight = this.currentOrder.items.reduce((sum, item) => sum + ((item.stoneWeight || 0) * item.quantity), 0);

        document.getElementById('total-items').textContent = this.currentOrder.totalItems;
        document.getElementById('total-metal-weight').textContent = this.currentOrder.totalMetalWeight.toFixed(2) + 'g';
        document.getElementById('total-stone-weight').textContent = this.currentOrder.totalStoneWeight.toFixed(2) + 'g';
        document.getElementById('total-weight').textContent = this.currentOrder.totalWeight.toFixed(2) + 'g';
        document.getElementById('order-date').textContent = this.currentOrder.date;
        document.getElementById('summary-customer').textContent = this.currentOrder.customerName || '-';

        const orderSummary = document.getElementById('order-summary');
        const orderActions = document.getElementById('order-actions');
        
        if (this.currentOrder.items.length > 0) {
            orderSummary.style.display = 'block';
            orderActions.style.display = 'block';
        } else {
            orderSummary.style.display = 'none';
            orderActions.style.display = 'none';
        }
    }

    renderOrderItems() {
        const orderItemsContainer = document.getElementById('order-items');
        
        if (this.currentOrder.items.length === 0) {
            orderItemsContainer.innerHTML = `
                <div class="empty-order">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" "/>
                    </svg>
                    <p>No items added yet</p>
                </div>
            `;
            return;
        }

        const itemsHTML = this.currentOrder.items.map(item => `
            <div class="order-item">
                <div class="item-image">
                    ${item.imageData ? `
                        <img src="${item.imageData}" alt="${item.description}" class="item-thumbnail" />
                    ` : `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" "/>
                        </svg>
                    `}
                </div>
                <div class="item-details">
                    <h4 class="item-code">${item.code}</h4>
                    <p class="item-description">${item.description}</p>
                    <div class="item-specs">
                        <span class="spec">Metal: ${item.metalWeight || item.weight || 0}g</span>
                        <span class="spec">Stone: ${item.stoneWeight ? item.stoneWeight + 'g' : 'None'}</span>
                        <span class="spec">Total: ${item.totalWeight || item.weight || 0}g</span>
                        <span class="spec">Material: ${item.material}</span>
                        <span class="spec">Type: ${item.type}</span>
                    </div>
                    ${item.notes ? `<p class="item-notes">Notes: ${item.notes}</p>` : ''}
                </div>
                <div class="item-quantity">
                    <label>Qty</label>
                    <input type="number" value="${item.quantity}" min="1" max="999" 
                           onchange="orderManager.updateQuantity('${item.code}', this.value)">
                </div>
                <div class="item-total">
                    <label class="item-total-label">Total Weight</label>
                    <span class="total-weight">${((item.totalWeight || item.weight || 0) * item.quantity).toFixed(2)}g</span>
                </div>
                <div class="item-actions">
                    <button class="btn-icon btn-danger" onclick="orderManager.removeItem('${item.code}')" title="Remove item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M18 6L6 18M6 6l12 12" "/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        orderItemsContainer.innerHTML = itemsHTML;
    }

    clearOrder() {
        if (this.currentOrder.items.length === 0) return;
        
        if (confirm('Are you sure you want to clear the current order?')) {
            this.currentOrder.items = [];
            this.currentOrder.orderNumber = this.generateOrderNumber();
            this.currentOrder.date = new Date().toLocaleDateString();
            this.currentOrder.customerName = '';
            
            // Clear customer name input
            const customerNameInput = document.getElementById('customer-name');
            if (customerNameInput) {
                customerNameInput.value = '';
            }
            
            this.updateOrderSummary();
            this.renderOrderItems();
            this.clearDraftOrder();
            this.showSuccess('Order cleared');
        }
    }

    clearForm() {
        document.getElementById('product-search').value = '';
        document.getElementById('quantity').value = '1';
        document.getElementById('item-notes').value = '';
        document.getElementById('product-preview').innerHTML = `
            <div class="preview-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" "/>
                </svg>
                <p>Select a product to see preview</p>
            </div>
        `;
    }

    saveDraftOrder() {
        try {
            localStorage.setItem('jewelryOrderDraft', JSON.stringify(this.currentOrder));
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    }

    loadDraftOrder() {
        try {
            const draft = localStorage.getItem('jewelryOrderDraft');
            if (draft) {
                const draftOrder = JSON.parse(draft);
                if (draftOrder.items && draftOrder.items.length > 0) {
                    this.currentOrder = draftOrder;
                    
                    // Restore customer name in input field
                    const customerNameInput = document.getElementById('customer-name');
                    if (customerNameInput && this.currentOrder.customerName) {
                        customerNameInput.value = this.currentOrder.customerName;
                    }
                    
                    this.updateOrderSummary();
                    this.renderOrderItems();
                }
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }

    clearDraftOrder() {
        try {
            localStorage.removeItem('jewelryOrderDraft');
        } catch (error) {
            console.error('Error clearing draft:', error);
        }
    }

    generatePDF() {
        if (this.currentOrder.items.length === 0) {
            this.showError('No items in order to generate PDF');
            return;
        }

        // Validate customer name before generating PDF
        if (!this.currentOrder.customerName) {
            this.showError('Please enter customer name before generating PDF');
            document.getElementById('customer-name').focus();
            return;
        }

        // Try jsPDF first
        if (typeof window.jsPDF !== 'undefined') {
            try {
                const pdfGenerator = new PDFGenerator();
                pdfGenerator.generateWorkOrder(this.currentOrder);
                this.showSuccess('PDF generated successfully');
                
                // Save to order history
                this.saveToHistory();
                return;
            } catch (error) {
                console.error('jsPDF error:', error);
                this.showError('jsPDF failed, trying alternative method...');
            }
        }

        // Fallback to offline PDF generator
        try {
            console.log('Using offline PDF generator');
            const offlinePdfGenerator = new OfflinePDFGenerator();
            offlinePdfGenerator.generateWorkOrder(this.currentOrder);
            this.showSuccess('Work order opened in print-friendly format. Use your browser\'s "Print" or "Save as PDF" option.');
            
            // Save to order history
            this.saveToHistory();
        } catch (error) {
            console.error('Offline PDF error:', error);
            
            // Final fallback - show instructions
            this.showError('PDF generation failed. Please use your browser\'s print function (Ctrl+P) to save the current page as PDF.');
            
            // Optionally show print dialog
            setTimeout(() => {
                if (confirm('Would you like to open the print dialog now?')) {
                    window.print();
                }
            }, 2000);
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    loadDraft() {
        this.loadDraftOrder();
        this.showSuccess('Draft loaded');
    }

    saveToHistory() {
        if (typeof orderHistory !== 'undefined') {
            const savedOrder = orderHistory.addOrder(this.currentOrder);
            if (savedOrder) {
                this.showSuccess('Order saved to history');
                
                // Ask user if they want to start a new order
                setTimeout(() => {
                    if (confirm('Order has been saved. Would you like to start a new order?')) {
                        this.clearOrder();
                    }
                }, 1000);
            } else {
                this.showError('Failed to save order to history');
            }
        }
    }

    viewHistory() {
        // Switch to history tab
        const historyTab = document.querySelector('[data-tab="history"]');
        if (historyTab) {
            historyTab.click();
        } else {
            this.showNotification('Order history not available', 'error');
        }
    }

    loadOrderFromHistory(orderId) {
        if (typeof orderHistory === 'undefined') {
            this.showError('Order history not available');
            return;
        }

        const historicalOrder = orderHistory.getOrder(orderId);
        if (!historicalOrder) {
            this.showError('Order not found');
            return;
        }

        // Confirm before loading
        if (this.currentOrder.items.length > 0) {
            if (!confirm('Loading this order will replace your current order. Continue?')) {
                return;
            }
        }

        // Load the historical order
        this.currentOrder = {
            items: [...historicalOrder.items],
            orderNumber: this.generateOrderNumber(), // Generate new order number
            date: new Date().toLocaleDateString(),
            customerName: historicalOrder.customerName,
            totalWeight: historicalOrder.totalWeight,
            totalItems: historicalOrder.totalItems
        };

        // Update UI
        const customerNameInput = document.getElementById('customer-name');
        if (customerNameInput) {
            customerNameInput.value = this.currentOrder.customerName;
        }

        this.updateOrderSummary();
        this.renderOrderItems();
        this.saveDraftOrder();
        
        // Switch to order tab
        const orderTab = document.querySelector('[data-tab="order"]');
        if (orderTab) {
            orderTab.click();
        }
        
        this.showSuccess(`Loaded order from history (Original: ${historicalOrder.orderNumber})`);
    }
}

const orderManager = new OrderManager();