"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import PageTransition from "@/components/animations/PageTransition";
import { Plus, Trash2, Star, Package, LayoutDashboard, Users, Shield, ShieldCheck, Edit2, X, ClipboardList, CheckCircle2, Clock, Truck, Archive, Box, Save } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"products" | "users" | "orders" | "stock">("products");
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [localStock, setLocalStock] = useState<{[key: number]: number}>({});
  const [formData, setFormData] = useState({ 
    name: "", 
    price: "", 
    category: "БАДы", 
    is_bestseller: false,
    description: "",
    stock: 0,
    image: null as File | null
  });
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        const stockMap: {[key: number]: number} = {};
        data.forEach((p: any) => stockMap[p.id] = p.stock || 0);
        setLocalStock(stockMap);
      } else {
        router.push("/profile");
      }
    } catch (err) {
      router.push("/profile");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchUsers(), fetchOrders()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("is_bestseller", formData.is_bestseller ? "1" : "0");
      formDataToSend.append("description", formData.description);
      formDataToSend.append("stock", formData.stock.toString());
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (editingId) {
        formDataToSend.append("id", editingId.toString());
      }

      const res = await fetch("/api/admin/products", {
        method: editingId ? "PATCH" : "POST",
        body: formDataToSend,
      });
      
      if (res.ok) {
        setFormData({ 
          name: "", 
          price: "", 
          category: "БАДы", 
          is_bestseller: false, 
          description: "",
          stock: 0,
          image: null
        });
        setEditingId(null);
        fetchProducts();
      } else {
        const errorData = await res.json();
        alert("Ошибка: " + (errorData.error || "Неизвестная ошибка"));
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка сети");
    }
  };

  const handleEditClick = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      is_bestseller: product.is_bestseller === 1,
      description: product.description || "",
      stock: product.stock || 0,
      image: null
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ 
      name: "", 
      price: "", 
      category: "БАДы", 
      is_bestseller: false, 
      description: "",
      stock: 0,
      image: null
    });
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Удалить этот товар?")) return;
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAdmin = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Сделать пользователя ${newRole === 'admin' ? 'администратором' : 'обычным пользователем'}?`)) return;
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickStockUpdate = async (product: any) => {
    const newStock = localStock[product.id];
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("id", product.id.toString());
      formDataToSend.append("name", product.name);
      formDataToSend.append("price", product.price);
      formDataToSend.append("category", product.category);
      formDataToSend.append("is_bestseller", product.is_bestseller.toString());
      formDataToSend.append("description", product.description || "");
      formDataToSend.append("stock", newStock.toString());

      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        body: formDataToSend,
      });
      
      if (res.ok) {
        fetchProducts();
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-8 right-8 bg-[#243A5E] text-white px-6 py-3 rounded-2xl shadow-2xl z-[200] flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-300';
        notification.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span>Сохранения изменены</span>`;
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4');
          setTimeout(() => notification.remove(), 300);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#f5e6be] flex items-center justify-center text-[#243A5E]">Загрузка админ-панели...</div>;

  return (
    <PageTransition>
      <Header activeModal={null} setActiveModal={() => {}} />
      <main className="pt-32 pb-20 bg-[#f5e6be] min-h-screen text-[#243A5E]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#243A5E] text-white rounded-2xl shadow-lg"><LayoutDashboard size={32} /></div>
              <div><h1 className="text-4xl font-playfair font-bold">Админ-панель</h1><p className="text-sm opacity-60 uppercase tracking-widest">Управление Proviora</p></div>
            </div>
            <div className="flex p-1 bg-white/50 backdrop-blur-sm rounded-2xl self-start">
              <button onClick={() => setActiveTab("products")} className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === "products" ? "bg-[#243A5E] text-white shadow-lg" : "text-[#243A5E]/50 hover:text-[#243A5E]"}`}><Package size={18} /><span>Товары</span></button>
              <button onClick={() => setActiveTab("users")} className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === "users" ? "bg-[#243A5E] text-white shadow-lg" : "text-[#243A5E]/50 hover:text-[#243A5E]"}`}><Users size={18} /><span>Пользователи</span></button>
              <button onClick={() => setActiveTab("orders")} className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === "orders" ? "bg-[#243A5E] text-white shadow-lg" : "text-[#243A5E]/50 hover:text-[#243A5E]"}`}><ClipboardList size={18} /><span>Заказы</span></button>
              <button onClick={() => setActiveTab("stock")} className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === "stock" ? "bg-[#243A5E] text-white shadow-lg" : "text-[#243A5E]/50 hover:text-[#243A5E]"}`}><Box size={18} /><span>Склад</span></button>
            </div>
          </div>

          {activeTab === "products" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-3xl shadow-xl sticky top-32">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center space-x-2">{editingId ? <Edit2 size={20} className="text-[#d4af37]" /> : <Plus size={20} className="text-[#d4af37]" />}<span>{editingId ? "Редактировать" : "Добавить"} товар</span></h3>
                    {editingId && <button onClick={cancelEdit} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>}
                  </div>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-2">Название</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#d4af37] text-black text-sm" /></div>
                    <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-2">Цена (с валютой)</label><input type="text" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="24,000 UZS" className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#d4af37] text-black text-sm" /></div>
                    <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-2">Категория</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#d4af37] text-black text-sm appearance-none"><option>БАДы</option><option>Уход за кожей</option><option>Витамины</option><option>Наборы</option></select></div>
                    <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-2">Описание</label><textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#d4af37] text-black text-sm min-h-[100px] resize-none" /></div>
                    <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-2">Количество на складе</label><input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#d4af37] text-black text-sm" /></div>
                    <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-2">Изображение</label><input type="file" accept="image/*" onChange={e => setFormData({...formData, image: e.target.files?.[0] || null})} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#d4af37] text-black text-sm" /></div>
                    <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl cursor-pointer group"><input type="checkbox" checked={formData.is_bestseller} onChange={e => setFormData({...formData, is_bestseller: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#243A5E] focus:ring-[#243A5E]" /><span className="text-sm font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Топ товар</span></label>
                    <button className="w-full py-5 bg-[#243A5E] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#d4af37] hover:text-[#243A5E] transition-all shadow-lg">{editingId ? "Сохранить изменения" : "Опубликовать"}</button>
                  </form>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                  <div className="p-8 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Список товаров ({products.length})</h3><Package size={24} className="opacity-20" /></div>
                  <div className="divide-y">
                    {products.map(product => (
                      <div key={product.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-6">
                          {product.image_url ? <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-xl" /> : <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl font-playfair text-gray-300">{product.name[0]}</div>}
                          <div><div className="flex items-center space-x-2"><h4 className="font-bold text-[#243A5E]">{product.name}</h4>{product.is_bestseller === 1 && <Star size={14} className="fill-[#d4af37] text-[#d4af37]" />}</div><p className="text-xs uppercase tracking-widest opacity-40">{product.category} • {product.price}</p><p className="text-[10px] font-bold mt-1">На складе: <span className={product.stock > 0 ? "text-green-500" : "text-red-500"}>{product.stock || 0} шт.</span></p></div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleEditClick(product)} className="p-3 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={20} /></button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "users" ? (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-8 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Пользователи ({users.length})</h3><Users size={24} className="opacity-20" /></div>
              <div className="divide-y">
                {users.map(user => (
                  <div key={user.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'admin' ? 'bg-[#d4af37]' : 'bg-[#243A5E]/20 text-[#243A5E]'}`}>{user.name[0]}</div>
                      <div><div className="flex items-center space-x-2"><h4 className="font-bold text-[#243A5E]">{user.name}</h4>{user.role === 'admin' && <span className="px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-bold uppercase rounded-full">Admin</span>}</div><p className="text-xs opacity-40">{user.email}</p></div>
                    </div>
                    <button onClick={() => handleToggleAdmin(user.id, user.role)} className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${user.role === 'admin' ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>{user.role === 'admin' ? <><Shield size={14} /><span>Снять админку</span></> : <><ShieldCheck size={14} /><span>Дать админку</span></>}</button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "orders" ? (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-8 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Заказы ({orders.length})</h3><ClipboardList size={24} className="opacity-20" /></div>
              <div className="divide-y">
                {orders.map(order => (
                  <div key={order.id} className="p-8 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center space-x-4">
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest">Заказ #{order.id}</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center space-x-1 ${order.status === 'Принят' ? 'bg-blue-50 text-blue-500' : order.status === 'Ожидает' ? 'bg-yellow-50 text-yellow-600' : order.status === 'Доставлен' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{order.status === 'Принят' && <Clock size={12} />}{order.status === 'Ожидает' && <Truck size={12} />}{order.status === 'Доставлен' && <CheckCircle2 size={12} />}{order.status === 'Закрыт' && <Archive size={12} />}<span>{order.status}</span></span>
                          <span className="text-xs opacity-40">{new Date(order.created_at).toLocaleString()}</span>
                        </div>
                        <div><h4 className="font-bold text-[#243A5E]">{order.user_name}</h4><p className="text-xs opacity-40">{order.user_email}</p></div>
                        <div className="flex flex-wrap gap-2">{order.items.map((item: any, idx: number) => (<div key={idx} className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-gray-100"><div className="w-8 h-8 bg-gray-50 rounded-lg overflow-hidden">{item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px]">{item.name[0]}</div>}</div><span className="text-xs font-medium">{item.name} x{item.quantity}</span></div>))}</div>
                      </div>
                      <div className="flex flex-col items-end gap-4">
                        <div className="text-right"><p className="text-xs uppercase tracking-widest opacity-40 mb-1">Сумма заказа</p><p className="text-2xl font-bold text-[#243A5E]">{order.total_price}</p></div>
                        <div className="flex p-1 bg-gray-100 rounded-xl">{['Принят', 'Ожидает', 'Доставлен', 'Закрыт'].map((s) => (<button key={s} onClick={() => handleUpdateOrderStatus(order.id, s)} className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-all ${order.status === s ? 'bg-white text-[#243A5E] shadow-sm' : 'text-gray-400 hover:text-[#243A5E]'}`}>{s}</button>))}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-8 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Управление складом ({products.length})</h3><Box size={24} className="opacity-20" /></div>
              <div className="divide-y">
                {products.map(product => (
                  <div key={product.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">{product.image_url ? <img src={product.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">{product.name[0]}</div>}</div>
                      <div><h4 className="font-bold text-[#243A5E]">{product.name}</h4><p className="text-xs opacity-40">{product.category}</p></div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl">
                        <button 
                          onClick={() => setLocalStock(prev => ({...prev, [product.id]: Math.max(0, (prev[product.id] ?? product.stock) - 1)}))}
                          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-red-50 text-red-500 transition-all"
                        >-</button>
                        <span className="w-12 text-center font-bold text-sm">{localStock[product.id] ?? product.stock}</span>
                        <button 
                          onClick={() => setLocalStock(prev => ({...prev, [product.id]: (prev[product.id] ?? product.stock) + 1}))}
                          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-green-50 text-green-500 transition-all"
                        >+</button>
                      </div>
                      <button 
                        onClick={() => handleQuickStockUpdate(product)}
                        className={`p-3 rounded-xl transition-all ${localStock[product.id] !== undefined && localStock[product.id] !== product.stock ? 'bg-[#d4af37] text-[#243A5E] shadow-lg scale-110' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        <Save size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
