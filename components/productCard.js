import React from 'react';

export default function ProductCard({ 
  producto, 
  precioFormateado, 
  esAdmin, 
  onAdd, 
  onDelete 
}) {
  return (
    <div className="group relative bg-white rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
      
      {/* 1. ÁREA DE IMAGEN (Galería Deslizable) */}
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        
        {/* Carrusel */}
        <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {producto.imagenes && producto.imagenes.length > 0 ? (
            producto.imagenes.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={producto.nombre}
                className="w-full h-full object-cover flex-shrink-0 snap-center transition-transform duration-700 group-hover:scale-105" 
              />
            ))
          ) : (
            <div className="flex w-full h-full items-center justify-center text-gray-300 text-xs">Sin imagen</div>
          )}
        </div>

        {/* Indicador de "Más fotos" (Solo si hay más de 1) */}
        {producto.imagenes && producto.imagenes.length > 1 && (
           <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md text-white text-[9px] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
             +{producto.imagenes.length - 1} fotos
           </div>
        )}

        {/* BOTÓN ELIMINAR (Solo Admin) */}
        {esAdmin && (
          <button 
            onClick={() => onDelete(producto.id)} 
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors z-20"
            title="Eliminar producto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        )}

        {/* BOTÓN AGREGAR (Aparece al pasar el mouse) */}
        {!esAdmin && (
          <button 
            onClick={() => onAdd(producto)}
            className="absolute bottom-4 right-4 bg-white text-black h-12 w-12 rounded-full flex items-center justify-center shadow-lg translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white z-10"
            title="Agregar al carrito"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        )}
      </div>

      {/* 2. INFO DEL PRODUCTO */}
      <div className="p-5">
        {/* Categoría o Etiqueta pequeña */}
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Original</p>
        
        {/* Nombre */}
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide truncate mb-2">
          {producto.nombre}
        </h3>
        
        {/* Precio */}
        <div className="flex justify-between items-end border-t border-gray-100 pt-3">
          <span className="text-lg font-serif font-medium text-gray-900">
            {precioFormateado}
          </span>
          <span className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-full font-bold">
            Disponible
          </span>
        </div>
      </div>
    </div>
  );
}