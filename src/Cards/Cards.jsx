import React from 'react';

const Card = ({ image, title, description, tags, buttonText = "Reserve now" }) => {
  return (
    <div className="relative w-[340px] h-[480px] rounded-[32px] overflow-hidden bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.5)] shrink-0 group transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(79,70,229,0.2)] ring-1 ring-white/10 hover:ring-indigo-500/50 cursor-pointer">
      {/* Background Image */}
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent transition-opacity duration-500 group-hover:opacity-90"></div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-7 text-white pb-7 z-10">
        <h2 className="text-[28px] font-semibold mb-2 tracking-tight drop-shadow-md">{title}</h2>
        <p className="text-[15px] text-slate-300 leading-snug mb-6 opacity-90 line-clamp-3 font-light drop-shadow-sm">
          {description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2.5 mb-8 text-[13px] font-medium">
          {tags.map((tag, index) => (
            <span key={index} className="px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-1.5 text-slate-100 border border-white/10 shadow-sm transition-colors group-hover:bg-white/20">
              {tag.icon && <span className="text-sm">{tag.icon}</span>}
              {tag.text}
            </span>
          ))}
        </div>
        
        {/* Button */}
        <button className="w-full py-4 bg-white/10 backdrop-blur-lg text-white font-semibold rounded-full hover:bg-white hover:text-slate-900 transition-all duration-300 text-[15px] border border-white/20 group-hover:border-white group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Card;
