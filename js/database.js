class ProductDatabase {
    constructor() {
        this.products = [];
        this.loadProducts();
    }

    async loadProducts() {
        try {
            const response = await fetch('./jewelry_database.json');
            const data = await response.json();
            this.products = data.products;
            console.log(`Loaded ${this.products.length} products`);
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = [];
        }
    }

    searchByCode(code) {
        return this.products.find(product => 
            product.code.toLowerCase() === code.toLowerCase()
        );
    }

    searchByName(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.products.filter(product => 
            product.description.toLowerCase().includes(term) ||
            product.code.toLowerCase().includes(term) ||
            product.type.toLowerCase().includes(term) ||
            product.material.toLowerCase().includes(term)
        );
    }

    getAllProducts() {
        return this.products;
    }

    getProductsByType(type) {
        return this.products.filter(product => product.type === type);
    }

    getProductsByMaterial(material) {
        return this.products.filter(product => product.material === material);
    }

    validateCode(code) {
        return this.products.some(product => 
            product.code.toLowerCase() === code.toLowerCase()
        );
    }

    getSuggestions(input) {
        if (!input || input.length < 1) {
            return this.products.slice(0, 10); // Show first 10 products when empty
        }

        const term = input.toLowerCase().trim();
        const suggestions = this.products.filter(product => {
            return product.code.toLowerCase().includes(term) ||
                   product.description.toLowerCase().includes(term);
        });

        return suggestions.sort((a, b) => {
            // Prioritize exact code matches
            const aCodeMatch = a.code.toLowerCase().startsWith(term);
            const bCodeMatch = b.code.toLowerCase().startsWith(term);
            
            if (aCodeMatch && !bCodeMatch) return -1;
            if (!aCodeMatch && bCodeMatch) return 1;
            
            // Then prioritize description matches
            const aDescMatch = a.description.toLowerCase().startsWith(term);
            const bDescMatch = b.description.toLowerCase().startsWith(term);
            
            if (aDescMatch && !bDescMatch) return -1;
            if (!aDescMatch && bDescMatch) return 1;
            
            return a.code.localeCompare(b.code);
        }).slice(0, 10);
    }

    getProductSuggestions(input) {
        return this.getSuggestions(input);
    }

    getProductTypes() {
        return [...new Set(this.products.map(product => product.type))];
    }

    getMaterials() {
        return [...new Set(this.products.map(product => product.material))];
    }
}

const productDatabase = new ProductDatabase();