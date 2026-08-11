/**
 * ============================================
 * Service Card Dynamic Loader & Generator
 * ============================================
 * Système de génération et chargement progressif
 * des cartes de service avec Intersection Observer
 * 
 * @version 3.0 - Production Ready
 * @author IOKEO
 * ============================================
 */

class ServiceCardLoader {
    /**
     * Configuration de l'Intersection Observer
     */
    static CONFIG = {
        rootMargin: '50px',
        threshold: 0.1,
        animationDelay: -9000 // délai entre chaque injection de carte (ms)
    };

    constructor() {
        this.loadedCards = new Set();
        this.observer = null;
        this.pendingCards = [];
        this.isProcessing = false;
        this.gridContainer = null;
        this.init();
    }

    /**
     * Initialise le système au chargement du DOM
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Configure le système: génération des cartes puis observation
     */
    setup() {
        try {
            this.gridContainer = document.getElementById('services-grid');
            if (!this.gridContainer) {
                console.error('[ServiceCardLoader] Conteneur #services-grid non trouvé');
                return;
            }
            
            // Générer les cartes vides
            this.generateServiceCards();
            
            // Configurer l'observation
            this.setupObserver();
        } catch (error) {
            console.error('[ServiceCardLoader] Erreur lors de l\'initialisation:', error);
        }
    }

    /**
     * Génère les cartes de service vides dans le DOM
     */
    generateServiceCards() {
        const fragment = document.createDocumentFragment();

        // Créer une carte pour chaque service
        servicesData.forEach((service, index) => {
            const card = this.createServiceCard(index);
            fragment.appendChild(card);
        });

        // Injecter toutes les cartes en une seule opération (meilleure performance)
        this.gridContainer.appendChild(fragment);
    }

    /**
     * Crée un élément de carte de service vide
     * @param {number} index - L'index du service
     * @returns {HTMLElement} - La carte créée
     */
    createServiceCard(index) {
        const article = document.createElement('article');
        article.className = 'service-card';
        article.dataset.cardIndex = index;

        article.innerHTML = `
            <div class="icon-circle"><img src="" alt=""></div>
            <h2></h2>
            <ul></ul>
            <a href="" class="btn-base btn-view"></a>
        `;

        return article;
    }

    /**
     * Crée et configure l'Intersection Observer
     */
    setupObserver() {
        const observerOptions = {
            root: null,
            rootMargin: ServiceCardLoader.CONFIG.rootMargin,
            threshold: ServiceCardLoader.CONFIG.threshold
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.handleCardVisibility(entry.target);
                }
            });
        }, observerOptions);

        // Observer toutes les cartes de service
        this.observeAllCards();
    }

    /**
     * Observe toutes les cartes de service présentes dans le DOM
     */
    observeAllCards() {
        const cards = document.querySelectorAll('.service-card');
        if (cards.length === 0) {
            console.warn('[ServiceCardLoader] Aucune carte de service trouvée dans le DOM');
            return;
        }

        cards.forEach((card) => {
            this.observer.observe(card);
        });
    }

    /**
     * Gère l'apparition d'une carte dans la vue
     * @param {HTMLElement} cardElement - La carte détectée
     */
    handleCardVisibility(cardElement) {
        const cardIndex = parseInt(cardElement.dataset.cardIndex);

        // Vérifier si la carte n'a pas déjà été chargée
        if (!this.loadedCards.has(cardIndex)) {
            // Ajouter à la queue de traitement
            this.pendingCards.push({ cardElement, cardIndex });
            
            // Traiter les cartes de manière progressive
            this.processQueue();

            // Arrêter d'observer après détection
            if (this.observer) {
                this.observer.unobserve(cardElement);
            }
        }
    }

    /**
     * Traite la queue de cartes en attente de chargement
     * Permet une injection progressive et fluide
     */
    processQueue() {
        if (this.isProcessing || this.pendingCards.length === 0) return;

        this.isProcessing = true;
        const { cardElement, cardIndex } = this.pendingCards.shift();

        // Ajouter classe skeleton (optionnel)
        cardElement.classList.add('skeleton');

        // Charger le contenu avec un délai léger pour l'animation
        setTimeout(() => {
            this.loadCardContent(cardElement, cardIndex);
            this.markCardLoaded(cardElement);
            this.loadedCards.add(cardIndex);

            // Continuer le traitement
            this.isProcessing = false;
            if (this.pendingCards.length > 0) {
                setTimeout(() => this.processQueue(), ServiceCardLoader.CONFIG.animationDelay);
            }
        }, 0);
    }

    /**
     * Charge et injecte le contenu dans une carte
     * @param {HTMLElement} cardElement - L'élément de la carte
     * @param {number} cardIndex - L'index de la carte
     */
    loadCardContent(cardElement, cardIndex) {
        // Validation
        if (cardIndex >= servicesData.length) {
            console.warn(`[ServiceCardLoader] Index invalide: ${cardIndex}`);
            return;
        }

        const service = servicesData[cardIndex];

        try {
            this.injectImage(cardElement, service);
            this.injectTitle(cardElement, service);
            this.injectList(cardElement, service);
            this.injectLink(cardElement, service);
        } catch (error) {
            console.error(`[ServiceCardLoader] Erreur lors du chargement de la carte ${cardIndex}:`, error);
        }
    }

    /**
     * Injecte l'image dans la carte
     * @param {HTMLElement} cardElement - L'élément de la carte
     * @param {Object} service - Les données du service
     */
    injectImage(cardElement, service) {
        const iconCircle = cardElement.querySelector('.icon-circle');
        if (!iconCircle) return;

        const img = iconCircle.querySelector('img');
        if (img) {
            // Utiliser une image de secours en cas d'erreur
            img.onerror = () => {
                console.warn(`[ServiceCardLoader] Impossible de charger l'image: ${service.image}`);
            };
            img.src = service.image;
            img.alt = service.imageAlt;
            img.loading = 'lazy'; // lazy loading natif
        }
    }

    /**
     * Injecte le titre dans la carte
     * @param {HTMLElement} cardElement - L'élément de la carte
     * @param {Object} service - Les données du service
     */
    injectTitle(cardElement, service) {
        const title = cardElement.querySelector('h2');
        if (title) {
            title.textContent = service.title;
        }
    }

    /**
     * Injecte la liste des items dans la carte
     * @param {HTMLElement} cardElement - L'élément de la carte
     * @param {Object} service - Les données du service
     */
    injectList(cardElement, service) {
        const list = cardElement.querySelector('ul');
        if (!list) return;

        // Vider la liste
        list.innerHTML = '';

        // Créer les éléments de liste
        const fragment = document.createDocumentFragment();
        service.items.forEach((item) => {
            const li = document.createElement('li');
            li.textContent = item;
            fragment.appendChild(li);
        });

        list.appendChild(fragment);
    }

    /**
     * Injecte le lien d'action dans la carte
     * @param {HTMLElement} cardElement - L'élément de la carte
     * @param {Object} service - Les données du service
     */
    injectLink(cardElement, service) {
        const link = cardElement.querySelector('a');
        if (link) {
            link.href = service.link;
            link.textContent = service.linkText;
        }
    }

    /**
     * Marque une carte comme chargée et déclenche l'animation
     * @param {HTMLElement} cardElement - L'élément de la carte
     */
    markCardLoaded(cardElement) {
        // Retirer la classe skeleton
        cardElement.classList.remove('skeleton');
        
        // Ajouter la classe loaded (déclenche l'animation CSS)
        cardElement.classList.add('loaded');
    }

    /**
     * Détruit le loader et nettoie les ressources
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.loadedCards.clear();
        this.pendingCards = [];
    }
}

/**
 * Instanciation et démarrage du loader
 * Le loader se gérera lui-même au chargement du DOM
 */
const serviceCardLoader = new ServiceCardLoader();

// Nettoyage facultatif avant le déchargement
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        serviceCardLoader.destroy();
    });
}
