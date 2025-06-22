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
- Removed Duplicate Order button from history tab (both actions column and modal)
- Fixed Reprint PDF functionality with proper error handling and fallbacks
- Implemented native Excel export (.xls format) without external dependencies
- Fixed Excel export to show proper columns: Order Number, Date, Customer, Items, Total Weight, Status
- Fixed image scaling for product thumbnails in order view and product grid

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
**Problem**: jsPDF library may not load from CDN
**Solution**: Multiple fallback CDNs implemented, with offline PDF generator as backup

### Excel Export
**Problem**: XLSX library wasn't loading properly
**Solution**: Implemented native Excel XML export that creates .xls files without external dependencies

### Image Scaling
**Problem**: Product images in order thumbnails and product grid weren't scaling properly
**Root Cause**: CSS changes were being applied to wrong directory (main vs WorkorderGenerator)
**Solution**: Applied proper CSS rules in correct location with strong selectors and `object-fit: cover`

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