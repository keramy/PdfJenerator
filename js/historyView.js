class HistoryView {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilters = {};
        this.sortField = 'date';
        this.sortDirection = 'desc';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Wait for DOM to be ready
        setTimeout(() => {
            this.initializeHistoryTab();
        }, 100);
    }


    initializeHistoryTab() {
        const historyTab = document.getElementById('history-tab');
        if (!historyTab) {
            console.error('History tab not found');
            return;
        }

        // Create history interface
        historyTab.innerHTML = `
            <div class="history-container">
                <div class="history-header">
                    <h2>Sipariş Geçmişi</h2>
                    <div class="history-actions">
                        <button class="btn btn-secondary" onclick="historyView.exportHistory()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 2v9m0 0l-3-3m3 3l3-3M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2h-4" "/>
                            </svg>
                            Dışa Aktar
                        </button>
                        <button class="btn btn-secondary" onclick="historyView.downloadTemplate()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10,9 9,9 8,9"/>
                            </svg>
                            Şablonu İndir
                        </button>
                        <button class="btn btn-secondary" onclick="historyView.showImportDialog()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 14v7m0 0l-3-3m3 3l3-3M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" "/>
                            </svg>
                            İçe Aktar
                        </button>
                        <button class="btn btn-primary" onclick="historyView.refreshHistory()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" "/>
                            </svg>
                            Yenile
                        </button>
                    </div>
                </div>

                <div class="history-filters">
                    <div class="filter-group">
                        <input type="text" id="history-search" placeholder="Sipariş no, müşteri veya ürüne göre ara..." class="form-input" onkeyup="historyView.applyFilters()">
                    </div>
                    <div class="filter-group">
                        <select id="time-filter" class="form-select" onchange="historyView.applyFilters()">
                            <option value="">Tüm Zamanlar</option>
                            <option value="last_week">Son Hafta</option>
                            <option value="last_month">Son Ay</option>
                            <option value="last_year">Son Yıl</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <select id="sort-filter" class="form-select" onchange="historyView.applySortFilter()">
                            <option value="date_desc">En Yeni Önce</option>
                            <option value="date_asc">En Eski Önce</option>
                            <option value="customer_asc">Müşteri A-Z</option>
                            <option value="customer_desc">Müşteri Z-A</option>
                            <option value="weight_desc">Ağırlık Yüksek-Düşük</option>
                            <option value="weight_asc">Ağırlık Düşük-Yüksek</option>
                        </select>
                    </div>
                    <button class="btn btn-secondary" onclick="historyView.clearFilters()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" "/>
                        </svg>
                        Temizle
                    </button>
                </div>

                <div class="history-stats" id="history-stats">
                    <!-- Stats will be loaded here -->
                </div>

                <div class="consumption-stats-card">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Malzeme Tüketim Özeti</h3>
                            <p class="card-subtitle">Tamamlanan tüm siparişlerdeki toplam malzeme tüketimi</p>
                        </div>
                        <div class="card-content">
                            <div id="consumption-stats" class="consumption-stats">
                                <!-- Consumption stats will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="history-table-container">
                    <table class="history-table">
                        <thead>
                            <tr>
                                <th>Sipariş No</th>
                                <th>Tarih</th>
                                <th>Müşteri</th>
                                <th>Adet</th>
                                <th>Ağırlık</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="history-table-body">
                            <!-- Orders will be loaded here -->
                        </tbody>
                    </table>
                </div>

                <div class="history-pagination" id="history-pagination">
                    <!-- Pagination will be loaded here -->
                </div>
            </div>

            <!-- Import Dialog (hidden by default) -->
            <div id="import-dialog" class="modal" style="display: none;">
                <div class="modal-content">
                    <h3>Siparişleri İçe Aktar</h3>
                    <div class="import-options">
                        <label>
                            <input type="file" id="import-file" accept=".json" />
                            <p>Sipariş verilerini içeren bir JSON dosyası seçin</p>
                        </label>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="historyView.importOrders()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 14v7m0 0l-3-3m3 3l3-3M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" "/>
                            </svg>
                            İçe Aktar
                        </button>
                        <button class="btn btn-secondary" onclick="historyView.closeImportDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" "/>
                            </svg>
                            İptal
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Set up event listeners for filters
        this.setupFilterListeners();
        
        // Load initial data
        this.loadHistory();
    }

    setupFilterListeners() {
        const searchInput = document.getElementById('history-search');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.applyFilters();
                }
            });
        }
    }

    loadHistory() {
        if (typeof orderHistory === 'undefined') {
            console.error('Order history not available');
            return;
        }

        // Load stats
        this.loadStats();

        // Get filtered orders
        let orders = this.getFilteredOrders();

        // Sort orders
        orders = this.sortOrders(orders);

        // Paginate
        const totalPages = Math.ceil(orders.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedOrders = orders.slice(startIndex, startIndex + this.itemsPerPage);

        // Render table
        this.renderTable(paginatedOrders);

        // Render pagination
        this.renderPagination(totalPages, orders.length);
    }

    loadStats() {
        const stats = orderHistory.getOrderStats();
        const statsContainer = document.getElementById('history-stats');
        
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${stats.totalOrders}</div>
                    <div class="stat-label">Toplam Sipariş</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalItems}</div>
                    <div class="stat-label">Toplam Adet</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalWeight.toFixed(2)}g</div>
                    <div class="stat-label">Toplam Ağırlık</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.topCustomers[0]?.name || 'N/A'}</div>
                    <div class="stat-label">En İyi Müşteri</div>
                </div>
            `;
        }

        // Load consumption stats
        const consumptionContainer = document.getElementById('consumption-stats');
        if (consumptionContainer) {
            consumptionContainer.innerHTML = `
                <div class="consumption-grid">
                    <div class="consumption-item metal">
                        <div class="consumption-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                            </svg>
                        </div>
                        <div class="consumption-details">
                            <div class="consumption-value">${stats.totalMetalWeight.toFixed(2)}g</div>
                            <div class="consumption-label">Toplam Metal Tüketimi</div>
                            <div class="consumption-sublabel">${stats.totalOrders} siparişte</div>
                        </div>
                    </div>
                    <div class="consumption-item stone">
                        <div class="consumption-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 3h12l4 6-10 13L2 9l4-6z"/>
                            </svg>
                        </div>
                        <div class="consumption-details">
                            <div class="consumption-value">${stats.totalStoneWeight.toFixed(2)}g</div>
                            <div class="consumption-label">Toplam Taş Tüketimi</div>
                            <div class="consumption-sublabel">${stats.totalOrders} siparişte</div>
                        </div>
                    </div>
                    <div class="consumption-item combined">
                        <div class="consumption-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                            </svg>
                        </div>
                        <div class="consumption-details">
                            <div class="consumption-value">${stats.totalWeight.toFixed(2)}g</div>
                            <div class="consumption-label">Toplam Malzeme Ağırlığı</div>
                            <div class="consumption-sublabel">Metal + Taş toplamı</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    getFilteredOrders() {
        let orders = orderHistory.getAllOrders();
        
        // Apply search filter
        const searchTerm = document.getElementById('history-search')?.value || '';
        if (searchTerm) {
            orders = orderHistory.searchOrders(searchTerm);
        }
        
        // Apply time filter
        const timeFilter = document.getElementById('time-filter')?.value || '';
        if (timeFilter) {
            orders = this.getTimeFilteredOrders(orders, timeFilter);
        }
        
        return orders;
    }

    getTimeFilteredOrders(orders, timeFilter) {
        const now = new Date();
        let filterDate;
        
        switch (timeFilter) {
            case 'last_week':
                filterDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                break;
            case 'last_month':
                filterDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                break;
            case 'last_year':
                filterDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
                break;
            default:
                return orders;
        }
        
        return orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= filterDate;
        });
    }

    sortOrders(orders) {
        const sortFilter = document.getElementById('sort-filter')?.value || 'date_desc';
        const [field, direction] = sortFilter.split('_');
        
        return orders.sort((a, b) => {
            let aVal, bVal;
            
            switch (field) {
                case 'date':
                    aVal = new Date(a.date);
                    bVal = new Date(b.date);
                    break;
                case 'customer':
                    aVal = (a.customerName || '').toLowerCase();
                    bVal = (b.customerName || '').toLowerCase();
                    break;
                case 'weight':
                    aVal = a.totalWeight || 0;
                    bVal = b.totalWeight || 0;
                    break;
                default:
                    aVal = a[field];
                    bVal = b[field];
            }

            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    applySortFilter() {
        this.loadHistory();
    }

    renderTable(orders) {
        const tbody = document.getElementById('history-table-body');
        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem;">
                        <p>Sipariş bulunamadı</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>${order.orderNumber}</strong></td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>${order.customerName || 'N/A'}</td>
                <td>
                    <span class="item-count">${order.items.reduce((sum, item) => sum + item.quantity, 0)} adet</span>
                    <div class="item-details">
                        ${order.items.slice(0, 3).map(item => 
                            `<small>${item.code} (x${item.quantity})</small>`
                        ).join(', ')}
                        ${order.items.length > 3 ? `<small>... +${order.items.length - 3} daha</small>` : ''}
                    </div>
                </td>
                <td>${order.totalWeight.toFixed(2)}g</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="historyView.viewOrderDetails('${order.id}')" title="Detayları gör">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                        </button>
                        <button class="btn-icon" onclick="historyView.reprintOrder('${order.id}')" title="PDF'i yeniden yazdır">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" "/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="historyView.deleteOrder('${order.id}')" title="Siparişi sil">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" "/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderPagination(totalPages, totalItems) {
        const paginationContainer = document.getElementById('history-pagination');
        if (!paginationContainer) return;

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <div class="pagination-info">
                ${totalItems} siparişten ${((this.currentPage - 1) * this.itemsPerPage) + 1}-${Math.min(this.currentPage * this.itemsPerPage, totalItems)} arası gösteriliyor
            </div>
            <div class="pagination-controls">
        `;

        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button onclick="historyView.goToPage(${this.currentPage - 1})">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 18l-6-6 6-6" "/>
                </svg>
                Önceki
            </button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="active">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `<button onclick="historyView.goToPage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<span>...</span>`;
            }
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button onclick="historyView.goToPage(${this.currentPage + 1})">
                Sonraki
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18l6-6-6-6" "/>
                </svg>
            </button>`;
        }

        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadHistory();
    }


    applyFilters() {
        this.currentPage = 1;
        this.loadHistory();
    }

    clearFilters() {
        document.getElementById('history-search').value = '';
        document.getElementById('time-filter').value = '';
        document.getElementById('sort-filter').value = 'date_desc';
        this.currentPage = 1;
        this.loadHistory();
    }

    refreshHistory() {
        this.loadHistory();
        if (window.orderManager) {
            window.orderManager.showSuccess('Geçmiş yenilendi');
        }
    }

    viewOrderDetails(orderId) {
        const order = orderHistory.getOrder(orderId);
        if (!order) return;

        // Create a modal to show order details
        const modal = document.createElement('div');
        modal.className = 'modal order-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Sipariş Detayları - ${order.orderNumber}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" "/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="order-info">
                        <p><strong>Tarih:</strong> ${new Date(order.date).toLocaleString()}</p>
                        <p><strong>Müşteri:</strong> ${order.customerName || 'Belirtilmemiş'}</p>
                        <p><strong>Toplam Adet:</strong> ${order.totalItems}</p>
                        <p><strong>Metal Ağırlığı:</strong> ${(order.totalMetalWeight || order.totalWeight || 0).toFixed(2)}g</p>
                        <p><strong>Taş Ağırlığı:</strong> ${(order.totalStoneWeight || 0).toFixed(2)}g</p>
                        <p><strong>Toplam Ağırlık:</strong> ${order.totalWeight.toFixed(2)}g</p>
                    </div>
                    <h4>Ürünler:</h4>
                    <div class="order-items-list">
                        ${order.items.map(item => `
                            <div class="order-item-detail">
                                <div class="item-code">${item.code}</div>
                                <div class="item-desc">${item.description}</div>
                                <div class="item-specs">
                                    <span>Miktar: ${item.quantity}</span>
                                    <span>Metal: ${item.metalWeight || item.weight || 0}g</span>
                                    <span>Taş: ${item.stoneWeight ? item.stoneWeight + 'g' : 'Yok'}</span>
                                    <span>Toplam: ${((item.totalWeight || item.weight || 0) * item.quantity).toFixed(2)}g</span>
                                </div>
                                ${item.notes ? `<div class="item-notes">Notlar: ${item.notes}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" "/>
                        </svg>
                        Kapat
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }


    async reprintOrder(orderId) {
        const order = orderHistory.getOrder(orderId);
        if (!order) {
            if (window.orderManager) {
                window.orderManager.showError('Sipariş bulunamadı');
            }
            return;
        }

        // Show loading message
        if (window.orderManager) {
            window.orderManager.showSuccess('PDF yeniden oluşturuluyor, lütfen bekleyin...');
        }

        try {
            // Try jsPDF with async loading
            const pdfGenerator = new PDFGenerator();
            await pdfGenerator.generateWorkOrder(order);
            if (window.orderManager) {
                window.orderManager.showSuccess('PDF başarıyla yeniden oluşturuldu');
            }
            return;
        } catch (error) {
            console.error('jsPDF error:', error);
        }

        // Fallback to offline PDF generator
        try {
            const offlinePDF = new OfflinePDFGenerator();
            offlinePDF.generateWorkOrder(order);
            if (window.orderManager) {
                window.orderManager.showSuccess('PDF yazdırma penceresi açıldı');
            }
        } catch (error) {
            console.error('Offline PDF error:', error);
            if (window.orderManager) {
                window.orderManager.showError('PDF oluşturulamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.');
            }
        }
    }



    deleteOrder(orderId) {
        if (confirm('Bu siparişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            if (orderHistory.deleteOrder(orderId)) {
                this.loadHistory();
                if (window.orderManager) {
                    window.orderManager.showSuccess('Sipariş silindi');
                }
            }
        }
    }

    exportHistory() {
        const data = this.generateExcelData();
        this.downloadExcel(data, `siparis-gecmisi-${new Date().toISOString().split('T')[0]}.xls`);
        
        if (window.orderManager) {
            window.orderManager.showSuccess('Geçmiş Excel olarak dışa aktarıldı');
        }
    }

    generateExcelData() {
        const orders = orderHistory.getAllOrders();
        
        let excelContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="header">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#CCCCCC" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Sipariş Geçmişi">
  <Table>
   <Row ss:StyleID="header">
    <Cell><Data ss:Type="String">Sipariş No</Data></Cell>
    <Cell><Data ss:Type="String">Tarih</Data></Cell>
    <Cell><Data ss:Type="String">Müşteri</Data></Cell>
    <Cell><Data ss:Type="String">Toplam Adet</Data></Cell>
    <Cell><Data ss:Type="String">Toplam Ağırlık (g)</Data></Cell>
    <Cell><Data ss:Type="String">Metal Ağırlığı (g)</Data></Cell>
    <Cell><Data ss:Type="String">Taş Ağırlığı (g)</Data></Cell>
   </Row>`;

        orders.forEach(order => {
            excelContent += `
   <Row>
    <Cell><Data ss:Type="String">${order.orderNumber}</Data></Cell>
    <Cell><Data ss:Type="String">${order.date}</Data></Cell>
    <Cell><Data ss:Type="String">${order.customerName || 'Belirtilmemiş'}</Data></Cell>
    <Cell><Data ss:Type="Number">${order.totalItems}</Data></Cell>
    <Cell><Data ss:Type="Number">${order.totalWeight.toFixed(2)}</Data></Cell>
    <Cell><Data ss:Type="Number">${(order.totalMetalWeight || 0).toFixed(2)}</Data></Cell>
    <Cell><Data ss:Type="Number">${(order.totalStoneWeight || 0).toFixed(2)}</Data></Cell>
   </Row>`;
        });

        excelContent += `
  </Table>
 </Worksheet>
</Workbook>`;

        return excelContent;
    }

    downloadExcel(content, filename) {
        const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    downloadTemplate() {
        const templateContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="header">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#CCCCCC" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Sipariş Şablonu">
  <Table>
   <Row ss:StyleID="header">
    <Cell><Data ss:Type="String">Sipariş No</Data></Cell>
    <Cell><Data ss:Type="String">Tarih</Data></Cell>
    <Cell><Data ss:Type="String">Müşteri</Data></Cell>
    <Cell><Data ss:Type="String">Toplam Adet</Data></Cell>
    <Cell><Data ss:Type="String">Toplam Ağırlık (g)</Data></Cell>
    <Cell><Data ss:Type="String">Metal Ağırlığı (g)</Data></Cell>
    <Cell><Data ss:Type="String">Taş Ağırlığı (g)</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">WO-20240101-1200</Data></Cell>
    <Cell><Data ss:Type="String">01.01.2024</Data></Cell>
    <Cell><Data ss:Type="String">Örnek Müşteri</Data></Cell>
    <Cell><Data ss:Type="Number">5</Data></Cell>
    <Cell><Data ss:Type="Number">25.50</Data></Cell>
    <Cell><Data ss:Type="Number">20.00</Data></Cell>
    <Cell><Data ss:Type="Number">5.50</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

        this.downloadExcel(templateContent, 'siparis-sablonu.xls');
        
        if (window.orderManager) {
            window.orderManager.showSuccess('Sipariş şablonu indirildi');
        }
    }

    showImportDialog() {
        const dialog = document.getElementById('import-dialog');
        if (dialog) {
            dialog.style.display = 'flex';
        }
    }

    closeImportDialog() {
        const dialog = document.getElementById('import-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
        document.getElementById('import-file').value = '';
    }

    importOrders() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Lütfen bir dosya seçin');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const count = orderHistory.importOrders(e.target.result, 'json');
                this.closeImportDialog();
                this.loadHistory();
                if (window.orderManager) {
                    window.orderManager.showSuccess(`${count} sipariş içe aktarıldı`);
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Siparişler içe aktarılamadı. Lütfen dosya formatını kontrol edin.');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize history view
const historyView = new HistoryView();