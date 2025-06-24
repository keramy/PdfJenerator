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
            console.log(`Loaded ${this.products.length} products from JSON file`);
        } catch (error) {
            console.error('Error loading products from JSON:', error);
            console.log('Loading fallback product data...');
            this.loadFallbackProducts();
        }
    }

    loadFallbackProducts() {
        // Fallback product data for when JSON loading fails
        this.products = [
            {
                "code": "KP001",
                "metalWeight": "2.80",
                "stoneWeight": "0.00",
                "totalWeight": "2.80",
                "material": "Gold",
                "type": "Hoop Earrings",
                "description": "Dokulu altın halka küpe",
                "image_ref": "page1_item1"
            },
            {
                "code": "KP002", 
                "metalWeight": "2.90",
                "stoneWeight": "0.00",
                "totalWeight": "2.90",
                "material": "Gold",
                "type": "Hoop Earrings",
                "description": "Çizgili altın halka küpe",
                "image_ref": "page1_item2"
            },
            {
                "code": "KP003",
                "metalWeight": "3.20",
                "stoneWeight": "0.25",
                "totalWeight": "3.45",
                "material": "Gold",
                "type": "Stud Earrings",
                "description": "Taşlı altın tıkalı küpe",
                "image_ref": "page1_item3"
            },
            {
                "code": "KP004",
                "metalWeight": "4.50",
                "stoneWeight": "0.00",
                "totalWeight": "4.50",
                "material": "Silver",
                "type": "Drop Earrings",
                "description": "Gümüş sarkık küpe",
                "image_ref": "page1_item4"
            },
            {
                "code": "KY001",
                "metalWeight": "15.20",
                "stoneWeight": "1.50",
                "totalWeight": "16.70",
                "material": "Gold",
                "type": "Necklace",
                "description": "Taşlı altın kolye",
                "image_ref": "page2_item1"
            }
        ];
        console.log(`Loaded ${this.products.length} fallback products`);
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
            return []; // Return empty array when no input
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