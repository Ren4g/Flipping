document.addEventListener('DOMContentLoaded', () => {
     
    const loadingScreen = createLoadingScreen();
    document.body.appendChild(loadingScreen);
    
    const cardCount = 6;
    const imageCount = 6;
    const basePath = 'assets';
    
    const cardNames = ["Trang", "Hà", "Ngân", "Huyền", "Trâm", ""];
    const cardColors = [
        "#8eb168", "#ecbeb7", "#ca9ff9", 
        "#b1d4e0", "#fbb79d", ""
    ];
    
     
    const imageUrls = [
        ...Array.from({length: imageCount}, (_, i) => `${basePath}/IMG_145${i + 1}-min.PNG`),
        `${basePath}/Card-bg-min.PNG`,
        `${basePath}/bg.jpg`
    ];
    
     
    const preloadedImages = new Map();
    let loadedCount = 0;
    const totalAssets = imageUrls.length + 1;
    
    function createLoadingScreen() {
        const screen = document.createElement('div');
        screen.className = 'loading-screen';
        screen.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); display: flex; flex-direction: column; 
            justify-content: center; align-items: center; z-index: 9999;
        `;
        
        const text = document.createElement('div');
        text.textContent = 'Chờ xíu...';
        text.style.cssText = `
            color: white; font-size: clamp(18px, 5vw, 24px); 
            margin-bottom: 20px; text-align: center; padding: 0 15px;
        `;
        
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: clamp(200px, 80%, 300px); background: #333; 
            border-radius: 10px; overflow: hidden;
        `;
        
        const progressBar = document.createElement('div');
        progressBar.id = 'progress-bar';
        progressBar.style.cssText = `
            width: 0%; height: 20px; background: #4CAF50; 
            transition: width 0.1s ease-out;
        `;
        
        const progressText = document.createElement('div');
        progressText.id = 'progress-text';
        progressText.textContent = '0%';
        progressText.style.cssText = 'color: white; margin-top: 10px;';
        
        progressContainer.appendChild(progressBar);
        screen.append(text, progressContainer, progressText);
        
        return screen;
    }
    
    function updateProgress() {
        loadedCount++;
        const percentage = Math.floor((loadedCount / totalAssets) * 100);
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        if (progressBar && progressText) {
             
            requestAnimationFrame(() => {
                progressBar.style.width = percentage + '%';
                progressText.textContent = percentage + '%';
            });
        }
    }
    
     
    function loadAudio() {
        return new Promise((resolve) => {
            const audio = document.getElementById('bg-music');
            if (!audio) {
                updateProgress();
                return resolve(null);
            }
            
            const cleanup = () => {
                audio.removeEventListener('canplaythrough', handleLoad);
                audio.removeEventListener('error', handleError);
            };
            
            const handleLoad = () => {
                cleanup();
                updateProgress();
                resolve(audio);
            };
            
            const handleError = () => {
                cleanup();
                console.warn('Audio loading failed');
                updateProgress();
                resolve(null);
            };
            
            audio.addEventListener('canplaythrough', handleLoad, { once: true });
            audio.addEventListener('error', handleError, { once: true });
            audio.load();
        });
    }
    
     
    function loadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            
            const cleanup = () => {
                img.onload = null;
                img.onerror = null;
            };
            
            img.onload = () => {
                cleanup();
                preloadedImages.set(url, img);
                updateProgress();
                resolve(img);
            };
            
            img.onerror = () => {
                cleanup();
                console.warn(`Failed to load: ${url}`);
                updateProgress();
                resolve(null);
            };
            
             
            setTimeout(() => {
                img.src = url;
            }, Math.random() * 100);
        });
    }
    
     
    Promise.all([
        loadAudio(),
        ...imageUrls.map(loadImage)
    ]).then((results) => {
        const audio = results[0];
        
         
        if (audio) {
            const playAudio = () => {
                audio.play().catch(() => {
                    console.log('Audio autoplay blocked - will play on user interaction');
                });
            };
            
             
            playAudio();
            
             
            const enableAudioOnInteraction = () => {
                playAudio();
                document.removeEventListener('click', enableAudioOnInteraction);
                document.removeEventListener('touchstart', enableAudioOnInteraction);
            };
            
            document.addEventListener('click', enableAudioOnInteraction, { once: true });
            document.addEventListener('touchstart', enableAudioOnInteraction, { once: true });
        }
        
         
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.3s ease-out';
            
            setTimeout(() => {
                document.body.removeChild(loadingScreen);
                initializeGame();
            }, 300);
        }, 200);
    });
    
    function initializeGame() {
        const container = document.querySelector('.card-container');
        if (!container) return;
        
        container.innerHTML = '';
        
         
        let nextImageIndex = 1;
        let flippedCardsCount = 0;
        let waitingForNameClick = false;
        let activeCard = null;
        let isFlipping = false;
        
         
        for (let i = 0; i < cardCount; i++) {
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'card-wrapper';
            
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-index', i);
            
             
            const frontSide = document.createElement('div');
            frontSide.className = 'front';
            
             
            const backSide = document.createElement('div');
            backSide.className = 'back';
            const backImage = document.createElement('img');
            const cardBgImg = preloadedImages.get(`${basePath}/Card-bg-min.PNG`);
            if (cardBgImg) {
                backImage.src = cardBgImg.src;
            }
            backSide.appendChild(backImage);
            
             
            const nameOverlay = document.createElement('div');
            nameOverlay.className = 'cute-name-overlay';
            const nameText = document.createElement('span');
            nameText.className = 'name-text';
            nameOverlay.appendChild(nameText);
            
            card.append(frontSide, backSide, nameOverlay);
            cardWrapper.appendChild(card);
            
             
            let clickTimeout;
            const handleCardFlip = (e) => {
                e.preventDefault();
                
                 
                if (clickTimeout) {
                    clearTimeout(clickTimeout);
                }
                
                clickTimeout = setTimeout(() => {
                    processCardClick(card, frontSide, nameText);
                }, 50);  
            };
            
            function processCardClick(card, frontSide, nameText) {
                 
                if (waitingForNameClick && card === activeCard) {
                    const currentImageIndex = (nextImageIndex - 1 + imageCount) % imageCount;
                    const nameIndex = currentImageIndex % cardNames.length - 1;
                    
                    nameText.textContent = cardNames[nameIndex];
                    card.classList.add('show-name');
                    card.classList.remove('needs-click');
                    
                    waitingForNameClick = false;
                    activeCard = null;
                    return;
                }
                
                 
                if (waitingForNameClick || card.classList.contains('show-name')) {
                    return;
                }
                
                 
                if (!isFlipping && !card.classList.contains('flipped') && flippedCardsCount < imageCount) {
                    isFlipping = true;
                    
                     
                    const imageKey = `${basePath}/IMG_145${nextImageIndex}-min.PNG`;
                    const preloadedImg = preloadedImages.get(imageKey);
                    
                    if (preloadedImg) {
                         
                        const frontImage = document.createElement('img');
                        frontImage.src = preloadedImg.src;
                        frontImage.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;';
                        
                        frontSide.innerHTML = '';
                        frontSide.appendChild(frontImage);
                    }
                    
                    card.classList.add('flipped');
                    nextImageIndex = nextImageIndex % imageCount + 1;
                    flippedCardsCount++;
                    
                     
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            isFlipping = false;
                            
                            if (flippedCardsCount < imageCount) {
                                waitingForNameClick = true;
                                activeCard = card;
                                card.classList.add('needs-click');
                            }
                        });
                    }, 800);
                }
            }
            
             
            cardWrapper.addEventListener('click', handleCardFlip);
            cardWrapper.addEventListener('touchstart', handleCardFlip, { passive: false });
            
            container.appendChild(cardWrapper);
        }
    }
});