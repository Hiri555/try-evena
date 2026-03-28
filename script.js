/**
 * Script principal — Landing page Evena
 * Gère le bouton sticky, les interactions CTA et le lazy loading
 */

// ==========================================================================
// Bouton Sticky
// ==========================================================================

function initStickyButton() {
    const stickyButton = document.getElementById('listicleSticky-sticky_add_to_cart');
    const finalCTA = document.querySelector('.final-cta-section');

    if (!stickyButton) return;

    function handleScroll() {
        const scrollPosition = window.scrollY + window.innerHeight;
        const finalCTAPosition = finalCTA ? finalCTA.offsetTop : Infinity;

        if (window.scrollY > 400 && scrollPosition < finalCTAPosition) {
            stickyButton.classList.add('show');
        } else {
            stickyButton.classList.remove('show');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

// ==========================================================================
// Lazy loading des images
// ==========================================================================

function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// ==========================================================================
// Animations au scroll
// ==========================================================================

function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    const animatedElements = document.querySelectorAll(
        '.benefit-item, .before-after-container, .testimonial-card'
    );

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ==========================================================================
// Initialisation
// ==========================================================================

function init() {
    initStickyButton();
    initLazyLoading();
    initScrollAnimations();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
