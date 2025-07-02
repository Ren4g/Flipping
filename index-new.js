document.addEventListener('DOMContentLoaded', () => {
    // Create loading screen
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 9999;';
    
    const loadingText = document.createElement('div');
    loadingText.textContent = 'Chờ xíu...';
    loadingText.style.cssText = 'color: white; font-size: clamp(18px, 5vw, 24px); margin-bottom: 20px; text-align: center; padding: 0 15px;';
    
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = 'width: clamp(200px, 80%, 300px); background: #333; border-radius: 10px; overflow: hidden;';
    
    const progressBar = document.createElement('div');
    progressBar.style.cssText = 'width: 0%; height: 20px; background: #4CAF50; transition: width 0.3s;';
    
    const progressText = document.createElement('div');
    progressText.textContent = '0%';
    progressText.style.cssText = 'color: white; margin-top: 10px;';
    
    progressContainer.appendChild(progressBar);
    loadingScreen.appendChild(loadingText);
    loadingScreen.appendChild(progressContainer);
    loadingScreen.appendChild(progressText);
    document.body.appendChild(loadingScreen);
    
    // Game configuration
    const cardCount = 6; 
    const imageCount = 6; 
    const basePath = 'assets';
    const imageUrls = [];
    
    // Create list of image URLs to preload
    for (let i = 1; i <= imageCount; i++) {
        imageUrls.push(`${basePath}/IMG_145${i}.PNG`);
    }
    imageUrls.push(`${basePath}/Card-bg.PNG`);
    imageUrls.push(`${basePath}/bg.jpg`);
    
    // Preload all images with progress tracking
    const preloadedImages = {};
    let loadedCount = 0;
    const totalImages = imageUrls.length;
    
    // Create HTML canvas for image processing (helps with rendering)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 300;
    
    // Function to update progress bar
    function updateProgress() {
        loadedCount++;
        const percentage = Math.floor((loadedCount / totalImages) * 100);
        progressBar.style.width = percentage + '%';
        progressText.textContent = percentage + '%';
    }
    
    // Preload all images
    Promise.all(
        imageUrls.map(url => new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // Needed for canvas operations
            
            img.onload = function() {
                // Store the image
                preloadedImages[url] = img;
                
                // Pre-render to canvas to force decode
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Update progress
                updateProgress();
                resolve(img);
            };
            
            img.onerror = function() {
                console.error(`Failed to load image: ${url}`);
                updateProgress();
                // Resolve anyway to not block the game
                resolve(null);
            };
            
            img.src = url;
        }))
    ).then(() => {
        // All images loaded, continue to game
        setTimeout(() => {
            document.body.removeChild(loadingScreen);
            initializeGame();
        }, 500); // Short delay for smooth transition
    });
    
    // Initialize game once all assets are loaded
    function initializeGame() {
        const container = document.querySelector('.card-container');
        
        if (container) {
            container.innerHTML = '';
            
            // Game state tracking
            let nextImageIndex = 1;
            let flippedCardsCount = 0;
            let isFlipping = false; // Lock to prevent multiple simultaneous flips
            
            // Create cards
            for (let i = 0; i < cardCount; i++) {
                const cardWrapper = document.createElement('div');
                cardWrapper.className = 'card-wrapper';
                
                const card = document.createElement('div');
                card.className = 'card';
                card.setAttribute('data-index', i);
                
                // Create front side with image
                const frontSide = document.createElement('div');
                frontSide.className = 'front';
                const frontImage = new Image();
                frontImage.src = preloadedImages[`${basePath}/IMG_1451.PNG`].src;
                frontSide.appendChild(frontImage);
                
                // Create back side (card back)
                const backSide = document.createElement('div');
                backSide.className = 'back';
                const backImage = document.createElement('img');
                backImage.src = preloadedImages[`${basePath}/Card-bg.PNG`].src;
                backSide.appendChild(backImage);
                
                // Assemble card
                card.appendChild(frontSide);
                card.appendChild(backSide);
                cardWrapper.appendChild(card);
                
                // Function to handle card flip
                const handleCardFlip = (e) => {
                    // Prevent default behavior for touch events to avoid double triggering
                    if (e.type === 'touchstart') {
                        e.preventDefault();
                    }
                    
                    // Only allow flipping if:
                    // 1. No card is currently being flipped (isFlipping lock)
                    // 2. This card hasn't been flipped yet
                    // 3. We haven't reached the maximum number of flipped cards
                    if (!isFlipping && !card.classList.contains('flipped') && flippedCardsCount < imageCount) {
                        // Set lock to prevent other cards from flipping while animation is in progress
                        isFlipping = true;
                        
                        // Update the image source
                        frontImage.src = preloadedImages[`${basePath}/IMG_145${nextImageIndex}.PNG`].src;
                        
                        // Flip the card
                        card.classList.add('flipped');
                        
                        // Update counters
                        nextImageIndex = nextImageIndex % imageCount + 1;
                        flippedCardsCount++;
                        
                        // Release the lock after the animation completes
                        setTimeout(() => {
                            isFlipping = false;
                        }, 800); // Match this to your CSS transition duration
                    }
                };
                
                // Add event listeners for both click and touch
                cardWrapper.addEventListener('click', handleCardFlip);
                cardWrapper.addEventListener('touchstart', handleCardFlip, { passive: false });
                
                // Add the card to the container
                container.appendChild(cardWrapper);
            }
        }
    }
});
