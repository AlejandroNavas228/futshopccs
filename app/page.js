'use client';

import React, { useState, useEffect } from 'react';
// Importamos nuestras piezas
import { supabase } from '@/lib/supabase'; 
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';

const ADMIN_PWD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD; 
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "584120000000";

const TIENDA_CONFIG = {
  nombre: "FUTBOL STORE CCS",
  whatsapp: WHATSAPP_NUMBER,
  metodosPago: "Pago Móvil / Zelle / Binance"
};

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [tasaCambio, setTasaCambio] = useState(385.00); 
  const [moneda, setMoneda] = useState('USD'); 
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [passInput, setPassInput] = useState("");

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const inicializarTienda = async () => {
      try {
        let { data } = await supabase.from('camisetas').select('*').order('id', { ascending: false });
        if (data) setProductos(data);

        try {
            const res = await fetch('https://pydolarvenezuela-api.vercel.app/api/v1/dollar');
            const dataTasa = await res.json();
            if (dataTasa?.monitors?.bcv?.price) setTasaCambio(dataTasa.monitors.bcv.price);
        } catch (e) { console.log("Usando tasa respaldo"); }
      } catch (err) { console.error(err); } 
      finally { setCargando(false); }
    };
    inicializarTienda();
  }, []);

  // --- UTILIDADES ---
  const formatoPrecio = (precioUSD) => {
    if (moneda === 'USD') return `$${precioUSD}`;
    return `Bs ${(precioUSD * tasaCambio).toFixed(2)}`;
  };

  const agregarAlCarrito = (producto) => setCarrito([...carrito, producto]);
  
  const eliminarDelCarrito = (index) => {
    const nuevo = [...carrito];
    nuevo.splice(index, 1);
    setCarrito(nuevo);
    if (nuevo.length === 0) setMostrarCarrito(false);
  };

  const calcularTotal = () => carrito.reduce((acc, p) => acc + p.precio, 0);

  const enviarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;
    const totalUSD = calcularTotal();
    const totalBs = (totalUSD * tasaCambio).toFixed(2);
    const lista = carrito.map(p => `▪️ ${p.nombre} ($${p.precio})`).join('\n');
    const mensaje = `*PEDIDO WEB* 🛍️\n----------------\n${lista}\n----------------\n💰 Total: $${totalUSD} / Bs ${totalBs}\n(Tasa: ${tasaCambio})`;
    window.open(`https://wa.me/${TIENDA_CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  // --- FUNCIONES DE ADMIN (RECUPERADAS) ---
  const intentarLogin = (e) => {
    e.preventDefault();
    if (passInput === ADMIN_PWD) {
      setEsAdmin(true);
      setMostrarLogin(false);
      setPassInput("");
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const agregarProducto = async () => {
    const n = document.getElementById('n-nom').value;
    const p = document.getElementById('n-pre').value;
    const i = document.getElementById('n-img').value; 
    
    if(!n || !p) return alert("Faltan datos");

    const arrayImagenes = i.split(',').map(url => url.trim()).filter(url => url.length > 0);

    const { data, error } = await supabase
      .from('camisetas')
      .insert([{ nombre: n, precio: parseInt(p), imagenes: arrayImagenes, stock: true }])
      .select();
      
    if (!error && data) {
      setProductos([data[0], ...productos]);
      document.getElementById('n-nom').value = "";
      document.getElementById('n-pre').value = "";
      document.getElementById('n-img').value = "";
      alert("✅ Producto agregado");
    } else {
      alert("Error: " + error.message);
    }
  };

  const eliminarProductoDB = async (id) => {
    if (confirm("¿Borrar permanentemente?")) {
      const { error } = await supabase.from('camisetas').delete().eq('id', id);
      if (!error) setProductos(productos.filter(p => p.id !== id));
    }
  };

  // --- RENDERIZADO ---
  if (cargando) return <div className="flex h-screen items-center justify-center font-serif italic">Cargando...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-32 font-sans text-gray-900 relative">
      
      <Navbar 
        nombreTienda={TIENDA_CONFIG.nombre}
        carritoCount={carrito.length}
        toggleCarrito={() => setMostrarCarrito(true)}
        moneda={moneda}
        toggleMoneda={() => setMoneda(moneda === 'USD' ? 'VES' : 'USD')}
        tasa={tasaCambio}
        esAdmin={esAdmin}
        toggleAdmin={esAdmin ? () => setEsAdmin(false) : () => setMostrarLogin(true)}
      />

      {/* LOGIN MODAL */}
      {mostrarLogin && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-2xl font-serif font-bold text-center mb-6">Acceso Admin</h3>
            <form onSubmit={intentarLogin} className="space-y-4">
              <input type="password" placeholder="Contraseña" value={passInput} onChange={(e) => setPassInput(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl text-center outline-none border focus:border-black" autoFocus />
              <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold hover:opacity-90">Entrar</button>
              <button type="button" onClick={() => setMostrarLogin(false)} className="w-full text-gray-400 text-sm hover:text-black">Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN PANEL (SOLO VISIBLE SI ES ADMIN) */}
      {esAdmin && (
        <div className="max-w-7xl mx-auto px-4 mt-8 animate-slide-down">
          <div className="p-6 bg-white rounded-2xl border-2 border-black shadow-xl">
            <h3 className="font-bold mb-4 uppercase text-sm tracking-widest">✨ Nuevo Producto</h3>
            <div className="space-y-3">
              <input id="n-nom" placeholder="Nombre del producto" className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black" />
              <div className="flex gap-2">
                  <input id="n-pre" type="number" placeholder="Precio ($)" className="w-1/3 p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black" />
                  <input id="n-img" placeholder="Links de imágenes (separados por coma)" className="w-2/3 p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-black" />
              </div>
              <button onClick={agregarProducto} className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:opacity-80 transition-all">+ PUBLICAR</button>
            </div>
          </div>
        </div>
      )}

      <Hero /> 

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-serif font-bold">Destacados</h2>
            <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {productos.map((prod) => (
            <ProductCard 
              key={prod.id}
              producto={prod}
              precioFormateado={formatoPrecio(prod.precio)}
              esAdmin={esAdmin}
              onAdd={agregarAlCarrito}
              onDelete={eliminarProductoDB}
            />
          ))}
        </div>
        {/* ------------------------------------- */}

      </main>

      {/* MODAL CARRITO */}
      {mostrarCarrito && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMostrarCarrito(false)}></div>
           <div className="bg-white w-full max-w-md h-full relative z-10 shadow-2xl p-6 flex flex-col animate-slide-left">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-serif font-bold">Tu Carrito ({carrito.length})</h2>
                 <button onClick={() => setMostrarCarrito(false)} className="text-gray-400 hover:text-black">✕</button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6">
                {carrito.map((p, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                         {p.imagenes && <img src={p.imagenes[0]} className="w-full h-full object-cover"/>}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                         <h4 className="font-medium text-gray-900">{p.nombre}</h4>
                         <p className="text-gray-500 text-sm">{formatoPrecio(p.precio)}</p>
                      </div>
                      <button onClick={() => eliminarDelCarrito(i)} className="text-red-400 text-sm hover:text-red-600">Eliminar</button>
                   </div>
                ))}
              </div>

              <div className="border-t pt-6 mt-6">
                 <div className="flex justify-between text-xl font-bold mb-6">
                    <span>Total</span>
                    <span>{formatoPrecio(calcularTotal())}</span>
                 </div>
                 <button onClick={enviarPedidoWhatsApp} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:opacity-90 transition-opacity">
                    Completar Pedido en WhatsApp
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}