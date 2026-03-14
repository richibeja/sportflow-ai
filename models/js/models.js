document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabs = document.querySelectorAll('.tab-btn');
    const freeGallery = document.getElementById('free-gallery');
    const premiumGallery = document.getElementById('premium-gallery');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tab.dataset.tab === 'premium') {
                freeGallery.classList.add('hidden');
                premiumGallery.classList.remove('hidden');
            } else {
                freeGallery.classList.remove('hidden');
                premiumGallery.classList.add('hidden');
            }
        });
    });

    // Chat CTA delay
    setTimeout(() => {
        const cta = document.getElementById('chat-cta');
        cta.classList.add('show');
    }, 4000);

    // Monetization triggers
    const unlockBtn = document.getElementById('btn-unlock-premium');
    const chatBtn = document.querySelector('.btn-chat');
    
    // Link de Adsterra SmartLink actualizado
    const smartLink = 'https://www.effectivegatecpm.com/jm7f9ypm?key=b8f95870742d9bd9e730551fa23f4398'; 

    unlockBtn.addEventListener('click', () => {
        window.open(smartLink, '_blank');
    });

    chatBtn.addEventListener('click', () => {
        window.open(smartLink, '_blank');
    });

    // Background optimization
    const bgOverlay = document.querySelector('.bg-overlay');
    // Using the generated image
    const bgImg = 'ai_model_premium_bg.png';
    bgOverlay.style.backgroundImage = `url(${bgImg})`; 
    bgOverlay.style.backgroundSize = 'cover';
    bgOverlay.style.backgroundPosition = 'center';
    bgOverlay.style.opacity = '0.4';
});
