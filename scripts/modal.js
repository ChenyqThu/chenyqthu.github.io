// Modal functionality for 24 Hour Fitness QR Code Check-in

class QRModal {
    constructor() {
        this.modal = document.getElementById('qr-modal');
        
        if (!this.modal) {
            console.error('Modal element not found');
            return;
        }
        
        this.qrContainer = this.modal.querySelector('.qr-placeholder');
        this.modalContent = this.modal.querySelector('.modal-content');
        this.handleBar = this.modal.querySelector('.w-10');
        this.isOpen = false;
        this.isDragging = false;
        this.startY = 0;
        this.currentY = 0;
        this.dragThreshold = 100; // Minimum drag distance to close
        
        console.log('Modal elements found:', {
            modal: !!this.modal,
            qrContainer: !!this.qrContainer,
            modalContent: !!this.modalContent,
            handleBar: !!this.handleBar
        });
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        if (!this.modal) return;
        
        // Click outside modal to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Prevent modal content clicks from closing modal
        if (this.modalContent) {
            this.modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        // Touch and drag events for pull-to-close
        this.initDragEvents();
    }
    
    initDragEvents() {
        if (!this.modalContent) return;
        
        // Mouse events
        this.modalContent.addEventListener('mousedown', this.handleDragStart.bind(this));
        document.addEventListener('mousemove', this.handleDragMove.bind(this));
        document.addEventListener('mouseup', this.handleDragEnd.bind(this));
        
        // Touch events
        this.modalContent.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleDragEnd.bind(this));
    }
    
    handleDragStart(e) {
        if (!this.isOpen) return;
        
        // Only start drag from handle bar or top area
        const target = e.target;
        const isHandle = target.classList.contains('w-10') || target.closest('.flex.justify-center');
        if (!isHandle) return;
        
        this.isDragging = true;
        this.startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        this.modalContent.style.transition = 'none';
        
        // Prevent text selection
        e.preventDefault();
    }
    
    handleDragMove(e) {
        if (!this.isDragging || !this.isOpen) return;
        
        this.currentY = (e.type === 'touchmove' ? e.touches[0].clientY : e.clientY) - this.startY;
        
        // Only allow dragging down
        if (this.currentY > 0) {
            this.modalContent.style.transform = `translateY(${this.currentY}px)`;
        }
        
        e.preventDefault();
    }
    
    handleDragEnd() {
        if (!this.isDragging || !this.isOpen) return;
        
        this.isDragging = false;
        this.modalContent.style.transition = '';
        
        // Close if dragged down enough
        if (this.currentY > this.dragThreshold) {
            this.close();
        } else {
            // Snap back to original position
            this.modalContent.style.transform = '';
        }
        
        this.currentY = 0;
    }
    
    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.modal.style.display = 'block';
        
        // Focus management for accessibility
        this.previousActiveElement = document.activeElement;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Reset modal content position
        this.modalContent.style.transform = 'translateY(100%)';
        this.modalContent.style.transition = 'transform 0.3s ease-out';
        
        // Trigger animation after a brief delay to ensure display:block takes effect
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.modal.style.opacity = '1';
                this.modalContent.style.transform = 'translateY(0)';
            });
        });
        
        // Generate QR code automatically when modal opens
        this.generateQR();
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        // Animate out
        this.modal.style.opacity = '0';
        this.modalContent.style.transform = 'translateY(100%)';
        
        // Hide modal after animation
        setTimeout(() => {
            this.modal.style.display = 'none';
            
            // Restore focus
            if (this.previousActiveElement) {
                this.previousActiveElement.focus();
            }
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Clear QR content
            this.clearQRContent();
        }, 300);
    }
    
    showQRPlaceholder() {
        this.qrContainer.innerHTML = '<p class="text-gray-500 text-lg font-medium">QR Code will appear here</p>';
        this.qrContainer.classList.remove('loading');
    }
    
    showLoading() {
        this.qrContainer.innerHTML = '<p class="text-gray-500 text-lg font-medium">Generating QR Code...</p>';
        this.qrContainer.classList.add('loading');
    }
    
    showQRCode(base64ImageData) {
        this.qrContainer.classList.remove('loading');
        this.qrContainer.innerHTML = `
            <img src="${base64ImageData}" alt="QR Code for check-in" class="qr-code-image">
        `;
    }
    
    showError(message = 'Unable to generate QR code. Please try again.') {
        this.qrContainer.classList.remove('loading');
        this.qrContainer.innerHTML = `
            <div class="error-container text-center">
                <p class="text-red-500 text-sm mb-3">${message}</p>
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm" onclick="qrModal.generateQR()">Try Again</button>
            </div>
        `;
    }
    
    clearQRContent() {
        this.qrContainer.innerHTML = '<p class="text-gray-500 text-lg font-medium">QR Code will appear here</p>';
        this.qrContainer.classList.remove('loading');
    }
    
    /**
     * Generate QR code using the QR API
     */
    async generateQR() {
        try {
            // Initialize QR API if not already done
            if (!this.qrAPI) {
                this.qrAPI = new QRCodeAPI();
            }
            
            // Show loading state
            this.showLoading();
            
            // Get custom member ID from URL parameters if available
            let customMemberID = null;
            if (window.urlParamHandler) {
                const memberID = window.urlParamHandler.getMemberID();
                // Always use the member ID from URL parameters, whether custom or default
                // This ensures consistent behavior and proper parameter passing
                customMemberID = memberID;
                
            } else {
                console.warn('Modal: No URL parameter handler available, using default');
            }
            
            // Generate QR code with custom member ID
            const base64ImageData = await this.qrAPI.generateQRCode(customMemberID);
            
            // Display the QR code
            this.showQRCode(base64ImageData);
            
        } catch (error) {
            console.error('QR generation failed:', error);
            
            // Show appropriate error message
            let errorMessage = 'Unable to generate QR code. Please try again.';
            
            if (error.message.includes('Network error')) {
                errorMessage = 'Network error: Please check your internet connection and try again.';
            } else if (error.message.includes('API error')) {
                errorMessage = 'Service temporarily unavailable. Please try again in a moment.';
            }
            
            this.showError(errorMessage);
        }
    }
    
    // Legacy methods for backward compatibility
    generateTimestamp() {
        return Date.now();
    }
    
    getCheckInData() {
        return {
            "DT": this.generateTimestamp(),
            "AP": "1.78.2",
            "OS": "iOS",
            "TP": "P",
            "SR": "24GO",
            "DI": "252AF98D-E54C-4DDC-8C62-52B52EA0E795",
            "MB": "MBR15222587"
        };
    }
}

// Initialize modal when DOM is loaded
let qrModal;

document.addEventListener('DOMContentLoaded', () => {
    qrModal = new QRModal();
});

// Global functions for button onclick handlers
function openModal() {
    console.log('openModal called, qrModal:', qrModal);
    if (qrModal) {
        qrModal.open();
    } else {
        console.error('qrModal not initialized');
    }
}

function closeModal(event) {
    if (qrModal) {
        if (event) {
            event.stopPropagation();
        }
        qrModal.close();
    }
}

// Export for potential future module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QRModal };
}