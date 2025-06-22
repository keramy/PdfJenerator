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
        if (!input || input.length < 2) return [];
        
        const suggestions = this.products.filter(product => 
            product.code.toLowerCase().startsWith(input.toLowerCase()) ||
            product.description.toLowerCase().includes(input.toLowerCase())
        );
        
        return suggestions.slice(0, 10);
    }

    getProductTypes() {
        return [...new Set(this.products.map(product => product.type))];
    }

    getMaterials() {
        return [...new Set(this.products.map(product => product.material))];
    }
}

const productDatabase = new ProductDatabase();