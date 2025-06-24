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
        this.setupProductSearchListener();
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
                this.currentOrder.customerId = null; // Reset customer ID when typing
                this.selectedCustomer = null; // Reset selected customer when typing
                this.clearCustomerValidationError(); // Clear validation errors while typing
                this.updateOrderSummary();
                this.saveDraftOrder();
                this.showCustomerSuggestions(e.target.value.trim());
                this.updateProductSearchState(); // Update product search state when customer changes
            });

            customerNameInput.addEventListener('blur', (e) => {
                // Validate customer name when user leaves the field
                if (e.target.value.trim()) {
                    this.validateCustomerName();
                }
            });

            customerNameInput.addEventListener('focus', (e) => {
                if (e.target.value.trim()) {
                    this.showCustomerSuggestions(e.target.value.trim());
                }
            });

            // Close suggestions when clicking outside (with delay to allow item selection)
            document.addEventListener('click', (e) => {
                if (!searchWrapper.contains(e.target)) {
                    // Use setTimeout to allow item selection handlers to execute first
                    setTimeout(() => {
                        this.hideCustomerSuggestions();
                    }, 0);
                }
            });
            
            // Add event delegation for customer result clicks with multiple approaches
            const resultsContainer = document.getElementById('customer-search-results');
            if (resultsContainer) {
                console.log('🔧 Setting up customer event delegation');
                
                // Method 1: Event delegation
                resultsContainer.addEventListener('click', (e) => {
                    console.log('🔍 Customer results container clicked', e.target);
                    const customerItem = e.target.closest('.customer-result');
                    if (customerItem && customerItem.dataset.customerId) {
                        console.log('🎯 Customer item clicked:', customerItem.dataset.customerId);
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        this.selectCustomer(customerItem.dataset.customerId);
                    }
                });
                
                // Method 2: Fallback with mousedown
                resultsContainer.addEventListener('mousedown', (e) => {
                    const customerItem = e.target.closest('.customer-result');
                    if (customerItem && customerItem.dataset.customerId) {
                        console.log('🎯 Customer mousedown:', customerItem.dataset.customerId);
                        e.preventDefault();
                        this.selectCustomer(customerItem.dataset.customerId);
                    }
                });
            } else {
                console.error('❌ customer-search-results container not found');
            }
        }
    }

    setupProductSearchListener() {
        const productSearchInput = document.getElementById('product-search');
        if (productSearchInput) {
            // Clear any existing selected product data
            this.selectedProduct = null;
            
            // Initially disable product search
            this.updateProductSearchState();

            productSearchInput.addEventListener('input', (e) => {
                console.log('🔍 Product input event triggered');
                console.log('🔍 Current value:', e.target.value);
                console.log('🔍 Customer name:', this.currentOrder.customerName);
                console.log('🔍 Customer ID:', this.currentOrder.customerId);
                
                // Check if customer is selected
                if (!this.currentOrder.customerName || !this.currentOrder.customerId) {
                    console.log('❌ Customer validation failed - blocking product search');
                    e.preventDefault();
                    this.showProductValidationError('Önce bir müşteri seçmelisiniz');
                    productSearchInput.value = '';
                    return;
                }
                
                console.log('✅ Customer validation passed - proceeding with product search');
                
                // Only reset selected product if the value changed from the selected product
                const currentValue = e.target.value.trim();
                console.log('🔍 Input event - currentValue:', currentValue);
                console.log('🔍 Input event - selectedProduct before check:', this.selectedProduct);
                if (this.selectedProduct && this.selectedProduct.code.toLowerCase() !== currentValue.toLowerCase()) {
                    console.log('🔍 Input event - CLEARING selectedProduct because value changed');
                    this.selectedProduct = null; // Reset only if user is typing something different
                } else {
                    console.log('🔍 Input event - selectedProduct preserved');
                }
                
                this.clearProductValidationError();
                console.log('🔍 About to call showProductSuggestions with:', currentValue);
                this.showProductSuggestions(currentValue);
                console.log('🔍 showProductSuggestions call completed');
            });

            productSearchInput.addEventListener('focus', (e) => {
                // Check if customer is selected
                if (!this.currentOrder.customerName || !this.currentOrder.customerId) {
                    this.showProductValidationError('Önce bir müşteri seçmelisiniz');
                    productSearchInput.blur();
                    return;
                }
                
                this.showProductSuggestions(e.target.value.trim());
            });

            // Close suggestions when clicking outside (with delay to allow item selection)
            document.addEventListener('click', (e) => {
                const searchWrapper = productSearchInput.parentElement;
                if (!searchWrapper.contains(e.target)) {
                    // Use setTimeout to allow item selection handlers to execute first
                    setTimeout(() => {
                        this.hideProductSuggestions();
                    }, 0);
                }
            });
            
            // Add event delegation for product result clicks with multiple approaches
            const productResultsContainer = document.getElementById('search-results');
            if (productResultsContainer) {
                console.log('🔧 Setting up product event delegation');
                
                // Method 1: Event delegation with enhanced debugging
                productResultsContainer.addEventListener('click', (e) => {
                    console.log('🔍 Product results container clicked');
                    console.log('🔍 Clicked element:', e.target);
                    console.log('🔍 Element classes:', e.target.className);
                    console.log('🔍 Element dataset:', e.target.dataset);
                    
                    const productItem = e.target.closest('.product-result');
                    console.log('🔍 Closest .product-result found:', productItem);
                    
                    if (productItem) {
                        console.log('🔍 Product item classes:', productItem.className);
                        console.log('🔍 Product item dataset:', productItem.dataset);
                        console.log('🔍 Product code from dataset:', productItem.dataset.productCode);
                        
                        if (productItem.dataset.productCode) {
                            console.log('🎯 Product item clicked:', productItem.dataset.productCode);
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            this.selectProductFromSearch(productItem.dataset.productCode);
                        } else {
                            console.log('❌ Product item found but no productCode in dataset');
                        }
                    } else {
                        console.log('❌ No .product-result found with closest()');
                    }
                });
                
                // Method 2: Fallback with mousedown
                productResultsContainer.addEventListener('mousedown', (e) => {
                    const productItem = e.target.closest('.product-result');
                    if (productItem && productItem.dataset.productCode) {
                        console.log('🎯 Product mousedown:', productItem.dataset.productCode);
                        e.preventDefault();
                        this.selectProductFromSearch(productItem.dataset.productCode);
                    }
                });
            } else {
                console.error('❌ search-results container not found');
            }
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
                    <p>Müşteri bulunamadı</p>
                    <span class="no-results-hint">Lütfen mevcut müşterilerden birini seçin</span>
                </div>
            `;
            resultsContainer.style.display = 'block';
            return;
        }

        resultsContainer.innerHTML = suggestions.map(customer => `
            <div class="search-result-item customer-result" data-customer-id="${customer.id}">
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

    showProductSuggestions(input) {
        console.log('🔍 showProductSuggestions called with input:', input);
        
        const resultsContainer = document.getElementById('search-results');
        console.log('🔍 Results container found:', resultsContainer);
        
        if (!resultsContainer) {
            console.log('❌ No results container found');
            return;
        }
        
        if (!window.productDatabase && typeof productDatabase === 'undefined') {
            console.log('❌ No productDatabase available');
            return;
        }
        
        // Use global productDatabase if window.productDatabase is not available
        const dbToUse = window.productDatabase || productDatabase;
        console.log('🔍 Using productDatabase:', dbToUse);
        
        console.log('🔍 About to call getProductSuggestions on:', dbToUse);
        const suggestions = dbToUse.getProductSuggestions(input);
        console.log('🔍 Suggestions returned:', suggestions);
        console.log('🔍 Suggestions length:', suggestions.length);
        
        if (suggestions.length === 0) {
            console.log('🔍 No suggestions found, showing no-results message');
            resultsContainer.innerHTML = `
                <div class="search-result-item no-results">
                    <p>Ürün bulunamadı</p>
                    <span class="no-results-hint">Lütfen mevcut ürünlerden birini seçin</span>
                </div>
            `;
            resultsContainer.style.display = 'block';
            console.log('🔍 No-results HTML set and display set to block');
            return;
        }

        console.log('🔍 Generating HTML for', suggestions.length, 'suggestions');
        const htmlContent = suggestions.map(product => `
            <div class="search-result-item product-result" data-product-code="${product.code}">
                <div class="product-result-info">
                    <div class="product-result-code">${product.code}</div>
                    <div class="product-result-description">${product.description}</div>
                    <div class="product-result-details">
                        ${product.totalWeight || product.weight || 0}g | ${product.material}
                    </div>
                </div>
            </div>
        `).join('');
        
        console.log('🔍 Generated HTML content (first 200 chars):', htmlContent.substring(0, 200));
        resultsContainer.innerHTML = htmlContent;
        resultsContainer.style.display = 'block';
        console.log('🔍 HTML set and display set to block');
        console.log('🔍 Final container innerHTML length:', resultsContainer.innerHTML.length);
        console.log('🔍 Container display style:', resultsContainer.style.display);
    }

    hideProductSuggestions() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    }

    selectProductFromSearch(productCode) {
        console.log('🎯 selectProductFromSearch called with code:', productCode);
        const product = productDatabase.searchByCode(productCode);
        console.log('🎯 Found product:', product);
        
        if (product) {
            const productSearchInput = document.getElementById('product-search');
            productSearchInput.value = product.code;
            this.selectedProduct = product;
            this.clearProductValidationError();
            this.hideProductSuggestions();
            
            // Product selection completed silently
            
            // Show product preview
            this.showProductPreview(product);
            
            console.log('✅ Product selection completed. selectedProduct:', this.selectedProduct);
        } else {
            console.error('❌ Product not found for code:', productCode);
        }
    }

    showProductPreview(product) {
        const preview = document.getElementById('product-preview');
        if (preview) {
            preview.innerHTML = `
                <div class="product-preview-container">
                    <div class="preview-image">
                        ${product.imageData ? `
                            <img src="${product.imageData}" alt="${product.description}" />
                        ` : `
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        `}
                    </div>
                    <div class="product-details">
                        <div class="detail-item">
                            <span class="detail-label">Kod:</span>
                            <span class="detail-value">${product.code}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Açıklama:</span>
                            <span class="detail-value">${product.description}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Metal Ağırlığı:</span>
                            <span class="detail-value">${product.metalWeight || product.weight || 0}g</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Taş Ağırlığı:</span>
                            <span class="detail-value">${product.stoneWeight ? product.stoneWeight + 'g' : 'Yok'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Toplam Ağırlık:</span>
                            <span class="detail-value">${product.totalWeight || product.weight || 0}g</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Malzeme:</span>
                            <span class="detail-value">${product.material}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Tip:</span>
                            <span class="detail-value">${product.type}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    selectCustomer(customerId) {
        console.log('🎯 selectCustomer called with ID:', customerId);
        const customer = customerDatabase.getCustomerById(customerId);
        if (customer) {
            console.log('🎯 Customer found:', customer);
            
            // Customer selection completed silently
            const customerNameInput = document.getElementById('customer-name');
            customerNameInput.value = customer.name;
            this.currentOrder.customerName = customer.name;
            this.currentOrder.customerId = customer.id; // Store customer ID for reference
            this.selectedCustomer = customer; // Set selected customer for validation
            this.clearCustomerValidationError(); // Clear any validation errors
            this.updateOrderSummary();
            this.saveDraftOrder();
            this.hideCustomerSuggestions();
            
            // Update customer stats
            customerDatabase.updateCustomerStats(customer.name);
            
            // Enable product search now that customer is selected
            this.updateProductSearchState();
            
            console.log('Customer selection completed');
        } else {
            console.error('Customer not found for ID:', customerId);
        }
    }
    
    updateProductSearchState() {
        const productSearchInput = document.getElementById('product-search');
        if (productSearchInput) {
            if (!this.currentOrder.customerName || !this.currentOrder.customerId) {
                productSearchInput.disabled = true;
                productSearchInput.placeholder = 'Önce bir müşteri seçin...';
                productSearchInput.value = '';
                this.hideProductSuggestions();
            } else {
                productSearchInput.disabled = false;
                productSearchInput.placeholder = 'Kod girin (örn. KP001) veya ada göre arayın...';
            }
        }
    }

    // Removed addNewCustomer function - customers can only be selected from existing database
    // addNewCustomer(name) {
    //     this.hideCustomerSuggestions();
    //     
    //     // Pre-fill the customer name in the add customer dialog
    //     if (window.customerManager) {
    //         customerManager.showAddCustomerDialog();
    //         setTimeout(() => {
    //             const nameInput = document.getElementById('modal-customer-name');
    //             if (nameInput) {
    //                 nameInput.value = name;
    //             }
    //         }, 100);
    //     }
    // }

    validateCustomerName() {
        const customerNameInput = document.getElementById('customer-name');
        const customerName = customerNameInput.value.trim();

        // Clear any existing validation errors
        this.clearCustomerValidationError();

        // Check if customer name is empty
        if (!customerName) {
            this.showCustomerValidationError('Müşteri adı boş olamaz');
            return false;
        }

        // Check if customer exists in database
        const existingCustomer = customerDatabase.getCustomerByName(customerName);
        if (existingCustomer) {
            // Check if the user has properly selected this customer
            if (this.currentOrder.customerId === existingCustomer.id) {
                return true; // Customer is properly selected
            } else {
                this.showCustomerValidationError(
                    'Bu müşteri adı zaten mevcut. Listeden seçin veya farklı bir ad girin.',
                    existingCustomer
                );
                return false;
            }
        } else {
            // Customer doesn't exist - show error since we require selection from dropdown
            this.showCustomerValidationError(
                'Geçerli bir müşteri seçin veya yeni müşteri ekleyin'
            );
            return false;
        }
    }

    showCustomerValidationError(message, existingCustomer = null) {
        const customerNameInput = document.getElementById('customer-name');
        const formGroup = customerNameInput.parentElement;
        
        // Remove any existing error message first
        const existingError = formGroup.querySelector('.customer-validation-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error styling to input
        customerNameInput.classList.add('error');
        
        // Create error message container
        const errorDiv = document.createElement('div');
        errorDiv.className = 'customer-validation-error';
        errorDiv.innerHTML = `
            <div class="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span>${message}</span>
            </div>
            ${existingCustomer ? `
                <div class="error-actions">
                    <button type="button" class="btn btn-sm btn-primary" onclick="orderManager.selectCustomer('${existingCustomer.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Mevcut Müşteriyi Seç
                    </button>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="orderManager.clearCustomerAndCreateNew()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 4v16m8-8H4"/>
                        </svg>
                        Yeni Müşteri Oluştur
                    </button>
                </div>
            ` : ''}
        `;
        
        formGroup.appendChild(errorDiv);
    }

    clearCustomerValidationError() {
        const customerNameInput = document.getElementById('customer-name');
        const formGroup = customerNameInput.parentElement;
        
        // Remove error styling
        customerNameInput.classList.remove('error');
        
        // Remove error message
        const existingError = formGroup.querySelector('.customer-validation-error');
        if (existingError) {
            existingError.remove();
        }
    }

    clearCustomerAndCreateNew() {
        const customerNameInput = document.getElementById('customer-name');
        customerNameInput.value = '';
        this.currentOrder.customerName = '';
        this.currentOrder.customerId = null;
        this.clearCustomerValidationError();
        this.updateOrderSummary();
        this.saveDraftOrder();
        customerNameInput.focus();
    }

    validateProductSelection() {
        const productSearchInput = document.getElementById('product-search');
        const productValue = productSearchInput.value.trim();

        console.log('🔍 validateProductSelection called:');
        console.log('🔍 productValue:', productValue);
        console.log('🔍 this.selectedProduct:', this.selectedProduct);

        // Clear any existing validation errors
        this.clearProductValidationError();

        // Check if product field is empty
        if (!productValue) {
            console.log('🔍 Validation failed: product field is empty');
            this.showProductValidationError('Lütfen bir ürün seçin');
            return false;
        }

        // Check if a valid product is selected from dropdown
        if (!this.selectedProduct) {
            console.log('🔍 Validation failed: no product selected from dropdown');
            this.showProductValidationError('Lütfen listeden bir ürün seçin');
            return false;
        }

        // Verify the selected product matches what's in the input (case-insensitive)
        if (this.selectedProduct.code.toLowerCase() !== productValue.toLowerCase()) {
            console.log('🔍 Validation failed: product code mismatch');
            console.log('🔍 selectedProduct.code:', this.selectedProduct.code.toLowerCase());
            console.log('🔍 productValue:', productValue.toLowerCase());
            this.showProductValidationError('Lütfen listeden bir ürün seçin');
            return false;
        }

        console.log('🔍 Product validation passed!');
        return true;
    }

    showProductValidationError(message) {
        const productSearchInput = document.getElementById('product-search');
        const formGroup = productSearchInput.parentElement.parentElement;
        
        // Remove any existing error message first
        const existingError = formGroup.querySelector('.product-validation-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error styling to input
        productSearchInput.classList.add('error');
        
        // Create error message container
        const errorDiv = document.createElement('div');
        errorDiv.className = 'product-validation-error';
        errorDiv.innerHTML = `
            <div class="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        formGroup.appendChild(errorDiv);
    }

    clearProductValidationError() {
        const productSearchInput = document.getElementById('product-search');
        const formGroup = productSearchInput.parentElement.parentElement;
        
        // Remove error styling
        productSearchInput.classList.remove('error');
        
        // Remove error message
        const existingError = formGroup.querySelector('.product-validation-error');
        if (existingError) {
            existingError.remove();
        }
    }

    addItem() {
        const productSearch = document.getElementById('product-search');
        const quantity = document.getElementById('quantity');
        const notes = document.getElementById('item-notes');

        const productCode = productSearch.value.trim();
        const qty = parseInt(quantity.value);
        const itemNotes = notes.value.trim();

        // Validate customer name first
        if (!this.validateCustomerName()) {
            return;
        }

        // Validate product selection
        if (!this.validateProductSelection()) {
            return;
        }

        const product = this.selectedProduct;

        if (qty < 1 || qty > 999) {
            this.showError('Miktar 1 ile 999 arasında olmalıdır');
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
        this.showSuccess(`${qty}x ${product.code} siparişe eklendi`);
    }

    removeItem(productCode) {
        this.currentOrder.items = this.currentOrder.items.filter(item => item.code !== productCode);
        this.updateOrderSummary();
        this.renderOrderItems();
        this.saveDraftOrder();
        this.showSuccess('Öğe siparişten çıkarıldı');
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

        // Safely update DOM elements only if they exist
        const totalItemsEl = document.getElementById('total-items');
        if (totalItemsEl) totalItemsEl.textContent = this.currentOrder.totalItems;
        
        const totalMetalWeightEl = document.getElementById('total-metal-weight');
        if (totalMetalWeightEl) totalMetalWeightEl.textContent = this.currentOrder.totalMetalWeight.toFixed(2) + 'g';
        
        const totalStoneWeightEl = document.getElementById('total-stone-weight');
        if (totalStoneWeightEl) totalStoneWeightEl.textContent = this.currentOrder.totalStoneWeight.toFixed(2) + 'g';
        
        const totalWeightEl = document.getElementById('total-weight');
        if (totalWeightEl) totalWeightEl.textContent = this.currentOrder.totalWeight.toFixed(2) + 'g';
        
        const orderDateEl = document.getElementById('order-date');
        if (orderDateEl) orderDateEl.textContent = this.currentOrder.date;
        
        const summaryCustomerEl = document.getElementById('summary-customer');
        if (summaryCustomerEl) summaryCustomerEl.textContent = this.currentOrder.customerName || '-';

        const orderSummary = document.getElementById('order-summary');
        const orderActions = document.getElementById('order-actions');
        
        if (this.currentOrder.items.length > 0) {
            if (orderSummary) orderSummary.style.display = 'block';
            if (orderActions) orderActions.style.display = 'block';
        } else {
            if (orderSummary) orderSummary.style.display = 'none';
            if (orderActions) orderActions.style.display = 'none';
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
        
        if (confirm('Mevcut siparişi temizlemek istediğinizden emin misiniz?')) {
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
            this.showSuccess('Sipariş temizlendi');
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
            // Auto-save as default draft (existing behavior)
            localStorage.setItem('jewelryOrderDraft', JSON.stringify(this.currentOrder));
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    }

    saveDraftWithName(draftName) {
        try {
            const timestamp = new Date().getTime();
            const draftKey = `jewelryOrderDraft_${timestamp}`;
            const draftData = {
                ...this.currentOrder,
                draftName: draftName || `Taslak ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
                savedAt: timestamp
            };
            localStorage.setItem(draftKey, JSON.stringify(draftData));
            return draftKey;
        } catch (error) {
            console.error('Error saving named draft:', error);
            return null;
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

    async generatePDF() {
        if (this.currentOrder.items.length === 0) {
            this.showError('PDF oluşturmak için siparişte öğe yok');
            return;
        }

        // Validate customer name before generating PDF
        if (!this.validateCustomerName()) {
            document.getElementById('customer-name').focus();
            return;
        }

        // Show preview instead of direct download
        await this.previewPDF();
    }

    async previewPDF() {
        try {
            // Generate PDF blob for preview (silent generation - no notifications)
            const pdfGenerator = new PDFGenerator();
            const pdfResult = await pdfGenerator.generateWorkOrderBlob(this.currentOrder);
            
            // Create URL for the blob
            const pdfUrl = URL.createObjectURL(pdfResult.blob);
            
            // Store the blob and filename for later download
            this.currentPDFBlob = pdfResult.blob;
            this.currentPDFFilename = pdfResult.filename;
            
            // Show the PDF in preview modal
            const iframe = document.getElementById('pdf-preview-frame');
            iframe.src = pdfUrl;
            
            // Open the modal
            const modal = document.getElementById('pdf-preview-modal');
            modal.style.display = 'block';
            
            // Clean up URL after a delay to prevent memory leaks
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
            
        } catch (error) {
            console.error('PDF preview error:', error);
            this.showError('PDF önizleme başarısız. Doğrudan indirme deneniyor...');
            
            // Fallback to direct download
            await this.fallbackToDirectDownload();
        }
    }

    async fallbackToDirectDownload() {
        try {
            // Try jsPDF with async loading
            const pdfGenerator = new PDFGenerator();
            await pdfGenerator.generateWorkOrder(this.currentOrder);
            this.showSuccess('PDF başarıyla oluşturuldu');
            
            // Save to order history
            this.saveToHistory();
            return;
        } catch (error) {
            console.error('jsPDF error:', error);
            this.showError('jsPDF başarısız, alternatif yöntem deneniyor...');
        }

        // Fallback to offline PDF generator
        try {
            console.log('Using offline PDF generator');
            const offlinePdfGenerator = new OfflinePDFGenerator();
            offlinePdfGenerator.generateWorkOrder(this.currentOrder);
            this.showSuccess('İş emri yazdırma dostu formatta açıldı. Tarayıcınızın "Yazdır" veya "PDF olarak kaydet" seçeneğini kullanın.');
            
            // Save to order history
            this.saveToHistory();
        } catch (error) {
            console.error('Offline PDF error:', error);
            
            // Final fallback - show instructions
            this.showError('PDF oluşturma başarısız. Lütfen mevcut sayfayı PDF olarak kaydetmek için tarayıcınızın yazdırma fonksiyonunu (Ctrl+P) kullanın.');
            
            // Optionally show print dialog
            setTimeout(() => {
                if (confirm('Şimdi yazdırma penceresini açmak ister misiniz?')) {
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
        this.showSuccess('Taslak yüklendi');
    }

    saveDraft() {
        if (this.currentOrder.items.length === 0) {
            this.showError('Kaydedilecek öğe yok');
            return;
        }
        
        this.saveDraftOrder();
        this.showSuccess('Taslak kaydedildi');
    }

    saveToHistory() {
        if (typeof orderHistory !== 'undefined') {
            const savedOrder = orderHistory.addOrder(this.currentOrder);
            if (savedOrder) {
                this.showSuccess('Sipariş geçmişe kaydedildi');
                
            } else {
                this.showError('Siparişi geçmişe kaydetme başarısız');
            }
        }
    }

    startNewOrder() {
        if (this.currentOrder.items.length === 0) {
            this.showError('Yeni sipariş oluşturmak için mevcut sipariş zaten boş');
            return;
        }
        
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
        this.showSuccess('Yeni sipariş oluşturuldu');
    }

    viewHistory() {
        // Switch to history tab
        const historyTab = document.querySelector('[data-tab="history"]');
        if (historyTab) {
            historyTab.click();
        } else {
            this.showNotification('Sipariş geçmişi mevcut değil', 'error');
        }
    }

    loadOrderFromHistory(orderId) {
        if (typeof orderHistory === 'undefined') {
            this.showError('Sipariş geçmişi mevcut değil');
            return;
        }

        const historicalOrder = orderHistory.getOrder(orderId);
        if (!historicalOrder) {
            this.showError('Sipariş bulunamadı');
            return;
        }

        // Confirm before loading
        if (this.currentOrder.items.length > 0) {
            if (!confirm('Bu siparişi yüklemek mevcut siparişinizi değiştirecek. Devam et?')) {
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
        
        this.showSuccess(`Sipariş geçmişten yüklendi (Orijinal: ${historicalOrder.orderNumber})`);
    }

    // Draft Management Methods
    getDraftsList() {
        const drafts = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('jewelryOrderDraft_')) {
                    const draftData = localStorage.getItem(key);
                    if (draftData) {
                        const draft = JSON.parse(draftData);
                        drafts.push({
                            key: key,
                            name: draft.draftName || 'İsimsiz Taslak',
                            customerName: draft.customerName || 'Müşteri belirtilmemiş',
                            itemCount: draft.items ? draft.items.length : 0,
                            savedAt: draft.savedAt || 0,
                            data: draft
                        });
                    }
                }
            }
            
            // Sort by saved date (newest first)
            drafts.sort((a, b) => b.savedAt - a.savedAt);
            
            // Also include the default draft if it exists
            const defaultDraft = localStorage.getItem('jewelryOrderDraft');
            if (defaultDraft) {
                const draft = JSON.parse(defaultDraft);
                if (draft.items && draft.items.length > 0) {
                    drafts.unshift({
                        key: 'jewelryOrderDraft',
                        name: 'Otomatik Taslak',
                        customerName: draft.customerName || 'Müşteri belirtilmemiş',
                        itemCount: draft.items ? draft.items.length : 0,
                        savedAt: 0,
                        data: draft,
                        isDefault: true
                    });
                }
            }
            
        } catch (error) {
            console.error('Error getting drafts list:', error);
        }
        return drafts;
    }

    viewDrafts() {
        const modal = document.getElementById('draft-modal');
        if (modal) {
            this.renderDraftsList();
            modal.style.display = 'block';
        }
    }

    closeDraftModal() {
        const modal = document.getElementById('draft-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    renderDraftsList() {
        const draftsContainer = document.getElementById('drafts-list');
        if (!draftsContainer) return;

        const drafts = this.getDraftsList();
        
        if (drafts.length === 0) {
            draftsContainer.innerHTML = `
                <div class="no-drafts">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                    </svg>
                    <p>Henüz kaydedilmiş taslak bulunmuyor</p>
                </div>
            `;
            return;
        }

        const draftsHTML = drafts.map(draft => {
            const date = draft.savedAt ? new Date(draft.savedAt).toLocaleDateString() : 'Bilinmiyor';
            const time = draft.savedAt ? new Date(draft.savedAt).toLocaleTimeString() : '';
            
            return `
                <div class="draft-item">
                    <div class="draft-info">
                        <div class="draft-name">${draft.name}</div>
                        <div class="draft-details">
                            <span class="draft-customer">👤 ${draft.customerName}</span>
                            <span class="draft-items">📦 ${draft.itemCount} öğe</span>
                            <span class="draft-date">📅 ${date} ${time}</span>
                        </div>
                    </div>
                    <div class="draft-actions">
                        <button class="btn btn-sm btn-primary" onclick="orderManager.loadSpecificDraft('${draft.key}')" title="Taslağı Yükle">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                            </svg>
                        </button>
                        ${!draft.isDefault ? `
                            <button class="btn btn-sm btn-secondary" onclick="orderManager.renameDraft('${draft.key}')" title="Yeniden Adlandır">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="orderManager.deleteDraft('${draft.key}')" title="Sil">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
                                    <path d="M10 11v6M14 11v6"/>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        draftsContainer.innerHTML = draftsHTML;
    }

    loadSpecificDraft(draftKey) {
        try {
            const draftData = localStorage.getItem(draftKey);
            if (draftData) {
                const draft = JSON.parse(draftData);
                if (draft.items && draft.items.length > 0) {
                    this.currentOrder = {
                        items: draft.items,
                        orderNumber: this.generateOrderNumber(), // Generate new order number
                        date: new Date().toLocaleDateString(), // Use current date
                        customerName: draft.customerName || '',
                        totalWeight: draft.totalWeight || 0,
                        totalItems: draft.totalItems || 0
                    };
                    
                    // Restore customer name in input field
                    const customerNameInput = document.getElementById('customer-name');
                    if (customerNameInput && this.currentOrder.customerName) {
                        customerNameInput.value = this.currentOrder.customerName;
                    }
                    
                    this.updateOrderSummary();
                    this.renderOrderItems();
                    this.closeDraftModal();
                    this.showSuccess(`Taslak yüklendi: ${draft.draftName || 'İsimsiz Taslak'}`);
                } else {
                    this.showError('Taslakta öğe bulunamadı');
                }
            } else {
                this.showError('Taslak bulunamadı');
            }
        } catch (error) {
            console.error('Error loading specific draft:', error);
            this.showError('Taslak yüklenirken hata oluştu');
        }
    }

    deleteDraft(draftKey) {
        if (draftKey === 'jewelryOrderDraft') {
            this.showError('Otomatik taslak silinemez');
            return;
        }
        
        const draft = localStorage.getItem(draftKey);
        if (draft) {
            const draftData = JSON.parse(draft);
            const draftName = draftData.draftName || 'İsimsiz Taslak';
            
            if (confirm(`"${draftName}" taslağını silmek istediğinizden emin misiniz?`)) {
                try {
                    localStorage.removeItem(draftKey);
                    this.renderDraftsList();
                    this.showSuccess('Taslak silindi');
                } catch (error) {
                    console.error('Error deleting draft:', error);
                    this.showError('Taslak silinirken hata oluştu');
                }
            }
        }
    }

    renameDraft(draftKey) {
        const draft = localStorage.getItem(draftKey);
        if (draft) {
            const draftData = JSON.parse(draft);
            const currentName = draftData.draftName || 'İsimsiz Taslak';
            const newName = prompt('Yeni taslak adını girin:', currentName);
            
            if (newName && newName.trim() && newName.trim() !== currentName) {
                try {
                    draftData.draftName = newName.trim();
                    localStorage.setItem(draftKey, JSON.stringify(draftData));
                    this.renderDraftsList();
                    this.showSuccess('Taslak yeniden adlandırıldı');
                } catch (error) {
                    console.error('Error renaming draft:', error);
                    this.showError('Taslak yeniden adlandırılırken hata oluştu');
                }
            }
        }
    }

    saveDraftWithCustomName() {
        if (this.currentOrder.items.length === 0) {
            this.showError('Kaydedilecek öğe yok');
            return;
        }

        const draftName = prompt('Taslak adını girin:', `Taslak ${new Date().toLocaleDateString()}`);
        if (draftName && draftName.trim()) {
            const draftKey = this.saveDraftWithName(draftName.trim());
            if (draftKey) {
                this.renderDraftsList();
                this.showSuccess('Taslak kaydedildi');
            } else {
                this.showError('Taslak kaydedilemedi');
            }
        }
    }
}

// Global functions for PDF preview modal
function closePDFPreview() {
    const modal = document.getElementById('pdf-preview-modal');
    modal.style.display = 'none';
    
    // Clear iframe source to free memory
    const iframe = document.getElementById('pdf-preview-frame');
    iframe.src = '';
    
    // Clear stored PDF data
    if (orderManager.currentPDFBlob) {
        orderManager.currentPDFBlob = null;
        orderManager.currentPDFFilename = null;
    }
}

function downloadPDFFromPreview() {
    if (!orderManager.currentPDFBlob || !orderManager.currentPDFFilename) {
        orderManager.showError('PDF verileri bulunamadı');
        return;
    }
    
    try {
        // Create download link and trigger download
        const url = URL.createObjectURL(orderManager.currentPDFBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = orderManager.currentPDFFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Close modal and show success
        closePDFPreview();
        orderManager.showSuccess('PDF başarıyla indirildi');
        
        // Save to order history
        orderManager.saveToHistory();
        
    } catch (error) {
        console.error('PDF download error:', error);
        orderManager.showError('PDF indirme başarısız');
    }
}

function regeneratePDFPreview() {
    // Close current preview
    closePDFPreview();
    
    // Generate new preview
    setTimeout(() => {
        orderManager.previewPDF();
    }, 100);
}

const orderManager = new OrderManager();