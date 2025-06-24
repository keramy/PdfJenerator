# Jewelry Work Order Management System - Development Guide

This document contains important information for AI assistants working on this project.

## Project Overview
A comprehensive jewelry work order management system with product catalog, customer management, and PDF generation capabilities.

## Key Features
- Work order creation with product selection
- Product management with image support and dual weight tracking (metal + stones)
- Customer database with search functionality
- Order history tracking with status management
- PDF generation for work orders
- Excel export functionality
- Material consumption tracking

## Recent Updates (Latest Session)
- **FIXED**: Product dropdown selection and validation issues ✅
  - Resolved critical product database reference issue in showProductSuggestions method
  - Fixed single-click product selection from dropdown (no more double-click required)
  - Enhanced customer validation workflow for product search functionality
  - Added fallback product data loading mechanism for offline/fetch failures
  - Implemented comprehensive event delegation debugging system
  - Complete order creation workflow now functions properly
- **FIXED**: jsPDF loading issue that caused "jsPDF library not loaded" console warnings
- **ENHANCED**: Asynchronous PDF loading with improved detection and multiple CDN fallbacks
- **IMPROVED**: PDF generation now uses promise-based loading with proper error handling
- **NEW: Complete PDF Generation Overhaul** ✅
  - **FULL TURKISH CHARACTER SUPPORT**: Implemented DejaVu Sans font loading system for native support of ğ, ü, ş, ı, ö, ç characters
  - **DejaVu Sans Integration**: Created font loader module that loads TTF files from /fonts/ directory and converts to base64
  - **Smart Font System**: Automatic fallback to Times font with character mapping if DejaVu Sans fails to load
  - **Product Images**: Added thumbnail images in PDF table with 14x14mm sizing and placeholder icons for products without images
  - **Unified Font Handling**: Created setFontStyle() helper method for consistent font management
  - Implemented 10-item pagination system (100 items = 10 pages as requested)
  - Professional table design with alternating row colors, borders, and improved spacing
  - Page numbers displayed only when multiple pages exist (format: "Sayfa X / Y")
  - Improved header and footer layout with Turkish locale timestamps
  - Enhanced PDF layout with proper visual hierarchy and professional appearance
  - Fixed broken PDF layout issues with proper column alignment and text positioning
- Removed Duplicate Order button from history tab (both actions column and modal)
- Fixed Reprint PDF functionality with proper error handling and fallbacks
- Implemented native Excel export (.xls format) without external dependencies
- Fixed Excel export to show proper columns: Order Number, Date, Customer, Items, Total Weight, Status
- Fixed image scaling for product thumbnails in order view and product grid
- Completed comprehensive Turkish translation of the entire application interface

## Previous Updates
- Fixed icon visibility issues by removing conflicting class attributes from SVG elements
- Implemented Bulletproof Icon Architecture v2.0 for consistent icon display
- Added metal weight and stone weight tracking to products
- Added material consumption statistics in history section
- Implemented order status workflow (In Production → Completed)
- Fixed history tab filters styling consistency

## Known Issues & Solutions

### Icon Visibility
**Problem**: SVG icons weren't showing despite being in the HTML
**Solution**: Remove `class="btn-icon"` from SVG elements to avoid CSS conflicts

### PDF Generation
**Problem**: jsPDF library loading race condition causing "jsPDF library not loaded" warnings
**Root Cause**: Timing issue between script loading and library detection in app.js line 262
**Solution**: 
- Implemented enhanced async loading with `ensureJsPDF()` promise-based function
- Added multiple detection methods for different jsPDF initialization patterns
- Made PDF generation methods async with proper error handling
- Improved fallback chain with better error messages and user feedback
- Added test page (`test-jspdf.html`) for debugging jsPDF loading issues

### Excel Export
**Problem**: XLSX library wasn't loading properly
**Solution**: Implemented native Excel XML export that creates .xls files without external dependencies

### Image Scaling
**Problem**: Product images in order thumbnails and product grid weren't scaling properly
**Root Cause**: CSS changes were being applied to wrong directory (main vs WorkorderGenerator)
**Solution**: Applied proper CSS rules in correct location with strong selectors and `object-fit: cover`

### Turkish Translation
**Scope**: Complete application localization to Turkish language
**Coverage**: All UI elements, messages, notifications, PDF content, and form labels
**Language**: Updated HTML lang attribute to "tr" for proper language recognition

## Important Implementation Details

### Weight Tracking
- Products have separate `metalWeight` and `stoneWeight` fields
- Total weight is calculated as sum of both
- All weights displayed in grams (g)
- Database migration handled for backward compatibility

### Order Status Management
- Orders start with status: 'in_production'
- Green checkmark toggle button to mark as 'completed'
- Status persists in order history

### Excel Export Format
- Uses Excel XML format for native .xls files
- Headers: Order Number | Date | Customer | Items | Total Weight | Status
- Styled headers with gray background
- Proper column widths and data types

## Development Guidelines
1. Always test icon visibility after any CSS changes
2. Maintain consistent button structure across all tabs
3. Use the established icon architecture patterns
4. Test PDF generation in both online and offline scenarios
5. Ensure weight calculations include both metal and stone weights
6. Keep Excel export simple and compatible

## File Structure
- `/css/styles.css` - Main styles with Bulletproof Icon Architecture and status toggle styles
- `/js/historyView.js` - History tab with Excel export and status management
- `/js/orderHistory.js` - Order storage with status tracking
- `/js/orderManager.js` - Order creation with dual weight support
- `/js/pdfGenerator.js` - PDF generation with weight breakdown
- `/index.html` - Main application file
- `/docs/` - Documentation and development notes

## Testing Checklist
- [ ] Icon visibility in all tabs
- [ ] PDF generation (online and offline)
- [ ] Excel export creates proper .xls file
- [ ] Order status toggle works correctly
- [ ] Weight calculations show correctly
- [ ] Material consumption stats update
- [ ] All filters work in history tab