document.addEventListener('DOMContentLoaded', () => {
     
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
    
     
    const cardCount = 6; 
    const imageCount = 6; 
    const basePath = 'assets';
    const imageUrls = [];
    

      
    const cardNames = ["Trang", "Hà", "Ngân", "Huyền", "Trâm", ""];
    const cardColors = [
        "#8eb168",   
        "#ecbeb7",   
        "#ca9ff9",   
        "#b1d4e0",   
        "#fbb79d",   
        ""  
    ];
    
     
    for (let i = 1; i <= imageCount; i++) {
        imageUrls.push(`${basePath}/IMG_145${i}-min.PNG`);
    }
    imageUrls.push(`${basePath}/Card-bg-min.PNG`);
    imageUrls.push(`${basePath}/bg.jpg`);
    
     
    const preloadedImages = {};
    let loadedCount = 0;
    const totalImages = imageUrls.length;
    const totalAssets = totalImages + 1; // +1 for audio file
    
     
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 300;
    
     
    function updateProgress() {
        loadedCount++;
        const percentage = Math.floor((loadedCount / totalAssets) * 100);
        progressBar.style.width = percentage + '%';
        progressText.textContent = percentage + '%';
    }
    
     
    const audioPromise = new Promise((resolve, reject) => {
        const audio = document.getElementById('bg-music');
        
        if (audio) {
            const handleCanPlayThrough = () => {
                updateProgress();
                resolve(audio);
                audio.removeEventListener('canplaythrough', handleCanPlayThrough);
                audio.removeEventListener('error', handleError);
            };
            
            const handleError = () => {
                console.error('Failed to load audio');
                updateProgress();
                resolve(null); 
                audio.removeEventListener('canplaythrough', handleCanPlayThrough);
                audio.removeEventListener('error', handleError);
            };
            
            audio.addEventListener('canplaythrough', handleCanPlayThrough);
            audio.addEventListener('error', handleError);
            
            // Force load the audio
            audio.load();
        } else {
            updateProgress();
            resolve(null);
        }
    });

    // Create image loading promises
    const imagePromises = imageUrls.map(url => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';  
        
        img.onload = function() {
             
            preloadedImages[url] = img;
            
             
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
             
            updateProgress();
            resolve(img);
        };
        
        img.onerror = function() {
            console.error(`Failed to load image: ${url}`);
            updateProgress();
             
            resolve(null);
        };
        
        img.src = url;
    }));

    Promise.all([...imagePromises, audioPromise]).then(() => {
        const audio = document.getElementById('bg-music');
        if (audio) {
            audio.play().catch(error => {
                console.log('Audio autoplay failed:', error);
                const playOnFirstClick = () => {
                    audio.play().catch(e => console.log('Audio play failed:', e));
                    document.removeEventListener('click', playOnFirstClick);
                    document.removeEventListener('touchstart', playOnFirstClick);
                };
                document.addEventListener('click', playOnFirstClick);
                document.addEventListener('touchstart', playOnFirstClick);
            });
        }
         
        setTimeout(() => {
            document.body.removeChild(loadingScreen);
            initializeGame();
        }, 500);  
    });
    
     
    function initializeGame() {
        const container = document.querySelector('.card-container');
        
        if (container) {
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
                const frontImage = new Image();
                // Start with card back image, will be replaced when flipped
                frontImage.src = preloadedImages[`${basePath}/Card-bg-min.PNG`].src;
                frontSide.appendChild(frontImage);
                
                  
                const backSide = document.createElement('div');
                backSide.className = 'back';
                const backImage = document.createElement('img');
                backImage.src = preloadedImages[`${basePath}/Card-bg-min.PNG`].src;
                backSide.appendChild(backImage);
                
                // Create simple name overlay
                const nameOverlay = document.createElement('div');
                nameOverlay.className = 'cute-name-overlay';
                
                // Create just the name text (no banner wrapper)
                const nameText = document.createElement('span');
                nameText.className = 'name-text';
                
                // Add text directly to overlay
                nameOverlay.appendChild(nameText);
                
                  
                card.appendChild(frontSide);
                card.appendChild(backSide);
                card.appendChild(nameOverlay);   
                cardWrapper.appendChild(card);
                
                  
                const handleCardFlip = (e) => {
                      
                    if (e.type === 'touchstart') {
                        e.preventDefault();
                    }
                    
                      
                    if (waitingForNameClick && card === activeCard) {
                          
                        const currentImageIndex = (nextImageIndex - 1 + imageCount) % imageCount;
                        const nameIndex = currentImageIndex % cardNames.length -1;
                        
                        // Update the name text
                        nameText.textContent = cardNames[nameIndex];
                        
                        // Show the simple name overlay
                        card.classList.add('show-name');
                        
                          
                        card.classList.remove('needs-click');
                        
                          
                        waitingForNameClick = false;
                        activeCard = null;
                        
                          
                          
                        
                        return;
                    }
                    
                      
                    if (waitingForNameClick) {
                        return;
                    }
                    
                      
                    if (card.classList.contains('show-name')) {
                        return;
                    }
                    
                      
                      
                      
                      
                    if (!isFlipping && !card.classList.contains('flipped') && flippedCardsCount < imageCount) {
                          
                        isFlipping = true;
                        
                          
                        frontImage.src = preloadedImages[`${basePath}/IMG_145${nextImageIndex}-min.PNG`].src;
                        
                          
                        card.classList.add('flipped');
                        
                          
                        nextImageIndex = nextImageIndex % imageCount + 1;
                        flippedCardsCount++;
                        
                          
                        setTimeout(() => {
                            isFlipping = false;
                            
                              
                            if (flippedCardsCount < imageCount) {
                                  
                                waitingForNameClick = true;
                                activeCard = card;
                                
                                  
                                card.classList.add('needs-click');
                            }
                        }, 800);   
                    }
                };
                
                 
                cardWrapper.addEventListener('click', handleCardFlip);
                cardWrapper.addEventListener('touchstart', handleCardFlip, { passive: false });
                
                 
                container.appendChild(cardWrapper);
            }
        }
    }
});
