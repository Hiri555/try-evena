# Landing Page - Fond de Teint Adaptatif

## 📋 Description

Landing page professionnelle pour la promotion d'un fond de teint adaptatif destiné aux femmes de 50+.

Cette page présente **10 raisons** pour lesquelles ce produit est considéré comme un "petit secret" par des milliers de femmes.

## 🎯 Fonctionnalités

- ✅ Design responsive (mobile, tablette, desktop)
- ✅ Compte à rebours dynamique pour créer l'urgence
- ✅ Section témoignages clients
- ✅ Appels à l'action (CTA) optimisés
- ✅ Images optimisées avec lazy loading
- ✅ Animations au scroll
- ✅ Prêt pour GitHub Pages

## 📁 Structure du projet

```
try-evena/
│
├── index.html          # Page principale
├── styles.css          # Feuille de styles
├── script.js           # Scripts JavaScript
├── README.md           # Ce fichier
│
└── assets/             # Dossier des images
    ├── README.md       # Documentation des images requises
    ├── hero-image.jpg
    ├── raison1.jpg
    ├── raison2.jpg
    ├── ...
    └── testimonial1.png
```

## 🚀 Installation et utilisation

### 1. Cloner le dépôt

```bash
git clone <votre-repo-url>
cd try-evena
```

### 2. Ajouter les images

Placez toutes vos images dans le dossier `/assets/`.

Consultez le fichier `/assets/README.md` pour la liste complète des images requises.

### 3. Tester localement

Ouvrez simplement le fichier `index.html` dans votre navigateur :

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

Ou utilisez un serveur local :

```bash
# Avec Python 3
python3 -m http.server 8000

# Avec Node.js (si vous avez http-server installé)
npx http-server
```

Ensuite, ouvrez `http://localhost:8000` dans votre navigateur.

### 4. Déployer sur GitHub Pages

#### Option A : Via les paramètres GitHub

1. Commitez tous vos fichiers (y compris les images)
2. Poussez vers GitHub
3. Allez dans **Settings** > **Pages**
4. Sélectionnez la branche `main` (ou `master`)
5. Cliquez sur **Save**
6. Votre site sera disponible à : `https://votre-nom.github.io/try-evena/`

#### Option B : Via la ligne de commande

```bash
git add .
git commit -m "Déploiement initial de la landing page"
git push origin main
```

## 🎨 Personnalisation

### Modifier les couleurs

Ouvrez `styles.css` et modifiez les variables CSS dans la section `:root` :

```css
:root {
    --color-primary: #D4AF37;        /* Couleur principale (or) */
    --color-primary-dark: #B8941F;   /* Variante foncée */
    --color-text-primary: #2C2C2C;   /* Texte principal */
    --color-text-secondary: #5A5A5A; /* Texte secondaire */
    /* ... */
}
```

### Modifier le compte à rebours

Dans `script.js`, ligne 13 :

```javascript
const countdownDuration = 50 * 60; // Durée en secondes (50 minutes par défaut)
```

### Ajouter un lien vers la page de commande

Dans `script.js`, ligne 73, décommentez et modifiez :

```javascript
window.location.href = 'https://votre-page-de-commande.com';
```

## 🎯 URLs des boutons CTA

Actuellement, les boutons CTA ne redirigent nulle part. Pour ajouter vos liens :

1. Ouvrez `script.js`
2. Trouvez la fonction `initCTAButtons()` (ligne ~66)
3. Décommentez la ligne `window.location.href` et ajoutez votre URL

## 📱 Design responsive

Le site s'adapte automatiquement à toutes les tailles d'écran :

- **Desktop** : Mise en page à 2 colonnes pour les raisons
- **Tablette** : Adaptation des tailles et espacements
- **Mobile** : Mise en page en colonne unique

## ⚡ Optimisations

- **Lazy loading** : Les images se chargent uniquement quand elles deviennent visibles
- **Animations au scroll** : Apparition progressive des sections
- **Compte à rebours persistant** : Utilise localStorage pour garder le même temps même après rechargement

## 🛠️ Technologies utilisées

- HTML5 sémantique
- CSS3 avec variables CSS et Grid/Flexbox
- JavaScript vanilla (pas de dépendances)
- IntersectionObserver API pour les animations

## 📊 SEO

Le site inclut :

- Meta tags appropriés
- Attributs `alt` sur toutes les images
- Structure sémantique HTML5
- Titre et description optimisés

## 🐛 Support navigateurs

Compatible avec :

- ✅ Chrome/Edge (dernières versions)
- ✅ Firefox (dernières versions)
- ✅ Safari (dernières versions)
- ✅ Navigateurs mobiles (iOS Safari, Chrome Mobile)

## 📝 Licence

Tous droits réservés.

## 🤝 Support

Pour toute question ou problème, contactez l'équipe de développement.

---

**Développé avec ❤️ pour les femmes de 50+**
