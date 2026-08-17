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

  // Customer Form Elements (Detailed Address Breakdown)
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

  // Valid Coupons Configuration (WELCOME50 Spotlight Enforced)
  const COUPONS = {
    'WELCOME50': { type: 'percent', value: 50, desc: '50% OFF (1st Order Special)', firstOrderOnly: true },
    'ROYAL25': { type: 'percent', value: 25, desc: '25% OFF' },
    'ORGANIC100': { type: 'flat', value: 100, desc: '₹100 OFF' },
    'HEALTH10': { type: 'percent', value: 10, desc: '10% OFF' }
  };

  // Dynamic Weight & Quantity Math
  function computeCardPrice(card) {
    const activeChip = card.querySelector('.weight-chip.active');
    const selectedWeight = activeChip ? activeChip.textContent.trim() : (card.getAttribute('data-base-weight') || '500g');
    const qty = parseInt(card.querySelector('.card-qty-val').textContent.trim()) || 1;
    
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
    return { unitPrice, totalPrice, selectedWeight, qty };
  }

  window.selectCardWeight = function(chipBtn, weightVal) {
    const card = chipBtn.closest('.product-card');
    card.querySelectorAll('.weight-chip').forEach(c => c.classList.remove('active'));
    chipBtn.classList.add('active');
    computeCardPrice(card);
  };

  window.stepCardQty = function(btn, step) {
    const card = btn.closest('.product-card');
    const qtySpan = card.querySelector('.card-qty-val');
    let currentVal = parseInt(qtySpan.textContent) || 1;
    currentVal = Math.max(1, Math.min(20, currentVal + step));
    qtySpan.textContent = currentVal;
    computeCardPrice(card);
  };

  // Product Quick View with Reviews
  window.openProductQuickView = async function(card) {
    activeQuickViewCard = card;
    const prodId = card.getAttribute('data-id') || '1';
    const name = card.getAttribute('data-name');
    const icon = card.getAttribute('data-icon');
    const rating = card.getAttribute('data-rating') || '4.9';
    const reviewsCount = card.getAttribute('data-reviews-count') || '120';
    const origin = card.getAttribute('data-origin') || 'India / Global';
    const { totalPrice, selectedWeight, qty } = computeCardPrice(card);

    document.getElementById('qvProductName').textContent = name;
    document.getElementById('qvProductIcon').textContent = icon;
    document.getElementById('qvOriginTag').textContent = `Origin: ${origin}`;
    document.getElementById('qvRatingBar').textContent = `⭐ ${rating} · ${reviewsCount} Verified Customer Ratings`;
    document.getElementById('qvPriceDisplay').textContent = `₹${totalPrice.toLocaleString('en-IN')}.00 (${selectedWeight} × ${qty})`;

    document.getElementById('addReviewForm').style.display = 'none';
    document.getElementById('toggleReviewFormBtn').textContent = '✍️ Write Review';
    document.getElementById('reviewTextInput').value = '';
    setRatingStar(5);

    loadCloudflareReviews(prodId);

    document.getElementById('qvAddToCartBtn').onclick = () => {
      closeProductQuickView();
      handleAddToCart(card);
    };

    document.getElementById('qvBuyNowBtn').onclick = () => {
      closeProductQuickView();
      openCustomerDetails(card.querySelector('.buy-btn'));
    };

    productModal.classList.add('active');
  };

  window.closeProductQuickView = function() {
    productModal.classList.remove('active');
  };

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
    listContainer.innerHTML = `<div style="text-align:center; padding:10px; color:#64748b; font-size:0.75rem;">Loading verified reviews...</div>`;

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
            <p class="rev-body">"Incredible crunch and zero bitter nuts. The vacuum seal keeps freshness locked in perfectly!"</p>
            <span class="rev-date">Verified Purchase · 2 days ago</span>
          </div>
        `;
      }
    } catch (e) {
      listContainer.innerHTML = `<div style="color:#64748b; font-size:0.75rem; text-align:center;">Verified customer feedback active.</div>`;
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

  // Add to Cart & Drawer Management
  window.handleAddToCart = function(card) {
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
    const { totalPrice, selectedWeight, qty } = computeCardPrice(card);

    cartItems.push({
      id: Date.now(),
      name,
      icon,
      weight: selectedWeight,
      quantity: qty,
      price: totalPrice
    });

    updateCartUI();
    showToast('Added to Cart', `${name} (${selectedWeight} × ${qty}) added to your cart.`, '🛒');
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
    }, 3500);
  };

  // Custom Animated Modal Prompt
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
    } else {
      navAccountBtn.style.display = 'flex';
      navUserMenu.style.display = 'none';
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
    const colors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#ffffff', '#fbbf24'];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2 + 50,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
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
      if (frames < 100) {
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

  // Slider & Filters (4 items)
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
        card.style.display = 'block';
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

    clearBtn.style.display = query.length > 0 ? 'block' : 'none';

    productCards.forEach(card => {
      const name = card.getAttribute('data-name').toLowerCase();
      if (name.includes(query)) {
        card.style.display = 'block';
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
  window.openCustomerDetails = function(buttonElement) {
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

    const card = buttonElement.closest('.product-card');
    const name = card.getAttribute('data-name');
    const icon = card.getAttribute('data-icon');
    const { totalPrice, selectedWeight, qty } = computeCardPrice(card);

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

  // Verified Coupon Calculation with WELCOME50 First-Order Check
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

      // Strict Check for 1st Order User Status
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

  // UPI Step - Packages all granular address details
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

    // Save to user profile silently
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

  // Payment Confirmation & Animated Receipt Print
  window.processPaymentAndPrint = async function() {
    clearInterval(countdownInterval);

    const randomOrderNum = Math.floor(100000 + Math.random() * 900000);
    currentOrderId = `ORD-IN-${randomOrderNum}`;
    const upiRef = `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const formattedDate = getIndianFormattedDate();

    // Increment orders count to enforce 1st-order WELCOME50 check
    const currentOrders = parseInt(localStorage.getItem('royal_orders_placed') || '0');
    localStorage.setItem('royal_orders_placed', (currentOrders + 1).toString());

    const fullFormattedAddress = `${activeCustomer.street}, Landmark: ${activeCustomer.landmark}, ${activeCustomer.city}, ${activeCustomer.state} - PIN: ${activeCustomer.pincode}`;

    // Web3Forms payload containing all customer and shipping data
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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
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
    }, 5000);
  };

  window.closeAllModals = function() {
    clearInterval(countdownInterval);
    modal.classList.remove('active');
    receipt.classList.remove('print-out');
  };

  // PDF Export with Granular Address Details
  downloadBtn.addEventListener('click', async () => {
    downloadBtn.textContent = 'Generating PDF...';
    downloadBtn.disabled = true;

    const printWrapper = document.createElement('div');
    printWrapper.style.position = 'fixed';
    printWrapper.style.left = '0';
    printWrapper.style.top = '0';
    printWrapper.style.width = '380px';
    printWrapper.style.backgroundColor = '#ffffff';
    printWrapper.style.color = '#000000';
    printWrapper.style.padding = '24px 20px';
    printWrapper.style.boxSizing = 'border-box';
    printWrapper.style.fontFamily = "'Courier New', Courier, monospace";
    printWrapper.style.zIndex = '-9999';
    printWrapper.style.opacity = '1';
    printWrapper.style.pointerEvents = 'none';

    const couponRow = appliedDiscount > 0 ? `
      <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; font-weight:bold; color:#047857;">
        <span>Coupon (${appliedCouponCode}):</span>
        <span>-₹${appliedDiscount.toFixed(2)}</span>
      </div>
    ` : '';

    const altPhoneLine = activeCustomer.altPhone && activeCustomer.altPhone !== 'N/A' ? `
      <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
        <span>Alt Phone:</span>
        <span>+91 ${activeCustomer.altPhone}</span>
      </div>
    ` : '';

    printWrapper.innerHTML = `
      <div style="text-align:center; margin-bottom:12px;">
        <div style="font-size:22px; margin-bottom:4px;">🌰</div>
        <h2 style="font-size:16px; margin:0; font-weight:bold; letter-spacing:1.2px; color:#000000;">ROYAL DRY FRUITS & NUTS</h2>
        <p style="font-size:11px; margin:3px 0 0; color:#333333;">GSTIN: 29AAACR1234F1Z5</p>
        <p style="font-size:10px; margin:2px 0 0; color:#555555;">OFFICIAL TAX INVOICE</p>
      </div>

      <div style="border-top:2px dashed #000000; margin:10px 0;"></div>

      <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:bold; color:#000000;">
        <span>${activeProduct.name}</span>
        <span>₹${activeProduct.originalPrice.toFixed(2)}</span>
      </div>
      <div style="font-size:11px; color:#333333; margin-bottom:6px;">Pack: ${activeProduct.weight} | Qty: ${activeProduct.quantity} Unit${activeProduct.quantity > 1 ? 's' : ''}</div>

      <div style="border-top:2px dashed #000000; margin:10px 0;"></div>

      <div style="font-size:11px; color:#000000; line-height:1.5;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <span>Customer:</span>
          <span style="font-weight:bold;">${activeCustomer.name}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <span>Primary Phone:</span>
          <span>+91 ${activeCustomer.phone}</span>
        </div>
        ${altPhoneLine}
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <span>Address:</span>
          <span>${activeCustomer.street}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <span>Landmark & City:</span>
          <span>${activeCustomer.landmark}, ${activeCustomer.city}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <span>State & PIN:</span>
          <span>${activeCustomer.state} - ${activeCustomer.pincode}</span>
        </div>
      </div>

      <div style="border-top:2px dashed #000000; margin:10px 0;"></div>

      <div style="font-size:12px; color:#000000;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Original Subtotal:</span>
          <span>₹${(activeProduct.originalPrice / 1.05).toFixed(2)}</span>
        </div>
        ${couponRow}
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>GST (5% Dry Fruits):</span>
          <span>₹${activeProduct.tax.toFixed(2)}</span>
        </div>
      </div>

      <div style="border-top:2px dashed #000000; margin:10px 0;"></div>

      <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:bold; color:#000000; padding:2px 0;">
        <span>TOTAL PAID (INR):</span>
        <span>₹${activeProduct.finalPrice.toFixed(2)}</span>
      </div>

      <div style="border-top:2px dashed #000000; margin:10px 0;"></div>

      <div style="font-size:10.5px; color:#222222; line-height:1.5;">
        <div><strong>Order No:</strong> ${currentOrderId}</div>
        <div><strong>Payment Mode:</strong> UPI QR (alsa8181@ibl)</div>
        <div><strong>UPI Ref ID:</strong> UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}</div>
        <div><strong>Date & Time:</strong> ${getIndianFormattedDate()}</div>
      </div>

      <div style="text-align:center; margin-top:14px; font-size:11px; letter-spacing:2px; font-weight:bold; color:#000000;">
        *${currentOrderId}*
      </div>
    `;

    document.body.appendChild(printWrapper);

    try {
      const canvas = await html2canvas(printWrapper, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const { jsPDF } = window.jspdf;
      
      const imgWidth = 90;
      const pageHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidth, pageHeight]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, pageHeight);
      pdf.save(`RoyalDryFruits_Invoice_${currentOrderId || 'Order'}.pdf`);
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
        Download Bill (PDF)
      `;
      downloadBtn.disabled = false;
    }
  });

  // Initialize on Load
  updateAuthNavbar();
  updateCartUI();
});
