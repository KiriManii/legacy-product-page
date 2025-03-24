// DOM Elements
const cartIcon = document.getElementById('cart-icon');
const cartCount = document.getElementById('cart-count');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const productItems = document.querySelectorAll('.product-item');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const imageContainers = document.querySelectorAll('.image-container');

// Cart Data
let cart = JSON.parse(localStorage.getItem('cart')) || [];
updateCartCount();

// Dark Mode Functionality
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'dark' || (!currentTheme && prefersDarkMode.matches)) {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
}

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});

// Add to Cart Functionality
addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const productItem = e.target.closest('.product-item');
        const productId = productItem.id;
        const productName = productItem.querySelector('h3').textContent;
        const productPrice = productItem.querySelector('.price').textContent;
        const productImage = productItem.querySelector('.product-image').src;
        
        // Check if product already exists in cart
        const existingProductIndex = cart.findIndex(item => item.id === productId);
        
        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }
        
        // Add animation to the button
        const button = e.target;
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 300);
        
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Visual feedback
        showAddedNotification(productName);
    });
});

// Cart Icon Click - Redirect to Cart Page
cartIcon.addEventListener('click', () => {
    window.location.href = 'cart.html';
});

// Product Image Enlargement (Image Preview)
imageContainers.forEach(container => {
    container.addEventListener('click', () => {
        const largeImageUrl = container.getAttribute('data-large');
        
        if (largeImageUrl) {
            const overlay = document.createElement('div');
            overlay.className = 'image-overlay';
            
            const largeImage = document.createElement('img');
            largeImage.src = largeImageUrl;
            largeImage.className = 'large-product-image';
            
            overlay.appendChild(largeImage);
            document.body.appendChild(overlay);
            
            // Close on click
            overlay.addEventListener('click', () => {
                document.body.removeChild(overlay);
            });
        }
    });
});

// Helper Functions
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (totalItems > 0) {
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }
}

function showAddedNotification(productName) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = `${productName} added to cart!`;
    
    // Add notification to the body
    document.body.appendChild(notification);
    
    // Show the notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// CSS for notification (added via JavaScript to avoid modifying the CSS file)
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--primary-color);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        transform: translateY(100px);
        opacity: 0;
        transition: transform 0.3s, opacity 0.3s;
        z-index: 1000;
    }
    
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .add-to-cart.clicked {
        animation: buttonPulse 0.3s;
    }
    
    @keyframes buttonPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    .image-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        cursor: pointer;
    }
    
    .large-product-image {
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
    }
`;

document.head.appendChild(notificationStyle);