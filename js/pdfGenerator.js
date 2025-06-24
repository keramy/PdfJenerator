class PDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 15;
        this.currentY = 0;
    }

    async setupTurkishFont() {
        try {
            // Try to use DejaVu Sans font for full Turkish character support
            if (window.dejaVuFontLoader) {
                // Load the font data
                const fontData = await window.dejaVuFontLoader.loadFont();
                
                if (fontData) {
                    // Add font to this PDF document
                    const success = window.dejaVuFontLoader.addToJsPDF(this.doc);
                    
                    if (success) {
                        logger.info('DejaVu Sans font loaded successfully - full Turkish character support enabled');
                        this.fontLoaded = true;
                        this.useNativeText = true; // Flag to skip character conversion
                        return;
                    }
                }
            }
            
            // Fallback: Try to load DejaVu Sans directly from file
            try {
                const response = await fetch('/fonts/DejaVuSans.ttf');
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const base64 = this.arrayBufferToBase64(arrayBuffer);
                    
                    this.doc.addFileToVFS('DejaVuSans.ttf', base64);
                    this.doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
                    this.doc.setFont('DejaVuSans', 'normal');
                    
                    logger.info('DejaVu Sans loaded directly - Turkish characters supported');
                    this.fontLoaded = true;
                    this.useNativeText = true;
                    return;
                }
            } catch (e) {
                logger.warn('Direct font loading failed:', e);
            }
            
            // Final fallback: Use Times font with character mapping
            this.setFontStyle('normal');
            logger.info('Using Times font with character mapping for Turkish support');
            this.fontLoaded = false;
            this.useNativeText = false;
            
        } catch (e) {
            logger.warn('Font configuration failed, using Times with character mapping:', e);
            this.setFontStyle('normal');
            this.fontLoaded = false;
            this.useNativeText = false;
        }
    }
    
    // Helper method to convert ArrayBuffer to base64
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
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
        
        // If DejaVu Sans is loaded, return text as-is (native Turkish support)
        if (this.useNativeText) {
            return text;
        }
        
        // Fallback: Use character substitution for Times font
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
    
    // Helper method to set font based on DejaVu Sans availability
    setFontStyle(style = 'normal', size = 12) {
        this.doc.setFontSize(size);
        
        if (this.useNativeText) {
            // DejaVu Sans loaded - use it for all text
            this.doc.setFont('DejaVuSans', 'normal');
        } else {
            // Fallback to Times font
            const fontStyle = style === 'bold' ? 'bold' : (style === 'italic' ? 'italic' : 'normal');
            this.doc.setFont('times', fontStyle);
        }
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
            logger.warn('Error adding image to PDF:', error);
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
            
            // Add Turkish-compatible font (await for async font loading)
            await this.setupTurkishFont();
            
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
                
                // Footer includes signature (no separate summary needed)
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

    async generateWorkOrderBlob(orderData) {
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
            
            // Add Turkish-compatible font (await for async font loading)
            await this.setupTurkishFont();
            
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
                
                // Footer includes signature (no separate summary needed)
                this.addFooter(pageNum, totalPages);
            }

            // Return PDF as blob instead of downloading
            const pdfBlob = this.doc.output('blob');
            return {
                blob: pdfBlob,
                filename: `WorkOrder_${orderData.orderNumber}.pdf`
            };
            
        } catch (error) {
            console.error('PDF blob generation error:', error);
            throw error;
        }
    }

    addHeader(orderData, pageNum = 1, totalPages = 1) {
        // Company header with improved Turkish support
        this.setFontStyle('bold', 22);
        this.doc.setTextColor(0, 51, 102); // Dark blue color
        
        // Main title with Turkish character support
        this.doc.text(this.formatTurkishText('LIZAR KUYUMCULUK İŞ EMRİ'), this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 12;
        
        // Subtitle
        this.setFontStyle('normal', 11);
        this.doc.setTextColor(100, 100, 100); // Gray color
        this.doc.text(this.formatTurkishText('Profesyonel İş Emri Yönetim Sistemi'), this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 8;
        
        // Page number (only if multiple pages)
        if (totalPages > 1) {
            this.setFontStyle('normal', 9);
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
        this.setFontStyle('bold', 12);
        
        this.doc.text(this.formatTurkishText(`Sipariş No: ${orderData.orderNumber}`), this.margin, this.currentY);
        this.doc.text(this.formatTurkishText(`Tarih: ${orderData.date}`), this.pageWidth - this.margin - 50, this.currentY);
        
        this.currentY += 10;
        
        this.doc.text(this.formatTurkishText(`Müşteri: ${orderData.customerName || 'Belirtilmemiş'}`), this.margin, this.currentY);
        
        this.currentY += 10;
        
        this.doc.text(this.formatTurkishText(`Toplam Öğe: ${orderData.totalItems}`), this.margin, this.currentY);
        this.doc.text(this.formatTurkishText(`Toplam Ağırlık: ${orderData.totalWeight.toFixed(2)}g`), this.pageWidth - this.margin - 50, this.currentY);
        
        this.currentY += 10;
        
        // Add metal and stone weights row
        this.doc.text(this.formatTurkishText(`Metal Ağırlığı: ${orderData.totalMetalWeight.toFixed(2)}g`), this.margin, this.currentY);
        this.doc.text(this.formatTurkishText(`Taş Ağırlığı: ${orderData.totalStoneWeight.toFixed(2)}g`), this.pageWidth - this.margin - 50, this.currentY);
        
        this.currentY += 15;
        
        this.doc.setLineWidth(0.3);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 15;
    }

    addItemsForPage(items, startIndex) {
        this.setFontStyle('bold', 13);
        this.doc.setTextColor(0, 51, 102);
        this.doc.text(this.formatTurkishText('SİPARİŞ ÖĞELERİ'), this.margin, this.currentY);
        this.currentY += 8;

        // Add table header with improved design
        this.addItemsHeader();
        
        // Add items for this page
        items.forEach((item, index) => {
            this.addItemRow(item, startIndex + index + 1);
        });
        
        this.currentY += 3; // Reduced space after items for compact layout
    }

    addItemsHeader() {
        this.setFontStyle('bold', 9);
        
        const headerY = this.currentY;
        const rowHeight = 10;
        const tableWidth = this.pageWidth - (2 * this.margin);
        
        // Professional header background
        this.doc.setFillColor(0, 51, 102); // Dark blue
        this.doc.rect(this.margin, headerY, tableWidth, rowHeight, 'F');
        
        // Header borders
        this.doc.setDrawColor(255, 255, 255);
        this.doc.setLineWidth(0.2);
        
        // Column positions properly fitted for A4 width (180mm usable)
        const columns = [
            { text: this.formatTurkishText('Resim'), x: this.margin + 9, width: 16, align: 'center' },
            { text: '#', x: this.margin + 22, width: 10, align: 'center' },
            { text: 'Kod', x: this.margin + 37, width: 20, align: 'center' },
            { text: this.formatTurkishText('Açıklama'), x: this.margin + 72, width: 50, align: 'center' },
            { text: 'Adet', x: this.margin + 107, width: 12, align: 'center' },
            { text: 'Metal(g)', x: this.margin + 127, width: 18, align: 'center' },
            { text: this.formatTurkishText('Taş(g)'), x: this.margin + 150, width: 16, align: 'center' },
            { text: 'Toplam(g)', x: this.margin + 170, width: 20, align: 'center' }
        ];
        
        // Draw header text in white with center alignment
        this.doc.setTextColor(255, 255, 255);
        columns.forEach((col, index) => {
            this.doc.text(col.text, col.x, headerY + 7, { align: col.align || 'left' });
            
            // Draw vertical lines between columns
            if (index < columns.length - 1) {
                const lineX = this.margin + [16, 27, 42, 97, 112, 135, 155][index];
                this.doc.line(lineX, headerY, lineX, headerY + rowHeight);
            }
        });
        
        // Reset colors
        this.doc.setTextColor(0, 0, 0);
        this.doc.setDrawColor(0, 0, 0);
        
        this.currentY += rowHeight;
    }
    
    addItemRow(item, itemNumber) {
        const rowHeight = 15; // Optimized height for single page with 10 items
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
        this.setFontStyle('normal', 8);
        this.doc.setTextColor(0, 0, 0);
        
        // Add product image first (if available) - smaller size for compact layout
        this.addProductImage(item, this.margin + 2, this.currentY + 1.5, 12, 12);
        
        // Column data aligned with A4-fitted headers
        const columns = [
            { text: itemNumber.toString(), x: this.margin + 22, align: 'center' },
            { text: item.code, x: this.margin + 37, align: 'center' },
            { text: this.formatTurkishText(this.truncateText(item.description, 30)), x: this.margin + 47, align: 'left' },
            { text: item.quantity.toString(), x: this.margin + 107, align: 'center' },
            { text: (item.metalWeight || 0).toFixed(2), x: this.margin + 127, align: 'center' },
            { text: item.stoneWeight ? item.stoneWeight.toFixed(2) : '-', x: this.margin + 150, align: 'center' },
            { text: ((item.totalWeight || item.weight || 0) * item.quantity).toFixed(2), x: this.margin + 170, align: 'center' }
        ];
        
        // Draw column data with proper alignment
        columns.forEach(col => {
            this.doc.text(col.text, col.x, this.currentY + 10, { align: col.align || 'left' });
        });
        
        this.currentY += rowHeight;
        
        // Add notes as separate row if exists
        if (item.notes && item.notes.trim()) {
            const noteRowHeight = 8;
            this.doc.setFillColor(255, 255, 240); // Light yellow for notes
            this.doc.rect(this.margin, this.currentY, tableWidth, noteRowHeight, 'F');
            
            this.setFontStyle('italic', 7);
            this.doc.setTextColor(80, 80, 80);
            this.doc.text(this.formatTurkishText(`Not: ${this.truncateText(item.notes, 90)}`), this.margin + 5, this.currentY + 6);
            
            // Reset formatting
            this.doc.setTextColor(0, 0, 0);
            this.setFontStyle('normal');
            this.currentY += noteRowHeight;
        }
    }
    
    // Helper method to truncate text
    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    }

    // Summary section removed - weights moved to header, signature moved to footer

    addFooter(pageNum = 1, totalPages = 1) {
        const footerY = this.pageHeight - 20; // Adjusted for minimal footer
        
        // Page number (only if multiple pages)  
        if (totalPages > 1) {
            this.setFontStyle('normal', 8);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(this.formatTurkishText(`Sayfa ${pageNum} / ${totalPages}`), this.pageWidth - this.margin, footerY, { align: 'right' });
        }
        
        // Signature line
        this.setFontStyle('normal', 10);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(this.formatTurkishText('Personel İmzası: ________________________'), this.margin, footerY + 5);
        
        // Footer line removed for cleaner appearance
    }
}