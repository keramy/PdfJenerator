class PDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 15;
        this.currentY = 0;
    }

    setupTurkishFont() {
        try {
            // Enhanced approach for Turkish character support
            // Configure the PDF for better UTF-8 handling
            
            // Try Times-Roman first as it has better Unicode support than Helvetica
            this.doc.setFont('times', 'normal');
            
            // Enable UTF-8 support in jsPDF if available
            if (this.doc.internal.textEncoding) {
                this.doc.internal.textEncoding = 'UTF-8';
            }
            
            // Set proper language and encoding
            this.doc.setLanguage('tr-TR');
            this.doc.setDocumentProperties({
                language: 'tr-TR',
                encoding: 'UTF-8'
            });
            
            console.log('Turkish font configuration applied with Times font and UTF-8 encoding');
            this.fontLoaded = true;
            
        } catch (e) {
            console.log('Font configuration failed, using Helvetica with character mapping:', e);
            this.doc.setFont('helvetica', 'normal');
            this.fontLoaded = false;
        }
    }
    
    setupTurkishCharMapping() {
        // Character mapping for Turkish characters as a fallback
        this.turkishCharMap = {
            'ğ': 'g', 'Ğ': 'G',
            'ü': 'u', 'Ü': 'U', 
            'ş': 's', 'Ş': 'S',
            'ı': 'i', 'İ': 'I',
            'ö': 'o', 'Ö': 'O',
            'ç': 'c', 'Ç': 'C'
        };
    }
    
    // Helper method to handle Turkish text properly
    formatTurkishText(text) {
        if (!text) return '';
        
        // If custom font loaded successfully, use text as-is
        if (this.fontLoaded) {
            return text;
        }
        
        // Fallback: Use character substitution for better compatibility
        const charMap = {
            'ğ': 'g', 'Ğ': 'G',
            'ü': 'u', 'Ü': 'U',
            'ş': 's', 'Ş': 'S', 
            'ı': 'i', 'İ': 'I',
            'ö': 'o', 'Ö': 'O',
            'ç': 'c', 'Ç': 'C'
        };
        
        let result = text;
        for (const [turkish, replacement] of Object.entries(charMap)) {
            result = result.replace(new RegExp(turkish, 'g'), replacement);
        }
        
        return result;
    }

    // Helper method to add product images to PDF
    addProductImage(item, x, y, width, height) {
        try {
            // Check if item has image data
            if (item.imageData && item.imageData.trim()) {
                // Ensure the image data is properly formatted
                let imageData = item.imageData;
                
                // Add data URL prefix if missing
                if (!imageData.startsWith('data:image/')) {
                    imageData = `data:image/jpeg;base64,${imageData}`;
                }
                
                // Add the image to PDF with proper scaling
                this.doc.addImage(imageData, 'JPEG', x, y, width, height, '', 'FAST');
                
                // Add border around image
                this.doc.setDrawColor(200, 200, 200);
                this.doc.setLineWidth(0.1);
                this.doc.rect(x, y, width, height, 'S');
                
            } else {
                // Draw placeholder icon when no image available
                this.drawImagePlaceholder(x, y, width, height);
            }
        } catch (error) {
            console.log('Error adding image to PDF:', error);
            // Draw placeholder on error
            this.drawImagePlaceholder(x, y, width, height);
        }
    }
    
    // Draw a simple placeholder icon for products without images
    drawImagePlaceholder(x, y, width, height) {
        // Draw border
        this.doc.setDrawColor(220, 220, 220);
        this.doc.setLineWidth(0.1);
        this.doc.rect(x, y, width, height, 'S');
        
        // Draw simple image icon
        this.doc.setDrawColor(180, 180, 180);
        this.doc.setLineWidth(0.5);
        
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const iconSize = Math.min(width, height) * 0.4;
        
        // Draw simple camera/image icon
        this.doc.rect(centerX - iconSize/2, centerY - iconSize/2, iconSize, iconSize, 'S');
        this.doc.circle(centerX, centerY, iconSize/4, 'S');
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
            
            // Add Turkish-compatible font
            this.setupTurkishFont();
            
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
        this.doc.setFont('times', 'bold');
        this.doc.setTextColor(0, 51, 102); // Dark blue color
        
        // Main title with Turkish character support
        this.doc.text(this.formatTurkishText('LIZAR KUYUMCULUK İŞ EMRİ'), this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 12;
        
        // Subtitle
        this.doc.setFontSize(11);
        this.doc.setFont('times', 'normal');
        this.doc.setTextColor(100, 100, 100); // Gray color
        this.doc.text(this.formatTurkishText('Profesyonel İş Emri Yönetim Sistemi'), this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 8;
        
        // Page number (only if multiple pages)
        if (totalPages > 1) {
            this.doc.setFontSize(9);
            this.doc.setTextColor(120, 120, 120);
            this.doc.text(this.formatTurkishText(`Sayfa ${pageNum} / ${totalPages}`), this.pageWidth / 2, this.currentY, { align: 'center' });
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
        this.doc.setFont('times', 'bold');
        
        this.doc.text(this.formatTurkishText(`Sipariş No: ${orderData.orderNumber}`), this.margin, this.currentY);
        this.doc.text(this.formatTurkishText(`Tarih: ${orderData.date}`), this.pageWidth - this.margin - 50, this.currentY);
        
        this.currentY += 10;
        
        this.doc.text(this.formatTurkishText(`Müşteri: ${orderData.customerName || 'Belirtilmemiş'}`), this.margin, this.currentY);
        
        this.currentY += 10;
        
        this.doc.text(this.formatTurkishText(`Toplam Öğe: ${orderData.totalItems}`), this.margin, this.currentY);
        this.doc.text(this.formatTurkishText(`Toplam Ağırlık: ${orderData.totalWeight.toFixed(2)}g`), this.pageWidth - this.margin - 50, this.currentY);
        
        this.currentY += 15;
        
        this.doc.setLineWidth(0.3);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 15;
    }

    addItemsForPage(items, startIndex) {
        this.doc.setFontSize(13);
        this.doc.setFont('times', 'bold');
        this.doc.setTextColor(0, 51, 102);
        this.doc.text(this.formatTurkishText('SİPARİŞ ÖĞELERİ'), this.margin, this.currentY);
        this.currentY += 8;

        // Add table header with improved design
        this.addItemsHeader();
        
        // Add items for this page
        items.forEach((item, index) => {
            this.addItemRow(item, startIndex + index + 1);
        });
        
        this.currentY += 5; // Add some space after items
    }

    addItemsHeader() {
        this.doc.setFontSize(9);
        this.doc.setFont('times', 'bold');
        
        const headerY = this.currentY;
        const rowHeight = 10;
        const tableWidth = this.pageWidth - (2 * this.margin);
        
        // Professional header background
        this.doc.setFillColor(0, 51, 102); // Dark blue
        this.doc.rect(this.margin, headerY, tableWidth, rowHeight, 'F');
        
        // Header borders
        this.doc.setDrawColor(255, 255, 255);
        this.doc.setLineWidth(0.2);
        
        // Column positions with image column and better spacing
        const columns = [
            { text: this.formatTurkishText('Resim'), x: this.margin + 2, width: 18 },
            { text: '#', x: this.margin + 20, width: 12 },
            { text: 'Kod', x: this.margin + 32, width: 25 },
            { text: this.formatTurkishText('Açıklama'), x: this.margin + 57, width: 60 },
            { text: 'Adet', x: this.margin + 117, width: 15 },
            { text: 'Metal(g)', x: this.margin + 132, width: 20 },
            { text: this.formatTurkishText('Taş(g)'), x: this.margin + 152, width: 18 },
            { text: 'Toplam(g)', x: this.margin + 170, width: 25 }
        ];
        
        // Draw header text in white
        this.doc.setTextColor(255, 255, 255);
        columns.forEach((col, index) => {
            this.doc.text(col.text, col.x, headerY + 7);
            
            // Draw vertical lines between columns
            if (index < columns.length - 1) {
                this.doc.line(col.x + col.width - 2, headerY, col.x + col.width - 2, headerY + rowHeight);
            }
        });
        
        // Reset colors
        this.doc.setTextColor(0, 0, 0);
        this.doc.setDrawColor(0, 0, 0);
        
        this.currentY += rowHeight;
    }
    
    addItemRow(item, itemNumber) {
        const rowHeight = 18; // Increased height for images
        const tableWidth = this.pageWidth - (2 * this.margin);
        
        // Alternate row background for better readability
        if (itemNumber % 2 === 0) {
            this.doc.setFillColor(248, 250, 255); // Very light blue
            this.doc.rect(this.margin, this.currentY, tableWidth, rowHeight, 'F');
        }
        
        // Row border
        this.doc.setDrawColor(220, 220, 220);
        this.doc.setLineWidth(0.1);
        this.doc.rect(this.margin, this.currentY, tableWidth, rowHeight, 'S');
        
        // Row data with improved positioning
        this.doc.setFontSize(8);
        this.doc.setFont('times', 'normal');
        this.doc.setTextColor(0, 0, 0);
        
        // Add product image first (if available)
        this.addProductImage(item, this.margin + 2, this.currentY + 2, 14, 14);
        
        // Column data matching header positions (updated for new layout)
        const columns = [
            { text: itemNumber.toString(), x: this.margin + 20 },
            { text: item.code, x: this.margin + 32 },
            { text: this.formatTurkishText(this.truncateText(item.description, 35)), x: this.margin + 57 },
            { text: item.quantity.toString(), x: this.margin + 117 },
            { text: (item.metalWeight || 0).toFixed(2), x: this.margin + 132 },
            { text: item.stoneWeight ? item.stoneWeight.toFixed(2) : '-', x: this.margin + 152 },
            { text: ((item.totalWeight || item.weight || 0) * item.quantity).toFixed(2), x: this.margin + 170 }
        ];
        
        // Draw column data
        columns.forEach(col => {
            this.doc.text(col.text, col.x, this.currentY + 12); // Adjusted for larger row height
        });
        
        this.currentY += rowHeight;
        
        // Add notes as separate row if exists
        if (item.notes && item.notes.trim()) {
            const noteRowHeight = 8;
            this.doc.setFillColor(255, 255, 240); // Light yellow for notes
            this.doc.rect(this.margin, this.currentY, tableWidth, noteRowHeight, 'F');
            
            this.doc.setFontSize(7);
            this.doc.setFont('times', 'italic');
            this.doc.setTextColor(80, 80, 80);
            this.doc.text(this.formatTurkishText(`Not: ${this.truncateText(item.notes, 90)}`), this.margin + 5, this.currentY + 6);
            
            // Reset formatting
            this.doc.setTextColor(0, 0, 0);
            this.doc.setFont('times', 'normal');
            this.currentY += noteRowHeight;
        }
    }
    
    // Helper method to truncate text
    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
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
        this.doc.setFont('times', 'bold');
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(this.formatTurkishText('SİPARİŞ ÖZETİ'), this.margin, this.currentY);
        this.currentY += 15;

        this.doc.setFontSize(12);
        this.doc.text(this.formatTurkishText(`Toplam Öğe: ${orderData.totalItems}`), this.margin, this.currentY);
        this.currentY += 8;
        
        this.doc.text(this.formatTurkishText(`Metal Ağırlığı: ${orderData.totalMetalWeight.toFixed(2)}g`), this.margin, this.currentY);
        this.doc.text(this.formatTurkishText(`Taş Ağırlığı: ${orderData.totalStoneWeight.toFixed(2)}g`), this.margin + 60, this.currentY);
        this.currentY += 8;
        
        this.doc.text(this.formatTurkishText(`Toplam Ağırlık: ${orderData.totalWeight.toFixed(2)}g`), this.margin, this.currentY);
        this.currentY += 8;

        this.doc.text(this.formatTurkishText(`Müşteri: ${orderData.customerName || 'Belirtilmemiş'}`), this.margin, this.currentY);
        this.currentY += 8;
        
        this.doc.text(this.formatTurkishText(`Sipariş Tarihi: ${orderData.date}`), this.margin, this.currentY);
        this.doc.text(this.formatTurkishText(`Sipariş No: ${orderData.orderNumber}`), this.margin + 60, this.currentY);
        this.currentY += 15;

        this.doc.setFontSize(10);
        this.doc.setFont('times', 'normal');
        this.doc.text(this.formatTurkishText('Personel İmzası: ________________________'), this.margin, this.currentY);
        this.doc.text(this.formatTurkishText('Tamamlanma Tarihi: ________________________'), this.margin + 80, this.currentY);
    }

    addFooter(pageNum = 1, totalPages = 1) {
        const footerY = this.pageHeight - 15;
        
        this.doc.setFontSize(8);
        this.doc.setFont('times', 'normal');
        this.doc.setTextColor(100, 100, 100);
        
        // Company name and system info
        this.doc.text(this.formatTurkishText('LIZAR KUYUMCULUK - İş Emri Yönetim Sistemi'), this.pageWidth / 2, footerY, { align: 'center' });
        
        // Timestamp and page number row
        const now = new Date();
        const timestamp = now.toLocaleString('tr-TR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Left side: timestamp
        this.doc.text(this.formatTurkishText(`Oluşturulma: ${timestamp}`), this.margin, footerY + 5);
        
        // Right side: page number (only if multiple pages)  
        if (totalPages > 1) {
            this.doc.text(this.formatTurkishText(`Sayfa ${pageNum} / ${totalPages}`), this.pageWidth - this.margin, footerY + 5, { align: 'right' });
        }
        
        // Footer line above text
        this.doc.setLineWidth(0.3);
        this.doc.setDrawColor(180, 180, 180);
        this.doc.line(this.margin, footerY - 3, this.pageWidth - this.margin, footerY - 3);
    }
}