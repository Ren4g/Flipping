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
    
     
    for (let i = 1; i <= imageCount; i++) {
        imageUrls.push(`${basePath}/IMG_145${i}.PNG`);
    }
    imageUrls.push(`${basePath}/Card-bg.PNG`);
    imageUrls.push(`${basePath}/bg.jpg`);
    
     
    const preloadedImages = {};
    let loadedCount = 0;
    const totalImages = imageUrls.length;
    
     
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 300;
    
     
    function updateProgress() {
        loadedCount++;
        const percentage = Math.floor((loadedCount / totalImages) * 100);
        progressBar.style.width = percentage + '%';
        progressText.textContent = percentage + '%';
    }
    
     
    Promise.all(
        imageUrls.map(url => new Promise((resolve, reject) => {
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
        }))
    ).then(() => {
         
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
                frontImage.src = preloadedImages[`${basePath}/IMG_1451.PNG`].src;
                frontSide.appendChild(frontImage);
                
                 
                const backSide = document.createElement('div');
                backSide.className = 'back';
                const backImage = document.createElement('img');
                backImage.src = preloadedImages[`${basePath}/Card-bg.PNG`].src;
                backSide.appendChild(backImage);
                
                 
                card.appendChild(frontSide);
                card.appendChild(backSide);
                cardWrapper.appendChild(card);
                
                 
                const handleCardFlip = (e) => {
                     
                    if (e.type === 'touchstart') {
                        e.preventDefault();
                    }
                    
                     
                     
                     
                     
                    if (!isFlipping && !card.classList.contains('flipped') && flippedCardsCount < imageCount) {
                         
                        isFlipping = true;
                        
                         
                        frontImage.src = preloadedImages[`${basePath}/IMG_145${nextImageIndex}.PNG`].src;
                        
                         
                        card.classList.add('flipped');
                        
                         
                        nextImageIndex = nextImageIndex % imageCount + 1;
                        flippedCardsCount++;
                        
                         
                        setTimeout(() => {
                            isFlipping = false;
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
