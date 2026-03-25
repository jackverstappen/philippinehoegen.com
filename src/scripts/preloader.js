import imagesLoaded from 'imagesloaded';

// Preloader element reference
let loading;

// Initialize the preloader element.
const initializeElements = () => {
  loading = document.querySelector('.loading');
};

// Load all images and background images on the page.
// Resolves when all assets are loaded, or rejects if any fail.
const loadImages = () => {
  return new Promise((resolve, reject) => {
    // Collect all <img> elements.
    const imgElements = document.querySelectorAll('img');

    // Collect elements with background images.
    const bgElements = [...document.querySelectorAll('*')].filter((el) => {
      const style = window.getComputedStyle(el);
      return style.backgroundImage !== 'none';
    });

    // Combine both sets of elements.
    const allElements = [...imgElements, ...bgElements];

    // Use imagesLoaded to track asset loading.
    // always resolves — a broken image should never leave the page blank.
    const imgLoad = imagesLoaded(allElements, { background: true });
    imgLoad.on('always', resolve);
  });
};

// Load assets and dispatch a custom event when done.
const loadAssets = async () => {
  await loadImages();
  document.dispatchEvent(new CustomEvent('assetsLoaded'));
};

// Show the preloader, load assets if needed, and then hide the preloader.
const toggleLoading = async () => {
  if (sessionStorage.getItem('preloadComplete') === 'true') {
    hide();
    return;
  }
  show();
  try {
    await loadAssets();
    sessionStorage.setItem('preloadComplete', 'true');
  } catch (error) {
    console.warn('Preloader: asset load error:', error);
  } finally {
    hide();
  }
};

// Display the preloader.
const show = () => {
  loading.classList.remove('hidden');
};

// Hide the preloader.
const hide = () => {
  loading.classList.add('hidden');
};

// Cleanup to reset references.
const cleanup = () => {
  loading = null;
};

// Initialize the preloader logic.
const init = () => {
  initializeElements();
  toggleLoading();
};

// Execute a callback only if the current page is the home page.
const handlePageEvent = (event, callback) => {
  const page = document.documentElement.getAttribute('data-page');
  if (page === 'home') callback();
};

// Listen for Astro's lifecycle events.
document.addEventListener('astro:page-load', () => {
  handlePageEvent('page-load', init);
});

document.addEventListener('astro:before-swap', () => {
  handlePageEvent('before-swap', cleanup);
});

// Clear the preload flag before page unload to ensure the loader appears on refresh.
window.addEventListener('beforeunload', () => {
  sessionStorage.removeItem('preloadComplete');
});
