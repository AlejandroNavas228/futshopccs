import React from 'react';

export default function Hero() {
  return (
    <div className="relative w-full h-[85vh] bg-gray-900 overflow-hidden">
      
      {/* 1. IMAGEN DE FONDO (Con efecto Parallax suave) */}
      <img 
        src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=2565&auto=format&fit=crop" // Foto de fútbol profesional de Unsplash
        alt="Hero Banner" 
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* 2. CAPA DE GRADIENTE (Para que el texto se lea bien) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

      {/* 3. CONTENIDO DE TEXTO */}
      <div className="relative h-full flex flex-col justify-center items-center text-center px-4 animate-fade-in-up">
        
        <span className="text-yellow-400 tracking-[0.3em] text-xs font-bold uppercase mb-4 border border-yellow-400 px-4 py-1 rounded-full">
          Temporada 2026
        </span>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white font-bold tracking-tighter mb-6 shadow-sm">
          FÚTBOL <br className="md:hidden"/> STORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">CCS</span>
        </h1>
        
        <p className="text-gray-300 text-sm md:text-lg max-w-lg font-light tracking-wide mb-10 leading-relaxed">
          La colección más exclusiva de indumentaria deportiva. 
          Calidad profesional para quienes viven el juego dentro y fuera de la cancha.
        </p>

        {/* 4. BOTONES DE ACCIÓN */}
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <button className="bg-white text-black px-8 py-4 font-bold text-sm tracking-widest uppercase hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Ver Colección
          </button>
          <button className="border border-white text-white px-8 py-4 font-bold text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all">
            Nuestro Instagram
          </button>
        </div>

      </div>
      
      {/* Decoración inferior (Scroll Indicator) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}