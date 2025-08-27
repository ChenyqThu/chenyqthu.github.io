// URL Parameter Handler for Dynamic Member ID and Name Support

class URLParamHandler {
    constructor() {
        this.defaultMemberID = 'MBR15222587';
        this.defaultName = 'Yuanquan';
        this.params = this.parseURLParameters();
    }
    
    /**
     * Parse URL parameters using URLSearchParams API
     * @returns {Object} Parsed and validated parameters
     */
    parseURLParameters() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            
            const rawParams = {
                MB: urlParams.get('MB'),
                Name: urlParams.get('Name')
            };
            
            // Validate and sanitize parameters
            return {
                memberID: this.validateMemberID(rawParams.MB),
                name: this.validateName(rawParams.Name),
                // Store raw values for debugging
                _raw: rawParams
            };
            
        } catch (error) {
            console.warn('URL parameter parsing failed:', error);
            return {
                memberID: this.defaultMemberID,
                name: this.defaultName,
                _raw: { MB: null, Name: null }
            };
        }
    }
    
    /**
     * Validate and sanitize member ID parameter
     * @param {string|null} memberID - Raw member ID from URL
     * @returns {string} Validated member ID
     */
    validateMemberID(memberID) {
        // Use default if not provided
        if (!memberID) {
            return this.defaultMemberID;
        }
        
        // URL decode
        try {
            memberID = decodeURIComponent(memberID);
        } catch (error) {
            console.warn('Failed to decode member ID:', error);
            return this.defaultMemberID;
        }
        
        // Sanitize - remove HTML tags and dangerous characters
        memberID = this.sanitizeInput(memberID);
        
        // Validate format - alphanumeric, max 20 chars
        if (!memberID.match(/^[A-Za-z0-9]{1,20}$/)) {
            console.warn('Invalid member ID format:', memberID);
            return this.defaultMemberID;
        }
        
        return memberID;
    }
    
    /**
     * Validate and sanitize name parameter
     * @param {string|null} name - Raw name from URL
     * @returns {string} Validated name
     */
    validateName(name) {
        // Use default if not provided
        if (!name) {
            return this.defaultName;
        }
        
        // URL decode
        try {
            name = decodeURIComponent(name);
        } catch (error) {
            console.warn('Failed to decode name:', error);
            return this.defaultName;
        }
        
        // Sanitize - remove HTML tags and dangerous characters
        name = this.sanitizeInput(name);
        
        // Validate length - max 30 chars
        if (name.length > 30) {
            console.warn('Name too long, truncating:', name);
            name = name.substring(0, 30);
        }
        
        // Validate characters - allow letters, numbers, spaces, hyphens, and Unicode characters
        if (!name.match(/^[\w\s\-\u4e00-\u9fff\u0100-\u017f\u0180-\u024f\u1e00-\u1eff]+$/)) {
            console.warn('Invalid name format:', name);
            return this.defaultName;
        }
        
        return name.trim();
    }
    
    /**
     * Sanitize input to prevent XSS attacks
     * @param {string} input - Raw input string
     * @returns {string} Sanitized string
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        // Remove HTML tags
        input = input.replace(/<[^>]*>/g, '');
        
        // Remove script-related content
        input = input.replace(/javascript:/gi, '');
        input = input.replace(/on\w+\s*=/gi, '');
        
        // Remove other potentially dangerous characters
        input = input.replace(/[<>\"'`]/g, '');
        
        return input;
    }
    
    /**
     * Get validated member ID
     * @returns {string} Member ID to use
     */
    getMemberID() {
        return this.params.memberID;
    }
    
    /**
     * Get validated name
     * @returns {string} Name to display
     */
    getName() {
        return this.params.name;
    }
    
    /**
     * Check if custom parameters were provided
     * @returns {Object} Status of parameter customization
     */
    getCustomizationStatus() {
        return {
            hasCustomMemberID: this.params._raw.MB !== null && this.params.memberID !== this.defaultMemberID,
            hasCustomName: this.params._raw.Name !== null && this.params.name !== this.defaultName,
            isFullyCustomized: this.params.memberID !== this.defaultMemberID && this.params.name !== this.defaultName
        };
    }
    
    /**
     * Get debug information about parameter processing
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        return {
            url: window.location.href,
            rawParams: this.params._raw,
            validatedParams: {
                memberID: this.params.memberID,
                name: this.params.name
            },
            defaults: {
                memberID: this.defaultMemberID,
                name: this.defaultName
            },
            customization: this.getCustomizationStatus()
        };
    }
    
    /**
     * Update page content with custom name
     */
    updatePageContent() {
        try {
            // Update welcome message
            const welcomeHeader = document.getElementById('welcome-text');
            if (welcomeHeader) {
                welcomeHeader.textContent = `Let's Go, ${this.getName()}`;
            }
            
            // Log successful update
            const status = this.getCustomizationStatus();
            if (status.hasCustomName || status.hasCustomMemberID) {
                console.log('Page customized with parameters:', {
                    name: this.getName(),
                    memberID: this.getMemberID()
                });
            }
            
        } catch (error) {
            console.error('Failed to update page content:', error);
        }
    }
    
    /**
     * Show parameter validation errors to user (if any)
     */
    showValidationErrors() {
        const errors = [];
        
        // Check for parameter issues
        if (this.params._raw.MB && this.params.memberID === this.defaultMemberID) {
            errors.push('Invalid Member ID format. Using default.');
        }
        
        if (this.params._raw.Name && this.params.name === this.defaultName) {
            errors.push('Invalid Name format. Using default.');
        }
        
        // Display errors if any
        if (errors.length > 0) {
            console.warn('Parameter validation issues:', errors);
            this.showUINotification(errors.join(' '), 'error');
        }
    }
    
    /**
     * Show UI notification for parameter status
     * @param {string} message - Message to display
     * @param {string} type - Notification type ('info' or 'error')
     */
    showUINotification(message, type = 'info') {
        try {
            // Create notification element
            const notification = document.createElement('div');
            const baseClasses = 'bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3 my-5 text-blue-400 text-sm text-center';
            const errorClasses = 'bg-red-500/10 border-red-500/30 text-red-400';
            notification.className = type === 'error' ? `${baseClasses} ${errorClasses}`.replace('bg-blue-500/10 border border-blue-500/30 text-blue-400', '') : baseClasses;
            notification.textContent = message;
            
            // Insert after welcome section
            const welcomeSection = document.querySelector('main > div:first-child');
            const mainContent = document.querySelector('main');
            
            if (welcomeSection && mainContent) {
                // Remove existing notifications
                const existingNotifications = mainContent.querySelectorAll('.param-notification');
                existingNotifications.forEach(n => n.remove());
                
                // Insert new notification
                welcomeSection.insertAdjacentElement('afterend', notification);
                
                // Auto-remove after 5 seconds for non-error notifications
                if (type !== 'error') {
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 5000);
                }
            }
            
        } catch (error) {
            console.error('Failed to show UI notification:', error);
        }
    }
    
    /**
     * Show success notification for custom parameters
     */
    showCustomizationNotification() {
        const status = this.getCustomizationStatus();
        
        if (status.hasCustomName && status.hasCustomMemberID) {
            this.showUINotification(`Customized for ${this.getName()} (${this.getMemberID()})`, 'info');
        } else if (status.hasCustomName) {
            this.showUINotification(`Customized for ${this.getName()}`, 'info');
        } else if (status.hasCustomMemberID) {
            this.showUINotification(`Using member ID: ${this.getMemberID()}`, 'info');
        }
    }
}

// Global instance
let urlParamHandler;

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        urlParamHandler = new URLParamHandler();
        window.urlParamHandler = urlParamHandler; // Ensure global access
        
        urlParamHandler.updatePageContent();
        urlParamHandler.showValidationErrors();
        urlParamHandler.showCustomizationNotification();
        
        
        console.log('URL Parameter Handler initialized successfully');
    } catch (error) {
        console.error('Failed to initialize URL parameter handler:', error);
    }
});

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.URLParamHandler = URLParamHandler;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { URLParamHandler };
}