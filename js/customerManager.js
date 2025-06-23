class CustomerManager {
    constructor() {
        this.currentCustomer = null;
        this.editingCustomerId = null;
        this.currentFilters = {};
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Wait for DOM to be ready
        setTimeout(() => {
            this.initializeCustomersTab();
        }, 100);
    }

    initializeCustomersTab() {
        const customersTab = document.getElementById('customers-tab');
        if (!customersTab) {
            console.error('Customers tab not found');
            return;
        }

        // Create customers interface
        customersTab.innerHTML = `
            <div class="customers-container">
                <div class="customers-header">
                    <h2>Müşteri Yönetimi</h2>
                    <div class="customers-actions">
                        <button class="btn btn-primary" onclick="customerManager.showAddCustomerDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" "/>
                            </svg>
                            Müşteri Ekle
                        </button>
                        <button class="btn btn-secondary" onclick="customerManager.showExportDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 2v9m0 0l-3-3m3 3l3-3M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2h-4" "/>
                            </svg>
                            Dışa Aktar
                        </button>
                        <button class="btn btn-secondary" onclick="customerManager.downloadTemplate()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10,9 9,9 8,9"/>
                            </svg>
                            Şablonu İndir
                        </button>
                        <button class="btn btn-secondary" onclick="customerManager.showImportDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 14v7m0 0l-3-3m3 3l3-3M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" "/>
                            </svg>
                            İçe Aktar
                        </button>
                    </div>
                </div>

                <div class="customers-filters">
                    <div class="filter-group">
                        <input type="text" id="customer-search" placeholder="Müşteri ara..." class="form-input">
                    </div>
                    <div class="filter-group">
                        <select id="customer-filter-tags" class="form-select">
                            <option value="">Tüm Etiketler</option>
                            <option value="VIP">VIP</option>
                            <option value="Regular">Regular</option>
                            <option value="New">New</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="customerManager.applyFilters()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" "/>
                        </svg>
                        Filtrele
                    </button>
                    <button class="btn btn-secondary" onclick="customerManager.clearFilters()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" "/>
                        </svg>
                        Temizle
                    </button>
                </div>

                <div class="customers-stats" id="customers-stats">
                    <!-- Stats will be loaded here -->
                </div>

                <div class="customers-grid" id="customers-grid">
                    <!-- Customers will be loaded here -->
                </div>
            </div>
        `;

        this.setupSearchListeners();
        this.loadCustomers();
        this.updateStats();
    }

    setupSearchListeners() {
        const searchInput = document.getElementById('customer-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.applyFilters();
                }, 300);
            });
        }
    }

    loadCustomers() {
        const grid = document.getElementById('customers-grid');
        if (!grid) return;

        const customers = this.getFilteredCustomers();
        
        if (customers.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8z" "/>
                    </svg>
                    <p>Müşteri bulunamadı</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = customers.map(customer => this.renderCustomerCard(customer)).join('');
    }

    renderCustomerCard(customer) {
        const address = customer.address;
        const fullAddress = [address.street, address.city, address.state, address.zip]
            .filter(part => part && part.trim())
            .join(', ');

        return `
            <div class="customer-card" data-customer-id="${customer.id}">
                <div class="customer-card-header">
                    <div class="customer-info">
                        <h3 class="customer-name">${customer.name}</h3>
                        <p class="customer-code">${customer.code}</p>
                    </div>
                    <div class="customer-actions">
                        <button class="btn-icon" onclick="customerManager.viewCustomerHistory('${customer.id}')" title="View Orders">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" "/>
                            </svg>
                        </button>
                        <button class="btn-icon" onclick="customerManager.editCustomer('${customer.id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" "/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="customerManager.deleteCustomer('${customer.id}')" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" "/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="customer-card-body">
                    ${customer.email ? `<p class="customer-email"><strong>Email:</strong> ${customer.email}</p>` : ''}
                    ${customer.phone ? `<p class="customer-phone"><strong>Phone:</strong> ${customer.phone}</p>` : ''}
                    ${fullAddress ? `<p class="customer-address"><strong>Address:</strong> ${fullAddress}</p>` : ''}
                    ${customer.notes ? `<p class="customer-notes"><strong>Notes:</strong> ${customer.notes}</p>` : ''}
                    <div class="customer-stats">
                        <span class="stat"><strong>Orders:</strong> ${customer.orderCount}</span>
                        <span class="stat"><strong>Since:</strong> ${customer.createdDate}</span>
                    </div>
                    ${customer.tags.length > 0 ? `
                        <div class="customer-tags">
                            ${customer.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getFilteredCustomers() {
        let customers = customerDatabase.getAllCustomers();

        // Apply search filter
        const searchTerm = document.getElementById('customer-search')?.value.trim();
        if (searchTerm) {
            customers = customers.filter(customer => 
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm)
            );
        }

        // Apply tag filter
        const tagFilter = document.getElementById('customer-filter-tags')?.value;
        if (tagFilter) {
            customers = customers.filter(customer => customer.tags.includes(tagFilter));
        }

        return customers;
    }

    applyFilters() {
        this.loadCustomers();
        this.updateStats();
    }

    clearFilters() {
        document.getElementById('customer-search').value = '';
        document.getElementById('customer-filter-tags').value = '';
        this.loadCustomers();
        this.updateStats();
    }

    updateStats() {
        const statsContainer = document.getElementById('customers-stats');
        if (!statsContainer) return;

        const stats = customerDatabase.getStatistics();
        const filteredCustomers = this.getFilteredCustomers();

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${filteredCustomers.length}</div>
                    <div class="stat-label">Gösteriliyor</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalCustomers}</div>
                    <div class="stat-label">Toplam Müşteri</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.customersWithOrders}</div>
                    <div class="stat-label">Siparişli</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.recentCustomers}</div>
                    <div class="stat-label">Yeni (30 gün)</div>
                </div>
            </div>
        `;
    }

    showAddCustomerDialog() {
        this.editingCustomerId = null;
        this.showCustomerDialog();
    }

    editCustomer(customerId) {
        this.editingCustomerId = customerId;
        const customer = customerDatabase.getCustomerById(customerId);
        if (customer) {
            this.showCustomerDialog(customer);
        }
    }

    showCustomerDialog(customer = null) {
        // Prevent body scroll
        document.body.classList.add('modal-open');
        
        const isEditing = customer !== null;
        const title = isEditing ? 'Müşteriyi Düzenle' : 'Müşteri Ekle';
        
        const modalHtml = `
            <div class="modal-overlay" onclick="customerManager.closeCustomerDialog()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="customerManager.closeCustomerDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" "/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="customer-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Müşteri Adı *</label>
                                    <input type="text" id="modal-customer-name" class="form-control" value="${customer?.name || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Müşteri Kodu</label>
                                    <input type="text" id="modal-customer-code" class="form-control" value="${customer?.code || ''}" placeholder="Boş bırakılırsa otomatik oluşturulur">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">E-posta</label>
                                    <input type="email" id="modal-customer-email" class="form-control" value="${customer?.email || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Telefon</label>
                                    <input type="tel" id="modal-customer-phone" class="form-control" value="${customer?.phone || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Sokak Adresi</label>
                                    <input type="text" id="modal-customer-street" class="form-control" value="${customer?.address?.street || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Şehir</label>
                                    <input type="text" id="modal-customer-city" class="form-control" value="${customer?.address?.city || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">İl</label>
                                    <input type="text" id="modal-customer-state" class="form-control" value="${customer?.address?.state || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Posta Kodu</label>
                                    <input type="text" id="modal-customer-zip" class="form-control" value="${customer?.address?.zip || ''}">
                                </div>
                                <div class="form-group full-width">
                                    <label class="form-label">Notlar</label>
                                    <textarea id="modal-customer-notes" class="form-control" rows="3">${customer?.notes || ''}</textarea>
                                </div>
                                <div class="form-group full-width">
                                    <label class="form-label">Etiketler (virgülle ayrılı)</label>
                                    <input type="text" id="modal-customer-tags" class="form-control" value="${customer?.tags?.join(', ') || ''}" placeholder="VIP, Normal, vb.">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="customerManager.closeCustomerDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" "/>
                            </svg>
                            İptal
                        </button>
                        <button class="btn btn-primary" onclick="customerManager.saveCustomer()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 6L9 17l-5-5" "/>
                            </svg>
                            ${isEditing ? 'Güncelle' : 'Ekle'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('modal-customer-name').focus();
    }

    closeCustomerDialog() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
        // Restore body scroll
        document.body.classList.remove('modal-open');
    }

    saveCustomer() {
        try {
            const customerData = {
                name: document.getElementById('modal-customer-name').value,
                code: document.getElementById('modal-customer-code').value,
                email: document.getElementById('modal-customer-email').value,
                phone: document.getElementById('modal-customer-phone').value,
                address: {
                    street: document.getElementById('modal-customer-street').value,
                    city: document.getElementById('modal-customer-city').value,
                    state: document.getElementById('modal-customer-state').value,
                    zip: document.getElementById('modal-customer-zip').value,
                    country: 'USA' // Default
                },
                notes: document.getElementById('modal-customer-notes').value,
                tags: document.getElementById('modal-customer-tags').value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag)
            };

            if (this.editingCustomerId) {
                customerDatabase.updateCustomer(this.editingCustomerId, customerData);
                this.showSuccess('Müşteri başarıyla güncellendi');
            } else {
                const newCustomer = customerDatabase.addCustomer(customerData);
                this.showSuccess('Müşteri başarıyla eklendi');
                
                // If order manager exists and has a pending customer name, update it
                if (window.orderManager && newCustomer) {
                    const customerNameInput = document.getElementById('customer-name');
                    if (customerNameInput && customerNameInput.value.trim().toLowerCase() === newCustomer.name.toLowerCase()) {
                        orderManager.selectCustomer(newCustomer.id);
                    }
                }
            }

            this.closeCustomerDialog();
            this.loadCustomers();
            this.updateStats();
        } catch (error) {
            this.showError(error.message);
            // Ensure scroll is restored even on error
            document.body.classList.remove('modal-open');
        }
    }

    deleteCustomer(customerId) {
        const customer = customerDatabase.getCustomerById(customerId);
        if (!customer) return;

        if (confirm(`"${customer.name}" müşterisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
            try {
                customerDatabase.deleteCustomer(customerId);
                this.showSuccess('Müşteri başarıyla silindi');
                this.loadCustomers();
                this.updateStats();
            } catch (error) {
                this.showError(error.message);
            }
        }
    }

    viewCustomerHistory(customerId) {
        const customer = customerDatabase.getCustomerById(customerId);
        if (!customer) return;

        // Switch to history tab and filter by customer
        const historyTab = document.querySelector('[data-tab="history"]');
        if (historyTab) {
            historyTab.click();
            setTimeout(() => {
                const searchInput = document.getElementById('history-search');
                if (searchInput) {
                    searchInput.value = customer.name;
                    if (window.historyView) {
                        window.historyView.applyFilters();
                    }
                }
            }, 100);
        }
    }

    exportCustomers() {
        try {
            const customers = customerDatabase.exportCustomers();
            const excelContent = this.generateCustomerExcelData(customers);
            this.downloadExcel(excelContent, `musteriler-${new Date().toISOString().split('T')[0]}.xls`);
            
            this.showSuccess('Müşteriler Excel olarak dışa aktarıldı');
        } catch (error) {
            this.showError('Müşterileri dışa aktarma hatası: ' + error.message);
        }
    }

    generateCustomerExcelData(customers) {
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
 <Worksheet ss:Name="Müşteriler">
  <Table>
   <Row ss:StyleID="header">
    <Cell><Data ss:Type="String">Ad</Data></Cell>
    <Cell><Data ss:Type="String">E-posta</Data></Cell>
    <Cell><Data ss:Type="String">Telefon</Data></Cell>
    <Cell><Data ss:Type="String">Adres</Data></Cell>
    <Cell><Data ss:Type="String">Etiket</Data></Cell>
    <Cell><Data ss:Type="String">Toplam Sipariş</Data></Cell>
   </Row>`;

        customers.forEach(customer => {
            excelContent += `
   <Row>
    <Cell><Data ss:Type="String">${customer.name || ''}</Data></Cell>
    <Cell><Data ss:Type="String">${customer.email || ''}</Data></Cell>
    <Cell><Data ss:Type="String">${customer.phone || ''}</Data></Cell>
    <Cell><Data ss:Type="String">${customer.address || ''}</Data></Cell>
    <Cell><Data ss:Type="String">${customer.tag || ''}</Data></Cell>
    <Cell><Data ss:Type="Number">${customer.totalOrders || 0}</Data></Cell>
   </Row>`;
        });

        excelContent += `
  </Table>
 </Worksheet>
</Workbook>`;

        return excelContent;
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
 <Worksheet ss:Name="Müşteri Şablonu">
  <Table>
   <Row ss:StyleID="header">
    <Cell><Data ss:Type="String">Ad</Data></Cell>
    <Cell><Data ss:Type="String">E-posta</Data></Cell>
    <Cell><Data ss:Type="String">Telefon</Data></Cell>
    <Cell><Data ss:Type="String">Adres</Data></Cell>
    <Cell><Data ss:Type="String">Etiket</Data></Cell>
    <Cell><Data ss:Type="String">Toplam Sipariş</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Örnek Müşteri</Data></Cell>
    <Cell><Data ss:Type="String">ornek@email.com</Data></Cell>
    <Cell><Data ss:Type="String">+90 555 123 4567</Data></Cell>
    <Cell><Data ss:Type="String">Örnek Adres, İstanbul</Data></Cell>
    <Cell><Data ss:Type="String">VIP</Data></Cell>
    <Cell><Data ss:Type="Number">5</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

        this.downloadExcel(templateContent, 'musteri-sablonu.xls');
        this.showSuccess('Müşteri şablonu indirildi');
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

    showExportDialog() {
        // Prevent body scroll
        document.body.classList.add('modal-open');
        
        const modalHtml = `
            <div class="modal-overlay" onclick="customerManager.closeExportDialog()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Müşteri Dışa Aktar</h3>
                        <button class="modal-close" onclick="customerManager.closeExportDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Müşteri verilerini Excel formatında dışa aktarmak istediğinizden emin misiniz?</p>
                        <div class="export-info">
                            <p><strong>İçerik:</strong> Tüm müşteri bilgileri, e-posta, telefon, adres ve etiketler dahil edilecek.</p>
                            <p><strong>Format:</strong> Excel (.xls) dosyası</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="customerManager.closeExportDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                            İptal
                        </button>
                        <button class="btn btn-primary" onclick="customerManager.confirmExport()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 2v9m0 0l-3-3m3 3l3-3M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2h-4" />
                            </svg>
                            Dışa Aktar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    closeExportDialog() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
        // Restore body scroll
        document.body.classList.remove('modal-open');
    }

    confirmExport() {
        this.exportCustomers();
        this.closeExportDialog();
    }

    showImportDialog() {
        // Prevent body scroll
        document.body.classList.add('modal-open');
        
        const modalHtml = `
            <div class="modal-overlay" onclick="customerManager.closeImportDialog()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Müşteri İçe Aktar</h3>
                        <button class="modal-close" onclick="customerManager.closeImportDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" "/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>İçe aktarılacak müşteri verilerini içeren Excel veya JSON dosyasını seçin:</p>
                        <input type="file" id="customer-import-file" accept=".xls,.xlsx,.json" class="form-control">
                        <div class="import-info">
                            <p><strong>Not:</strong> Aynı isimli müşteriler atlanacaktır.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="customerManager.closeImportDialog()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" "/>
                            </svg>
                            İptal
                        </button>
                        <button class="btn btn-primary" onclick="customerManager.importCustomers()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 14v7m0 0l-3-3m3 3l3-3M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" "/>
                            </svg>
                            İçe Aktar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    closeImportDialog() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
        // Restore body scroll
        document.body.classList.remove('modal-open');
    }

    importCustomers() {
        const fileInput = document.getElementById('customer-import-file');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showError('Lütfen içe aktarılacak dosyayı seçin');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const customersData = data.customers || data;
                
                const result = customerDatabase.importCustomers(customersData);
                this.showSuccess(`İçe aktarma tamamlandı: ${result.imported} eklendi, ${result.skipped} atlandı`);
                
                this.closeImportDialog();
                this.loadCustomers();
                this.updateStats();
            } catch (error) {
                this.showError('Müşteri içe aktarma hatası: ' + error.message);
                // Ensure scroll is restored even on error
                this.closeImportDialog();
            }
        };
        
        reader.readAsText(file);
    }

    getCustomerSuggestions(input) {
        return customerDatabase.getCustomerSuggestions(input);
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize global customer manager
window.customerManager = new CustomerManager();