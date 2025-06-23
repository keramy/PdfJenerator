class OrderHistory {
    constructor() {
        this.storageKey = 'jewelryOrderHistory';
        this.orders = this.loadOrders();
    }

    loadOrders() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading order history:', error);
            return [];
        }
    }

    saveOrders() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.orders));
            return true;
        } catch (error) {
            console.error('Error saving order history:', error);
            if (error.name === 'QuotaExceededError') {
                this.showStorageFullError();
            }
            return false;
        }
    }

    addOrder(orderData) {
        const completedOrder = {
            ...orderData,
            id: this.generateUniqueId(),
            completedDate: new Date().toISOString(),
            status: 'in_production',
            version: 1
        };
        
        this.orders.unshift(completedOrder); // Add to beginning
        
        // Keep only last 500 orders to prevent storage overflow
        if (this.orders.length > 500) {
            this.orders = this.orders.slice(0, 500);
        }
        
        const success = this.saveOrders();
        
        // Update customer statistics if customer database is available
        if (success && orderData.customerName && window.customerDatabase) {
            customerDatabase.updateCustomerStats(orderData.customerName);
        }
        
        return success ? completedOrder : null;
    }

    updateOrderStatus(orderId, status) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            order.lastModified = new Date().toISOString();
            this.saveOrders();
            return order;
        }
        return null;
    }

    getOrder(orderId) {
        return this.orders.find(o => o.id === orderId);
    }

    getOrderByNumber(orderNumber) {
        return this.orders.find(o => o.orderNumber === orderNumber);
    }

    getAllOrders() {
        return [...this.orders];
    }

    getRecentOrders(limit = 10) {
        return this.orders.slice(0, limit);
    }

    searchOrders(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.orders.filter(order => 
            order.orderNumber.toLowerCase().includes(term) ||
            order.customerName.toLowerCase().includes(term) ||
            order.items.some(item => 
                item.code.toLowerCase().includes(term) ||
                item.description.toLowerCase().includes(term)
            )
        );
    }

    getOrdersByCustomer(customerName) {
        if (!customerName) return [];
        
        return this.orders.filter(order => 
            order.customerName.toLowerCase() === customerName.toLowerCase()
        ).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    filterOrders(filters) {
        let filtered = [...this.orders];
        
        if (filters.customerName) {
            filtered = filtered.filter(o => 
                o.customerName.toLowerCase().includes(filters.customerName.toLowerCase())
            );
        }
        
        if (filters.status) {
            filtered = filtered.filter(o => o.status === filters.status);
        }
        
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            filtered = filtered.filter(o => new Date(o.date) >= fromDate);
        }
        
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(o => new Date(o.date) <= toDate);
        }
        
        if (filters.productCode) {
            filtered = filtered.filter(o => 
                o.items.some(item => 
                    item.code.toLowerCase().includes(filters.productCode.toLowerCase())
                )
            );
        }
        
        return filtered;
    }

    getOrderStats() {
        const stats = {
            totalOrders: this.orders.length,
            totalItems: 0,
            totalWeight: 0,
            totalMetalWeight: 0,
            totalStoneWeight: 0,
            ordersByStatus: {},
            ordersByMonth: {},
            topProducts: {},
            topCustomers: {}
        };
        
        this.orders.forEach(order => {
            // Count by status
            stats.ordersByStatus[order.status] = (stats.ordersByStatus[order.status] || 0) + 1;
            
            // Count by month
            const monthKey = new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            stats.ordersByMonth[monthKey] = (stats.ordersByMonth[monthKey] || 0) + 1;
            
            // Count customers
            if (order.customerName) {
                stats.topCustomers[order.customerName] = (stats.topCustomers[order.customerName] || 0) + 1;
            }
            
            // Process items
            order.items.forEach(item => {
                stats.totalItems += item.quantity;
                stats.totalWeight += (item.totalWeight || item.weight || 0) * item.quantity;
                stats.totalMetalWeight += (item.metalWeight || item.weight || 0) * item.quantity;
                stats.totalStoneWeight += (item.stoneWeight || 0) * item.quantity;
                stats.topProducts[item.code] = (stats.topProducts[item.code] || 0) + item.quantity;
            });
        });
        
        // Convert to sorted arrays
        stats.topProducts = Object.entries(stats.topProducts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([code, count]) => ({ code, count }));
            
        stats.topCustomers = Object.entries(stats.topCustomers)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));
        
        return stats;
    }

    deleteOrder(orderId) {
        const index = this.orders.findIndex(o => o.id === orderId);
        if (index > -1) {
            this.orders.splice(index, 1);
            this.saveOrders();
            return true;
        }
        return false;
    }

    exportOrders(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.orders, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV();
        }
    }

    convertToCSV() {
        const headers = ['Order Number', 'Date', 'Customer', 'Total Items', 'Total Weight', 'Status', 'Products'];
        const rows = this.orders.map(order => [
            order.orderNumber,
            new Date(order.date).toLocaleDateString(),
            order.customerName || 'N/A',
            order.totalItems,
            order.totalWeight.toFixed(2) + 'g',
            order.status || 'completed',
            order.items.map(i => `${i.code}(${i.quantity})`).join('; ')
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
            
        return csvContent;
    }

    importOrders(data, format = 'json') {
        try {
            let imported = [];
            if (format === 'json') {
                imported = JSON.parse(data);
                if (!Array.isArray(imported)) {
                    throw new Error('Invalid data format');
                }
            }
            
            // Validate and merge
            imported.forEach(order => {
                if (!this.getOrderByNumber(order.orderNumber)) {
                    this.orders.push({
                        ...order,
                        id: order.id || this.generateUniqueId(),
                        imported: true,
                        importDate: new Date().toISOString()
                    });
                }
            });
            
            this.saveOrders();
            return imported.length;
        } catch (error) {
            console.error('Error importing orders:', error);
            return 0;
        }
    }

    generateUniqueId() {
        return 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showStorageFullError() {
        if (window.orderManager) {
            window.orderManager.showError('Storage is full. Please export and clear old orders.');
        }
    }

    clearOldOrders(daysToKeep = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        const oldCount = this.orders.length;
        this.orders = this.orders.filter(order => 
            new Date(order.date) > cutoffDate
        );
        
        this.saveOrders();
        return oldCount - this.orders.length;
    }
}

// Initialize order history
const orderHistory = new OrderHistory();