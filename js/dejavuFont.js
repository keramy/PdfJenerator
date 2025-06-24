// DejaVu Sans font for Turkish character support in PDF
// This module provides the font data and loading functionality

class DejaVuFontLoader {
    constructor() {
        this.fontLoaded = false;
        this.fontData = null;
    }

    // Load DejaVu Sans font from external file or base64
    async loadFont() {
        try {
            // For production, we'll use a subset of DejaVu Sans that includes Turkish characters
            // This is a minimal subset to keep file size reasonable
            // Full font would be over 1MB in base64
            
            // Try to load from local file first
            const fontPath = '/fonts/DejaVuSans.ttf';
            
            try {
                const response = await fetch(fontPath);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    this.fontData = this.arrayBufferToBase64(arrayBuffer);
                    console.log('DejaVu Sans font loaded from file');
                    this.fontLoaded = true;
                    return this.fontData;
                }
            } catch (e) {
                console.log('Could not load font from file, using embedded subset');
            }
            
            // Fallback: Use embedded subset with Latin + Turkish characters
            // This is a minimal subset that includes: Basic Latin + Latin-1 Supplement + Latin Extended-A
            // Covers: a-z, A-Z, 0-9, common punctuation, and Turkish characters: ğĞ üÜ şŞ ıİ öÖ çÇ
            this.fontData = this.getEmbeddedFontSubset();
            this.fontLoaded = true;
            return this.fontData;
            
        } catch (error) {
            console.error('Error loading DejaVu Sans font:', error);
            return null;
        }
    }
    
    // Convert ArrayBuffer to base64
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    
    // Get embedded font subset (minimal version for Turkish support)
    getEmbeddedFontSubset() {
        // This is a placeholder for the actual base64 font data
        // In production, this would contain a subset of DejaVu Sans
        // For now, return null to trigger fallback in PDF generator
        console.log('Note: Full DejaVu Sans font embedding not implemented due to size constraints');
        console.log('To use DejaVu Sans, place DejaVuSans.ttf in /fonts/ directory');
        return null;
    }
    
    // Add font to jsPDF
    addToJsPDF(doc) {
        if (!this.fontLoaded || !this.fontData) {
            console.warn('DejaVu Sans font not loaded');
            return false;
        }
        
        try {
            // Add font to jsPDF virtual file system
            doc.addFileToVFS('DejaVuSans.ttf', this.fontData);
            
            // Register the font
            doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
            
            // Set as default font
            doc.setFont('DejaVuSans', 'normal');
            
            console.log('DejaVu Sans font added to jsPDF successfully');
            return true;
        } catch (error) {
            console.error('Error adding DejaVu Sans to jsPDF:', error);
            return false;
        }
    }
}

// Create global instance
window.dejaVuFontLoader = new DejaVuFontLoader();