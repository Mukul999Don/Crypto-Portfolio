// Contact Form JavaScript
class ContactForm {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
    }

    handleSubmit() {
        const form = document.getElementById('contactForm');
        const formData = new FormData(form);
        
        const contactData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
            newsletter: document.getElementById('newsletter').checked,
            timestamp: new Date().toISOString()
        };

        // Validate form data
        if (!this.validateForm(contactData)) {
            return;
        }

        // In a real application, this would send to the server
        this.submitToServer(contactData);
    }

    validateForm(data) {
        let isValid = true;

        // Clear previous validation states
        this.clearValidationStates();

        // Name validation
        if (!data.name || data.name.trim().length < 2) {
            this.showFieldError('name', 'Name must be at least 2 characters long');
            isValid = false;
        } else {
            this.showFieldSuccess('name');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        } else {
            this.showFieldSuccess('email');
        }

        // Message validation
        if (!data.message || data.message.trim().length < 10) {
            this.showFieldError('message', 'Message must be at least 10 characters long');
            isValid = false;
        } else {
            this.showFieldSuccess('message');
        }

        return isValid;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
            
            // Remove existing feedback
            const existingFeedback = field.parentNode.querySelector('.invalid-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }

            // Add error message
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = message;
            field.parentNode.appendChild(feedback);
        }
    }

    showFieldSuccess(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('is-valid');
            field.classList.remove('is-invalid');
            
            // Remove existing feedback
            const existingFeedback = field.parentNode.querySelector('.invalid-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }
        }
    }

    clearValidationStates() {
        const fields = ['name', 'email', 'message'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.remove('is-valid', 'is-invalid');
                const existingFeedback = field.parentNode.querySelector('.invalid-feedback');
                if (existingFeedback) {
                    existingFeedback.remove();
                }
            }
        });
    }

    async submitToServer(contactData) {
        const submitButton = document.querySelector('#contactForm button[type="submit"]');
        const originalText = submitButton.textContent;
        
        try {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

            // Simulate server request (in real app, this would be an actual API call)
            await this.simulateServerRequest(contactData);

            // Save to localStorage for demo purposes
            this.saveContactMessage(contactData);

            // Show success message
            app.showAlert('contactAlert', 
                'Thank you for your message! We\'ll get back to you within 24-48 hours.', 
                'success'
            );

            // Reset form
            document.getElementById('contactForm').reset();
            this.clearValidationStates();

        } catch (error) {
            console.error('Error submitting form:', error);
            app.showAlert('contactAlert', 
                'There was an error sending your message. Please try again later.', 
                'danger'
            );
        } finally {
            // Reset button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    async simulateServerRequest(data) {
        // Simulate network delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate occasional failures for testing
                if (Math.random() < 0.1) {
                    reject(new Error('Server error'));
                } else {
                    resolve(data);
                }
            }, 1000);
        });
    }

    saveContactMessage(contactData) {
        // Save contact messages to localStorage for demo
        const existingMessages = app.loadFromStorage('crypto_portfolio_contacts') || [];
        existingMessages.push({
            id: Date.now(),
            ...contactData
        });
        app.saveToStorage('crypto_portfolio_contacts', existingMessages);
    }

    // Admin function to view stored contact messages (for demo)
    viewStoredMessages() {
        const messages = app.loadFromStorage('crypto_portfolio_contacts') || [];
        console.table(messages);
        return messages;
    }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('contactForm')) {
        new ContactForm();
    }
});