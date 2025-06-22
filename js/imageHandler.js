class ImageHandler {
    constructor() {
        this.setupImageUpload();
    }

    setupImageUpload() {
        const imageInput = document.getElementById('product-image');
        if (imageInput) {
            imageInput.addEventListener('change', this.handleImageSelect.bind(this));
        }
    }

    handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) {
            if (this.validateImage(file)) {
                this.previewImage(file);
            } else {
                alert('Please select a valid image file (JPG, PNG, GIF) under 5MB');
                event.target.value = '';
            }
        }
    }

    validateImage(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        return allowedTypes.includes(file.type) && file.size <= maxSize;
    }

    previewImage(file) {
        const reader = new FileReader();
        const preview = document.getElementById('image-preview');

        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" 
                     style="max-width: 100%; max-height: 200px; border-radius: 8px;" 
                     alt="Product preview">
                <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #6c757d;">
                    ${file.name} (${(file.size / 1024).toFixed(1)}KB)
                </p>
            `;
        };

        reader.readAsDataURL(file);
    }

    getImageDataURL() {
        const img = document.querySelector('#image-preview img');
        return img ? img.src : null;
    }

    clearPreview() {
        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 4v16m8-8H4" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p>Click to upload image</p>
            `;
        }
        
        const input = document.getElementById('product-image');
        if (input) {
            input.value = '';
        }
    }
}

const imageHandler = new ImageHandler();