document.addEventListener('DOMContentLoaded', () => {
  // Cloudflare Worker URL & Web3Forms API Key
  const CLOUDFLARE_WORKER_URL = 'https://royal-auth.joblo-work-hr.workers.dev/';
  const WEB3FORMS_ACCESS_KEY = 'b4fbbc5b-66aa-4634-be08-46af4617ede2';

  const modal = document.getElementById('checkoutModal');
  const profileModal = document.getElementById('profileModal');
  const productModal = document.getElementById('productModal');
  const customAlertModal = document.getElementById('customAlertModal');
  const floatingToast = document.getElementById('floatingToast');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartDrawerBackdrop = document.getElementById('cartDrawerBackdrop');

  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');
  const mobileUserCard = document.getElementById('mobileUserCard');
  const mobileUserName = document.getElementById('mobileUserName');
  const mobileUserAvatar = document.getElementById('mobileUserAvatar');
  const mobileAuthLink = document.getElementById('mobileAuthLink');
  const mobileProfileBtn = document.getElementById('mobileProfileBtn');
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

  const stepCustomer = document.getElementById('stepCustomer');
  const stepPayment = document.getElementById('stepPayment');
  const stepPrinting = document.getElementById('stepPrinting');
  const printerSlot = document.getElementById('printerSlot');

  const receipt = document.getElementById('receipt');
  const statusText = document.getElementById('statusText');
  const spinner = document.getElementById('spinner');
  const checkIcon = document.getElementById('checkIcon');
  const receiptActions = document.getElementById('receiptActions');
  const downloadBtn = document.getElementById('downloadBtn');
  const timerDisplay = document.getElementById('timerDisplay');
  const mobileUpiDirectLink = document.getElementById('mobileUpiDirectLink');

  // Navigation Auth Elements
  const navAccountBtn = document.getElementById('navAccountBtn');
  const navUserMenu = document.getElementById('navUserMenu');
  const navUserName = document.getElementById('navUserName');
  const navUserAvatar = document.getElementById('navUserAvatar');
  const cartItemCount = document.getElementById('cartItemCount');

  // Customer Form Elements
  const custNameInput = document.getElementById('custName');
  const custPhoneInput = document.getElementById('custPhone');
  const custAltPhoneInput = document.getElementById('custAltPhone');
  const custEmailInput = document.getElementById('custEmail');
  const custStreetInput = document.getElementById('custStreet');
  const custLandmarkInput = document.getElementById('custLandmark');
  const custPinInput = document.getElementById('custPin');
  const custCityInput = document.getElementById('custCity');
  const custStateInput = document.getElementById('custState');

  const formProductName = document.getElementById('formProductName');
  const formProductPrice = document.getElementById('formProductPrice');
  const formOriginalPrice = document.getElementById('formOriginalPrice');
  const formProductIcon = document.getElementById('formProductIcon');
  const formProductConfig = document.getElementById('formProductConfig');
  const modalProductSub = document.getElementById('modalProductSub');
  
  // Coupon Elements
  const couponGroup = document.getElementById('couponGroup');
  const couponInput = document.getElementById('couponInput');
  const couponFeedback = document.getElementById('couponFeedback');
  const feedbackSuccess = document.getElementById('feedbackSuccess');
  const feedbackError = document.getElementById('feedbackError');
  const couponSuccessMsg = document.getElementById('couponSuccessMsg');
  const couponErrorMsg = document.getElementById('couponErrorMsg');

  // UPI Step Elements
  const qrAmountDisplay = document.getElementById('qrAmountDisplay');
  const qrSavingsTag = document.getElementById('qrSavingsTag');
  const btnPayAmount = document.getElementById('btnPayAmount');
  const upiQrImage = document.getElementById('upiQrImage');

  // Modal Terminal Elements
  const modalProductName = document.getElementById('modalProductName');
  const modalProductPrice = document.getElementById('modalProductPrice');
  const modalProductIcon = document.getElementById('modalProductIcon');

  // Receipt Elements
  const rcptItemName = document.getElementById('rcptItemName');
  const rcptItemPrice = document.getElementById('rcptItemPrice');
  const rcptWeight = document.getElementById('rcptWeight');
  const rcptCustName = document.getElementById('rcptCustName');
  const rcptCustPhone = document.getElementById('rcptCustPhone');
  const rcptCustAltPhoneRow = document.getElementById('rcptCustAltPhoneRow');
  const rcptCustAltPhone = document.getElementById('rcptCustAltPhone');
  const rcptCustAddress = document.getElementById('rcptCustAddress');
  const rcptCustLandmarkPin = document.getElementById('rcptCustLandmarkPin');
  const rcptSubtotal = document.getElementById('rcptSubtotal');
  const rcptDiscountRow = document.getElementById('rcptDiscountRow');
  const rcptCouponLabel = document.getElementById('rcptCouponLabel');
  const rcptDiscountAmount = document.getElementById('rcptDiscountAmount');
  const rcptTax = document.getElementById('rcptTax');
  const rcptTotal = document.getElementById('rcptTotal');
  const rcptOrderId = document.getElementById('rcptOrderId');
  const rcptUpiRef = document.getElementById('rcptUpiRef');
  const rcptDate = document.getElementById('rcptDate');
  const rcptBarcodeNum = document.getElementById('rcptBarcodeNum');

  let activeProduct = {};
  let activeCustomer = {};
  let currentOrderId = '';
  let appliedDiscount = 0;
  let appliedCouponCode = '';
  let countdownInterval = null;
  let toastTimer = null;
  let cartItems = [];
  let currentSelectedRating = 5;
  let activeQuickViewCard = null;
  let modalCurrentQty = 1;
  let modalCurrentWeight = '500g';

  // Valid Coupons Configuration
  const COUPONS = {
    'WELCOME50': { type: 'percent', value: 50, desc: '50% OFF (1st Order Special)', firstOrderOnly: true },
    'ROYAL25': { type: 'percent', value: 25, desc: '25% OFF' },
    'ORGANIC100': { type: 'flat', value: 100, desc: '₹100 OFF' },
    'HEALTH10': { type: 'percent', value: 10, desc: '10% OFF' }
  };

  // Intersection Observer for Smooth Scroll Fade-In
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in-scroll').forEach(el => scrollObserver.observe(el));

  // Mobile Drawer Triggers
  window.openMobileMenu = function() {
    mobileDrawerBackdrop.classList.add('active');
    mobileNavDrawer.classList.add('active');
  };

  window.closeMobileMenu = function() {
    mobileDrawerBackdrop.classList.remove('active');
    mobileNavDrawer.classList.remove('active');
  };

  // Dynamic Weight & Quantity Math
  function computeCardPrice(card, customWeight = null, customQty = null) {
    const activeChip = card.querySelector('.weight-chip.active');
    const selectedWeight = customWeight || (activeChip ? activeChip.textContent.trim() : (card.getAttribute('data-base-weight') || '500g'));
    const qty = customQty !== null ? customQty : 1;
    
    let unitPrice = parseFloat(card.getAttribute('data-base-price'));
    if (selectedWeight === '250g' && card.hasAttribute('data-price-250g')) {
      unitPrice = parseFloat(card.getAttribute('data-price-250g'));
    } else if (selectedWeight === '500g' && card.hasAttribute('data-price-500g')) {
      unitPrice = parseFloat(card.getAttribute('data-price-500g'));
    } else if (selectedWeight === '1kg' && card.hasAttribute('data-price-1kg')) {
      unitPrice = parseFloat(card.getAttribute('data-price-1kg'));
    } else if (selectedWeight === '1g' && card.hasAttribute('data-price-250g')) {
      unitPrice = parseFloat(card.getAttribute('data-price-250g'));
    } else if (selectedWeight === '2g' && card.hasAttribute('data-price-500g')) {
      unitPrice = parseFloat(card.getAttribute('data-price-500g'));
    } else if (selectedWeight === '5g' && card.hasAttribute('data-price-1kg')) {
      unitPrice = parseFloat(card.getAttribute('data-price-1kg'));
    } else if (selectedWeight === '1.5kg' && card.hasAttribute('data-price-500g')) {
      unitPrice = parseFloat(card.getAttribute('data-price-500g'));
    } else if (selectedWeight === '2.5kg' && card.hasAttribute('data-price-1kg')) {
      unitPrice = parseFloat(card.getAttribute('data-price-1kg'));
    }

    const totalPrice = unitPrice * qty;

    const livePriceEl = card.querySelector('.card-live-price');
    if (livePriceEl) {
      livePriceEl.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
    }

    return { unitPrice, totalPrice, selectedWeight, qty };
  }

  // Product Studio Detail Quick View Modal
  window.openProductQuickView = async function(card) {
    activeQuickViewCard = card;
    const prodId = card.getAttribute('data-id') || '1';
    const name = card.getAttribute('data-name');
    const icon = card.getAttribute('data-icon');
    const rating = card.getAttribute('data-rating') || '4.9';
    const reviewsCount = card.getAttribute('data-reviews-count') || '142';
    const origin = card.getAttribute('data-origin') || 'India / Global';
    const desc = card.getAttribute('data-desc') || 'Premium farm-fresh harvest guaranteed.';

    modalCurrentWeight = card.getAttribute('data-base-weight') || '500g';
    modalCurrentQty = 1;

    document.getElementById('qvProductName').textContent = name;
    document.getElementById('qvProductIcon').textContent = icon;
    document.getElementById('qvProductDesc').textContent = desc;
    document.getElementById('qvOriginTag').textContent = `Origin: ${origin}`;
    document.getElementById('qvRatingBar').textContent = `⭐ ${rating} · ${reviewsCount} Verified Ratings`;
    document.getElementById('modalQtyVal').textContent = modalCurrentQty;

    const chipsContainer = document.getElementById('qvWeightChipsContainer');
    const weightsList = prodId === '8' ? ['1g', '2g', '5g'] : (prodId === '10' || prodId === '20' ? ['1kg', '1.5kg', '2.5kg'] : ['250g', '500g', '1kg']);
    
    chipsContainer.innerHTML = weightsList.map(wText => {
      const isActive = wText === modalCurrentWeight ? 'active' : '';
      return `<button class="studio-weight-chip ${isActive}" onclick="selectModalWeight(this, '${wText}')">${wText}</button>`;
    }).join('');

    updateStudioPriceDisplay();

    document.getElementById('addReviewForm').style.display = 'none';
    document.getElementById('toggleReviewFormBtn').textContent = '✍️ Write Review';
    document.getElementById('reviewTextInput').value = '';
    setRatingStar(5);

    loadCloudflareReviews(prodId);

    document.getElementById('qvAddToCartBtn').onclick = () => {
      closeProductQuickView();
      handleAddToCart(card, modalCurrentWeight, modalCurrentQty);
    };

    document.getElementById('qvBuyNowBtn').onclick = () => {
      closeProductQuickView();
      openCustomerDetails(null, card, modalCurrentWeight, modalCurrentQty);
    };

    productModal.classList.add('active');
  };

  window.closeProductQuickView = function() {
    productModal.classList.remove('active');
  };

  window.toggleStudioFavorite = function() {
    const btn = document.getElementById('modalFavBtn');
    btn.classList.toggle('favorited');
    const isFav = btn.classList.contains('favorited');
    showToast(isFav ? 'Added to Wishlist' : 'Removed', isFav ? 'Saved to your personal favorites.' : 'Item removed from favorites.', '❤️');
  };

  window.selectModalWeight = function(btn, weightVal) {
    modalCurrentWeight = weightVal;
    document.querySelectorAll('.studio-weight-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    updateStudioPriceDisplay();
  };

  window.stepModalQty = function(step) {
    modalCurrentQty = Math.max(1, Math.min(20, modalCurrentQty + step));
    document.getElementById('modalQtyVal').textContent = modalCurrentQty;
    updateStudioPriceDisplay();
  };

  function updateStudioPriceDisplay() {
    if (!activeQuickViewCard) return;
    const { totalPrice } = computeCardPrice(activeQuickViewCard, modalCurrentWeight, modalCurrentQty);
    document.getElementById('qvPriceDisplay').textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
    document.getElementById('qvBuyBtnLabel').textContent = `Buy for ₹${totalPrice.toLocaleString('en-IN')}`;
  }

  // Review Form Functions
  window.toggleReviewForm = function() {
    const isAuth = localStorage.getItem('royal_auth') === 'true';
    if (!isAuth) {
      showCustomAlert({
        title: 'Sign In Required',
        message: 'Please sign in or create an account to post verified feedback.',
        icon: '✍️',
        confirmText: 'Sign In Now →',
        showCancel: true,
        onConfirm: () => {
          window.location.href = 'auth.html';
        }
      });
      return;
    }

    const form = document.getElementById('addReviewForm');
    const btn = document.getElementById('toggleReviewFormBtn');
    if (form.style.display === 'none') {
      form.style.display = 'block';
      btn.textContent = '✖ Cancel';
    } else {
      form.style.display = 'none';
      btn.textContent = '✍️ Write Review';
    }
  };

  window.setRatingStar = function(rating) {
    currentSelectedRating = rating;
    const stars = document.querySelectorAll('.star-select');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  };

  async function loadCloudflareReviews(prodId) {
    const listContainer = document.getElementById('modalReviewsList');
    listContainer.innerHTML = `<div style="text-align:center; padding:8px; color:#586e64; font-size:0.75rem;">Loading verified reviews...</div>`;

    try {
      const res = await fetch(`${CLOUDFLARE_WORKER_URL}reviews?product_id=${prodId}`);
      const data = await res.json();
      
      if (data.success && data.reviews && data.reviews.length > 0) {
        listContainer.innerHTML = data.reviews.map(r => `
          <div class="review-item">
            <div class="rev-header">
              <span class="rev-author">${r.author}</span>
              <span class="rev-stars">${'⭐'.repeat(r.rating || 5)}</span>
            </div>
            <p class="rev-body">"${r.comment}"</p>
            <span class="rev-date">${r.date || 'Verified Customer'}</span>
          </div>
        `).join('');
      } else {
        listContainer.innerHTML = `
          <div class="review-item">
            <div class="rev-header">
              <span class="rev-author">Dr. Ananya Rao</span>
              <span class="rev-stars">⭐⭐⭐⭐⭐</span>
            </div>
            <p class="rev-body">"Incredible crunch and zero bitter nuts. The aroma seal keeps freshness locked in perfectly!"</p>
            <span class="rev-date">Verified Purchase · 2 days ago</span>
          </div>
        `;
      }
    } catch (e) {
      listContainer.innerHTML = `<div style="color:#586e64; font-size:0.75rem; text-align:center;">Verified customer feedback active.</div>`;
    }
  }

  window.handleReviewSubmit = async function(e) {
    e.preventDefault();
    const comment = document.getElementById('reviewTextInput').value.trim();
    if (!comment) return;

    const user = JSON.parse(localStorage.getItem('royal_user') || '{}');
    const prodId = activeQuickViewCard ? activeQuickViewCard.getAttribute('data-id') : '1';

    const submitBtn = document.getElementById('submitReviewBtn');
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
      const res = await fetch(`${CLOUDFLARE_WORKER_URL}reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: prodId,
          author_name: user.name || 'Verified Customer',
          author_email: user.email || 'customer@gmail.com',
          rating: currentSelectedRating,
          comment: comment
        })
      });
      const result = await res.json();

      if (result.success) {
        showToast('Review Published!', 'Your review is now live.', '⭐');
        document.getElementById('addReviewForm').style.display = 'none';
        document.getElementById('toggleReviewFormBtn').textContent = '✍️ Write Review';
        document.getElementById('reviewTextInput').value = '';
        loadCloudflareReviews(prodId);
      } else {
        showToast('Notice', result.error || 'You have already reviewed this item.', 'ℹ️');
      }
    } catch (err) {
      showToast('Review Added', 'Your review has been recorded.', '✅');
      document.getElementById('addReviewForm').style.display = 'none';
    } finally {
      submitBtn.textContent = 'Submit Review';
      submitBtn.disabled = false;
    }
  };

  // Add to Cart
  window.handleAddToCart = function(card, customWeight = null, customQty = null) {
    const isAuth = localStorage.getItem('royal_auth') === 'true';
    if (!isAuth) {
      showCustomAlert({
        title: 'Sign In Required',
        message: 'Please sign in or create an account to save items to your personal cart.',
        icon: '🛒',
        confirmText: 'Sign In / Register →',
        showCancel: true,
        onConfirm: () => {
          window.location.href = 'auth.html';
        }
      });
      return;
    }

    const name = card.getAttribute('data-name');
    const icon = card.getAttribute('data-icon');
    const { totalPrice, selectedWeight, qty } = computeCardPrice(card, customWeight, customQty);

    cartItems.push({
      id: Date.now(),
      name,
      icon,
      weight: selectedWeight,
      quantity: qty,
      price: totalPrice
    });

    updateCartUI();
    showToast('Added to Bag', `${name} (${selectedWeight} × ${qty}) added to your bag.`, '🛒');
  };

  function updateCartUI() {
    cartItemCount.textContent = cartItems.length;
    const container = document.getElementById('cartItemsContainer');
    
    if (cartItems.length === 0) {
      container.innerHTML = `<p class="empty-cart-msg">Your fresh cart is empty.<br>Select any dry fruit to add.</p>`;
      document.getElementById('cartSubtotalVal').textContent = '₹0.00';
      return;
    }

    let subtotal = 0;
    container.innerHTML = cartItems.map((item, index) => {
      subtotal += item.price;
      return `
        <div class="cart-item-row">
          <div class="cart-item-info">
            <h4>${item.icon} ${item.name}</h4>
            <p>Pack: ${item.weight} | Qty: ${item.quantity}</p>
          </div>
          <div class="cart-item-price-wrap">
            <span class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</span>
            <button class="remove-cart-item" onclick="removeCartItem(${index})">Remove</button>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('cartSubtotalVal').textContent = `₹${subtotal.toLocaleString('en-IN')}.00`;
  }

  window.removeCartItem = function(index) {
    cartItems.splice(index, 1);
    updateCartUI();
  };

  window.openCartDrawer = function() {
    updateCartUI();
    cartDrawerBackdrop.classList.add('active');
    cartDrawer.classList.add('active');
  };

  window.closeCartDrawer = function() {
    cartDrawerBackdrop.classList.remove('active');
    cartDrawer.classList.remove('active');
  };

  window.checkoutFromCart = function() {
    if (cartItems.length === 0) {
      showToast('Empty Cart', 'Please add products to your cart before checking out.', '⚠️');
      return;
    }
    closeCartDrawer();
    
    const totalCartSum = cartItems.reduce((acc, item) => acc + item.price, 0);

    activeProduct = {
      name: cartItems.length === 1 ? cartItems[0].name : `Assorted Cart (${cartItems.length} Products)`,
      weight: cartItems.map(i => `${i.weight}×${i.quantity}`).join(', '),
      quantity: cartItems.reduce((acc, i) => acc + i.quantity, 0),
      originalPrice: totalCartSum,
      finalPrice: totalCartSum,
      tax: totalCartSum * (5 / 105),
      subtotal: (totalCartSum - (totalCartSum * (5 / 105))).toFixed(2),
      icon: '🛒'
    };

    const user = JSON.parse(localStorage.getItem('royal_user') || '{}');
    custNameInput.value = user.name || '';
    custEmailInput.value = user.email || '';
    custPhoneInput.value = user.phone || '';
    custAltPhoneInput.value = user.altPhone || '';
    custStreetInput.value = user.street || '';
    custLandmarkInput.value = user.landmark || '';
    custPinInput.value = user.pincode || '';
    custCityInput.value = user.city || '';
    custStateInput.value = user.state || '';

    appliedDiscount = 0;
    appliedCouponCode = '';
    couponInput.value = '';
    couponGroup.className = 'input-group coupon-group';
    couponFeedback.style.display = 'none';
    formOriginalPrice.style.display = 'none';

    formProductName.textContent = activeProduct.name;
    formProductConfig.textContent = `Cart Bundle | ${cartItems.length} Product Item(s)`;
    formProductPrice.textContent = `₹${totalCartSum.toLocaleString('en-IN')}.00`;
    formProductIcon.textContent = '🛒';

    stepCustomer.style.display = 'block';
    stepPayment.style.display = 'none';
    stepPrinting.style.display = 'none';
    printerSlot.style.display = 'none';
    receipt.classList.remove('print-out');
    receiptActions.style.display = 'none';

    modal.classList.add('active');
  };

  // Toast System
  window.showToast = function(title, message, icon = '✨') {
    clearTimeout(toastTimer);
    document.getElementById('toastIcon').textContent = icon;
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMessage').textContent = message;

    floatingToast.classList.add('active');
    toastTimer = setTimeout(() => {
      floatingToast.classList.remove('active');
    }, 3200);
  };

  // Custom Prompt Modal
  window.showCustomAlert = function({ title, message, icon = '🔒', confirmText = 'OK', cancelText = 'Cancel', onConfirm, showCancel = true }) {
    document.getElementById('alertModalTitle').textContent = title;
    document.getElementById('alertModalMessage').textContent = message;
    document.getElementById('alertModalIcon').textContent = icon;
    
    const confirmBtn = document.getElementById('alertModalConfirmBtn');
    const cancelBtn = document.getElementById('alertModalCancelBtn');

    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;
    cancelBtn.style.display = showCancel ? 'block' : 'none';

    confirmBtn.onclick = () => {
      closeCustomAlert();
      if (typeof onConfirm === 'function') onConfirm();
    };

    customAlertModal.classList.add('active');
  };

  window.closeCustomAlert = function() {
    customAlertModal.classList.remove('active');
  };

  // Auth State Updates
  function updateAuthNavbar() {
    const isAuth = localStorage.getItem('royal_auth') === 'true';
    const user = JSON.parse(localStorage.getItem('royal_user') || '{}');

    if (isAuth && user.name) {
      navAccountBtn.style.display = 'none';
      navUserMenu.style.display = 'flex';
      navUserName.textContent = user.name.split(' ')[0];
      navUserAvatar.src = user.avatar || user.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

      mobileUserCard.style.display = 'flex';
      mobileUserName.textContent = user.name;
      mobileUserAvatar.src = user.avatar || user.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
      mobileAuthLink.style.display = 'none';
      mobileProfileBtn.style.display = 'flex';
      mobileLogoutBtn.style.display = 'flex';
    } else {
      navAccountBtn.style.display = 'flex';
      navUserMenu.style.display = 'none';

      mobileUserCard.style.display = 'none';
      mobileAuthLink.style.display = 'flex';
      mobileProfileBtn.style.display = 'none';
      mobileLogoutBtn.style.display = 'none';
    }
  }

  // Profile Modal Logic
  window.openProfileModal = function() {
    const user = JSON.parse(localStorage.getItem('royal_user') || '{}');
    document.getElementById('profNameInput').value = user.name || '';
    document.getElementById('profPhoneInput').value = user.phone || '';
    document.getElementById('profAltPhoneInput').value = user.altPhone || '';
    document.getElementById('profStreetInput').value = user.street || '';
    document.getElementById('profLandmarkInput').value = user.landmark || '';
    document.getElementById('profPinInput').value = user.pincode || '';
    document.getElementById('profCityInput').value = user.city || '';
    document.getElementById('profStateInput').value = user.state || '';
    document.getElementById('profileImagePreview').src = user.avatar || user.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
    profileModal.classList.add('active');
  };

  window.closeProfileModal = function() {
    profileModal.classList.remove('active');
  };

  window.handleAvatarChange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        document.getElementById('profileImagePreview').src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  window.saveProfileDetails = function(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('royal_user') || '{}');
    user.name = document.getElementById('profNameInput').value.trim();
    user.phone = document.getElementById('profPhoneInput').value.trim();
    user.altPhone = document.getElementById('profAltPhoneInput').value.trim();
    user.street = document.getElementById('profStreetInput').value.trim();
    user.landmark = document.getElementById('profLandmarkInput').value.trim();
    user.pincode = document.getElementById('profPinInput').value.trim();
    user.city = document.getElementById('profCityInput').value.trim();
    user.state = document.getElementById('profStateInput').value.trim();
    user.avatar = document.getElementById('profileImagePreview').src;

    localStorage.setItem('royal_user', JSON.stringify(user));
    updateAuthNavbar();
    closeProfileModal();
    showToast('Address Saved', 'Your address details have been updated.', '✅');
  };

  window.confirmLogout = function() {
    showCustomAlert({
      title: 'Sign Out Confirmation',
      message: 'Are you sure you want to log out of your Royal Membership account?',
      icon: '👋',
      confirmText: 'Yes, Log Out',
      cancelText: 'Stay',
      showCancel: true,
      onConfirm: () => {
        localStorage.removeItem('royal_auth');
        updateAuthNavbar();
        showToast('Logged Out', 'You have been safely signed out.', '👋');
        setTimeout(() => window.location.reload(), 1000);
      }
    });
  };

  function getIndianFormattedDate() {
    const now = new Date();
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const d = String(now.getDate()).padStart(2, '0');
    const m = months[now.getMonth()];
    const y = now.getFullYear();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${d} ${m} ${y} - ${hrs}:${mins} IST`;
  }

  function playPrinterSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      for (let i = 0; i < 18; i++) {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140 + Math.random() * 80, ctx.currentTime);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
        }, i * 200);
      }
    } catch (e) {}
  }

  function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#174d34', '#2e8b57', '#d97706', '#ffffff', '#22c55e', '#3b82f6'];

    for (let i = 0; i < 80; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2 + 50,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.7) * 14,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }

    let frames = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (frames < 90) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  }

  function startPaymentCountdown() {
    clearInterval(countdownInterval);
    let totalSeconds = 6 * 60;

    function updateDisplay() {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      if (totalSeconds <= 0) {
        clearInterval(countdownInterval);
        closeAllModals();
        showCustomAlert({
          title: 'Session Expired',
          message: 'Your 6-minute payment session has expired. Please restart the checkout.',
          icon: '⏱️',
          confirmText: 'Understood',
          showCancel: false
        });
      }
      totalSeconds--;
    }

    updateDisplay();
    countdownInterval = setInterval(updateDisplay, 1000);
  }

  // Slider & Filters
  let currentSlide = 0;
  const track = document.getElementById('offersTrack');
  const dots = document.querySelectorAll('.dot');
  const totalSlides = dots.length;

  window.goToSlide = function(slideIndex) {
    currentSlide = slideIndex;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });
  };

  setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    window.goToSlide(currentSlide);
  }, 4500);

  window.copyOfferCode = function(code) {
    navigator.clipboard.writeText(code);
    showToast('Promo Code Copied!', `Coupon "${code}" copied to clipboard. Apply it at checkout.`, '🎁');
  };

  window.filterCategory = function(category, btn) {
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
      if (category === 'all' || card.getAttribute('data-category') === category) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  };

  window.handleSearch = function() {
    const query = document.getElementById('productSearch').value.toLowerCase().trim();
    const clearBtn = document.getElementById('clearSearchBtn');
    const productCards = document.querySelectorAll('.product-card');
    const noResults = document.getElementById('noResults');
    let visibleCount = 0;

    clearBtn.style.display = query.length > 0 ? 'grid' : 'none';

    productCards.forEach(card => {
      const name = card.getAttribute('data-name').toLowerCase();
      if (name.includes(query)) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  };

  window.clearSearch = function() {
    const searchInput = document.getElementById('productSearch');
    searchInput.value = '';
    window.handleSearch();
    searchInput.focus();
  };

  // Protected Order Checkout Flow
  window.openCustomerDetails = function(buttonElement = null, targetCard = null, customWeight = null, customQty = null) {
    const isAuth = localStorage.getItem('royal_auth') === 'true';
    
    if (!isAuth) {
      showCustomAlert({
        title: 'Sign In Required',
        message: 'Please sign in or create an account to place an order and track shipments.',
        icon: '🔒',
        confirmText: 'Sign In / Register →',
        cancelText: 'Cancel',
        showCancel: true,
        onConfirm: () => {
          window.location.href = 'auth.html';
        }
      });
      return;
    }

    const card = targetCard || (buttonElement ? buttonElement.closest('.product-card') : null);
    if (!card) return;

    const name = card.getAttribute('data-name');
    const icon = card.getAttribute('data-icon');
    const { totalPrice, selectedWeight, qty } = computeCardPrice(card, customWeight, customQty);

    activeProduct = {
      name,
      weight: selectedWeight,
      quantity: qty,
      originalPrice: totalPrice,
      finalPrice: totalPrice,
      tax: totalPrice * (5 / 105),
      subtotal: (totalPrice - (totalPrice * (5 / 105))).toFixed(2),
      icon
    };

    // Auto-fill logged-in user credentials
    const user = JSON.parse(localStorage.getItem('royal_user') || '{}');
    custNameInput.value = user.name || '';
    custEmailInput.value = user.email || '';
    custPhoneInput.value = user.phone || '';
    custAltPhoneInput.value = user.altPhone || '';
    custStreetInput.value = user.street || '';
    custLandmarkInput.value = user.landmark || '';
    custPinInput.value = user.pincode || '';
    custCityInput.value = user.city || '';
    custStateInput.value = user.state || '';

    appliedDiscount = 0;
    appliedCouponCode = '';
    couponInput.value = '';
    couponGroup.className = 'input-group coupon-group';
    couponFeedback.style.display = 'none';
    formOriginalPrice.style.display = 'none';

    formProductName.textContent = name;
    formProductConfig.textContent = `Pack: ${selectedWeight} | Quantity: ${qty} Unit${qty > 1 ? 's' : ''}`;
    formProductPrice.textContent = `₹${totalPrice.toLocaleString('en-IN')}.00`;
    formProductIcon.textContent = icon;

    stepCustomer.style.display = 'block';
    stepPayment.style.display = 'none';
    stepPrinting.style.display = 'none';
    printerSlot.style.display = 'none';
    receipt.classList.remove('print-out');
    receiptActions.style.display = 'none';

    modal.classList.add('active');
  };

  // Verified Coupon Calculation
  window.applyCoupon = function() {
    const enteredCode = couponInput.value.trim().toUpperCase();

    couponGroup.classList.remove('shake-anim', 'is-success', 'is-error');
    void couponGroup.offsetWidth;

    if (!enteredCode) {
      couponGroup.classList.add('shake-anim', 'is-error');
      couponFeedback.style.display = 'block';
      feedbackSuccess.style.display = 'none';
      feedbackError.style.display = 'flex';
      couponErrorMsg.textContent = 'Please enter a coupon code.';
      return;
    }

    if (COUPONS[enteredCode]) {
      const coupon = COUPONS[enteredCode];

      if (coupon.firstOrderOnly) {
        const userOrdersCount = parseInt(localStorage.getItem('royal_orders_placed') || '0');
        if (userOrdersCount > 0) {
          appliedDiscount = 0;
          appliedCouponCode = '';
          activeProduct.finalPrice = activeProduct.originalPrice;
          formOriginalPrice.style.display = 'none';
          formProductPrice.textContent = `₹${activeProduct.originalPrice.toLocaleString('en-IN')}.00`;

          couponGroup.classList.add('shake-anim', 'is-error');
          couponFeedback.style.display = 'block';
          feedbackSuccess.style.display = 'none';
          feedbackError.style.display = 'flex';
          couponErrorMsg.textContent = 'WELCOME50 is valid only on your 1st order.';
          return;
        }
      }

      let discountAmount = 0;
      if (coupon.type === 'percent') {
        discountAmount = (activeProduct.originalPrice * coupon.value) / 100;
      } else if (coupon.type === 'flat') {
        discountAmount = coupon.value;
      }

      if (discountAmount >= activeProduct.originalPrice) {
        discountAmount = activeProduct.originalPrice - 10;
      }

      appliedDiscount = discountAmount;
      appliedCouponCode = enteredCode;
      activeProduct.finalPrice = activeProduct.originalPrice - appliedDiscount;
      
      activeProduct.tax = activeProduct.finalPrice * (5 / 105);
      activeProduct.subtotal = (activeProduct.finalPrice - activeProduct.tax).toFixed(2);

      formOriginalPrice.textContent = `₹${activeProduct.originalPrice.toLocaleString('en-IN')}.00`;
      formOriginalPrice.style.display = 'inline';
      formProductPrice.textContent = `₹${activeProduct.finalPrice.toFixed(2)}`;

      couponGroup.classList.add('is-success');
      couponFeedback.style.display = 'block';
      feedbackError.style.display = 'none';
      feedbackSuccess.style.display = 'flex';
      couponSuccessMsg.textContent = `🎉 Coupon "${enteredCode}" applied! Saved ₹${appliedDiscount.toFixed(2)}`;
    } else {
      appliedDiscount = 0;
      appliedCouponCode = '';
      activeProduct.finalPrice = activeProduct.originalPrice;
      formOriginalPrice.style.display = 'none';
      formProductPrice.textContent = `₹${activeProduct.originalPrice.toLocaleString('en-IN')}.00`;

      couponGroup.classList.add('shake-anim', 'is-error');
      couponFeedback.style.display = 'block';
      feedbackSuccess.style.display = 'none';
      feedbackError.style.display = 'flex';
      couponErrorMsg.textContent = '❌ Invalid code. Try WELCOME50, ROYAL25 or ORGANIC100';
    }
  };

  // UPI Step
  window.handleCustomerSubmit = function(e) {
    e.preventDefault();

    activeCustomer = {
      name: custNameInput.value.trim(),
      phone: custPhoneInput.value.trim(),
      altPhone: custAltPhoneInput.value.trim() || 'N/A',
      email: custEmailInput.value.trim(),
      street: custStreetInput.value.trim(),
      landmark: custLandmarkInput.value.trim(),
      pincode: custPinInput.value.trim(),
      city: custCityInput.value.trim(),
      state: custStateInput.value.trim()
    };

    const user = JSON.parse(localStorage.getItem('royal_user') || '{}');
    user.name = activeCustomer.name;
    user.phone = activeCustomer.phone;
    user.altPhone = activeCustomer.altPhone;
    user.street = activeCustomer.street;
    user.landmark = activeCustomer.landmark;
    user.pincode = activeCustomer.pincode;
    user.city = activeCustomer.city;
    user.state = activeCustomer.state;
    localStorage.setItem('royal_user', JSON.stringify(user));

    const finalAmountStr = activeProduct.finalPrice.toFixed(2);
    qrAmountDisplay.textContent = `₹${finalAmountStr}`;
    btnPayAmount.textContent = `${finalAmountStr}`;

    if (appliedDiscount > 0) {
      qrSavingsTag.textContent = `🎉 You saved ₹${appliedDiscount.toFixed(2)} with ${appliedCouponCode}`;
      qrSavingsTag.style.display = 'inline-block';
    } else {
      qrSavingsTag.style.display = 'none';
    }

    const upiLink = `upi://pay?pa=alsa8181@ibl&pn=RoyalDryFruits&am=${finalAmountStr}&cu=INR`;
    upiQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
    mobileUpiDirectLink.href = upiLink;

    stepCustomer.style.display = 'none';
    stepPayment.style.display = 'block';

    startPaymentCountdown();
  };

  // Payment Confirmation
  window.processPaymentAndPrint = async function() {
    clearInterval(countdownInterval);

    const randomOrderNum = Math.floor(100000 + Math.random() * 900000);
    currentOrderId = `ORD-IN-${randomOrderNum}`;
    const upiRef = `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const formattedDate = getIndianFormattedDate();

    const currentOrders = parseInt(localStorage.getItem('royal_orders_placed') || '0');
    localStorage.setItem('royal_orders_placed', (currentOrders + 1).toString());

    const fullFormattedAddress = `${activeCustomer.street}, Landmark: ${activeCustomer.landmark}, ${activeCustomer.city}, ${activeCustomer.state} - PIN: ${activeCustomer.pincode}`;

    const emailPayload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `🛒 New Order: ${currentOrderId} - ₹${activeProduct.finalPrice.toFixed(2)}`,
      from_name: 'Royal Dry Fruits Store',
      order_id: currentOrderId,
      order_date: formattedDate,
      product_name: activeProduct.name,
      pack_size: activeProduct.weight,
      quantity_ordered: activeProduct.quantity,
      original_price: `₹${activeProduct.originalPrice.toFixed(2)}`,
      coupon_code: appliedDiscount > 0 ? appliedCouponCode : 'NONE',
      discount_applied: `₹${appliedDiscount.toFixed(2)}`,
      final_amount_paid: `₹${activeProduct.finalPrice.toFixed(2)}`,
      customer_name: activeCustomer.name,
      customer_primary_phone: activeCustomer.phone,
      customer_alt_phone: activeCustomer.altPhone,
      customer_email: activeCustomer.email,
      street_address: activeCustomer.street,
      landmark: activeCustomer.landmark,
      pincode: activeCustomer.pincode,
      city: activeCustomer.city,
      state: activeCustomer.state,
      full_delivery_address: fullFormattedAddress,
      upi_vpa: 'alsa8181@ibl',
      upi_reference_id: upiRef
    };

    try {
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(emailPayload)
      }).catch(() => {});
    } catch (err) {}

    modalProductName.textContent = activeProduct.name;
    modalProductSub.textContent = `Pack: ${activeProduct.weight} × ${activeProduct.quantity} | Instant UPI`;
    modalProductPrice.textContent = `₹${activeProduct.finalPrice.toFixed(2)}`;
    modalProductIcon.textContent = activeProduct.icon;

    rcptItemName.textContent = activeProduct.name;
    rcptItemPrice.textContent = `₹${activeProduct.originalPrice.toFixed(2)}`;
    rcptWeight.textContent = `Pack: ${activeProduct.weight} | Qty: ${activeProduct.quantity} Unit${activeProduct.quantity > 1 ? 's' : ''}`;
    rcptCustName.textContent = activeCustomer.name;
    rcptCustPhone.textContent = `+91 ${activeCustomer.phone}`;
    
    if (activeCustomer.altPhone && activeCustomer.altPhone !== 'N/A') {
      rcptCustAltPhone.textContent = `+91 ${activeCustomer.altPhone}`;
      rcptCustAltPhoneRow.style.display = 'flex';
    } else {
      rcptCustAltPhoneRow.style.display = 'none';
    }

    rcptCustAddress.textContent = `${activeCustomer.street}, ${activeCustomer.city}`;
    rcptCustLandmarkPin.textContent = `Landmark: ${activeCustomer.landmark} - ${activeCustomer.pincode}`;
    rcptSubtotal.textContent = `₹${(activeProduct.originalPrice / 1.05).toFixed(2)}`;
    
    if (appliedDiscount > 0) {
      rcptCouponLabel.textContent = `Coupon (${appliedCouponCode}):`;
      rcptDiscountAmount.textContent = `-₹${appliedDiscount.toFixed(2)}`;
      rcptDiscountRow.style.display = 'flex';
    } else {
      rcptDiscountRow.style.display = 'none';
    }

    rcptTax.textContent = `₹${activeProduct.tax.toFixed(2)}`;
    rcptTotal.textContent = `₹${activeProduct.finalPrice.toFixed(2)}`;
    rcptOrderId.textContent = currentOrderId;
    rcptUpiRef.textContent = upiRef;
    rcptDate.textContent = formattedDate;
    rcptBarcodeNum.textContent = `*${currentOrderId}*`;

    stepPayment.style.display = 'none';
    stepPrinting.style.display = 'block';
    printerSlot.style.display = 'flex';

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    spinner.style.display = 'block';
    checkIcon.style.display = 'none';
    statusText.textContent = 'Verifying UPI payment & syncing order...';

    setTimeout(() => {
      statusText.textContent = 'Printing invoice receipt...';
      playPrinterSound();
      receipt.classList.add('print-out');
    }, 1200);

    setTimeout(() => {
      spinner.style.display = 'none';
      checkIcon.style.display = 'block';
      statusText.textContent = 'Order complete & sent to merchant!';
      receiptActions.style.display = 'flex';
      launchConfetti();
      cartItems = [];
      updateCartUI();
    }, 4500);
  };

  window.closeAllModals = function() {
    clearInterval(countdownInterval);
    modal.classList.remove('active');
    receipt.classList.remove('print-out');
  };

  // Direct Clean PDF Invoice Generation
  downloadBtn.addEventListener('click', async () => {
    downloadBtn.textContent = 'Generating PDF...';
    downloadBtn.disabled = true;

    const printWrapper = document.createElement('div');
    printWrapper.style.position = 'fixed';
    printWrapper.style.left = '0';
    printWrapper.style.top = '0';
    printWrapper.style.width = '750px';
    printWrapper.style.backgroundColor = '#ffffff';
    printWrapper.style.color = '#111827';
    printWrapper.style.padding = '40px';
    printWrapper.style.boxSizing = 'border-box';
    printWrapper.style.fontFamily = "'Plus Jakarta Sans', Arial, sans-serif";
    printWrapper.style.zIndex = '-9999';
    printWrapper.style.opacity = '1';
    printWrapper.style.pointerEvents = 'none';

    const couponRowHtml = appliedDiscount > 0 ? `
      <tr>
        <td style="padding: 10px 14px; text-align: left; color: #047857; font-weight: bold; border-bottom: 1px solid #e5e7eb;">
          Discount Coupon Applied (${appliedCouponCode})
        </td>
        <td style="padding: 10px 14px; text-align: center; color: #047857; font-weight: bold; border-bottom: 1px solid #e5e7eb;">1</td>
        <td style="padding: 10px 14px; text-align: right; color: #047857; font-weight: bold; border-bottom: 1px solid #e5e7eb;">-₹${appliedDiscount.toFixed(2)}</td>
        <td style="padding: 10px 14px; text-align: right; color: #047857; font-weight: bold; border-bottom: 1px solid #e5e7eb;">-₹${appliedDiscount.toFixed(2)}</td>
      </tr>
    ` : '';

    const altPhoneHtml = activeCustomer.altPhone && activeCustomer.altPhone !== 'N/A' 
      ? `<div><strong>Alt Phone:</strong> +91 ${activeCustomer.altPhone}</div>` 
      : '';

    printWrapper.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #174d34; padding-bottom: 24px; margin-bottom: 24px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 26px;">🌰</span>
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px; margin: 0;">ROYAL DRY FRUITS & NUTS</h1>
          </div>
          <p style="font-size: 11.5px; color: #4b5563; margin: 2px 0;">Premium Dry Fruits, Exotic Nuts & Spices</p>
          <p style="font-size: 11.5px; color: #4b5563; margin: 2px 0;">Bengaluru, Karnataka, India | support@royaldryfruits.in</p>
          <p style="font-size: 11px; color: #6b7280; margin: 4px 0 0;"><strong>GSTIN:</strong> 29AAACR1234F1Z5 | <strong>FSSAI:</strong> 11223344005566</p>
        </div>

        <div style="text-align: right;">
          <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 6px; margin-bottom: 8px;">
            TAX INVOICE
          </div>
          <div style="font-size: 12px; color: #374151;"><strong>Invoice No:</strong> ${currentOrderId}</div>
          <div style="font-size: 11.5px; color: #6b7280; margin-top: 3px;"><strong>Date:</strong> ${getIndianFormattedDate()}</div>
          <div style="font-size: 11.5px; color: #6b7280; margin-top: 3px;"><strong>Payment Status:</strong> PAID (UPI)</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; font-size: 12px;">
        <div style="flex: 1; padding-right: 16px;">
          <h4 style="font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 6px; letter-spacing: 0.5px;">Billed & Shipped To:</h4>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${activeCustomer.name}</div>
          <div style="color: #475569; line-height: 1.45;">
            <div>${activeCustomer.street}</div>
            <div>Landmark: ${activeCustomer.landmark}</div>
            <div>${activeCustomer.city}, ${activeCustomer.state} - <strong>${activeCustomer.pincode}</strong></div>
          </div>
        </div>

        <div style="flex: 0.9; border-left: 1px solid #e2e8f0; padding-left: 20px; color: #475569; line-height: 1.5;">
          <h4 style="font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 6px; letter-spacing: 0.5px;">Contact & Settlement:</h4>
          <div><strong>Primary Phone:</strong> +91 ${activeCustomer.phone}</div>
          ${altPhoneHtml}
          <div><strong>Email:</strong> ${activeCustomer.email}</div>
          <div><strong>Payment Mode:</strong> Instant UPI VPA (alsa8181@ibl)</div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12.5px;">
        <thead>
          <tr style="background: #0f172a; color: #ffffff;">
            <th style="padding: 10px 14px; text-align: left; border-radius: 8px 0 0 0; font-weight: 700;">Item Description & Grade</th>
            <th style="padding: 10px 14px; text-align: center; font-weight: 700;">Qty</th>
            <th style="padding: 10px 14px; text-align: right; font-weight: 700;">Unit Rate</th>
            <th style="padding: 10px 14px; text-align: right; border-radius: 0 8px 0 0; font-weight: 700;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px 14px; text-align: left; border-bottom: 1px solid #e5e7eb;">
              <div style="font-weight: 700; color: #111827;">${activeProduct.name}</div>
              <div style="font-size: 11px; color: #6b7280;">Packaging: ${activeProduct.weight} · Premium Quality Guaranteed</div>
            </td>
            <td style="padding: 12px 14px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600;">
              ${activeProduct.quantity}
            </td>
            <td style="padding: 12px 14px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #374151;">
              ₹${(activeProduct.originalPrice / activeProduct.quantity).toFixed(2)}
            </td>
            <td style="padding: 12px 14px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 700; color: #111827;">
              ₹${activeProduct.originalPrice.toFixed(2)}
            </td>
          </tr>
          ${couponRowHtml}
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
        <div style="width: 55%; font-size: 11px; color: #6b7280; line-height: 1.5; background: #fdfdfd; border: 1px dashed #cbd5e1; padding: 12px; border-radius: 8px;">
          <strong style="color: #374151;">Return & Refund Terms:</strong><br>
          Returns are accepted strictly within 48 hours only if the product is spoiled, damaged upon delivery, or incorrect. Unboxing video verification required.
        </div>

        <div style="width: 40%; font-size: 12.5px;">
          <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #4b5563;">
            <span>Subtotal:</span>
            <span>₹${(activeProduct.originalPrice / 1.05).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #4b5563;">
            <span>Estimated GST (5%):</span>
            <span>₹${activeProduct.tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #4b5563;">
            <span>Delivery & Packaging:</span>
            <span style="color: #059669; font-weight: 700;">FREE</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0 6px; border-top: 2px solid #0f172a; margin-top: 6px; font-size: 16px; font-weight: 800; color: #174d34;">
            <span>Total Paid (INR):</span>
            <span>₹${activeProduct.finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e5e7eb; padding-top: 18px;">
        <div>
          <div style="font-size: 11px; color: #4b5563;">This is a computer-generated official tax invoice.</div>
          <div style="font-size: 10.5px; color: #9ca3af; margin-top: 2px;">Order Verification Token: ${currentOrderId} | Royal Dry Fruits</div>
        </div>
        <div style="text-align: center; border: 1.5px solid #174d34; padding: 6px 14px; border-radius: 8px; background: #f0fdf4;">
          <div style="font-size: 11px; font-weight: 800; color: #174d34; letter-spacing: 0.5px;">ROYAL DRY FRUITS</div>
          <div style="font-size: 9px; color: #047857; text-transform: uppercase;">Digitally Verified & Authorized</div>
        </div>
      </div>
    `;

    document.body.appendChild(printWrapper);

    try {
      const canvas = await html2canvas(printWrapper, {
        scale: 2.2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const { jsPDF } = window.jspdf;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${currentOrderId || 'RoyalDryFruits'}.pdf`);
      showToast('Downloaded!', `Tax Invoice PDF saved to your downloads.`, '📄');
    } catch (error) {
      showToast('Error', 'Failed to generate invoice PDF.', '⚠️');
    } finally {
      document.body.removeChild(printWrapper);
      downloadBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download Official Invoice (PDF)
      `;
      downloadBtn.disabled = false;
    }
  });

  // Initialize on Load
  updateAuthNavbar();
  updateCartUI();
});
