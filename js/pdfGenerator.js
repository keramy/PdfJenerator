class PDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210;
        this.pageHeight = 297;
        this.margin = 20;
        this.currentY = 0;
    }

    generateWorkOrder(orderData) {
        try {
            // Check if jsPDF is available
            if (typeof window.jsPDF === 'undefined') {
                throw new Error('jsPDF library not loaded. Please refresh the page.');
            }
            
            // Try different ways to access jsPDF
            const { jsPDF } = window;
            if (jsPDF) {
                this.doc = new jsPDF();
            } else if (window.jsPDF) {
                this.doc = new window.jsPDF();
            } else {
                throw new Error('jsPDF library not found');
            }
            this.currentY = this.margin;

            this.addHeader(orderData);
            this.addOrderInfo(orderData);
            this.addItems(orderData.items);
            this.addSummary(orderData);
            this.addFooter();

            const filename = `WorkOrder_${orderData.orderNumber}.pdf`;
            this.doc.save(filename);
            
            return true;
        } catch (error) {
            console.error('PDF generation error:', error);
            throw error;
        }
    }

    addHeader(orderData) {
        this.doc.setFontSize(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('JEWELRY WORK ORDER', this.pageWidth / 2, this.currentY, { align: 'center' });
        
        this.currentY += 15;
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Professional Jewelry Manufacturing', this.pageWidth / 2, this.currentY, { align: 'center' });
        
        this.currentY += 20;
        
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 10;
    }

    addOrderInfo(orderData) {
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        
        this.doc.text(`Order Number: ${orderData.orderNumber}`, this.margin, this.currentY);
        this.doc.text(`Date: ${orderData.date}`, this.pageWidth - this.margin - 50, this.currentY);
        
        this.currentY += 10;
        
        this.doc.text(`Customer: ${orderData.customerName || 'Not specified'}`, this.margin, this.currentY);
        
        this.currentY += 10;
        
        this.doc.text(`Total Items: ${orderData.totalItems}`, this.margin, this.currentY);
        this.doc.text(`Total Weight: ${orderData.totalWeight.toFixed(2)}g`, this.pageWidth - this.margin - 50, this.currentY);
        
        this.currentY += 15;
        
        this.doc.setLineWidth(0.3);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 15;
    }

    addItems(items) {
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('ORDER ITEMS', this.margin, this.currentY);
        this.currentY += 15;

        items.forEach((item, index) => {
            this.addSingleItem(item, index + 1);
        });
    }

    addSingleItem(item, itemNumber) {
        if (this.currentY > this.pageHeight - 60) {
            this.doc.addPage();
            this.currentY = this.margin;
        }

        const itemHeight = 45;
        const imageSize = 35;
        const startY = this.currentY;

        this.doc.setFillColor(248, 249, 250);
        this.doc.rect(this.margin, startY, this.pageWidth - (2 * this.margin), itemHeight, 'F');

        this.doc.setDrawColor(220, 220, 220);
        this.doc.setLineWidth(0.2);
        this.doc.rect(this.margin, startY, this.pageWidth - (2 * this.margin), itemHeight);

        this.doc.setFillColor(255, 255, 255);
        this.doc.rect(this.margin + 5, startY + 5, imageSize, imageSize, 'F');
        this.doc.setDrawColor(200, 200, 200);
        this.doc.rect(this.margin + 5, startY + 5, imageSize, imageSize);

        // Try to add product image if available
        if (item.imageData) {
            try {
                // Add the image to PDF (jsPDF supports base64 images)
                this.doc.addImage(item.imageData, 'JPEG', this.margin + 5, startY + 5, imageSize, imageSize);
            } catch (error) {
                console.warn('Could not add image to PDF:', error);
                // Fallback to placeholder text
                this.doc.setFontSize(8);
                this.doc.setTextColor(150, 150, 150);
                this.doc.text('IMAGE', this.margin + 5 + (imageSize / 2), startY + 5 + (imageSize / 2), { align: 'center' });
            }
        } else {
            // Show placeholder text
            this.doc.setFontSize(8);
            this.doc.setTextColor(150, 150, 150);
            this.doc.text('IMAGE', this.margin + 5 + (imageSize / 2), startY + 5 + (imageSize / 2), { align: 'center' });
        }

        const textStartX = this.margin + imageSize + 15;
        let textY = startY + 8;

        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(`${itemNumber}. ${item.code}`, textStartX, textY);

        textY += 6;
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(item.description, textStartX, textY);

        textY += 8;
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Metal: ${item.metalWeight || item.weight || 0}g`, textStartX, textY);
        this.doc.text(`Stone: ${item.stoneWeight ? item.stoneWeight + 'g' : 'None'}`, textStartX + 25, textY);
        this.doc.text(`Material: ${item.material}`, textStartX + 50, textY);
        this.doc.text(`Type: ${item.type}`, textStartX + 80, textY);

        textY += 6;
        this.doc.text(`Quantity: ${item.quantity}`, textStartX, textY);
        this.doc.text(`Total Weight: ${((item.totalWeight || item.weight || 0) * item.quantity).toFixed(2)}g`, textStartX + 35, textY);

        if (item.notes) {
            textY += 6;
            this.doc.setFont('helvetica', 'italic');
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(`Notes: ${item.notes}`, textStartX, textY);
        }

        this.currentY += itemHeight + 10;
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
        this.doc.text('ORDER SUMMARY', this.margin, this.currentY);
        this.currentY += 15;

        this.doc.setFontSize(12);
        this.doc.text(`Total Items: ${orderData.totalItems}`, this.margin, this.currentY);
        this.currentY += 8;
        
        this.doc.text(`Metal Weight: ${orderData.totalMetalWeight.toFixed(2)}g`, this.margin, this.currentY);
        this.doc.text(`Stone Weight: ${orderData.totalStoneWeight.toFixed(2)}g`, this.margin + 60, this.currentY);
        this.currentY += 8;
        
        this.doc.text(`Total Weight: ${orderData.totalWeight.toFixed(2)}g`, this.margin, this.currentY);
        this.currentY += 8;

        this.doc.text(`Customer: ${orderData.customerName || 'Not specified'}`, this.margin, this.currentY);
        this.currentY += 8;
        
        this.doc.text(`Order Date: ${orderData.date}`, this.margin, this.currentY);
        this.doc.text(`Order Number: ${orderData.orderNumber}`, this.margin + 60, this.currentY);
        this.currentY += 15;

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Staff Signature: ________________________', this.margin, this.currentY);
        this.doc.text('Date Completed: ________________________', this.margin + 80, this.currentY);
    }

    addFooter() {
        const footerY = this.pageHeight - 15;
        
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100);
        
        this.doc.text('Generated by Jewelry Work Order System', this.pageWidth / 2, footerY, { align: 'center' });
        
        const now = new Date();
        const timestamp = now.toLocaleString();
        this.doc.text(`Generated on: ${timestamp}`, this.pageWidth / 2, footerY + 5, { align: 'center' });
    }
}