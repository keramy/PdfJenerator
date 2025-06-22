class ProductManager {
    constructor() {
        this.filteredProducts = [];
        this.currentEditingProduct = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const productFilter = document.getElementById('product-filter');
        const materialFilter = document.getElementById('material-filter');
        const typeFilter = document.getElementById('type-filter');

        if (productFilter) {
            productFilter.addEventListener('input', this.filterProducts.bind(this));
        }
        if (materialFilter) {
            materialFilter.addEventListener('change', this.filterProducts.bind(this));
        }
        if (typeFilter) {
            typeFilter.addEventListener('change', this.filterProducts.bind(this));
        }

        setTimeout(() => {
            this.loadProducts();
        }, 100);
    }

    loadProducts() {
        if (productDatabase && productDatabase.products.length > 0) {
            this.filteredProducts = productDatabase.getAllProducts();
            this.renderProducts();
        } else {
            setTimeout(() => this.loadProducts(), 500);
        }
    }

    filterProducts() {
        const searchTerm = document.getElementById('product-filter')?.value.toLowerCase() || '';
        const materialFilter = document.getElementById('material-filter')?.value || '';
        const typeFilter = document.getElementById('type-filter')?.value || '';

        this.filteredProducts = productDatabase.getAllProducts().filter(product => {
            const matchesSearch = !searchTerm || 
                product.code.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm);
            
            const matchesMaterial = !materialFilter || product.material === materialFilter;
            const matchesType = !typeFilter || product.type === typeFilter;

            return matchesSearch && matchesMaterial && matchesType;
        });

        this.renderProducts();
    }

    renderProducts() {
        const container = document.getElementById('products-grid');
        if (!container) return;

        if (this.filteredProducts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #6c757d;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 64px; height: 64px; margin-bottom: 1rem; opacity: 0.5;">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p>No products found matching your criteria.</p>
                </div>
            `;
            return;
        }

        const productsHTML = this.filteredProducts.map(product => `
            <div class="product-card">
                <div class="product-image" ${product.imageData ? `style="background-image: url(${product.imageData}); background-size: cover; background-position: center;"` : ''}>
                    ${!product.imageData ? `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    ` : ''}
                </div>
                <div class="product-info">
                    <div class="product-header">
                        <div class="product-code">${product.code}</div>
                        <div class="product-actions">
                            <button class="btn-icon btn-edit" onclick="productManager.editProduct('${product.code}')" title="Edit product">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="btn-icon btn-select" onclick="productManager.selectProduct('${product.code}')" title="Add to order">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M12 4v16m8-8H4" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                            </button>
                            <button class="btn-icon btn-delete" onclick="productManager.deleteProduct('${product.code}')" title="Delete product">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="product-description">${product.description}</div>
                    <div class="product-specs">
                        <div class="spec">
                            <span>Metal:</span>
                            <span>${product.metalWeight || product.weight || 0}g</span>
                        </div>
                        <div class="spec">
                            <span>Stone:</span>
                            <span>${product.stoneWeight ? product.stoneWeight + 'ct' : 'None'}</span>
                        </div>
                        <div class="spec">
                            <span>Total:</span>
                            <span>${product.totalWeight || product.weight || 0}g</span>
                        </div>
                        <div class="spec">
                            <span>Material:</span>
                            <span>${product.material}</span>
                        </div>
                        <div class="spec" style="grid-column: 1 / -1;">
                            <span>Type:</span>
                            <span>${product.type}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = productsHTML;
    }

    selectProduct(code) {
        const product = productDatabase.searchByCode(code);
        if (product) {
            // Switch to orders tab
            this.switchToOrdersTab();
            
            // Fill the product search field
            const productSearch = document.getElementById('product-search');
            if (productSearch) {
                productSearch.value = product.code;
                this.showProductPreview(product);
            }
        }
    }

    switchToOrdersTab() {
        // Remove active class from all tabs
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        
        // Add active class to orders tab
        const ordersTab = document.querySelector('[data-tab="orders"]');
        const ordersPanel = document.getElementById('orders-tab');
        
        if (ordersTab) ordersTab.classList.add('active');
        if (ordersPanel) ordersPanel.classList.add('active');
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
                            <span class="detail-label">Code:</span>
                            <span class="detail-value">${product.code}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Description:</span>
                            <span class="detail-value">${product.description}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Metal Weight:</span>
                            <span class="detail-value">${product.metalWeight || product.weight || 0}g</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Stone Weight:</span>
                            <span class="detail-value">${product.stoneWeight ? product.stoneWeight + 'ct' : 'None'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Total Weight:</span>
                            <span class="detail-value">${product.totalWeight || product.weight || 0}g</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Material:</span>
                            <span class="detail-value">${product.material}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">${product.type}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    deleteProduct(code) {
        const product = productDatabase.searchByCode(code);
        if (!product) {
            if (orderManager) {
                orderManager.showError('Product not found');
            }
            return;
        }

        if (confirm(`Are you sure you want to delete product ${code}?\n\nThis action cannot be undone.`)) {
            // Find and remove the product from the database
            const index = productDatabase.products.findIndex(p => p.code === code);
            if (index > -1) {
                productDatabase.products.splice(index, 1);
                
                // Refresh the products display
                this.loadProducts();
                
                if (orderManager) {
                    orderManager.showSuccess(`Product ${code} deleted successfully`);
                }
            }
        }
    }

    showAddProduct() {
        const modal = document.getElementById('product-modal');
        const title = document.getElementById('modal-title');
        
        if (title) title.textContent = 'Add New Product';
        this.currentEditingProduct = null;
        this.clearProductForm();
        
        if (modal) {
            modal.style.display = 'block';
        }
    }

    editProduct(code) {
        const product = productDatabase.searchByCode(code);
        if (!product) {
            if (orderManager) {
                orderManager.showError('Product not found');
            }
            return;
        }

        this.currentEditingProduct = product;
        const modal = document.getElementById('product-modal');
        const title = document.getElementById('modal-title');
        
        if (title) title.textContent = 'Edit Product';
        
        // Fill form with existing data
        this.fillProductForm(product);
        
        if (modal) {
            modal.style.display = 'block';
        }
    }

    fillProductForm(product) {
        const codeInput = document.getElementById('product-code');
        const metalWeightInput = document.getElementById('product-metal-weight');
        const stoneWeightInput = document.getElementById('product-stone-weight');
        const materialSelect = document.getElementById('product-material');
        const typeSelect = document.getElementById('product-type');
        const descriptionInput = document.getElementById('product-description');

        if (codeInput) codeInput.value = product.code;
        if (metalWeightInput) metalWeightInput.value = product.metalWeight || product.weight || 0;
        if (stoneWeightInput) stoneWeightInput.value = product.stoneWeight || 0;
        if (materialSelect) materialSelect.value = product.material;
        if (typeSelect) typeSelect.value = product.type;
        if (descriptionInput) descriptionInput.value = product.description;

        // Show existing image if available
        if (product.imageData && imageHandler) {
            const preview = document.getElementById('image-preview');
            if (preview) {
                preview.innerHTML = `
                    <img src="${product.imageData}" 
                         style="max-width: 100%; max-height: 200px; border-radius: 8px;" 
                         alt="Product image">
                    <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #6c757d;">
                        Current product image
                    </p>
                `;
            }
        }
    }

    closeModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentEditingProduct = null;
        this.clearProductForm();
    }

    clearProductForm() {
        const form = document.getElementById('product-form');
        if (form) {
            form.reset();
        }
        if (imageHandler) {
            imageHandler.clearPreview();
        }
    }

    saveProduct() {
        const code = document.getElementById('product-code')?.value.trim();
        const metalWeight = document.getElementById('product-metal-weight')?.value;
        const stoneWeight = document.getElementById('product-stone-weight')?.value || 0;
        const material = document.getElementById('product-material')?.value;
        const type = document.getElementById('product-type')?.value;
        const description = document.getElementById('product-description')?.value.trim();

        if (!this.validateProductForm(code, metalWeight, stoneWeight, material, type, description)) {
            return;
        }

        // Get image data if available
        let imageData = null;
        if (imageHandler) {
            imageData = imageHandler.getImageDataURL();
        }

        if (this.currentEditingProduct) {
            // Editing existing product
            const existingProduct = productDatabase.searchByCode(this.currentEditingProduct.code);
            if (existingProduct) {
                // Check if code changed and new code already exists
                if (code.toUpperCase() !== this.currentEditingProduct.code && productDatabase.searchByCode(code)) {
                    alert('Product code already exists. Please use a different code.');
                    return;
                }

                // Update existing product
                existingProduct.code = code.toUpperCase();
                existingProduct.metalWeight = parseFloat(metalWeight).toFixed(2);
                existingProduct.stoneWeight = parseFloat(stoneWeight).toFixed(2);
                existingProduct.totalWeight = (parseFloat(metalWeight) + parseFloat(stoneWeight)).toFixed(2);
                existingProduct.material = material;
                existingProduct.type = type;
                existingProduct.description = description;
                
                if (imageData) {
                    existingProduct.imageData = imageData;
                }

                // Refresh the products display
                this.loadProducts();
                
                // Close modal and show success
                this.closeModal();
                if (orderManager) {
                    orderManager.showSuccess(`Product ${code} updated successfully`);
                }
            }
        } else {
            // Adding new product
            // Check if product code already exists
            if (productDatabase.searchByCode(code)) {
                alert('Product code already exists. Please use a different code.');
                return;
            }

            // Create new product object
            const newProduct = {
                code: code.toUpperCase(),
                metalWeight: parseFloat(metalWeight).toFixed(2),
                stoneWeight: parseFloat(stoneWeight).toFixed(2),
                totalWeight: (parseFloat(metalWeight) + parseFloat(stoneWeight)).toFixed(2),
                material: material,
                type: type,
                description: description,
                image_ref: `user_${Date.now()}`
            };

            if (imageData) {
                newProduct.imageData = imageData;
            }

            // Add to database (in a real app, this would save to backend)
            productDatabase.products.push(newProduct);
            
            // Refresh the products display
            this.loadProducts();
            
            // Close modal and show success
            this.closeModal();
            if (orderManager) {
                orderManager.showSuccess(`Product ${code} added successfully`);
            }
        }
    }

    validateProductForm(code, metalWeight, stoneWeight, material, type, description) {
        if (!code) {
            alert('Product code is required');
            return false;
        }

        if (!metalWeight || parseFloat(metalWeight) <= 0) {
            alert('Valid metal weight is required');
            return false;
        }

        if (stoneWeight && parseFloat(stoneWeight) < 0) {
            alert('Stone weight cannot be negative');
            return false;
        }

        if (!material) {
            alert('Material is required');
            return false;
        }

        if (!type) {
            alert('Product type is required');
            return false;
        }

        if (!description) {
            alert('Product description is required');
            return false;
        }

        return true;
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.products && Array.isArray(data.products)) {
                            productDatabase.products = data.products;
                            this.loadProducts();
                            if (orderManager) {
                                orderManager.showSuccess(`Imported ${data.products.length} products`);
                            }
                        } else {
                            alert('Invalid file format. Expected JSON with products array.');
                        }
                    } catch (error) {
                        alert('Error reading file: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    exportData() {
        const data = {
            products: productDatabase.getAllProducts(),
            exportDate: new Date().toISOString(),
            totalProducts: productDatabase.products.length
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `jewelry_products_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (orderManager) {
            orderManager.showSuccess('Products exported successfully');
        }
    }
}

const productManager = new ProductManager();