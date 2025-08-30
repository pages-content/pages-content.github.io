// ======================
// Theme Management System
// ======================

class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                name: 'Light',
                icon: 'bi-sun',
                label: 'Light'
            },
            dark: {
                name: 'Dark', 
                icon: 'bi-moon',
                label: 'Dark'
            },
            'high-contrast': {
                name: 'High Contrast',
                icon: 'bi-circle-half',
                label: 'High Contrast'
            }
        };
        
        this.currentTheme = 'light';
        this.init();
    }
    
    init() {
        // Load saved theme or detect system preference
        this.loadTheme();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update UI
        this.updateThemeUI();
        
        // Listen for system theme changes
        this.listenForSystemThemeChanges();
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('preferred-theme');
        
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        } else {
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.currentTheme = 'dark';
            } else {
                this.currentTheme = 'light';
            }
        }
        
        this.applyTheme(this.currentTheme);
    }
    
    setupEventListeners() {
        // Theme dropdown options
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = e.currentTarget.dataset.theme;
                this.switchTheme(theme);
            });
        });
        
        // Keyboard shortcut for theme switching (Ctrl/Cmd + Shift + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyT') {
                e.preventDefault();
                this.cycleTheme();
            }
        });
    }
    
    switchTheme(theme) {
        if (!this.themes[theme]) return;
        
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.saveTheme(theme);
        this.updateThemeUI();
        
        // Announce theme change for accessibility
        this.announceThemeChange(theme);
    }
    
    applyTheme(theme) {
        const html = document.documentElement;
        
        // Add transition class for smooth theme switching
        html.classList.add('theme-transitioning');
        
        // Apply theme
        html.setAttribute('data-bs-theme', theme);
        
        // Remove transition class after animation
        setTimeout(() => {
            html.classList.remove('theme-transitioning');
        }, 300);
    }
    
    saveTheme(theme) {
        localStorage.setItem('preferred-theme', theme);
    }
    
    updateThemeUI() {
        const currentThemeSpan = document.getElementById('current-theme');
        const currentThemeData = this.themes[this.currentTheme];
        
        if (currentThemeSpan && currentThemeData) {
            currentThemeSpan.textContent = currentThemeData.label;
        }
        
        // Update dropdown button icon
        const themeButton = document.getElementById('themeDropdown');
        if (themeButton) {
            const iconElement = themeButton.querySelector('i');
            if (iconElement) {
                // Remove all theme icons
                iconElement.className = iconElement.className.replace(/bi-sun|bi-moon|bi-circle-half/g, '');
                // Add current theme icon
                iconElement.classList.add(currentThemeData.icon);
            }
        }
        
        // Update active state in dropdown
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            if (option.dataset.theme === this.currentTheme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    cycleTheme() {
        const themeKeys = Object.keys(this.themes);
        const currentIndex = themeKeys.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        const nextTheme = themeKeys[nextIndex];
        
        this.switchTheme(nextTheme);
    }
    
    listenForSystemThemeChanges() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if no manual preference is saved
                if (!localStorage.getItem('preferred-theme')) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    this.switchTheme(newTheme);
                }
            });
        }
    }
    
    announceThemeChange(theme) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = `Theme changed to ${this.themes[theme].label}`;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// ======================
// Smooth Scrolling for Navigation
// ======================

class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        // Add smooth scrolling to all anchor links
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', this.handleClick.bind(this));
        });
    }
    
    handleClick(e) {
        e.preventDefault();
        
        const targetId = e.currentTarget.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetElement.offsetTop - navbarHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// ======================
// Navbar Scroll Effect
// ======================

class NavbarScrollEffect {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.init();
    }
    
    init() {
        if (!this.navbar) return;
        
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
}

// ======================
// Form Handling
// ======================

class FormHandler {
    constructor() {
        this.init();
    }
    
    init() {
        const contactForm = document.querySelector('.contact-form form');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const formObject = {};
        
        for (let [key, value] of formData.entries()) {
            formObject[key] = value;
        }
        
        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="bi bi-spinner"></i> Envoi en cours...';
        submitButton.disabled = true;
        
        // Simulate form submission (replace with actual form handling)
        setTimeout(() => {
            // Reset form
            e.target.reset();
            
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Show success message
            this.showMessage('Message envoyé avec succès !', 'success');
        }, 2000);
    }
    
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type} alert-dismissible fade show`;
        messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.contact-form');
        container.insertBefore(messageDiv, container.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// ======================
// Intersection Observer for Animations
// ======================

class AnimationObserver {
    constructor() {
        this.init();
    }
    
    init() {
        if (!('IntersectionObserver' in window)) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements that should animate
        const animateElements = document.querySelectorAll('.stat-item, .service-card, .hero-card, .expertise-item, .portfolio-item, .formation-card, .blog-card');
        animateElements.forEach(el => {
            observer.observe(el);
        });
    }
}

// ======================
// Accessibility Enhancements
// ======================

class AccessibilityEnhancements {
    constructor() {
        this.init();
    }
    
    init() {
        // Add skip link
        this.addSkipLink();
        
        // Enhance focus management
        this.enhanceFocusManagement();
        
        // Add screen reader announcements
        this.addScreenReaderAnnouncements();
    }
    
    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link sr-only sr-only-focusable';
        skipLink.textContent = 'Passer au contenu principal';
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    enhanceFocusManagement() {
        // Trap focus in dropdown menus
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const trigger = dropdown.previousElementSibling;
                    if (trigger) {
                        trigger.click();
                        trigger.focus();
                    }
                }
            });
        });
    }
    
    addScreenReaderAnnouncements() {
        // Add aria-live region for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        
        document.body.appendChild(liveRegion);
    }
}

// ======================
// Performance Optimizations
// ======================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        // Lazy load images
        this.lazyLoadImages();
        
        // Preload critical resources
        this.preloadCriticalResources();
    }
    
    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    preloadCriticalResources() {
        // Preload fonts
        const fontLinks = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        ];
        
        fontLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = href;
            link.as = 'style';
            document.head.appendChild(link);
        });
    }
}

// ======================
// Initialize Everything
// ======================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new ThemeManager();
    new SmoothScroll();
    new NavbarScrollEffect();
    new FormHandler();
    new AnimationObserver();
    new AccessibilityEnhancements();
    new PerformanceOptimizer();
    
    // Add CSS for theme transitions
    const style = document.createElement('style');
    style.textContent = `
        .theme-transitioning * {
            transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease !important;
        }
        
        .sr-only {
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        }
        
        .sr-only-focusable:focus {
            position: static !important;
            width: auto !important;
            height: auto !important;
            padding: 0.5rem 1rem !important;
            margin: 0 !important;
            overflow: visible !important;
            clip: auto !important;
            white-space: normal !important;
            background: var(--accent-color) !important;
            color: white !important;
            text-decoration: none !important;
            z-index: 9999 !important;
        }
        
        .skip-link {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 9999;
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease-out;
        }
        
        .navbar.scrolled {
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
        }
        
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(style);
});

// ======================
// Service Worker Registration (Optional)
// ======================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 
