'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURACIÓN SEGURA ---
// Ahora Next.js buscará estas variables en tu archivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ... el resto de tu código sigue igual ...
// ---------------------------------------------------------
// 1. CONFIGURACIÓN DE LA TIENDA (CAMBIA ESTO PARA CADA CLIENTE)
// ---------------------------------------------------------
const TIENDA_CONFIG = {
  nombre: "FUTBOL STORE CCS", // Nombre que sale en el título
  whatsapp: "584120000000",   // TU número (formato internacional sin +)
  colorPrincipal: "blue",     // blue, red, green, black (colores de Tailwind)
  adminPassword: "AaronKey2026", // ¡Cámbiala para cada cliente!
  moneda: "$",                // Símbolo de moneda
  mensajeSaludo: "Hola! Vengo de la página web y quiero pedir esto:",
  metodosPago: "Pago Móvil / Zelle / Binance"
};

// ---------------------------------------------------------
// 2. SEGURIDAD: LAS CREDENCIALES (¡IMPORTANTE!)
// ---------------------------------------------------------
// NOTA: Para producción real, esto debería ir en un archivo .env
// Por ahora las dejo aquí para que te funcione al copiar y pegar, 
// pero NUNCA publiques esto en GitHub público.

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);

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

  // ---------------------------------------------------------
  // 3. LA MAGIA: PEDIDO POR WHATSAPP AUTOMÁTICO
  // ---------------------------------------------------------
  const enviarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;

    // Formateamos la lista de productos para que se vea bonita en el chat
    const listaProductos = carrito.map(p => `▪️ ${p.nombre} (${TIENDA_CONFIG.moneda}${p.precio})`).join('\n');
    const total = carrito.reduce((acc, p) => acc + p.precio, 0);

    // Creamos el mensaje final
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

  // Lógica de Admin
  const eliminarProducto = async (id) => {
    if (confirm("¿Borrar este producto?")) {
      const { error } = await supabase.from('camisetas').delete().eq('id', id);
      if (!error) setProductos(productos.filter(p => p.id !== id));
    }
  };

  const entrarComoAdmin = () => {
    const pass = prompt("Contraseña de Administrador:");
    if (pass === TIENDA_CONFIG.adminPassword) { 
      setEsAdmin(true);
    } else {
      alert("Acceso denegado");
    }
  };

  // Clases dinámicas basadas en la config (Truco sencillo)
  const btnColor = `bg-${TIENDA_CONFIG.colorPrincipal}-600`;
  const borderColor = `border-${TIENDA_CONFIG.colorPrincipal}-500`;
  const textColor = `text-${TIENDA_CONFIG.colorPrincipal}-600`;

  if (cargando) return <div className="flex h-screen items-center justify-center font-bold animate-pulse">Cargando Tienda...</div>;

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-32 font-sans text-gray-900">
      
      {/* --- HEADER PERSONALIZABLE --- */}
      <header className="bg-black text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-lg font-black tracking-tighter italic uppercase">{TIENDA_CONFIG.nombre}</h1>
          <p className="text-[9px] text-gray-400">Envíos a todo el país 🇻🇪</p>
        </div>
        <button 
          onClick={esAdmin ? () => setEsAdmin(false) : entrarComoAdmin} 
          className={`text-[9px] px-3 py-1 rounded-full border transition-all ${esAdmin ? 'bg-red-500 border-red-500 text-white' : 'border-gray-600 text-gray-400'}`}
        >
          {esAdmin ? 'SALIR ADMIN' : 'LOGIN'}
        </button>
      </header>

      {/* --- PANEL DE ADMINISTRACIÓN (Solo visible si es admin) --- */}
      {esAdmin && (
        <div className={`m-4 p-5 bg-white rounded-2xl border-2 ${borderColor} shadow-xl animate-fade-in-down`}>
          <h3 className={`font-bold mb-3 ${textColor} uppercase text-sm`}>Panel de Control</h3>
          <div className="space-y-3">
            <input id="n-nom" placeholder="Nombre del producto" className="w-full p-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black" />
            <div className="flex gap-2">
                <input id="n-pre" type="number" placeholder="Precio" className="w-1/2 p-2 bg-gray-100 rounded-lg text-sm outline-none" />
                <input id="n-img" placeholder="Link de Foto" className="w-1/2 p-2 bg-gray-100 rounded-lg text-sm outline-none" />
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
              className={`w-full ${btnColor} text-white py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform`}
            >
              + PUBLICAR PRODUCTO
            </button>
          </div>
        </div>
      )}

      {/* --- GRID DE PRODUCTOS --- */}
      <div className="grid grid-cols-2 gap-3 p-3 pt-4">
        {productos.map((prod) => (
          <div key={prod.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            {/* Imagen cuadrada */}
            <div className="relative aspect-square bg-gray-200">
              {prod.imagen_url ? (
                <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">Sin imagen</div>
              )}
              {esAdmin && (
                <button onClick={() => eliminarProducto(prod.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm">✕</button>
              )}
            </div>

            {/* Info del producto */}
            <div className="p-3 flex flex-col flex-grow">
              <h2 className="text-xs font-medium text-gray-600 line-clamp-2 uppercase tracking-wide min-h-[32px]">{prod.nombre}</h2>
              <p className="text-lg font-black text-gray-900 mt-1">{TIENDA_CONFIG.moneda}{prod.precio}</p>

              {!esAdmin && (
                <button 
                  onClick={() => setCarrito([...carrito, prod])}
                  className={`mt-auto w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${btnColor} text-white opacity-90 hover:opacity-100`}
                >
                  Agregar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- CARRITO FLOTANTE (CHECKOUT) --- */}
      {!esAdmin && carrito.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center z-50 animate-bounce-in">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Total a Pagar</span>
            <span className="font-black text-2xl">{TIENDA_CONFIG.moneda}{carrito.reduce((acc, p) => acc + p.precio, 0)}</span>
            <span className="text-[10px] text-gray-400">{carrito.length} artículos</span>
          </div>
          <button 
            onClick={enviarPedidoWhatsApp}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2"
          >
            <span>PEDIR POR WHATSAPP</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
