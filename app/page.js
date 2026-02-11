'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURACIÓN SEGURA ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ADMIN_PWD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD; 

const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONFIGURACIÓN DE LA TIENDA ---
const TIENDA_CONFIG = {
  nombre: "FUTBOL STORE CCS",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "584120000000", 
  metodosPago: "Pago Móvil / Zelle / Binance"
};

export default function Home() {
  // Estados de datos
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  
  // Estados de Moneda
  const [tasaCambio, setTasaCambio] = useState(0); // Aquí guardamos el precio del dólar
  const [moneda, setMoneda] = useState('USD'); // 'USD' o 'VES'
  
  // Estados de interfaz
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [passInput, setPassInput] = useState("");

  // Cargar productos y Tasa del Dólar
  useEffect(() => {
    const inicializarTienda = async () => {
      try {
        // 1. Cargar Productos
        let { data, error } = await supabase
          .from('camisetas')
          .select('*')
          .order('id', { ascending: false });
        if (!error && data) setProductos(data);

        // 2. Cargar Tasa del BCV (API Gratuita)
        const res = await fetch('https://pydolarvenezuela-api.vercel.app/api/v1/dollar?page=bcv');
        const dataTasa = await res.json();
        // Nota: Esta API a veces cambia su estructura. Si falla, pon una tasa manual de respaldo.
        if (dataTasa && dataTasa.monitors && dataTasa.monitors.usd) {
           setTasaCambio(dataTasa.monitors.usd.price);
        } else {
           setTasaCambio(60.00); // Tasa de respaldo manual si falla la API
        }

      } catch (err) {
        console.error("Error cargando datos:", err);
        setTasaCambio(60.00); // Fallback en caso de error
      } finally {
        setCargando(false);
      }
    };
    inicializarTienda();
  }, []);

  // --- FUNCIÓN DE FORMATEO DE PRECIO ---
  const formatoPrecio = (precioUSD) => {
    if (moneda === 'USD') {
      return `$${precioUSD}`;
    } else {
      const precioBs = (precioUSD * tasaCambio).toFixed(2);
      return `Bs ${precioBs}`;
    }
  };

  // --- FUNCIONES DEL CARRITO ---
  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);
  };

  const eliminarDelCarrito = (index) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
    if (nuevoCarrito.length === 0) setMostrarCarrito(false);
  };

  const calcularTotal = () => {
    const totalUSD = carrito.reduce((acc, p) => acc + p.precio, 0);
    return totalUSD;
  };

  // --- ENVIAR PEDIDO ---
  const enviarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;

    const totalUSD = calcularTotal();
    const totalBs = (totalUSD * tasaCambio).toFixed(2);

    const listaProductos = carrito.map(p => 
      `▪️ ${p.nombre} ($${p.precio})`
    ).join('\n');

    const mensajeCliente = `
*PEDIDO WEB - ${TIENDA_CONFIG.nombre}* 🛍️
---------------------------------
${listaProductos}
---------------------------------
💰 *TOTAL USD: $${totalUSD}*
🇻🇪 *TOTAL BS: Bs ${totalBs}*
(Tasa: ${tasaCambio})

📝 *Métodos de pago preferido:* ${TIENDA_CONFIG.metodosPago}
    `.trim();

    const url = `https://wa.me/${TIENDA_CONFIG.whatsapp}?text=${encodeURIComponent(mensajeCliente)}`;
    window.open(url, '_blank');
  };

  // --- LÓGICA ADMIN ---
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
    const nombreInput = document.getElementById('n-nom');
    const precioInput = document.getElementById('n-pre');
    const imagenInput = document.getElementById('n-img');
    const nombre = nombreInput.value;
    const precio = precioInput.value;
    const imagen_url = imagenInput.value;
    
    if(!nombre || !precio) return alert("Faltan datos");

    const { data, error } = await supabase
      .from('camisetas')
      .insert([{ nombre, precio: parseInt(precio), imagen_url, stock: true }])
      .select();
      
    if (!error && data) {
      setProductos([data[0], ...productos]);
      nombreInput.value = ""; precioInput.value = ""; imagenInput.value = "";
      alert("✅ Producto agregado");
    } else {
      alert("Error: " + error.message);
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
        
        <div className="flex items-center gap-3">
          {/* SWITCH DE MONEDA */}
          <button 
            onClick={() => setMoneda(moneda === 'USD' ? 'VES' : 'USD')}
            className="bg-gray-800 px-3 py-1 rounded-full text-xs font-bold border border-gray-600 hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <span>{moneda === 'USD' ? '🇺🇸 $' : '🇻🇪 Bs'}</span>
            <span className="text-[10px] text-gray-400 font-normal opacity-80">
               {moneda === 'USD' ? 'Cambiar a Bs' : `Tasa: ${tasaCambio}`}
            </span>
          </button>

          <button 
            onClick={esAdmin ? () => setEsAdmin(false) : () => setMostrarLogin(true)} 
            className={`text-[10px] px-3 py-1 rounded-full border transition-all ${esAdmin ? 'bg-red-500 border-red-500 text-white font-bold' : 'border-gray-600 text-gray-400 hover:text-white'}`}
          >
            {esAdmin ? 'SALIR' : 'LOGIN'}
          </button>
        </div>
      </header>

      {/* --- MODAL LOGIN --- */}
      {mostrarLogin && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-200">
            <h3 className="text-xl font-bold text-center mb-1">Acceso Administrativo</h3>
            <form onSubmit={intentarLogin} className="space-y-4 mt-4">
              <input type="password" placeholder="Ingresa la contraseña" value={passInput} onChange={(e) => setPassInput(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all text-center tracking-widest" autoFocus />
              <div className="flex gap-2">
                <button type="button" onClick={() => setMostrarLogin(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancelar</button>
                <button type="submit" className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 shadow-lg">Entrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PANEL ADMIN --- */}
      {esAdmin && (
        <div className="m-4 p-6 bg-white rounded-2xl border-2 border-blue-500 shadow-xl max-w-md mx-auto animate-slide-down">
          <h3 className="font-bold mb-4 text-blue-600 uppercase text-sm tracking-wide">✨ Nuevo Producto</h3>
          <div className="space-y-3">
            <input id="n-nom" placeholder="Nombre (Ej: Vinotinto)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
            <div className="flex gap-2">
                <input id="n-pre" type="number" placeholder="Precio ($)" className="w-1/3 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                <input id="n-img" placeholder="URL Imagen" className="w-2/3 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
            </div>
            <button onClick={agregarProducto} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all">+ PUBLICAR</button>
          </div>
        </div>
      )}

      {/* --- GRID DE PRODUCTOS --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 pt-6">
        {productos.map((prod) => (
          <div key={prod.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 group border border-gray-100">
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
              {prod.imagen_url ? <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="flex items-center justify-center h-full text-gray-400 text-xs font-medium">Sin imagen</div>}
              {esAdmin && (
                <button onClick={() => eliminarProductoDB(prod.id)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-colors z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wide min-h-[32px] line-clamp-2 leading-relaxed">{prod.nombre}</h2>
              <div className="flex justify-between items-end mt-3">
                {/* PRECIO CONVERTIDO AUTOMÁTICAMENTE */}
                <p className="text-xl font-black text-gray-900">{formatoPrecio(prod.precio)}</p>
                {!esAdmin && (
                   <button onClick={() => agregarAlCarrito(prod)} className="bg-black hover:bg-gray-800 text-white text-[10px] px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95">Agregar</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- BARRA FLOTANTE --- */}
      {!esAdmin && carrito.length > 0 && !mostrarCarrito && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center z-40 animate-bounce-in border border-gray-800 cursor-pointer" onClick={() => setMostrarCarrito(true)}>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total estimado</span>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-2xl">{formatoPrecio(calcularTotal())}</span>
              <span className="text-xs text-gray-900 font-bold bg-white px-2 py-0.5 rounded-full">{carrito.length} items</span>
            </div>
          </div>
          <button className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2 hover:bg-gray-100">VER CARRITO 🛒</button>
        </div>
      )}

      {/* --- MODAL CARRITO --- */}
      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setMostrarCarrito(false)}></div>
          <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl p-6 shadow-2xl relative z-10 max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h3 className="text-xl font-black italic uppercase">Tu Pedido</h3>
              <button onClick={() => setMostrarCarrito(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
              {carrito.map((prod, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    {prod.imagen_url && <img src={prod.imagen_url} className="w-10 h-10 rounded-md object-cover bg-white" />}
                    <div>
                        <p className="text-xs font-bold text-gray-800 line-clamp-1">{prod.nombre}</p>
                        <p className="text-sm font-black text-blue-600">{formatoPrecio(prod.precio)}</p>
                    </div>
                  </div>
                  <button onClick={() => eliminarDelCarrito(index)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Total a pagar:</span>
                <span className="text-3xl font-black">{formatoPrecio(calcularTotal())}</span>
              </div>
              <button onClick={enviarPedidoWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2">
                <span>COMPLETAR EN WHATSAPP</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}