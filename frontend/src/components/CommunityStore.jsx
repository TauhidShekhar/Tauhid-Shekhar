import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaCoins, FaCrown, FaShoppingBag, FaHistory, FaCheckCircle, FaCreditCard, FaTags } from 'react-icons/fa';

const CommunityStore = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [purchaseHistoryTab, setPurchaseHistoryTab] = useState(false);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(false);
  const [checkingOutProduct, setCheckingOutProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('coins'); // coins, payment
  
  const [processing, setProcessing] = useState(false);
  const [msg, setMsg] = useState('');

  const loadStore = async () => {
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.getStoreProducts(),
        api.getStoreHistory()
      ]);
      if (prodRes.success) setProducts(prodRes.data || []);
      if (orderRes.success) setOrders(orderRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, []);

  const handleCheckout = async () => {
    if (!checkingOutProduct) return;
    setProcessing(true);
    setMsg('');
    try {
      const res = await api.checkoutStoreProduct(checkingOutProduct._id, {
        method: paymentMethod,
        coupon: appliedDiscount ? 'welcome50' : ''
      });
      if (res.success) {
        setMsg(`Success! ${checkingOutProduct.name} activated successfully.`);
        setCheckingOutProduct(null);
        loadStore();
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Checkout failed.');
    } finally {
      setProcessing(false);
    }
  };

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'welcome50') {
      setAppliedDiscount(true);
    } else {
      alert('Invalid coupon code.');
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center bg-[#121217] border border-white/5 rounded-3xl min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-3 border-purple-500/20 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(p => p.category === activeTab);

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-wider">Developer Marketplace</h1>
          <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">Spend coins or purchase premium developer cosmetics & courses</p>
        </div>

        {/* Purchase History toggle */}
        <button
          onClick={() => setPurchaseHistoryTab(!purchaseHistoryTab)}
          className="px-4 py-2 bg-[#121217] border border-white/5 hover:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-350 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
        >
          {purchaseHistoryTab ? <FaShoppingBag /> : <FaHistory />} {purchaseHistoryTab ? 'Browse Store' : 'Purchase History'}
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold flex items-center gap-2">
          <FaCheckCircle /> {msg}
        </div>
      )}

      {purchaseHistoryTab ? (
        /* Purchase History List */
        <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
          <h2 className="text-xs font-black text-white uppercase border-b border-white/5 pb-2">Order Receipts History</h2>
          
          <div className="flex flex-col gap-3">
            {orders.map(order => (
              <div key={order._id} className="p-4 rounded-2xl bg-[#181822] border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img src={order.product?.imageUrl} alt="" className="w-8.5 h-8.5 rounded-lg object-cover bg-white/5" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white">{order.product?.name}</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">Order ID: {order.paymentId || 'coins'} &bull; Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end text-left sm:text-right gap-1 shrink-0">
                  <span className="font-black text-purple-400 flex items-center gap-1">
                    {order.purchaseType === 'coins' ? <FaCoins /> : '$'}{order.pricePaid} {order.purchaseType === 'coins' ? 'Coins' : ''}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      order.paymentStatus === 'refunded' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/15' 
                        : 'bg-green-500/10 text-green-400 border border-green-500/15'
                    }`}>
                      {order.paymentStatus}
                    </span>
                    {order.paymentStatus !== 'refunded' && (
                      <button
                        onClick={async () => {
                          if (!window.confirm('Are you sure you want to refund this purchase?')) return;
                          try {
                            const res = await api.refundStoreProduct(order._id);
                            if (res.success) {
                              alert(res.message);
                              loadStore();
                            }
                          } catch (err) {
                            alert(err.message || 'Refund request failed.');
                          }
                        }}
                        className="px-2 py-0.5 border border-white/5 hover:border-red-500/20 text-slate-400 hover:text-red-450 rounded text-[8px] font-black uppercase cursor-pointer transition-colors"
                      >
                        Refund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <p className="text-xs text-slate-500 italic text-center p-6">No purchases logged yet.</p>
            )}
          </div>
        </div>
      ) : (
        /* Store catalog */
        <>
          {/* Categories select tab */}
          <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
            {['all', 'membership', 'badge', 'avatar_frame', 'theme', 'ai_credits', 'template'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === cat 
                    ? 'bg-purple-650 text-white shadow-md shadow-purple-600/10' 
                    : 'bg-[#121217] border border-white/5 text-slate-450 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Items' :
                 cat === 'membership' ? 'Memberships' :
                 cat === 'badge' ? 'Badges' :
                 cat === 'avatar_frame' ? 'Avatar Frames' :
                 cat === 'theme' ? 'Profile Themes' :
                 cat === 'ai_credits' ? 'AI Credits' :
                 'Templates'}
              </button>
            ))}
          </div>

          {/* Catalog grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(prod => (
              <div key={prod._id} className="bg-[#121217] border border-white/5 rounded-3xl overflow-hidden p-5 flex flex-col justify-between min-h-[280px] shadow-sm hover:border-white/10 transition-colors">
                
                <div className="flex flex-col gap-3">
                  <div className="w-full h-32 rounded-2xl overflow-hidden bg-[#181822] border border-white/5 relative">
                    {prod.imageUrl ? (
                      <img src={prod.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold uppercase text-[10px]">Preview Image</div>
                    )}
                    {prod.category === 'membership' && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[8px] font-black uppercase tracking-wider rounded border border-yellow-500/30 flex items-center gap-1">
                        <FaCrown size={8} /> Pro
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col text-left">
                    <h3 className="font-black text-xs text-white leading-snug">{prod.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{prod.description}</p>
                  </div>
                </div>

                <div className="flex flex-col mt-4 pt-3.5 border-t border-white/5">
                  <div className="flex justify-between items-center text-xs mb-3">
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Coin Price</span>
                      <span className="font-bold text-white flex items-center gap-1 mt-0.5"><FaCoins className="text-amber-400" /> {prod.priceCoins}</span>
                    </div>
                    <div className="flex flex-col text-left items-end">
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Real Price</span>
                      <span className="font-bold text-purple-400 mt-0.5">${prod.priceReal}</span>
                    </div>
                  </div>

                  {(() => {
                    const isCosmetic = ['membership', 'badge', 'avatar_frame', 'theme'].includes(prod.category);
                    const isOwned = isCosmetic && orders.some(o => (o.product?._id || o.product) === prod._id && o.paymentStatus !== 'refunded');
                    return (
                      <button
                        disabled={isOwned}
                        onClick={() => {
                          setCheckingOutProduct(prod);
                          setPaymentMethod('coins');
                        }}
                        className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1 ${
                          isOwned 
                            ? 'bg-green-600/10 border border-green-500/20 text-green-500 cursor-not-allowed opacity-80' 
                            : 'bg-purple-650 hover:bg-purple-700 text-white active:scale-[0.98]'
                        }`}
                      >
                        {isOwned ? (
                          <>
                            <FaCheckCircle size={10} /> Owned
                          </>
                        ) : (
                          <>
                            <FaShoppingBag size={10} /> Purchase Item
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>

              </div>
            ))}
          </div>
        </>
      )}

      {/* Checkout Selection Modal Overlay */}
      {checkingOutProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-white/10 p-6 rounded-[30px] w-full max-w-sm flex flex-col gap-4 text-xs shadow-xl animate-scale-up">
            
            <div className="border-b border-white/5 pb-2.5 text-left">
              <h2 className="text-sm font-black text-white uppercase">Checkout Product</h2>
              <span className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase block">{checkingOutProduct.name}</span>
            </div>

            {/* Payment method selector */}
            <div className="flex flex-col gap-2">
              <span className="text-[8px] text-slate-450 font-black uppercase tracking-wider">Select Checkout Method</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('coins')}
                  className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'coins' 
                      ? 'border-purple-500 bg-purple-600/5 text-purple-400' 
                      : 'border-white/5 bg-[#181822] text-slate-400 hover:text-white'
                  }`}
                >
                  <FaCoins size={14} />
                  <span className="text-[8px] font-black uppercase">Coins ({checkingOutProduct.priceCoins})</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('payment')}
                  className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'payment' 
                      ? 'border-purple-500 bg-purple-600/5 text-purple-400' 
                      : 'border-white/5 bg-[#181822] text-slate-400 hover:text-white'
                  }`}
                >
                  <FaCreditCard size={14} />
                  <span className="text-[8px] font-black uppercase">Gateway (${checkingOutProduct.priceReal})</span>
                </button>
              </div>
            </div>

            {/* Promo Code section */}
            <div className="flex flex-col gap-1.5 mt-1 text-left">
              <span className="text-[8px] text-slate-450 font-black uppercase tracking-wider">Promo Coupon</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Code (e.g. WELCOME50)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#181822] border border-white/5 text-[10px] text-white focus:outline-none focus:border-purple-500"
                />
                <button 
                  onClick={applyCoupon}
                  className="px-3 bg-purple-650 hover:bg-purple-700 text-white rounded-lg text-[9px] font-black uppercase cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {appliedDiscount && (
                <span className="text-[8px] text-green-400 font-bold uppercase mt-1">Discount Coupon Applied: 50% Off!</span>
              )}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-b border-white/5 py-2.5 flex justify-between font-bold text-xs">
              <span className="text-slate-450">Total Amount:</span>
              <span className="text-white">
                {paymentMethod === 'coins' 
                  ? `${appliedDiscount ? Math.floor(checkingOutProduct.priceCoins * 0.5) : checkingOutProduct.priceCoins} Coins` 
                  : `$${appliedDiscount ? Math.floor(checkingOutProduct.priceReal * 0.5) : checkingOutProduct.priceReal}`}
              </span>
            </div>

            {/* Checkout CTA triggers */}
            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => {
                  setCheckingOutProduct(null);
                  setAppliedDiscount(false);
                  setCouponCode('');
                }}
                className="px-4 py-2 bg-[#181822] border border-white/5 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={processing}
                onClick={handleCheckout}
                className="px-5 py-2 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer transition-colors"
              >
                {processing ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityStore;
