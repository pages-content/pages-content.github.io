// ===============================================================================================================
// E3PO - Enhanced Experience Engine for Personal Websites
// ===============================================================================================================
// This script manages theme switching, smooth scrolling, dynamic navbar adjustments, and other UX enhancements.
// Each class is designed to be self-contained and initialized safely to prevent site-wide script failures.
// ===============================================================================================================

/**
 * Manages the website's theme (light, dark, high-contrast).
 * - Loads theme from localStorage or system preference.
 * - Updates UI elements to reflect the current theme.
 * - Handles user interaction for theme switching.
 */
class ThemeManager {
    constructor() {
        this.themes = {
            light: { name: 'Light', icon: 'bi-sun', label: 'Light' },
            dark: { name: 'Dark', icon: 'bi-moon', label: 'Dark' },
            'high-contrast': { name: 'High Contrast', icon: 'bi-circle-half', label: 'High Contrast' }
        };
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        this.loadTheme();
        this.setupEventListeners();
        this.updateThemeUI();
        this.listenForSystemThemeChanges();
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('preferred-theme');
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        } else {
            this.currentTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        this.applyTheme(this.currentTheme);
    }

    setupEventListeners() {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTheme(e.currentTarget.dataset.theme);
            });
        });
    }

    switchTheme(theme) {
        if (!this.themes[theme]) return;
        this.currentTheme = theme;
        this.applyTheme(theme);
        localStorage.setItem('preferred-theme', theme);
        this.updateThemeUI();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
    }

    updateThemeUI() {
        const currentThemeData = this.themes[this.currentTheme];
        const themeButton = document.getElementById('themeDropdown');
        if (themeButton && currentThemeData) {
            themeButton.setAttribute('aria-label', `Thème actuel : ${currentThemeData.label}`);
            const iconElement = themeButton.querySelector('i');
            if (iconElement) {
                iconElement.className = `bi ${currentThemeData.icon} me-1`;
            }
            // The text content of #current-theme is now visually hidden but still updated for screen readers
            const currentThemeSpan = themeButton.querySelector('#current-theme');
            if (currentThemeSpan) {
                currentThemeSpan.textContent = currentThemeData.label;
            }
        }
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === this.currentTheme);
        });
    }

    listenForSystemThemeChanges() {
        window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('preferred-theme')) {
                this.switchTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

/**
 * Manages the "Scroll to Top" button.
 * - Shows the button when the user scrolls down.
 * - Adjusts its position to avoid overlapping with the footer.
 */
class ScrollToTopButton {
    constructor(button) {
        this.button = button;
        this.footer = document.querySelector('footer');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        this.button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    handleScroll() {
        const scrollY = window.scrollY;
        this.button.classList.toggle('show', scrollY > 300);

        if (this.footer) {
            const footerRect = this.footer.getBoundingClientRect();
            if (footerRect.top < window.innerHeight) {
                this.button.style.bottom = `${window.innerHeight - footerRect.top + 20}px`;
            } else {
                this.button.style.bottom = '20px';
            }
        }
    }
}

/**
 * Handles automatic closing of the mobile navigation menu.
 * - When a navigation link is clicked, the expanded mobile menu collapses.
 */
class MobileMenuManager {
    constructor(navbar) {
        this.navLinks = navbar.querySelectorAll('.navbar-nav .nav-link');
        this.navbarCollapse = navbar.querySelector('.navbar-collapse');
        this.init();
    }

    init() {
        if (!this.navbarCollapse) return;
        const bsCollapse = new bootstrap.Collapse(this.navbarCollapse, { toggle: false });
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.navbarCollapse.classList.contains('show')) {
                    bsCollapse.hide();
                }
            });
        });
    }
}

/**
 * Handles smooth scrolling to anchor links with an offset for fixed headers.
 * - Intercepts clicks on internal anchor links.
 * - Calculates scroll position considering the fixed navbar height.
 * - Performs a smooth scroll to the target.
 */
class SmoothScrollWithOffset {
    constructor(navbarSelector = '.navbar') {
        this.navbar = document.querySelector(navbarSelector);
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleAnchorClick.bind(this));
        });
    }

    handleAnchorClick(event) {
        const href = event.currentTarget.getAttribute('href');
        if (href === '#' || href === '#home') { // Handle #home or empty hash specifically
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            event.preventDefault();
            const navbarCollapse = this.navbar.querySelector('.navbar-collapse');
            const isMobileMenuOpen = navbarCollapse && navbarCollapse.classList.contains('show');

            if (isMobileMenuOpen) {
                // Wait for the collapse animation to finish before scrolling
                navbarCollapse.addEventListener('hidden.bs.collapse', () => {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }, { once: true });
            } else {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
}

/**
 * Dynamically updates the --navbar-height CSS variable based on the actual navbar height.
 * This ensures scroll-margin-top is always accurate for fixed headers.
 */
class NavbarHeightUpdater {
    constructor(navbar) {
        this.navbar = navbar;
        this.init();
    }

    init() {
        if (!this.navbar || !('ResizeObserver' in window)) return;
        const resizeObserver = new ResizeObserver(() => this.updateHeight());
        resizeObserver.observe(this.navbar);
        this.updateHeight(); // Initial update
    }

    updateHeight() {
        const brandElement = this.navbar.querySelector('.navbar-brand');
        let actualNavbarHeight = 0;

        if (brandElement) {
            actualNavbarHeight = brandElement.offsetHeight;
        }

        const newHeight = `${actualNavbarHeight}px`;
        document.documentElement.style.setProperty('--navbar-height', newHeight);
        console.log('NavbarHeightUpdater - New --navbar-height set to:', newHeight, 'from element:', brandElement);
    }
}

/**
 * Dynamically switches the navbar to burger mode when menu items no longer fit.
 * This is achieved by adding/removing the .navbar-expand-lg class, letting Bootstrap handle the UI changes.
 */
class DynamicNavbarBreakpoint {
    constructor(navbar) {
        this.navbar = navbar;
        this.container = navbar.querySelector('.container');
        this.brand = navbar.querySelector('.navbar-brand');
        this.navbarNav = navbar.querySelector('.navbar-nav');
        this.themeSelector = navbar.querySelector('.theme-dropdown-btn');
        this.init();
    }

    init() {
        if (!this.container || !this.brand || !this.navbarNav || !this.themeSelector) {
            console.warn('DynamicNavbarBreakpoint: Missing required elements for measurement.');
            return;
        }

        const resizeObserver = new ResizeObserver(() => this.checkBreakpoint());
        resizeObserver.observe(this.container);
        
        // Also observe the navbar itself in case its contents change dynamically
        resizeObserver.observe(this.navbarNav);

        // Initial check after a short delay to ensure rendering is complete
        setTimeout(() => this.checkBreakpoint(), 150);
    }

    checkBreakpoint() {
        // Temporarily force the navbar to be expanded to measure its true width
        this.navbar.classList.add('navbar-expand-lg');

        const brandWidth = this.brand.offsetWidth;
        const navbarNavWidth = this.navbarNav.offsetWidth;
        const themeSelectorWidth = this.themeSelector.offsetWidth;
        
        // Calculate the gap between flex items. We assume the gap is consistent.
        const navbarCollapse = this.navbar.querySelector('.navbar-collapse');
        const gapStyle = navbarCollapse ? getComputedStyle(navbarCollapse).gap : '0px';
        const gapWidth = parseFloat(gapStyle) || 8; // Default to 8px if gap is not found

        // Total required width is the sum of elements plus the gaps between them
        const requiredWidth = brandWidth + navbarNavWidth + themeSelectorWidth + (2 * gapWidth);

        // Available width is the container's inner width
        const availableWidth = this.container.clientWidth;
        
        // A small buffer to prevent elements from touching the edge
        const buffer = 5;

        if (requiredWidth + buffer > availableWidth) {
            // Not enough space, remove the class to collapse into burger mode
            this.navbar.classList.remove('navbar-expand-lg');
        } else {
            // Enough space, the class is already added, so Bootstrap handles expansion
            // This ensures the class remains for the expanded view
            this.navbar.classList.add('navbar-expand-lg');
        }
    }
}


// ======================
// Main Initialization
// ======================
document.addEventListener('DOMContentLoaded', () => {
    // Safely initialize ThemeManager
    if (document.getElementById('themeDropdown')) {
        try {
            new ThemeManager();
        } catch (e) {
            console.error("Failed to initialize ThemeManager:", e);
        }
    }

    // Safely initialize Navbar features
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        try {
            new MobileMenuManager(navbar);
        } catch (e) {
            console.error("Failed to initialize MobileMenuManager:", e);
        }
        try {
            new NavbarHeightUpdater(navbar); // Initialize NavbarHeightUpdater
        } catch (e) {
            console.error("Failed to initialize NavbarHeightUpdater:", e);
        }
        try {
            new DynamicNavbarBreakpoint(navbar); // Initialize the dynamic breakpoint logic
        } catch (e) {
            console.error("Failed to initialize DynamicNavbarBreakpoint:", e);
        }
    }

    // Safely initialize ScrollToTopButton
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        try {
            new ScrollToTopButton(scrollToTopBtn);
        } catch (e) {
            console.error("Failed to initialize ScrollToTopButton:", e);
        }
    }

    // Safely initialize SmoothScrollWithOffset
    try {
        new SmoothScrollWithOffset();
    } catch (e) {
        console.error("Failed to initialize SmoothScrollWithOffset:", e);
    }
});