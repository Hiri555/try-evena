/**
 * Script principal pour la landing page
 * Gère le compte à rebours et les interactions
 */

// ==========================================================================
// Compte à rebours
// ==========================================================================

/**
 * Initialise et met à jour le compte à rebours
 */
function initCountdown() {
    // Durée du compte à rebours en minutes (50 minutes par défaut)
    const countdownDuration = 50 * 60; // 50 minutes en secondes

    // Récupérer ou initialiser le temps de fin
    let endTime = localStorage.getItem('countdownEndTime');

    if (!endTime) {
        // Si pas de temps de fin enregistré, créer un nouveau compte à rebours
        endTime = Date.now() + (countdownDuration * 1000);
        localStorage.setItem('countdownEndTime', endTime);
    } else {
        endTime = parseInt(endTime);

        // Si le compte à rebours est terminé, réinitialiser
        if (endTime < Date.now()) {
            endTime = Date.now() + (countdownDuration * 1000);
            localStorage.setItem('countdownEndTime', endTime);
        }
    }

    // Mettre à jour le compte à rebours toutes les secondes
    updateCountdown(endTime);
    setInterval(() => updateCountdown(endTime), 1000);
}

/**
 * Met à jour l'affichage du compte à rebours
 * @param {number} endTime - Timestamp de fin du compte à rebours
 */
function updateCountdown(endTime) {
    const now = Date.now();
    const timeLeft = Math.max(0, endTime - now);

    // Calculer heures, minutes, secondes
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // Formater avec zéro devant si nécessaire
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    // Mettre à jour l'affichage
    const timeUnits = document.querySelectorAll('.countdown-timer .time-value');

    if (timeUnits.length >= 3) {
        timeUnits[0].textContent = formattedHours;
        timeUnits[1].textContent = formattedMinutes;
        timeUnits[2].textContent = formattedSeconds;
    }

    // Si le temps est écoulé, réinitialiser
    if (timeLeft === 0) {
        const newEndTime = Date.now() + (50 * 60 * 1000);
        localStorage.setItem('countdownEndTime', newEndTime);
    }
}

// ==========================================================================
// Gestion des boutons CTA
// ==========================================================================

/**
 * Initialise les événements des boutons CTA
 */
function initCTAButtons() {
    const ctaButtons = document.querySelectorAll('.cta-button, .cta-button-secondary');

    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Ajouter ici l'URL de destination ou l'action souhaitée
            // Par exemple : window.location.href = 'https://votre-page-de-commande.com';

            // Pour l'instant, empêcher le comportement par défaut
            e.preventDefault();

            // Animation au clic
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'translateY(-2px)';
            }, 100);

            // Afficher un message dans la console (à remplacer par la vraie action)
            console.log('CTA cliqué - Redirection vers la page de commande');

            // IMPORTANT : Décommenter la ligne suivante et ajouter votre URL de destination
            // window.location.href = 'https://votre-page-de-commande.com';
        });
    });
}

// ==========================================================================
// Lazy loading des images
// ==========================================================================

/**
 * Initialise le lazy loading pour les images
 */
function initLazyLoading() {
    // Vérifier si le navigateur supporte IntersectionObserver
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Si l'image a un attribut data-src, l'utiliser
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

        // Observer toutes les images qui ne sont pas en eager loading
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// ==========================================================================
// Animation au scroll
// ==========================================================================

/**
 * Ajoute des animations au scroll pour les blocs de raisons
 */
function initScrollAnimations() {
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observer tous les blocs de raisons
        const reasonBlocks = document.querySelectorAll('.reason-block');
        reasonBlocks.forEach(block => {
            block.style.opacity = '0';
            block.style.transform = 'translateY(20px)';
            block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(block);
        });
    }
}

// ==========================================================================
// Initialisation au chargement de la page
// ==========================================================================

/**
 * Fonction d'initialisation principale
 */
function init() {
    initCountdown();
    initCTAButtons();
    initLazyLoading();
    initScrollAnimations();

    console.log('Landing page initialisée avec succès ✓');
}

// Lancer l'initialisation quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
