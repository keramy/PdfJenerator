// Simple offline PDF alternative using browser's print functionality
class OfflinePDFGenerator {
    constructor() {
        this.orderData = null;
    }

    generateWorkOrder(orderData) {
        this.orderData = orderData;
        
        // Create a new window for PDF generation
        const printWindow = window.open('', '_blank');
        const htmlContent = this.createPrintableHTML(orderData);
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Auto-trigger print dialog
        setTimeout(() => {
            printWindow.print();
        }, 500);
        
        return true;
    }

    createPrintableHTML(orderData) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Work Order ${orderData.orderNumber}</title>
            <style>
                @page {
                    margin: 15mm;
                    size: A4;
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    font-size: 12pt;
                    line-height: 1.4;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    font-size: 24pt;
                    margin: 0;
                    color: #333;
                }
                .header p {
                    margin: 10px 0 0 0;
                    color: #666;
                }
                .order-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                    padding: 15px;
                    background: #f9f9f9;
                    border: 1px solid #ddd;
                }
                .order-info div {
                    font-weight: bold;
                }
                .items-section {
                    margin-bottom: 30px;
                }
                .items-title {
                    font-size: 16pt;
                    font-weight: bold;
                    margin-bottom: 20px;
                    color: #333;
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 10px;
                }
                .item {
                    border: 1px solid #ddd;
                    margin-bottom: 15px;
                    padding: 15px;
                    background: #f8f9fa;
                    page-break-inside: avoid;
                    display: flex;
                    gap: 15px;
                }
                .item-image {
                    width: 80px;
                    height: 80px;
                    flex-shrink: 0;
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .item-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .item-content {
                    flex: 1;
                }
                .item-header {
                    font-weight: bold;
                    font-size: 14pt;
                    color: #333;
                    margin-bottom: 8px;
                }
                .item-description {
                    color: #666;
                    margin-bottom: 10px;
                }
                .item-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 15px;
                    font-size: 11pt;
                }
                .item-notes {
                    margin-top: 10px;
                    font-style: italic;
                    color: #666;
                    border-top: 1px solid #eee;
                    padding-top: 10px;
                }
                .summary {
                    border: 2px solid #333;
                    padding: 20px;
                    background: #f9f9f9;
                    margin-top: 30px;
                    page-break-inside: avoid;
                }
                .summary h3 {
                    margin: 0 0 15px 0;
                    font-size: 16pt;
                }
                .summary-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                .signature-area {
                    margin-top: 40px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                }
                .signature-field {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 5px;
                    margin-bottom: 5px;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 10pt;
                    color: #666;
                    border-top: 1px solid #ccc;
                    padding-top: 10px;
                }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>LIZAR KUYUMCULUK İŞ EMRİ</h1>
                <p>Profesyonel İş Emri Yönetim Sistemi</p>
            </div>

            <div class="order-info">
                <div>Sipariş No: ${orderData.orderNumber}</div>
                <div>Tarih: ${orderData.date}</div>
                <div>Müşteri: ${orderData.customerName || 'Belirtilmemiş'}</div>
                <div>Toplam Öğe: ${orderData.totalItems}</div>
                <div>Toplam Ağırlık: ${orderData.totalWeight.toFixed(2)}g</div>
            </div>

            <div class="items-section">
                <div class="items-title">SİPARİŞ ÖĞELERİ</div>
                ${orderData.items.map((item, index) => `
                    <div class="item">
                        <div class="item-image">
                            ${item.imageData ? `
                                <img src="${item.imageData}" alt="${item.description}" />
                            ` : `
                                <div style="font-size: 8pt; color: #999; text-align: center;">IMAGE</div>
                            `}
                        </div>
                        <div class="item-content">
                            <div class="item-header">${index + 1}. ${item.code}</div>
                            <div class="item-description">${item.description}</div>
                            <div class="item-details">
                                <div><strong>Metal Ağırlığı:</strong> ${item.metalWeight || item.weight || 0}g</div>
                                <div><strong>Taş Ağırlığı:</strong> ${item.stoneWeight ? item.stoneWeight + 'g' : 'Yok'}</div>
                                <div><strong>Malzeme:</strong> ${item.material}</div>
                                <div><strong>Tip:</strong> ${item.type}</div>
                                <div><strong>Miktar:</strong> ${item.quantity}</div>
                                <div><strong>Toplam Ağırlık:</strong> ${((item.totalWeight || item.weight || 0) * item.quantity).toFixed(2)}g</div>
                                <div></div>
                            </div>
                            ${item.notes ? `<div class="item-notes"><strong>Notlar:</strong> ${item.notes}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="summary">
                <h3>SİPARİŞ ÖZETİ</h3>
                <div class="summary-grid">
                    <div><strong>Müşteri:</strong> ${orderData.customerName || 'Belirtilmemiş'}</div>
                    <div><strong>Toplam Öğe:</strong> ${orderData.totalItems}</div>
                    <div><strong>Metal Ağırlığı:</strong> ${orderData.totalMetalWeight ? orderData.totalMetalWeight.toFixed(2) + 'g' : '0.00g'}</div>
                    <div><strong>Taş Ağırlığı:</strong> ${orderData.totalStoneWeight ? orderData.totalStoneWeight.toFixed(2) + 'g' : '0.00g'}</div>
                    <div><strong>Toplam Ağırlık:</strong> ${orderData.totalWeight.toFixed(2)}g</div>
                    <div><strong>Sipariş Tarihi:</strong> ${orderData.date}</div>
                    <div><strong>Sipariş No:</strong> ${orderData.orderNumber}</div>
                </div>
            </div>

            <div class="signature-area">
                <div>
                    <div class="signature-field"></div>
                    <div>Personel İmzası</div>
                </div>
                <div>
                    <div class="signature-field"></div>
                    <div>Tamamlanma Tarihi</div>
                </div>
            </div>

            <div class="footer">
                <p>LIZAR KUYUMCULUK - İş Emri Yönetim Sistemi | Oluşturulma: ${new Date().toLocaleString()}</p>
            </div>

            <div class="no-print" style="margin-top: 30px; text-align: center;">
                <button onclick="window.print()" style="padding: 10px 20px; font-size: 14pt; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
                    <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="6,9 6,2 18,2 18,9" stroke-width="2" stroke-linecap="round"/>
                        <path d="M6,18H4a2,2,0,0,1-2-2v-5a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18" stroke-width="2"/>
                        <rect x="6" y="14" width="12" height="8" stroke-width="2"/>
                    </svg>
                    Yazdır / PDF Kaydet
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; font-size: 14pt; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px; display: inline-flex; align-items: center; gap: 8px;">
                    <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Kapat
                </button>
            </div>
        </body>
        </html>`;
    }
}

// Make available globally
window.OfflinePDFGenerator = OfflinePDFGenerator;