/**
 * Script principal — Listicle Evena 5 raisons
 */

// ==========================================================================
// Bouton Sticky
// ==========================================================================

function initStickyButton() {
    const stickyButton = document.getElementById('listicleSticky-sticky_add_to_cart');
    const finalCTA = document.querySelector('.final-cta');

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
// Lazy loading
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

    const animatedElements = document.querySelectorAll('.reason-block, .testimonial');
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

/* ==========================================================================
   SECTION PRODUIT — Diagnostic + checkout direct
   --------------------------------------------------------------------------
   ⚠️  SEULE CHOSE À REMPLIR : les 3 `variantId` ci-dessous.
   Où les trouver : Shopify admin → Produits → Evena fond de teint 4-en-1
   → section Variantes → clique une variante → l'ID est à la fin de l'URL
   (.../variants/44123456789012  →  44123456789012)
   Ou ouvre https://try-evena.com/products/evena-fond-de-teint-4-en-1.json
   et relève le champ "id" de chaque variante.

   mode:
     'checkout' → ajoute au panier ET saute directement au checkout
     'cart'     → ajoute au panier et ouvre le panier du site
   ========================================================================== */

const EVENA_SHOP = {
    domain: 'try-evena.com',
    mode: 'checkout',
    offers: {
        single: { variantId: null, quantity: 1, price: '39,90 €', compare: null,     sub: '1 flacon · livraison offerte' },
        duo:    { variantId: null, quantity: 1, price: '59,90 €', compare: '79,80 €', sub: '2 flacons · 1 acheté = 1 offert' },
        trio:   { variantId: null, quantity: 1, price: '79,90 €', compare: '119,70 €', sub: '3 flacons · meilleur prix au flacon' }
    },
    // Repli tant que les IDs ne sont pas renseignés : on envoie sur la fiche produit.
    fallbackUrl: 'https://try-evena.com/products/evena-fond-de-teint-4-en-1'
};

const EVENA_CONCERNS = {
    plis: {
        what: "Après 50 ans, la peau perd en densité et les plis d'expression se creusent. Un fond de teint classique, trop épais et trop sec, s'accumule dedans au fil des heures — et souligne exactement ce que tu voulais atténuer.",
        fix: "La texture <strong>Biomimic</strong> reste souple toute la journée au lieu de durcir. Elle se dépose en voile fin, ne s'accumule pas dans les plis et ne craquelle pas à 17&nbsp;h."
    },
    terne: {
        what: "Le renouvellement cellulaire ralentit et la microcirculation baisse. Résultat&nbsp;: un teint qui vire au gris, surtout en fin de journée — et un fond de teint mat qui éteint encore plus la lumière du visage.",
        fix: "La <strong>Gentiana Scabra</strong> et le fini satiné relancent l'éclat au lieu de l'absorber. Le teint reste lumineux, pas poudré."
    },
    secheresse: {
        what: "La production de sébum chute nettement à la ménopause. La peau tiraille, boit le fond de teint en quelques heures, et les zones sèches accrochent le produit en plaques.",
        fix: "Formule <strong>4-en-1 hydratante</strong>&nbsp;: soin, base, fond de teint et SPF&nbsp;50 dans le même flacon. La peau est nourrie pendant qu'elle est couverte."
    },
    taches: {
        what: "Taches pigmentaires et rougeurs diffuses s'installent avec les années et le soleil. Pour les masquer, on sur-couvre — et c'est le sur-couvrage qui donne l'effet masque qui vieillit.",
        fix: "Couvrance <strong>modulable</strong> et <strong>SPF&nbsp;50</strong> intégré&nbsp;: tu corriges là où il faut sans charger le reste, et tu empêches les taches de foncer davantage."
    }
};

function evenaBuildUrl(offer) {
    const o = EVENA_SHOP.offers[offer];
    if (!o || !o.variantId) return EVENA_SHOP.fallbackUrl;
    const base = `https://${EVENA_SHOP.domain}`;
    const qty = o.quantity || 1;
    return EVENA_SHOP.mode === 'cart'
        ? `${base}/cart/${o.variantId}:${qty}`
        : `${base}/cart/add?id=${o.variantId}&quantity=${qty}&return_to=/checkout`;
}

function initEvenaProductSection() {
    const section = document.querySelector('.product-section');
    if (!section) return;

    /* --- cartes diagnostic --- */
    const cards = section.querySelectorAll('.concern-card');
    const whatEl = section.querySelector('.concern-panel__what');
    const fixEl = section.querySelector('.concern-panel__fix');

    function selectConcern(key) {
        const data = EVENA_CONCERNS[key];
        if (!data) return;
        whatEl.innerHTML = data.what;
        fixEl.innerHTML = data.fix;
        cards.forEach(c => {
            const on = c.dataset.concern === key;
            c.classList.toggle('is-active', on);
            c.setAttribute('aria-selected', on ? 'true' : 'false');
        });
    }

    cards.forEach(card => {
        card.addEventListener('click', () => selectConcern(card.dataset.concern));
    });
    selectConcern('plis');

    /* --- buy box --- */
    const offers = section.querySelectorAll('.offer');
    const cta = section.querySelector('[data-checkout]');
    const ctaSub = section.querySelector('[data-cta-sub]');

    Object.entries(EVENA_SHOP.offers).forEach(([key, o]) => {
        const priceEl = section.querySelector(`[data-price-${key}]`);
        const compareEl = section.querySelector(`[data-compare-${key}]`);
        if (priceEl) priceEl.textContent = o.price || '';
        if (compareEl) compareEl.textContent = o.compare || '';
    });

    function selectOffer(value) {
        offers.forEach(label => {
            const input = label.querySelector('input');
            const on = input.value === value;
            label.classList.toggle('is-selected', on);
            input.checked = on;
        });
        const o = EVENA_SHOP.offers[value];
        cta.setAttribute('href', evenaBuildUrl(value));
        if (ctaSub) ctaSub.textContent = o ? `${o.sub} — ${o.price}` : '';
    }

    offers.forEach(label => {
        const input = label.querySelector('input');
        label.addEventListener('click', () => selectOffer(input.value));
        input.addEventListener('change', () => selectOffer(input.value));
    });

    selectOffer('single');

    // Avertissement console si la config n'est pas remplie
    const missing = Object.entries(EVENA_SHOP.offers).filter(([, o]) => !o.variantId).map(([k]) => k);
    if (missing.length) {
        console.warn(
            `[Evena] variantId manquant pour : ${missing.join(', ')}. ` +
            `Les boutons renvoient vers la fiche produit. Renseigne EVENA_SHOP.offers dans script.js.`
        );
    }
}

document.addEventListener('DOMContentLoaded', initEvenaProductSection);
