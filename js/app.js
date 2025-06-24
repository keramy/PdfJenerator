class App {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        // this.setupSearch(); // Disabled - orderManager.js handles product search with enhanced validation
        this.setupModalEvents();
        this.setupFormValidation();
        
        // Wait for other components to load
        setTimeout(() => {
            this.initializeComponents();
        }, 100);
    }

    setupNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const tabPanels = document.querySelectorAll('.tab-panel');

        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Remove active class from all tabs and panels
                navTabs.forEach(t => t.classList.remove('active'));
                tabPanels.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding panel
                tab.classList.add('active');
                const targetPanel = document.getElementById(`${targetTab}-tab`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    setupSearch() {
        const productSearch = document.getElementById('product-search');
        const searchResults = document.getElementById('search-results');

        if (productSearch && searchResults) {
            let searchTimeout;

            productSearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();

                if (query.length < 2) {
                    searchResults.style.display = 'none';
                    return;
                }

                searchTimeout = setTimeout(() => {
                    this.performSearch(query, searchResults);
                }, 300);
            });

            productSearch.addEventListener('blur', () => {
                // Delay hiding results to allow clicks
                setTimeout(() => {
                    searchResults.style.display = 'none';
                }, 200);
            });

            productSearch.addEventListener('focus', () => {
                if (productSearch.value.length >= 2) {
                    this.performSearch(productSearch.value, searchResults);
                }
            });
        }
    }

    performSearch(query, resultsContainer) {
        if (!productDatabase || !productDatabase.products.length) {
            return;
        }

        const suggestions = productDatabase.getSuggestions(query);
        
        if (suggestions.length === 0) {
            resultsContainer.style.display = 'none';
            return;
        }

        const resultsHTML = suggestions.map(product => `
            <div class="search-result" onclick="app.selectSearchResult('${product.code}')">
                <div class="result-image">
                    ${product.imageData ? `
                        <img src="${product.imageData}" alt="${product.description}" />
                    ` : `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    `}
                </div>
                <div class="result-content">
                    <div class="result-code">${product.code}</div>
                    <div class="result-description">${product.description}</div>
                </div>
            </div>
        `).join('');

        resultsContainer.innerHTML = resultsHTML;
        resultsContainer.style.display = 'block';
    }

    // Legacy method - no longer used since orderManager.js handles product selection
    selectSearchResult(code) {
        const product = productDatabase.searchByCode(code);
        if (product) {
            const productSearch = document.getElementById('product-search');
            const searchResults = document.getElementById('search-results');
            
            if (productSearch) {
                productSearch.value = product.code;
            }
            
            if (searchResults) {
                searchResults.style.display = 'none';
            }

            this.showProductPreview(product);
        }
    }

    showProductPreview(product) {
        if (productManager) {
            productManager.showProductPreview(product);
        }
    }

    setupModalEvents() {
        const modal = document.getElementById('product-modal');
        
        if (modal) {
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (productManager) {
                        productManager.closeModal();
                    }
                }
            });

            // Close modal with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    if (productManager) {
                        productManager.closeModal();
                    }
                }
            });
        }
    }

    setupFormValidation() {
        const itemForm = document.getElementById('item-form');
        if (itemForm) {
            itemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (orderManager) {
                    orderManager.addItem();
                }
            });
        }

        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (productManager) {
                    productManager.saveProduct();
                }
            });
        }

        // Real-time validation for product code
        const productCodeInput = document.getElementById('product-code');
        if (productCodeInput) {
            productCodeInput.addEventListener('input', this.validateProductCode);
        }
    }

    validateProductCode(e) {
        const code = e.target.value.trim().toUpperCase();
        e.target.value = code;

        // Basic format validation (letters followed by numbers)
        const isValidFormat = /^[A-Z]{1,3}\d{1,4}$/.test(code);
        
        if (code.length > 0 && !isValidFormat) {
            e.target.setCustomValidity('Product code should be in format like KP001, ABC123, etc.');
        } else {
            e.target.setCustomValidity('');
        }
    }

    initializeComponents() {
        // Initialize order manager if not already done
        if (typeof orderManager === 'undefined') {
            window.orderManager = new OrderManager();
        }

        // Initialize product manager if not already done
        if (typeof productManager === 'undefined') {
            window.productManager = new ProductManager();
        }

        // Set initial order date
        const orderDate = document.getElementById('order-date');
        if (orderDate) {
            orderDate.textContent = new Date().toLocaleDateString();
        }

        console.log('Jewelry Work Order System initialized successfully');
    }

    // Utility methods
    formatWeight(weight) {
        return parseFloat(weight).toFixed(2) + 'g';
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        if (orderManager) {
            orderManager.showError(`An error occurred${context ? ' in ' + context : ''}. Please try again.`);
        } else {
            alert(`An error occurred${context ? ' in ' + context : ''}. Please try again.`);
        }
    }
}

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    
    // Show fix status indicator
    setTimeout(() => {
        const fixStatusEl = document.getElementById('fix-status');
        
        // Check if fixes are active
        const hasEventDelegation = typeof orderManager !== 'undefined' && 
                                   typeof orderManager.selectCustomer === 'function';
        const hasJsPDFEnhancement = typeof window.ensureJsPDF === 'function';
        
        if (hasEventDelegation && hasJsPDFEnhancement && fixStatusEl) {
            fixStatusEl.style.display = 'block';
            // Hide after 3 seconds
            setTimeout(() => {
                fixStatusEl.style.opacity = '0';
                fixStatusEl.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    fixStatusEl.style.display = 'none';
                }, 500);
            }, 3000);
        }
    }, 2000);
});

// Enhanced jsPDF detection
window.addEventListener('load', () => {
    // Use the new ensureJsPDF function if available
    if (typeof window.ensureJsPDF === 'function') {
        window.ensureJsPDF().then(() => {
            console.log('jsPDF library confirmed loaded and ready');
        }).catch((error) => {
            console.error('Failed to load jsPDF:', error);
            setTimeout(() => {
                if (typeof window.orderManager !== 'undefined') {
                    window.orderManager.showError('PDF library failed to load. Please refresh the page or check your internet connection.');
                }
            }, 2000);
        });
    } else {
        // Fallback to old detection method
        setTimeout(() => {
            if (typeof window.jsPDF === 'undefined') {
                console.warn('jsPDF library not loaded. PDF generation will not work.');
                if (typeof window.orderManager !== 'undefined') {
                    window.orderManager.showError('PDF library not loaded. Please refresh the page.');
                }
            } else {
                console.log('jsPDF library loaded successfully');
            }
        }, 1000);
    }
});