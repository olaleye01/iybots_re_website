document.addEventListener('DOMContentLoaded', () => {

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('nav-open');
        });

        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('nav-open') && !navLinks.contains(e.target)) {
                navLinks.classList.remove('nav-open');
            }
        });
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(faq => faq.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                if (window.innerWidth <= 768 && navLinks.classList.contains('nav-open')) {
                    navLinks.classList.remove('nav-open');
                }
            }
        });
    });

    // Scroll animations
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.problem-card, .step-card, .feature-split, .executive-box, .pricing-card, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // FAB visibility — show only between hero and CTA sections
    const fabStack = document.getElementById('fabStack');
    const heroSection = document.querySelector('.hero');
    const ctaSection = document.querySelector('.cta-section');
    let heroVisible = true;
    let ctaVisible = false;

    function updateFabVisibility() {
        if (!heroVisible && !ctaVisible) {
            fabStack.classList.add('fab-visible');
        } else {
            fabStack.classList.remove('fab-visible');
        }
    }

    if (fabStack && heroSection) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                heroVisible = entry.isIntersecting;
                updateFabVisibility();
            });
        }, { root: null, threshold: 0 });

        heroObserver.observe(heroSection);
    }

    if (fabStack && ctaSection) {
        const ctaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                ctaVisible = entry.isIntersecting;
                updateFabVisibility();
            });
        }, { root: null, threshold: 0 });

        ctaObserver.observe(ctaSection);
    }

    // Dynamic Currency Conversion (USD to NGN based on IP)
    const USD_TO_NGN_RATE = 1400;

    // Helper to format large numbers to K/M shorthand (e.g., 420,000 -> 420k, 1,400,000 -> 1.4M)
    function formatNaira(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k';
        }
        return num.toLocaleString();
    }

    async function applyLocalCurrency() {
        try {
            // Fetch user location via free ipapi (fallback to USD on failure or rate-limit)
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) return; // Keep USD

            const data = await response.json();

            // If user is in Nigeria, convert prices
            if (data.country_code === 'NG') {
                const currencySymbols = document.querySelectorAll('[data-currency-symbol]');
                const basePrices = document.querySelectorAll('[data-base-price]');
                const baseSetups = document.querySelectorAll('[data-base-setup]');

                // Update symbols
                currencySymbols.forEach(el => {
                    el.textContent = '₦';
                });

                // Update monthly amounts
                basePrices.forEach(el => {
                    const usdVal = parseInt(el.getAttribute('data-base-price'), 10);
                    if (!isNaN(usdVal)) {
                        el.textContent = formatNaira(usdVal * USD_TO_NGN_RATE);
                    }
                });

                // Update setup amounts
                baseSetups.forEach(el => {
                    const usdVal = parseInt(el.getAttribute('data-base-setup'), 10);
                    if (!isNaN(usdVal)) {
                        el.textContent = formatNaira(usdVal * USD_TO_NGN_RATE);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching location for currency conversion:', error);
            // On network error or ad-blocker blocking IP API, degrade gracefully to USD default.
        }
    }

    applyLocalCurrency();

});
