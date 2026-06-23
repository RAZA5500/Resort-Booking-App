import React from 'react';
import Card from './Cards/Cards';

const App = () => {
  const cardsData = [
    {
      id: 1,
      image: "https://picsum.photos/id/1052/800/600",
      title: "Santorini Villa",
      description: "Luxury villa overlooking the Aegean Sea, offering breathtaking sunset views and a private infinity pool for ultimate relaxation.",
      tags: [
        { text: "4.5 ⭐⭐⭐⭐⭐" },
        { text: "3 Night Stay" }
      ]
    },
    {
      id: 2,
      image: "https://picsum.photos/id/1018/800/600",
      title: "Swiss Chalet",
      description: "Cozy wooden chalet nestled in the Swiss Alps, offering a warm fireplace, scenic mountain views, and direct access to ski slopes.",
      tags: [
        { icon: "🏆", text: "Guest Favorite" },
        { text: "4 Night Stay" }
      ]
    },
    {
      id: 3,
      image: "https://picsum.photos/id/1044/800/600",
      title: "Bali Treehouse",
      description: "An eco-friendly bamboo treehouse hidden in the lush jungles of Bali, featuring open-air design and stunning valley views.",
      tags: [
        { icon: "🌿", text: "Eco-friendly" },
        { text: "4.8 ⭐" }
      ]
    },
    {
      id: 4,
      image: "https://picsum.photos/id/1048/800/600",
      title: "Tokyo Penthouse",
      description: "Ultra-modern luxury penthouse in the heart of Shinjuku with panoramic city skyline views and private jacuzzi.",
      tags: [
        { icon: "🏙️", text: "City View" },
        { text: "5.0 ⭐" }
      ]
    },
    {
      id: 5,
      image: "https://picsum.photos/id/1041/800/600",
      title: "Maldives Bungalow",
      description: "Exclusive overwater villa offering direct access to the crystal-clear lagoon, private deck, and glass-bottom floors.",
      tags: [
        { icon: "🌊", text: "Beachfront" },
        { text: "Trending" }
      ]
    },
    {
      id: 6,
      image: "https://picsum.photos/id/1015/800/600",
      title: "Sahara Glamping",
      description: "Experience the magic of the desert under the stars in a luxurious glamping tent with authentic Berber hospitality.",
      tags: [
        { icon: "🐪", text: "Unique" },
        { text: "1 Night Stay" }
      ]
    },
    {
      id: 7,
      image: "https://picsum.photos/id/1040/800/600",
      title: "Lake Como Retreat",
      description: "Elegant apartment with a spacious terrace overlooking the serene waters of Lake Como and surrounding mountains.",
      tags: [
        { icon: "⛵", text: "Lakefront" },
        { text: "4.9 ⭐" }
      ]
    },
    {
      id: 8,
      image: "https://picsum.photos/id/1069/800/600",
      title: "Aurora Igloo",
      description: "Sleep under the Northern Lights in a heated glass igloo surrounded by the pristine snowy landscape of Lapland.",
      tags: [
        { icon: "✨", text: "Rare Find" },
        { text: "Winter Special" }
      ]
    }
  ];

  return (
    <div className='min-h-screen bg-[#020617] relative overflow-hidden font-sans selection:bg-indigo-500/30'>
      {/* Gorgeous Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className='relative z-10 container mx-auto px-6 pt-10 pb-24 flex flex-col items-center'>
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Premium Collection
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-slate-500">
            Extraordinary Stays
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed">
            Handpicked luxury destinations around the globe. Discover your next unforgettable getaway with our exclusive, world-class collection.
          </p>
        </div>

        {/* Cards Grid */}
        <div className='flex flex-wrap gap-12 justify-center max-w-[1400px]'>
          {cardsData.map((card) => (
            <Card 
              key={card.id}
              {...card}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
