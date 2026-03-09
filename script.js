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

    // FAB visibility — show only between hero and pricing sections
    const fabStack = document.getElementById('fabStack');
    const heroSection = document.querySelector('.hero');
    const pricingSection = document.querySelector('#pricing');

    if (fabStack && heroSection && pricingSection) {
        const toggleFabVisibility = () => {
            const heroRect = heroSection.getBoundingClientRect();
            const pricingRect = pricingSection.getBoundingClientRect();

            // Hero is scrolled out of view (top of screen has passed it)
            const passedHero = heroRect.bottom < 100;
            // Pricing has not yet scrolled into the viewport
            const beforePricing = pricingRect.top > window.innerHeight - 100;

            if (passedHero && beforePricing) {
                fabStack.classList.add('fab-visible');
            } else {
                fabStack.classList.remove('fab-visible');
            }
        };

        window.addEventListener('scroll', toggleFabVisibility, { passive: true });
        // Check once on load
        toggleFabVisibility();
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
            }
        } catch (error) {
            console.error('Error fetching location for currency conversion:', error);
            // On network error or ad-blocker blocking IP API, degrade gracefully to USD default.
        }
    }

    applyLocalCurrency();

    // Demo Modal Logic
    const demoModal = document.getElementById('demoModal');
    const openDemoModalBtns = document.querySelectorAll('.open-demo-modal');
    const closeDemoModalBtn = document.getElementById('closeDemoModalBtn');
    const demoForm = document.getElementById('demoForm');
    const demoFormContainer = document.getElementById('demoFormContainer');
    const demoVideoContainer = document.getElementById('demoVideoContainer');
    const modalContent = document.querySelector('.modal-content');
    const demoVideoFrame = document.getElementById('demoVideoFrame');

    // Actual YouTube embed URL from User (enablejsapi=1 allows postMessage pause/play)
    const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/FocsbiV4d2o?autoplay=1&enablejsapi=1';
    // Webhook URL
    const WEBHOOK_URL = 'https://oracle.iybots.com/webhook/03337660-5a6b-4555-a3af-0334667ffca4';

    if (openDemoModalBtns.length > 0 && demoModal) {
        openDemoModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                demoModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
    }

    const closeModal = () => {
        demoModal.classList.remove('active');
        document.body.style.overflow = '';
        if (demoVideoContainer.classList.contains('active') && demoVideoFrame.contentWindow) {
            // Pause the video using YouTube iframe API postMessage
            demoVideoFrame.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
    };

    if (closeDemoModalBtn) {
        closeDemoModalBtn.addEventListener('click', closeModal);
    }

    if (demoModal) {
        demoModal.addEventListener('click', (e) => {
            if (e.target === demoModal) {
                closeModal();
            }
        });
    }

    if (demoForm) {
        demoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = demoForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Processing...';
            submitBtn.disabled = true;

            // Gather Data
            const formData = {
                name: document.getElementById('demoName').value,
                email: document.getElementById('demoEmail').value,
                phone: document.getElementById('demoPhone').value,
                company: document.getElementById('demoCompany').value,
                source: "Website Demo Form"
            };

            try {
                // Prepare Basic Auth token (iyb:Testtest123)
                const basicAuth = btoa('iyb:Testtest123');

                // Send to Webhook
                await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${basicAuth}`
                    },
                    body: JSON.stringify(formData)
                });

                // Show Video regardless of webhook absolute success
                demoFormContainer.classList.remove('active');
                demoVideoContainer.classList.add('active');
                modalContent.classList.add('video-mode');

                demoVideoFrame.src = YOUTUBE_EMBED_URL;

                // Reset form optionally
                demoForm.reset();
            } catch (error) {
                console.error("Error submitting form", error);
                alert("Something went wrong. Please try again.");
            } finally {
                // Restore button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

});
