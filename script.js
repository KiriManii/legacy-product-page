document.addEventListener("DOMContentLoaded", () => {
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const cartIcon = document.getElementById("cart-icon");
    const cartCount = document.getElementById("cart-count");
    const addToCartButtons = document.querySelectorAll(".add-to-cart");
    
    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Initialize cart dropdown elements
    let cartDropdown;
    let cartDropdownItems;
    let cartDropdownTotal;
    let cartDropdownCheckout;
    
    // Initialize cart page elements if on cart page
    const isCartPage = window.location.pathname.includes("cart.html");
    let cartItemsContainer;
    let cartSubtotal;
    let cartShipping;
    let cartTotal;
    let checkoutButton;
    let emptyCartMessage;
    
    // 🌙 Dark Mode Toggle
    if (localStorage.getItem("dark-mode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("dark-mode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
    });

    // 🛒 Create Cart Dropdown
    function createCartDropdown() {
        // Create dropdown if it doesn't exist
        if (!document.querySelector('.cart-dropdown')) {
            cartDropdown = document.createElement('div');
            cartDropdown.className = 'cart-dropdown';
            
            const dropdownHeader = document.createElement('h3');
            dropdownHeader.textContent = 'Your Cart';
            cartDropdown.appendChild(dropdownHeader);
            
            cartDropdownItems = document.createElement('div');
            cartDropdownItems.className = 'dropdown-items';
            cartDropdown.appendChild(cartDropdownItems);
            
            const dropdownFooter = document.createElement('div');
            dropdownFooter.className = 'dropdown-footer';
            
            cartDropdownTotal = document.createElement('div');
            cartDropdownTotal.className = 'dropdown-total';
            cartDropdownTotal.innerHTML = '<span>Total:</span><span class="dropdown-price">KSh 0</span>';
            dropdownFooter.appendChild(cartDropdownTotal);
            
            cartDropdownCheckout = document.createElement('button');
            cartDropdownCheckout.className = 'checkout-btn';
            cartDropdownCheckout.textContent = 'Checkout';
            cartDropdownCheckout.addEventListener('click', () => {
                window.location.href = 'cart.html';
            });
            dropdownFooter.appendChild(cartDropdownCheckout);
            
            const viewCartBtn = document.createElement('button');
            viewCartBtn.className = 'view-cart-btn';
            viewCartBtn.textContent = 'View Cart';
            viewCartBtn.addEventListener('click', () => {
                window.location.href = 'cart.html';
            });
            dropdownFooter.appendChild(viewCartBtn);
            
            cartDropdown.appendChild(dropdownFooter);
            
            document.querySelector('.cart-icon').appendChild(cartDropdown);
        }
    }
    
    // 🔄 Update Cart Count
    function updateCartCount() {
        // Calculate total quantity across all items
        const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalQuantity;
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    
    // 💲 Format price string to number
    function priceStringToNumber(priceString) {
        return parseFloat(priceString.replace('KSh ', '').replace(',', ''));
    }
    
    // 💲 Format number to price string
    function formatPrice(price) {
        return `KSh ${price.toLocaleString()}`;
    }
    
    // 🛒 Update Cart Dropdown
    function updateCartDropdown() {
        if (!cartDropdown) return;
        
        cartDropdownItems.innerHTML = '';
        
        if (cart.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-cart-message';
            emptyMessage.textContent = 'Your cart is empty';
            cartDropdownItems.appendChild(emptyMessage);
            cartDropdownTotal.querySelector('.dropdown-price').textContent = 'KSh 0';
            return;
        }
        
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemPrice = priceStringToNumber(item.price);
            const itemTotal = itemPrice * item.quantity;
            total += itemTotal;
            
            const dropdownItem = document.createElement('div');
            dropdownItem.className = 'dropdown-item';
            
            const itemImage = document.createElement('img');
            itemImage.src = item.image;
            itemImage.alt = item.name;
            dropdownItem.appendChild(itemImage);
            
            const itemDetails = document.createElement('div');
            itemDetails.className = 'dropdown-item-details';
            
            const itemName = document.createElement('p');
            itemName.className = 'dropdown-item-name';
            itemName.textContent = item.name;
            itemDetails.appendChild(itemName);
            
            const itemPriceElement = document.createElement('p');
            itemPriceElement.className = 'dropdown-item-price';
            itemPriceElement.textContent = `${item.price} × ${item.quantity}`;
            itemDetails.appendChild(itemPriceElement);
            
            dropdownItem.appendChild(itemDetails);
            
            const removeButton = document.createElement('button');
            removeButton.className = 'dropdown-remove-item';
            removeButton.textContent = '×';
            removeButton.dataset.index = index;
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent dropdown from closing
                removeItemFromCart(index);
            });
            dropdownItem.appendChild(removeButton);
            
            cartDropdownItems.appendChild(dropdownItem);
        });
        
        cartDropdownTotal.querySelector('.dropdown-price').textContent = formatPrice(total);
    }
    
    // 📦 Update Cart Page (if on cart page)
    function updateCartPage() {
        if (!isCartPage) return;
        
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            document.querySelector('.cart-summary').classList.add('hidden');
            return;
        }
        
        emptyCartMessage.classList.add('hidden');
        document.querySelector('.cart-summary').classList.remove('hidden');
        
        let subtotal = 0;
        const shipping = 200; // Default shipping cost

        // Use the template to create cart items
        const template = document.getElementById('cart-item-template');
        
        cart.forEach((item, index) => {
            const itemPrice = priceStringToNumber(item.price);
            const itemTotal = itemPrice * item.quantity;
            subtotal += itemTotal;
            
            const cartItem = document.importNode(template.content, true);
            
            // Set item details
            cartItem.querySelector('.cart-item-name').textContent = item.name;
            cartItem.querySelector('.cart-item-price').textContent = item.price;
            cartItem.querySelector('img').src = item.image;
            cartItem.querySelector('img').alt = item.name;
            cartItem.querySelector('.item-quantity').textContent = item.quantity;
            cartItem.querySelector('.item-total-price').textContent = formatPrice(itemTotal);
            
            // Add event listeners
            cartItem.querySelector('.decrease').addEventListener('click', () => {
                if (item.quantity > 1) {
                    item.quantity--;
                    updateCartCount();
                    updateCartDropdown();
                    updateCartPage();
                }
            });
            
            cartItem.querySelector('.increase').addEventListener('click', () => {
                item.quantity++;
                updateCartCount();
                updateCartDropdown();
                updateCartPage();
            });
            
            cartItem.querySelector('.remove-item').addEventListener('click', () => {
                removeItemFromCart(index);
            });
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        // Update totals
        cartSubtotal.textContent = formatPrice(subtotal);
        cartShipping.textContent = formatPrice(shipping);
        cartTotal.textContent = formatPrice(subtotal + shipping);
    }
    
    // ➖ Remove Item From Cart
    function removeItemFromCart(index) {
        cart.splice(index, 1);
        updateCartCount();
        updateCartDropdown();
        updateCartPage();
    }
    
    // ➕ Add to Cart Function
    function addToCart(product) {
        const productName = product.querySelector("h3").textContent;
        const productPrice = product.querySelector(".price").textContent;
        const productImage = product.querySelector(".product-image").src;

        // Check if item exists
        const existingItemIndex = cart.findIndex(item => item.name === productName);
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ name: productName, price: productPrice, image: productImage, quantity: 1 });
        }

        updateCartCount();
        updateCartDropdown();
        updateCartPage();
    }
    
    // ⚡ Initialize Cart Page Elements
    if (isCartPage) {
        cartItemsContainer = document.getElementById('cart-items');
        cartSubtotal = document.getElementById('cart-subtotal');
        cartShipping = document.getElementById('cart-shipping');
        cartTotal = document.getElementById('cart-total');
        checkoutButton = document.getElementById('checkout-button');
        emptyCartMessage = document.getElementById('empty-cart-message');
        
        checkoutButton.addEventListener('click', () => {
            alert('Checkout feature will be implemented in the next phase.');
            // Implement actual checkout logic here
        });
        
        updateCartPage();
    }
    
    // 🎣 Event Listeners
    createCartDropdown();
    updateCartCount();
    updateCartDropdown();
    
    // Toggle cart dropdown
    cartIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        cartDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (cartDropdown && cartDropdown.classList.contains('active') && !cartDropdown.contains(e.target) && e.target !== cartIcon) {
            cartDropdown.classList.remove('active');
        }
    });
    
    // Add event listeners to all "Add to Cart" buttons
    addToCartButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const product = event.target.closest(".product-item");
            addToCart(product);
        });
    });
});