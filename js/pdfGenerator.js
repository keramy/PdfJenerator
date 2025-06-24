class PDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 15;
        this.currentY = 0;
    }

    async generateWorkOrder(orderData) {
        try {
            // Ensure jsPDF is loaded before proceeding
            let jsPDFConstructor;
            
            if (typeof window.ensureJsPDF === 'function') {
                jsPDFConstructor = await window.ensureJsPDF();
            } else if (typeof window.jsPDF !== 'undefined') {
                jsPDFConstructor = window.jsPDF;
            } else {
                throw new Error('jsPDF library not loaded. Please refresh the page.');
            }
            
            if (!jsPDFConstructor) {
                throw new Error('jsPDF constructor not found');
            }
            
            // Create new PDF document with UTF-8 support
            this.doc = new jsPDFConstructor({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                putOnlyUsedFonts: true,
                floatPrecision: 16
            });
            
            // Configure for Turkish character support
            this.doc.setCharSpace(0);
            this.currentY = this.margin;

            // Calculate total pages needed (10 items per page)
            const itemsPerPage = 10;
            const totalPages = Math.ceil(orderData.items.length / itemsPerPage);
            
            // Generate pages with pagination
            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                if (pageNum > 1) {
                    this.doc.addPage();
                    this.currentY = this.margin;
                }
                
                // Add header and order info on each page
                this.addHeader(orderData, pageNum, totalPages);
                this.addOrderInfo(orderData);
                
                // Get items for this page
                const startIndex = (pageNum - 1) * itemsPerPage;
                const endIndex = Math.min(startIndex + itemsPerPage, orderData.items.length);
                const pageItems = orderData.items.slice(startIndex, endIndex);
                
                // Add items for this page
                this.addItemsForPage(pageItems, startIndex);
                
                // Add summary only on the last page
                if (pageNum === totalPages) {
                    this.addSummary(orderData);
                }
                
                this.addFooter(pageNum, totalPages);
            }

            const filename = `WorkOrder_${orderData.orderNumber}.pdf`;
            this.doc.save(filename);
            
            return true;
        } catch (error) {
            console.error('PDF generation error:', error);
            throw error;
        }
    }

    addHeader(orderData, pageNum = 1, totalPages = 1) {
        // Company header with improved Turkish support
        this.doc.setFontSize(22);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 51, 102); // Dark blue color
        
        // Main title
        this.doc.text('LIZAR KUYUMCULUK İŞ EMRİ', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 12;
        
        // Subtitle
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100); // Gray color
        this.doc.text('Profesyonel İş Emri Yönetim Sistemi', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 8;
        
        // Page number (only if multiple pages)
        if (totalPages > 1) {
            this.doc.setFontSize(9);
            this.doc.setTextColor(120, 120, 120);
            this.doc.text(`Sayfa ${pageNum} / ${totalPages}`, this.pageWidth / 2, this.currentY, { align: 'center' });
            this.currentY += 8;
        }
        
        // Reset text color
        this.doc.setTextColor(0, 0, 0);
        
        // Header line
        this.doc.setLineWidth(0.8);
        this.doc.setDrawColor(0, 51, 102);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 12;
    }

    addOrderInfo(orderData) {
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        
        this.doc.text(`Sipariş No: ${orderData.orderNumber}`, this.margin, this.currentY);
        this.doc.text(`Tarih: ${orderData.date}`, this.pageWidth - this.margin - 50, this.currentY);
        
        this.currentY += 10;
        
        this.doc.text(`Müşteri: ${orderData.customerName || 'Belirtilmemiş'}`, this.margin, this.currentY);
        
        this.currentY += 10;
        
        this.doc.text(`Toplam Öğe: ${orderData.totalItems}`, this.margin, this.currentY);
        this.doc.text(`Toplam Ağırlık: ${orderData.totalWeight.toFixed(2)}g`, this.pageWidth - this.margin - 50, this.currentY);
        
        this.currentY += 15;
        
        this.doc.setLineWidth(0.3);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 15;
    }

    addItems(items) {
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('SİPARİŞ ÖĞELERİ', this.margin, this.currentY);
        this.currentY += 10;

        // Add table header
        this.addItemsHeader();
        
        items.forEach((item, index) => {
            this.addItemRow(item, index + 1);
        });
    }

    addItemsHeader() {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFillColor(240, 240, 240);
        
        const headerY = this.currentY;
        const rowHeight = 8;
        const tableWidth = this.pageWidth - (2 * this.margin);
        
        // Draw header background
        this.doc.rect(this.margin, headerY, tableWidth, rowHeight, 'F');
        
        // Draw header text
        this.doc.setTextColor(0, 0, 0);
        let xPos = this.margin + 2;
        this.doc.text('#', xPos, headerY + 5);
        xPos += 10;
        this.doc.text('Kod', xPos, headerY + 5);
        xPos += 25;
        this.doc.text('Açıklama', xPos, headerY + 5);
        xPos += 60;
        this.doc.text('Miktar', xPos, headerY + 5);
        xPos += 20;
        this.doc.text('Metal(g)', xPos, headerY + 5);
        xPos += 25;
        this.doc.text('Taş(g)', xPos, headerY + 5);
        xPos += 20;
        this.doc.text('Toplam(g)', xPos, headerY + 5);
        
        this.currentY += rowHeight + 2;
    }
    
    addItemRow(item, itemNumber) {
        if (this.currentY > this.pageHeight - 30) {
            this.doc.addPage();
            this.currentY = this.margin;
            this.addItemsHeader();
        }
        
        const rowHeight = 7;
        const tableWidth = this.pageWidth - (2 * this.margin);
        
        // Alternate row background
        if (itemNumber % 2 === 0) {
            this.doc.setFillColor(248, 249, 250);
            this.doc.rect(this.margin, this.currentY, tableWidth, rowHeight, 'F');
        }
        
        // Draw row data
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0);
        
        let xPos = this.margin + 2;
        this.doc.text(itemNumber.toString(), xPos, this.currentY + 5);
        xPos += 10;
        this.doc.text(item.code, xPos, this.currentY + 5);
        xPos += 25;
        
        // Truncate description if too long
        let desc = item.description;
        if (desc.length > 35) {
            desc = desc.substring(0, 32) + '...';
        }
        this.doc.text(desc, xPos, this.currentY + 5);
        xPos += 60;
        
        this.doc.text(item.quantity.toString(), xPos, this.currentY + 5);
        xPos += 20;
        this.doc.text((item.metalWeight || item.weight || 0).toString(), xPos, this.currentY + 5);
        xPos += 25;
        this.doc.text(item.stoneWeight ? item.stoneWeight.toString() : '-', xPos, this.currentY + 5);
        xPos += 20;
        this.doc.text(((item.totalWeight || item.weight || 0) * item.quantity).toFixed(2), xPos, this.currentY + 5);
        
        // Add notes as separate row if exists
        if (item.notes) {
            this.currentY += rowHeight;
            this.doc.setFont('helvetica', 'italic');
            this.doc.setFontSize(8);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(`   Notlar: ${item.notes}`, this.margin + 12, this.currentY + 4);
        }
        
        this.currentY += rowHeight;
    }

    addSummary(orderData) {
        if (this.currentY > this.pageHeight - 40) {
            this.doc.addPage();
            this.currentY = this.margin;
        }

        this.currentY += 10;
        
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 15;

        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 0, 0);
        this.doc.text('SİPARİŞ ÖZETİ', this.margin, this.currentY);
        this.currentY += 15;

        this.doc.setFontSize(12);
        this.doc.text(`Toplam Öğe: ${orderData.totalItems}`, this.margin, this.currentY);
        this.currentY += 8;
        
        this.doc.text(`Metal Ağırlığı: ${orderData.totalMetalWeight.toFixed(2)}g`, this.margin, this.currentY);
        this.doc.text(`Taş Ağırlığı: ${orderData.totalStoneWeight.toFixed(2)}g`, this.margin + 60, this.currentY);
        this.currentY += 8;
        
        this.doc.text(`Toplam Ağırlık: ${orderData.totalWeight.toFixed(2)}g`, this.margin, this.currentY);
        this.currentY += 8;

        this.doc.text(`Müşteri: ${orderData.customerName || 'Belirtilmemiş'}`, this.margin, this.currentY);
        this.currentY += 8;
        
        this.doc.text(`Sipariş Tarihi: ${orderData.date}`, this.margin, this.currentY);
        this.doc.text(`Sipariş No: ${orderData.orderNumber}`, this.margin + 60, this.currentY);
        this.currentY += 15;

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Personel İmzası: ________________________', this.margin, this.currentY);
        this.doc.text('Tamamlanma Tarihi: ________________________', this.margin + 80, this.currentY);
    }

    addFooter() {
        const footerY = this.pageHeight - 15;
        
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100);
        
        this.doc.text('LIZAR KUYUMCULUK - İş Emri Yönetim Sistemi', this.pageWidth / 2, footerY, { align: 'center' });
        
        const now = new Date();
        const timestamp = now.toLocaleString();
        this.doc.text(`Oluşturulma Tarihi: ${timestamp}`, this.pageWidth / 2, footerY + 5, { align: 'center' });
    }
}