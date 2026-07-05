const User = require('../models/User');
const CommunityProduct = require('../models/CommunityProduct');
const CommunityOrder = require('../models/CommunityOrder');
const CommunityCoupon = require('../models/CommunityCoupon');

// GET /api/community/store/products
const getMarketplaceProducts = async (req, res, next) => {
  try {
    let products = await CommunityProduct.find({ isActive: true });
    if (products.length === 0) {
      // Seed initial catalog
      products = await CommunityProduct.create([
        {
          name: 'Premium Member Status',
          description: 'Unlock premium badge, priority search, and extra cloud storage space.',
          priceCoins: 500,
          priceReal: 299,
          category: 'membership',
          itemKey: 'premium_status',
          imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100'
        },
        {
          name: 'Verified Developer Badge',
          description: 'Gain a purple verified checkmark badge next to your user name.',
          priceCoins: 300,
          priceReal: 199,
          category: 'badge',
          itemKey: 'verified_badge',
          imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=100'
        },
        {
          name: 'Gold Profile Border',
          description: 'Surround your profile avatar with an elegant glowing gold outline.',
          priceCoins: 150,
          priceReal: 99,
          category: 'avatar_frame',
          itemKey: 'gold_border',
          imageUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=100'
        },
        {
          name: 'Neon Cyberpunk Theme',
          description: 'A special color palette cosmetic setting for user profiles.',
          priceCoins: 200,
          priceReal: 149,
          category: 'theme',
          itemKey: 'neon_theme',
          imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100'
        },
        {
          name: 'AI Consulting Pack (100 credits)',
          description: 'Adds 100 AI credits for code analysis and resume reviews.',
          priceCoins: 100,
          priceReal: 49,
          category: 'ai_credits',
          itemKey: 'ai_credits_100',
          imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=100'
        }
      ]);
    }
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/store/products
const createMarketplaceProduct = async (req, res, next) => {
  try {
    const { name, description, priceCoins, priceReal, category, itemKey, imageUrl } = req.body;
    const prod = await CommunityProduct.create({
      name,
      description,
      priceCoins,
      priceReal,
      category,
      itemKey,
      imageUrl,
      isActive: true
    });
    res.status(201).json({ success: true, data: prod });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/store/coupons
const createMarketplaceCoupon = async (req, res, next) => {
  try {
    const { code, discountPercentage, maxUses } = req.body;
    const coupon = await CommunityCoupon.create({
      code: code.toUpperCase(),
      discountPercentage,
      maxUses,
      isActive: true
    });
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/store/checkout/:productId
const checkoutMarketplaceProduct = async (req, res, next) => {
  try {
    const { method, coupon = '' } = req.body; // 'coins' or 'payment'
    const product = await CommunityProduct.findById(req.params.productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Listing not found or archived.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    let finalPrice = method === 'coins' ? product.priceCoins : product.priceReal;

    // Apply dynamic coupon discount if present from DB
    if (coupon) {
      const activeCoupon = await CommunityCoupon.findOne({
        code: coupon.toUpperCase(),
        isActive: true
      });
      if (activeCoupon) {
        if (activeCoupon.usesCount < activeCoupon.maxUses) {
          const discount = activeCoupon.discountPercentage / 100;
          finalPrice = Math.floor(finalPrice * (1 - discount));
          activeCoupon.usesCount += 1;
          await activeCoupon.save();
        } else {
          return res.status(400).json({ success: false, message: 'Coupon usage limit reached.' });
        }
      } else if (coupon.toLowerCase() === 'welcome50') {
        // Fallback for seeded default
        finalPrice = Math.floor(finalPrice * 0.5);
      } else {
        return res.status(400).json({ success: false, message: 'Invalid or inactive promo coupon.' });
      }
    }

    if (method === 'coins') {
      if ((user.coins || 0) < finalPrice) {
        return res.status(400).json({ success: false, message: 'Insufficient community coins balance.' });
      }
      // Deduct coins
      user.coins -= finalPrice;
    }

    // Activate item benefits on user document
    if (product.itemKey === 'premium_status') {
      user.isPremium = true;
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1); // 1 Month membership
      user.premiumExpiresAt = expiry;
      if (!user.badges.some(b => b.name === 'Premium Member')) {
        user.badges.push({ name: 'Premium Member', icon: 'FaAward' });
      }
    } else if (product.itemKey === 'verified_badge') {
      user.isVerified = true;
      if (!user.badges.some(b => b.name === 'Verified Developer')) {
        user.badges.push({ name: 'Verified Developer', icon: 'FaCheckCircle' });
      }
    } else if (product.itemKey === 'gold_border') {
      user.avatarBorder = 'gold';
    } else if (product.itemKey === 'neon_theme') {
      user.profileTheme = 'neon';
    } else if (product.itemKey === 'ai_credits_100') {
      user.aiCredits = (user.aiCredits || 0) + 100;
    }

    await user.save({ validateBeforeSave: false });

    // Save Order log
    const order = await CommunityOrder.create({
      user: req.user.id,
      product: product._id,
      purchaseType: method,
      pricePaid: finalPrice,
      paymentId: method === 'payment' ? 'ch_' + Math.random().toString(36).substring(7) : 'coins_wallet',
      paymentStatus: 'completed',
      status: 'delivered'
    });

    res.json({
      success: true,
      data: order,
      message: `${product.name} purchased and activated successfully!`
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/community/store/history
const getPurchaseHistory = async (req, res, next) => {
  try {
    const orders = await CommunityOrder.find({ user: req.user.id })
      .populate('product')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// POST /api/community/store/refund/:orderId
const requestOrderRefund = async (req, res, next) => {
  try {
    const order = await CommunityOrder.findOne({ _id: req.params.orderId, user: req.user.id })
      .populate('product');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order receipt not found.' });
    }

    if (order.paymentStatus === 'refunded') {
      return res.status(400).json({ success: false, message: 'This purchase has already been refunded.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Restore coins if paid in coins
    if (order.purchaseType === 'coins') {
      user.coins = (user.coins || 0) + order.pricePaid;
    }

    // Revert inventory cosmetics based on itemKey
    const itemKey = order.product?.itemKey;
    if (itemKey === 'premium_status') {
      user.isPremium = false;
      user.badges = user.badges.filter(b => b.name !== 'Premium Member');
    } else if (itemKey === 'verified_badge') {
      user.isVerified = false;
      user.badges = user.badges.filter(b => b.name !== 'Verified Developer');
    } else if (itemKey === 'gold_border') {
      user.avatarBorder = '';
    } else if (itemKey === 'neon_theme') {
      user.profileTheme = '';
    } else if (itemKey === 'ai_credits_100') {
      user.aiCredits = Math.max(0, (user.aiCredits || 0) - 100);
    }

    await user.save({ validateBeforeSave: false });

    // Update order status
    order.paymentStatus = 'refunded';
    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Purchase refunded successfully. Coins restored and items deactivated.',
      data: order
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMarketplaceProducts,
  createMarketplaceProduct,
  createMarketplaceCoupon,
  checkoutMarketplaceProduct,
  getPurchaseHistory,
  requestOrderRefund
};
