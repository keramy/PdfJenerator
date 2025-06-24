// Production Configuration for LIZAR KUYUMCULUK Work Order System
const APP_CONFIG = {
    // Application settings
    appName: 'LIZAR KUYUMCULUK İş Emri Sistemi',
    version: '1.0.0',
    language: 'tr-TR',
    
    // Debug mode (set to false for production)
    debug: false,
    
    // PDF Generation settings
    pdf: {
        itemsPerPage: 10,
        defaultFont: 'DejaVuSans',
        fallbackFont: 'times',
        enableImages: true,
        imageSize: { width: 14, height: 14 } // mm
    },
    
    // Storage settings
    storage: {
        prefix: 'lizar_',
        customerDB: 'customerDatabase',
        productDB: 'productDatabase',
        orderHistory: 'orderHistory',
        draftOrder: 'draftOrder'
    },
    
    // UI settings
    ui: {
        animationDuration: 300,
        searchDebounce: 300,
        maxSearchResults: 10,
        dateFormat: 'DD/MM/YYYY'
    },
    
    // Feature flags
    features: {
        customerValidation: true,
        productImages: true,
        excelExport: true,
        orderStatus: true,
        materialTracking: true
    },
    
    // Cache settings
    cache: {
        ttl: 900000, // 15 minutes in milliseconds
        maxSize: 50 // Maximum cached items
    }
};

// Make config immutable
Object.freeze(APP_CONFIG);
Object.freeze(APP_CONFIG.pdf);
Object.freeze(APP_CONFIG.storage);
Object.freeze(APP_CONFIG.ui);
Object.freeze(APP_CONFIG.features);
Object.freeze(APP_CONFIG.cache);