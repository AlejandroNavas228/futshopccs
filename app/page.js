'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURACIÓN SEGURA ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONFIGURACIÓN DE LA TIENDA ---
const TIENDA_CONFIG = {
  nombre: "FUTBOL STORE CCS",
  whatsapp: "584120000000", 
  moneda: "$",
  adminPassword: "AaronKey2026", // Contraseña para entrar al modo admin
  metodosPago: "Pago Móvil / Zelle / Binance"
};

export default function Home() {
  // Estados de datos
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  
  // Estados de interfaz (Modales y Admin)
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mostrarLogin, setMostrarLogin] = useState(false); // Nuevo: Modal Login
  const [mostrarCarrito, setMostrarCarrito] = useState(false); // Nuevo: Modal Carrito
  const [passInput, setPassInput] = useState(""); // Input del password

  // Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        let { data, error } = await supabase
          .from('camisetas')
          .select('*')
          .order('id', { ascending: false });
        
        if (!error && data) setProductos(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setCargando(false);
      }
    };
    fetchProductos();
  }, []);

  // --- FUNCIONES DEL CARRITO ---
  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);
  };

  const eliminarDelCarrito = (index) => {
    // Borra el elemento en la posición "index"
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
    // Si vacía el carrito, cierra el modal
    if (nuevoCarrito.length === 0) setMostrarCarrito(false);
  };

  const calcularTotal = () => carrito.reduce((acc, p) => acc + p.precio, 0);

  // --- ENVIAR PEDIDO ---
  const enviarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;

    const listaProductos = carrito.map(p => `▪️ ${p.nombre} (${TIENDA_CONFIG.moneda}${p.precio})`).join('\n');
    const total = calcularTotal();

    const mensajeCliente = `
*PEDIDO WEB - ${TIENDA_CONFIG.nombre}* 🛍️
---------------------------------
${listaProductos}
---------------------------------
💰 *TOTAL A PAGAR: ${TIENDA_CONFIG.moneda}${total}*

📝 *Métodos de pago preferido:* ${TIENDA_CONFIG.metodosPago}
    `.trim();

    const url = `https://wa.me/${TIENDA_CONFIG.whatsapp}?text=${encodeURIComponent(mensajeCliente)}`;
    window.open(url, '_blank');
  };

  // --- LÓGICA ADMIN ---
  const intentarLogin = (e) => {
    e.preventDefault(); // Evita recargar la página
    if (passInput === TIENDA_CONFIG.adminPassword) {
      setEsAdmin(true);
      setMostrarLogin(false);
      setPassInput("");
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const eliminarProductoDB = async (id) => {
    if (confirm("¿Borrar este producto de la base de datos?")) {
      const { error } = await supabase.from('camisetas').delete().eq('id', id);
      if (!error) setProductos(productos.filter(p => p.id !== id));
    }
  };

  if (cargando) return <div className="flex h-screen items-center justify-center font-bold animate-pulse text-blue-600">Cargando Tienda...</div>;

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen pb-32 font-sans text-gray-900 relative">
      
      {/* --- HEADER --- */}
      <header className="bg-black text-white p-4 sticky top-0 z-40 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-lg font-black tracking-tighter italic uppercase">{TIENDA_CONFIG.nombre}</h1>
          <p className="text-[10px] text-gray-400">Envíos a todo el país 🇻🇪</p>
        </div>
        <button 
          onClick={esAdmin ? () => setEsAdmin(false) : () => setMostrarLogin(true)} 
          className={`text-[10px] px-3 py-1 rounded-full border transition-all ${esAdmin ? 'bg-red-500 border-red-500 text-white font-bold' : 'border-gray-600 text-gray-400 hover:text-white'}`}
        >
          {esAdmin ? 'SALIR ADMIN' : 'LOGIN'}
        </button>
      </header>

      {/* --- MODAL LOGIN (NUEVO Y ELEGANTE) --- */}
      {mostrarLogin && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-200">
            <h3 className="text-xl font-bold text-center mb-1">Acceso Administrativo</h3>
            <p className="text-xs text-gray-500 text-center mb-6">Solo para personal autorizado</p>
            
            <form onSubmit={intentarLogin} className="space-y-4">
              <input 
                type="password" 
                placeholder="Ingresa la contraseña" 
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                className="w-full p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all text-center tracking-widest"
                autoFocus
              />
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setMostrarLogin(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PANEL DE CREACIÓN DE PRODUCTOS (SOLO ADMIN) --- */}
      {esAdmin && (
        <div className="m-4 p-6 bg-white rounded-2xl border-2 border-blue-500 shadow-xl max-w-md mx-auto animate-slide-down">
          <h3 className="font-bold mb-4 text-blue-600 uppercase text-sm tracking-wide flex items-center gap-2">
            <span>✨ Nuevo Producto</span>
          </h3>
          <div className="space-y-3">
            <input id="n-nom" placeholder="Nombre (Ej: Vinotinto 2026)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all" />
            <div className="flex gap-2">
                <input id="n-pre" type="number" placeholder="Precio ($)" className="w-1/3 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all" />
                <input id="n-img" placeholder="URL Imagen" className="w-2/3 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all" />
            </div>
            
            <button 
              onClick={async () => {
                const nombre = document.getElementById('n-nom').value;
                const precio = document.getElementById('n-pre').value;
                const imagen_url = document.getElementById('n-img').value;
                
                if(!nombre || !precio) return alert("Faltan datos");

                const { error } = await supabase
                  .from('camisetas')
                  .insert([{ nombre, precio: parseInt(precio), imagen_url, stock: true }]);
                  
                if (!error) {
                  alert("✅ Producto Agregado");
                  window.location.reload();
                } else {
                  alert("Error: " + error.message);
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              + PUBLICAR
            </button>
          </div>
        </div>
      )}

      {/* --- GRID DE PRODUCTOS --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 pt-6">
        {productos.map((prod) => (
          <div key={prod.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 group border border-gray-100">
            
            {/* Imagen */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
              {prod.imagen_url ? (
                <img 
                  src={prod.imagen_url} 
                  alt={prod.nombre} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs font-medium">Sin imagen</div>
              )}
              
              {esAdmin && (
                <button 
                  onClick={() => eliminarProductoDB(prod.id)} 
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-colors z-10"
                >
                  <svg className="w-4 h-4" fill="none"
