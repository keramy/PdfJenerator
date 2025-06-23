class CustomerDatabase {
    constructor() {
        this.customers = [];
        this.storageKey = 'jewelryCustomerDatabase';
        this.loadCustomers();
    }

    loadCustomers() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.customers = JSON.parse(stored);
                console.log(`Loaded ${this.customers.length} customers from storage`);
            } else {
                // Initialize with empty database
                this.customers = [];
                this.saveCustomers();
            }
        } catch (error) {
            console.error('Error loading customer database:', error);
            this.customers = [];
        }
    }

    saveCustomers() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.customers));
            return true;
        } catch (error) {
            console.error('Error saving customer database:', error);
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please export your data and consider clearing old records.');
            }
            return false;
        }
    }

    generateCustomerId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `CUST_${timestamp}_${random}`;
    }

    generateCustomerCode() {
        // Generate next customer code (C001, C002, etc.)
        const existingCodes = this.customers
            .map(c => c.code)
            .filter(code => code && code.match(/^C\d+$/))
            .map(code => parseInt(code.substring(1)))
            .sort((a, b) => b - a);
        
        const nextNumber = existingCodes.length > 0 ? existingCodes[0] + 1 : 1;
        return `C${String(nextNumber).padStart(3, '0')}`;
    }

    addCustomer(customerData) {
        try {
            // Validate required fields
            if (!customerData.name || !customerData.name.trim()) {
                throw new Error('Customer name is required');
            }

            // Check for duplicate names
            const existingCustomer = this.customers.find(c => 
                c.name.toLowerCase() === customerData.name.trim().toLowerCase()
            );
            if (existingCustomer) {
                throw new Error('A customer with this name already exists');
            }

            // Create new customer object
            const customer = {
                id: this.generateCustomerId(),
                code: customerData.code || this.generateCustomerCode(),
                name: customerData.name.trim(),
                email: customerData.email ? customerData.email.trim() : '',
                phone: customerData.phone ? customerData.phone.trim() : '',
                address: {
                    street: customerData.address?.street || '',
                    city: customerData.address?.city || '',
                    state: customerData.address?.state || '',
                    zip: customerData.address?.zip || '',
                    country: customerData.address?.country || ''
                },
                notes: customerData.notes ? customerData.notes.trim() : '',
                tags: customerData.tags || [],
                createdDate: new Date().toISOString().split('T')[0],
                lastModified: new Date().toISOString().split('T')[0],
                orderCount: 0,
                totalSpent: 0
            };

            this.customers.push(customer);
            this.saveCustomers();
            
            console.log('Customer added successfully:', customer.name);
            return customer;
        } catch (error) {
            console.error('Error adding customer:', error);
            throw error;
        }
    }

    updateCustomer(customerId, updates) {
        try {
            const customerIndex = this.customers.findIndex(c => c.id === customerId);
            if (customerIndex === -1) {
                throw new Error('Customer not found');
            }

            // Validate name if being updated
            if (updates.name && updates.name.trim()) {
                const existingCustomer = this.customers.find(c => 
                    c.id !== customerId && 
                    c.name.toLowerCase() === updates.name.trim().toLowerCase()
                );
                if (existingCustomer) {
                    throw new Error('A customer with this name already exists');
                }
            }

            // Update customer data
            const customer = this.customers[customerIndex];
            customer.name = updates.name ? updates.name.trim() : customer.name;
            customer.email = updates.email !== undefined ? updates.email.trim() : customer.email;
            customer.phone = updates.phone !== undefined ? updates.phone.trim() : customer.phone;
            
            if (updates.address) {
                customer.address = {
                    street: updates.address.street || customer.address.street,
                    city: updates.address.city || customer.address.city,
                    state: updates.address.state || customer.address.state,
                    zip: updates.address.zip || customer.address.zip,
                    country: updates.address.country || customer.address.country
                };
            }
            
            customer.notes = updates.notes !== undefined ? updates.notes.trim() : customer.notes;
            customer.tags = updates.tags || customer.tags;
            customer.lastModified = new Date().toISOString().split('T')[0];

            this.saveCustomers();
            
            console.log('Customer updated successfully:', customer.name);
            return customer;
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    }

    deleteCustomer(customerId) {
        try {
            const customerIndex = this.customers.findIndex(c => c.id === customerId);
            if (customerIndex === -1) {
                throw new Error('Customer not found');
            }

            const customer = this.customers[customerIndex];
            this.customers.splice(customerIndex, 1);
            this.saveCustomers();
            
            console.log('Customer deleted successfully:', customer.name);
            return true;
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    }

    getCustomerById(customerId) {
        return this.customers.find(c => c.id === customerId);
    }

    getCustomerByName(name) {
        if (!name || !name.trim()) return null;
        return this.customers.find(c => 
            c.name.toLowerCase() === name.trim().toLowerCase()
        );
    }

    getCustomerByCode(code) {
        return this.customers.find(c => c.code === code);
    }

    searchByName(searchTerm) {
        if (!searchTerm || !searchTerm.trim()) {
            return [];
        }
        
        const term = searchTerm.toLowerCase().trim();
        return this.customers.filter(customer => 
            customer.name.toLowerCase().includes(term)
        ).sort((a, b) => a.name.localeCompare(b.name));
    }

    searchByEmail(email) {
        if (!email || !email.trim()) {
            return [];
        }
        
        return this.customers.filter(customer => 
            customer.email && customer.email.toLowerCase().includes(email.toLowerCase().trim())
        );
    }

    searchByPhone(phone) {
        if (!phone || !phone.trim()) {
            return [];
        }
        
        return this.customers.filter(customer => 
            customer.phone && customer.phone.includes(phone.trim())
        );
    }

    getAllCustomers() {
        return [...this.customers].sort((a, b) => a.name.localeCompare(b.name));
    }

    getCustomerSuggestions(input) {
        if (!input || input.length < 1) {
            return this.getAllCustomers().slice(0, 10);
        }

        const term = input.toLowerCase().trim();
        const suggestions = this.customers.filter(customer => {
            return customer.name.toLowerCase().includes(term) ||
                   customer.code.toLowerCase().includes(term) ||
                   (customer.email && customer.email.toLowerCase().includes(term)) ||
                   (customer.phone && customer.phone.includes(term));
        });

        return suggestions.sort((a, b) => {
            // Prioritize exact name matches
            const aNameMatch = a.name.toLowerCase().startsWith(term);
            const bNameMatch = b.name.toLowerCase().startsWith(term);
            
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            
            return a.name.localeCompare(b.name);
        }).slice(0, 10);
    }

    getCustomerHistory(customerId) {
        // This will integrate with order history
        const customer = this.getCustomerById(customerId);
        if (!customer) {
            return [];
        }

        // Get orders from order history that match this customer
        if (window.orderHistory) {
            return window.orderHistory.getOrdersByCustomer(customer.name);
        }
        
        return [];
    }

    updateCustomerStats(customerName) {
        // Update customer statistics based on order history
        const customer = this.customers.find(c => c.name === customerName);
        if (!customer) {
            return;
        }

        if (window.orderHistory) {
            const orders = window.orderHistory.getOrdersByCustomer(customerName);
            customer.orderCount = orders.length;
            // Note: totalSpent would require price information in orders
            this.saveCustomers();
        }
    }

    importCustomers(customersData) {
        try {
            if (!Array.isArray(customersData)) {
                throw new Error('Invalid data format. Expected an array of customers.');
            }

            let imported = 0;
            let skipped = 0;

            for (const customerData of customersData) {
                try {
                    // Check if customer already exists
                    const existing = this.customers.find(c => 
                        c.name.toLowerCase() === customerData.name?.toLowerCase()
                    );
                    
                    if (existing) {
                        skipped++;
                        continue;
                    }

                    this.addCustomer(customerData);
                    imported++;
                } catch (error) {
                    console.warn('Skipped invalid customer:', error.message);
                    skipped++;
                }
            }

            return { imported, skipped };
        } catch (error) {
            console.error('Error importing customers:', error);
            throw error;
        }
    }

    exportCustomers() {
        return {
            exportDate: new Date().toISOString(),
            customerCount: this.customers.length,
            customers: [...this.customers]
        };
    }

    getStatistics() {
        const stats = {
            totalCustomers: this.customers.length,
            customersWithEmail: this.customers.filter(c => c.email).length,
            customersWithPhone: this.customers.filter(c => c.phone).length,
            customersWithOrders: this.customers.filter(c => c.orderCount > 0).length,
            recentCustomers: this.customers.filter(c => {
                const createdDate = new Date(c.createdDate);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return createdDate >= thirtyDaysAgo;
            }).length
        };

        return stats;
    }
}

// Initialize global customer database
window.customerDatabase = new CustomerDatabase();