import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Khởi tạo Supabase client ($0-cost)
const supabaseUrl = 'https://xpkmlxpugoixkhesbwdk.supabase.co/rest/v1/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwa21seHB1Z29peGtoZXNid2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTg0OTcsImV4cCI6MjEwNzEzNDQ5N30.1gCXIixt_Szfv8Ch6icnSmQgJaEGdZ-MKlHYWd67j3U';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchShopData();
  }, []);

  async function fetchShopData() {
    // Lấy thông tin shop mới nhất
    const { data: shopData } = await supabase.from('shops').select('*').limit(1).single();
    if (shopData) {
      setShop(shopData);
      // Lấy danh sách sản phẩm thuộc shop đó
      const { data: productData } = await supabase.from('products').select('*').eq('shop_id', shopData.id);
      setProducts(productData || []);
    }
  }

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0);
  const orderId = Math.floor(100000 + Math.random() * 900000); // Mã đơn hàng ngẫu nhiên

  if (!shop) return <div className="p-8 text-center">Đang tải cửa hàng...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header / Hero Banner */}
      <header className="p-6 text-white text-center shadow-lg" style={{ backgroundColor: shop.theme_color || '#10B981' }}>
        <h1 className="text-3xl font-bold">{shop.name}</h1>
        <p className="mt-2 opacity-90">{shop.slogan}</p>
      </header>

      {/* Danh sách sản phẩm */}
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-4">Thực đơn / Sản phẩm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-500 text-sm">{item.description}</p>
                <p className="text-emerald-600 font-bold mt-1">{Number(item.price).toLocaleString()} đ</p>
              </div>
              <button 
                onClick={() => addToCart(item)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
              >
                + Thêm
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Thanh Giỏ hàng cố định bên dưới */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-xl flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <p className="text-xs text-gray-500">{cart.length} món trong giỏ</p>
            <p className="text-lg font-bold text-emerald-600">{totalPrice.toLocaleString()} đ</p>
          </div>
          <button 
            onClick={() => setShowCheckout(true)}
            className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700"
          >
            Thanh toán VietQR
          </button>
        </div>
      )}

      {/* Modal VietQR Thanh toán thật */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative">
            <h3 className="text-lg font-bold mb-2">Mã VietQR Thanh Toán</h3>
            <p className="text-xs text-gray-500 mb-4">Quét mã bằng app Ngân hàng để chuyển khoản tự động</p>
            
            {/* Ảnh VietQR Động sinh từ dữ liệu Shop */}
            <img 
              src={`https://img.vietqr.io/image/${shop.bank_name}-${shop.bank_account}-compact2.png?amount=${totalPrice}&addInfo=FEWERFIN%20DH${orderId}&accountName=${encodeURIComponent(shop.account_holder || '')}`}
              alt="Mã VietQR Thanh toán" 
              className="w-full rounded-xl border mb-4"
            />

            <div className="text-left text-xs bg-gray-50 p-3 rounded-lg mb-4 space-y-1">
              <p><strong>Ngân hàng:</strong> {shop.bank_name}</p>
              <p><strong>Số tài khoản:</strong> {shop.bank_account}</p>
              <p><strong>Chủ tài khoản:</strong> {shop.account_holder}</p>
              <p><strong>Nội dung CK:</strong> FEWERFIN DH{orderId}</p>
            </div>

            <button 
              onClick={() => setShowCheckout(false)}
              className="w-full py-2 bg-gray-200 rounded-lg text-sm font-semibold"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
