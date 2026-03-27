"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import PageTransition from "@/components/animations/PageTransition";
import Modal from "@/components/ui/Modal";
import { User, Package, Settings, LogOut, ChevronRight, ShieldCheck, Clock, Truck, CheckCircle2, Archive } from "lucide-react";

import { useToast } from "@/lib/store/useToast";

export default function ProfilePage() {
  const { addToast } = useToast();
  const [user, setUser] = useState<any>(null);  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setNewName(data.user.name);
      } else {
        router.push("/");
      }
    } catch (err) {
      router.push("/");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        console.log("Orders received in frontend:", data);
        setOrders(data);
      } else {
        console.error("Failed to fetch orders:", await res.text());
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    }
  };
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchUser(), fetchOrders()]);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        setUser({ ...user, name: newName });
        setIsSettingsOpen(false);
        addToast("Имя успешно обновлено");
      }
    } catch (err) {
      addToast("Ошибка при обновлении", "error");
    } finally {
      setUpdateLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/");
        router.refresh(); // Принудительно обновляем состояние страницы
      }
    } catch (err) {
      console.error("Logout error:", err);
      // Fallback: удаление через JS если API недоступно
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      router.push("/");
    }
  };
  if (loading) return <div className="min-h-screen bg-[#f5e6be] flex items-center justify-center text-[#243A5E]">Загрузка...</div>;

  return (
    <PageTransition>
      <Header activeModal={null} setActiveModal={() => {}} />
      <main className="pt-32 pb-20 bg-[#f5e6be] min-h-screen text-[#243A5E]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar */}
            <aside className="lg:w-1/4 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
                <div className="w-20 h-20 bg-[#243A5E] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  {user?.name[0]}
                </div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-sm text-[#243A5E]/50">{user?.email}</p>
              </div>

              <nav className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center justify-between p-5 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-[#243A5E] text-white' : 'hover:bg-[#243A5E]/5'}`}
                >
                  <div className="flex items-center space-x-4">
                    <User size={20} />
                    <span>Профиль</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center justify-between p-5 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-[#243A5E] text-white' : 'hover:bg-[#243A5E]/5'}`}
                >
                  <div className="flex items-center space-x-4">
                    <Package size={20} />
                    <span>Мои заказы</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full flex items-center justify-between p-5 text-sm font-bold uppercase tracking-widest transition-all hover:bg-[#243A5E]/5"
                >
                  <div className="flex items-center space-x-4">
                    <Settings size={20} />
                    <span>Настройки</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
                
                {user?.role === 'admin' && (
                  <div className="p-4 bg-[#243A5E]/5">
                    <Link
                      href="/admin"
                      className="w-full flex items-center justify-between p-4 bg-white border-2 border-[#d4af37] rounded-2xl text-xs font-bold uppercase tracking-widest text-[#d4af37] hover:bg-[#d4af37] hover:text-white transition-all shadow-sm group"
                    >
                      <div className="flex items-center space-x-3">
                        <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
                        <span>Админ-панель</span>
                      </div>
                      <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" />
                    </Link>
                  </div>
                )}

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-4 p-5 text-sm font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut size={20} />
                  <span>Выйти</span>
                </button>
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 space-y-8">
              {activeTab === "profile" ? (
                <div className="bg-white p-10 rounded-3xl shadow-xl">
                  <h3 className="text-2xl font-playfair font-bold mb-8 border-b pb-4">Личные данные</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#243A5E]/40">Имя</label>
                      <p className="text-lg font-medium">{user?.name}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#243A5E]/40">E-mail</label>
                      <p className="text-lg font-medium">{user?.email}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#243A5E]/40">Роль</label>
                      <p className="text-lg font-medium uppercase tracking-widest text-[#d4af37]">{user?.role}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-2xl font-playfair font-bold mb-8 bg-white p-6 rounded-3xl shadow-xl">История заказов</h3>
                  {orders.length === 0 ? (
                    <div className="bg-white p-20 rounded-3xl shadow-xl text-center text-[#243A5E]/40 italic">
                      У вас пока нет совершенных заказов.
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="bg-white p-8 rounded-3xl shadow-xl space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Заказ #{order.id}</p>
                            <p className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2 ${
                            order.status === 'Принят' ? 'bg-blue-50 text-blue-500' :
                            order.status === 'Ожидает' ? 'bg-yellow-50 text-yellow-600' :
                            order.status === 'Доставлен' ? 'bg-green-50 text-green-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {order.status === 'Принят' && <Clock size={14} />}
                            {order.status === 'Ожидает' && <Truck size={14} />}
                            {order.status === 'Доставлен' && <CheckCircle2 size={14} />}
                            {order.status === 'Закрыт' && <Archive size={14} />}
                            <span>{order.status}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Сумма</p>
                            <p className="text-xl font-bold text-[#243A5E]">{order.total_price}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-2xl">
                              <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex-shrink-0">
                                {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">{item.name[0]}</div>}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{item.name}</p>
                                <p className="text-xs opacity-50">{item.quantity} шт. • {item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Настройки профиля">
        <form onSubmit={handleUpdateName} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#243A5E]/40 ml-2">Изменить имя</label>
            <input
              type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              className="w-full p-4 bg-white rounded-2xl border border-[#243A5E]/5 outline-none focus:ring-2 focus:ring-[#d4af37] transition-all text-black"
              placeholder="Ваше новое имя" required
            />
          </div>
          <button
            type="submit" disabled={updateLoading}
            className="w-full py-4 bg-[#243A5E] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#d4af37] hover:text-[#243A5E] transition-all shadow-lg disabled:opacity-50"
          >
            {updateLoading ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </form>
      </Modal>
    </PageTransition>
  );
}
