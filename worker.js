export default {
  async fetch(request, env) {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      const url = new URL(request.url);

      // 1. GET REVIEWS FOR A PRODUCT
      if (request.method === 'GET' && url.pathname === '/reviews') {
        const productId = url.searchParams.get('product_id') || '1';
        let reviews = [];
        if (env.USERS_KV) {
          const stored = await env.USERS_KV.get(`reviews:prod_${productId}`);
          if (stored) reviews = JSON.parse(stored);
        }
        return new Response(JSON.stringify({ success: true, reviews }), { status: 200, headers });
      }

      // 2. POST / SUBMIT A REVIEW (1 per user per product, max 10 kept)
      if (request.method === 'POST' && url.pathname === '/reviews') {
        const data = await request.json();
        const { product_id, author_name, author_email, rating, comment } = data;

        if (!product_id || !author_email || !comment) {
          return new Response(JSON.stringify({ error: 'Missing review details' }), { status: 400, headers });
        }

        if (env.USERS_KV) {
          // Check if this user already reviewed this product
          const userReviewedKey = `has_reviewed:${author_email}:prod_${product_id}`;
          const alreadyReviewed = await env.USERS_KV.get(userReviewedKey);
          if (alreadyReviewed) {
            return new Response(JSON.stringify({ error: 'You have already submitted a review for this product.' }), { status: 400, headers });
          }

          // Fetch existing reviews list
          const existingKey = `reviews:prod_${product_id}`;
          let reviewsList = [];
          const stored = await env.USERS_KV.get(existingKey);
          if (stored) reviewsList = JSON.parse(stored);

          // Add new review at top & keep max 10
          const newReview = {
            id: Date.now(),
            author: author_name || 'Verified Customer',
            rating: parseInt(rating) || 5,
            comment: comment.substring(0, 300),
            date: 'Just now'
          };
          reviewsList.unshift(newReview);
          if (reviewsList.length > 10) reviewsList = reviewsList.slice(0, 10);

          // Save back to KV & flag user
          await env.USERS_KV.put(existingKey, JSON.stringify(reviewsList));
          await env.USERS_KV.put(userReviewedKey, 'true');

          return new Response(JSON.stringify({ success: true, message: 'Review published!', review: newReview }), { status: 200, headers });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
      }

      // 3. AUTH ENDPOINT
      if (request.method === 'POST' && url.pathname === '/auth') {
        const data = await request.json();
        const { action, email } = data;

        if (env.USERS_KV && (action === 'signup' || action === 'google_auth')) {
          const userData = {
            name: data.name || '',
            email: data.email,
            phone: data.phone || '',
            registered_at: new Date().toISOString(),
            provider: action === 'google_auth' ? 'google' : 'email'
          };
          await env.USERS_KV.put(`user:${email}`, JSON.stringify(userData));
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }
};