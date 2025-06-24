# LIZAR KUYUMCULUK Work Order System - Deployment Guide

## System Requirements

- Web Server: Apache 2.4+ or Nginx 1.18+
- PHP: Not required (pure client-side application)
- Browser Support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Minimum Server Space: 5MB

## Pre-Deployment Checklist

- [x] Remove all test/debug files
- [x] Create production configuration
- [x] Add security headers (.htaccess)
- [x] Remove debug console.log statements
- [ ] Test all features thoroughly
- [ ] Backup current version

## Directory Structure

```
/WorkorderGenerator/
├── index.html              # Main application
├── config.js               # Production configuration
├── .htaccess              # Apache configuration
├── robots.txt             # Search engine rules
├── README.md              # User documentation
├── CLAUDE.md              # Developer notes
├── DEPLOYMENT.md          # This file
├── css/                   # Stylesheets
│   ├── styles.css         # Main styles
│   └── print.css          # Print styles
├── js/                    # JavaScript files
│   ├── app.js             # Main application
│   ├── logger.js          # Debug/production logger
│   ├── database.js        # Product database
│   ├── dejavuFont.js      # Font loader
│   ├── imageHandler.js    # Image processing
│   ├── productManager.js  # Product management
│   ├── customerDatabase.js # Customer data
│   ├── customerManager.js # Customer management
│   ├── orderHistory.js    # Order storage
│   ├── orderManager.js    # Order creation
│   ├── pdfGenerator.js    # PDF generation
│   ├── offline-pdf.js     # Offline PDF fallback
│   ├── historyView.js     # History interface
│   └── lib/
│       └── jspdf.min.js   # PDF library
├── fonts/                 # Font files
│   ├── DejaVuSans.ttf     # Turkish font support
│   └── DejaVuSans-Bold.ttf
├── images/                # Application images
│   └── lizar-logo.png     # Company logo
└── data/                  # Data files
    └── jewelry_database.json # Product data

```

## Deployment Steps

### 1. Server Configuration

#### Apache (.htaccess included)
- Ensure mod_rewrite, mod_headers, mod_expires enabled
- Place .htaccess in application root

#### Nginx
```nginx
location /WorkorderGenerator {
    charset utf-8;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    
    # Cache static assets
    location ~* \.(css|js|jpg|jpeg|png|svg|woff|woff2|ttf)$ {
        expires 1M;
        add_header Cache-Control "public";
    }
    
    # Don't cache HTML
    location ~* \.html$ {
        expires -1;
    }
}
```

### 2. Production Configuration

Edit `config.js` to set:
```javascript
debug: false  // Disable debug mode
```

### 3. HTTPS Configuration

Uncomment HTTPS redirect in .htaccess:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
</IfModule>
```

### 4. File Permissions

```bash
# Set proper permissions
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;

# Protect sensitive files
chmod 640 .htaccess
chmod 640 config.js
```

### 5. Performance Optimization

#### Enable Gzip Compression
Already configured in .htaccess

#### Minify Assets (Optional)
```bash
# Install minifiers
npm install -g uglify-js clean-css-cli

# Minify JavaScript
uglifyjs js/*.js -o js/app.min.js

# Minify CSS
cleancss -o css/styles.min.css css/styles.css
```

## Testing Checklist

### Core Features
- [ ] Create new work order
- [ ] Add products with Turkish characters
- [ ] Customer search and selection
- [ ] Generate PDF with proper formatting
- [ ] View order history
- [ ] Export to Excel
- [ ] Product management
- [ ] Customer management

### Turkish Character Support
- [ ] PDF displays: ğ, ü, ş, ı, ö, ç correctly
- [ ] Excel export handles Turkish characters
- [ ] Search works with Turkish characters

### Performance
- [ ] Page loads in < 2 seconds
- [ ] PDF generation < 3 seconds
- [ ] Search responds in < 500ms

## Monitoring

### Error Logging
Errors are always logged to console. Consider adding:
- Remote error logging service (e.g., Sentry)
- Google Analytics for usage tracking

### Backup Strategy
- Daily backup of localStorage data
- Weekly full application backup
- Store backups offsite

## Troubleshooting

### Common Issues

#### PDF Font Not Loading
- Check `/fonts/` directory permissions
- Verify DejaVuSans.ttf exists
- Check browser console for CORS errors

#### localStorage Full
- Clear old orders > 1 year
- Implement data archiving
- Increase browser storage quota

#### Slow Performance
- Check browser console for errors
- Verify no debug mode active
- Clear browser cache

## Security Considerations

1. **Content Security Policy**: Configured in .htaccess
2. **HTTPS**: Required for production
3. **Input Validation**: All user inputs sanitized
4. **XSS Protection**: Enabled via headers
5. **Clickjacking**: Prevented with X-Frame-Options

## Support

For technical support or issues:
- Check CLAUDE.md for development notes
- Review browser console for errors
- Ensure all files uploaded correctly

## Version History

- v1.0.0 - Initial production release
  - Full Turkish character support
  - PDF generation with pagination
  - Excel export functionality
  - Product image support