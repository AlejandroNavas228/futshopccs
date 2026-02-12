import React from 'react';

export default function Navbar({ 
  nombreTienda, 
  carritoCount, 
  toggleCarrito, 
  moneda, 
  toggleMoneda, 
  tasa,
  esAdmin,
  toggleAdmin 
}) {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 1. LOGO (Izquierda) */}
          <div className="flex-shrink-0 flex items-center cursor-pointer">
            <h1 className="font-serif text-2xl font-bold tracking-tighter text-gray-900 hover:opacity-80 transition-opacity">
              {nombreTienda}
            </h1>
          </div>

          {/* 2. MENÚ CENTRAL (Desktop) - Decorativo estilo Figma */}
          <div className="hidden md:flex space-x-8">
            <span className="text-xs font-medium text-gray-500 hover:text-black cursor-pointer tracking-widest uppercase">Inicio</span>
            <span className="text-xs font-medium text-gray-500 hover:text-black cursor-pointer tracking-widest uppercase">Colección</span>
            <span className="text-xs font-medium text-gray-500 hover:text-black cursor-pointer tracking-widest uppercase">Nosotros</span>
          </div>

          {/* 3. ÍCONOS DE ACCIÓN (Derecha) */}
          <div className="flex items-center space-x-4">
            
            {/* Switch Moneda Minimalista */}
            <button 
              onClick={toggleMoneda}
              className="group flex flex-col items-end mr-2"
            >
              <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {moneda === 'USD' ? 'USD ($)' : 'VES (Bs)'}
              </span>
              {moneda === 'VES' && (
                <span className="text-[9px] text-gray-400">Tasa: {tasa}</span>
              )}
            </button>

            {/* Botón Admin (Discreto) */}
            <button 
              onClick={toggleAdmin}
              className={`p-2 rounded-full transition-all ${esAdmin ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </button>

            {/* Carrito (Con contador estilo burbuja) */}
            <button 
              onClick={toggleCarrito}
              className="relative p-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {carritoCount > 0 && (
                <span className="absolute top-1 right-0 bg-black text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {carritoCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}