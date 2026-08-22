import React from "react";
import { Link } from "react-router-dom";

const apps = [
  { text: "R", bg: "#fff", color: "#111", x: 90, y: 35 },
  { text: "K", bg: "#292d32", color: "#fff", x: 155, y: 35 },
  { text: "✓", bg: "#fff", color: "#111", x: 220, y: 35 },
  { text: "▥", bg: "#fff", color: "#111", x: 285, y: 35 },

  { text: "Air", bg: "#ff385c", color: "#fff", x: 90, y: 90 },
  { text: "◎", bg: "#fff", color: "#111", x: 155, y: 90 },
  { text: "✣", bg: "#fff", color: "#111", x: 285, y: 90 },

  { text: "7", bg: "#7bdd55", color: "#111", x: 90, y: 145 },
  { text: "C", bg: "#149ee8", color: "#fff", x: 155, y: 145 },
  { text: "C", bg: "#4285f4", color: "#fff", x: 220, y: 145 },
  { text: "P", bg: "#123e91", color: "#fff", x: 285, y: 145 },

  { text: "◈", bg: "#fff", color: "#111", x: 220, y: 200 },
  { text: "D", bg: "#52c66a", color: "#fff", x: 285, y: 200 },

  { text: "8", bg: "#ffb6bd", color: "#fff", x: 490, y: 35 },
  { text: "deal.", bg: "#191919", color: "#fff", x: 555, y: 35 },
  { text: "✦", bg: "#ff5bb4", color: "#fff", x: 685, y: 35 },

  { text: "◎", bg: "#fff", color: "#111", x: 490, y: 90 },
  { text: "✈", bg: "#fff", color: "#111", x: 555, y: 90 },
  { text: "∞", bg: "#191919", color: "#fff", x: 620, y: 90 },
  { text: "B", bg: "#27d98b", color: "#111", x: 685, y: 90 },

  { text: "H", bg: "#ff6940", color: "#fff", x: 490, y: 145 },
  { text: "◎", bg: "#fff", color: "#111", x: 555, y: 145 },
  { text: "S", bg: "#635bff", color: "#fff", x: 620, y: 145 },

  { text: "shop", bg: "#673cff", color: "#fff", x: 490, y: 200 },
  { text: "R", bg: "#fff", color: "#111", x: 555, y: 200 },
  { text: "Z", bg: "#191919", color: "#fff", x: 620, y: 200 },
  { text: "U", bg: "#7658ff", color: "#fff", x: 685, y: 200 },

  { text: "i", bg: "#ff5438", color: "#fff", x: 425, y: 255 },
  { text: "N", bg: "#fff", color: "#111", x: 490, y: 255 },
  { text: "X", bg: "#fff", color: "#111", x: 620, y: 255 },
  { text: "≡", bg: "#fff", color: "#111", x: 685, y: 255 },
];

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center overflow-hidden font-sans px-5">

      <div className="w-full max-w-[1050px] flex flex-col items-center">

        {/* 404 */}
        <div className="relative select-none">
          <h1
            className="
              text-[150px]
              sm:text-[190px]
              md:text-[230px]
              lg:text-[260px]
              leading-none
              font-bold
              tracking-[-0.09em]
              text-[#f3f3f3]
            "
          >
            404
          </h1>

          {/* Small orange accent */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-14 h-1 rounded-full bg-orange-500" />
        </div>

        {/* Main message */}
        <div className="text-center mt-8 relative z-20">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Page not found
          </h2>

          <p className="mt-2 text-sm sm:text-[15px] text-[#858585] max-w-md mx-auto">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <Link
            to="/dashboard"
            className="
              inline-flex
              items-center
              justify-center
              mt-7
              h-[50px]
              px-7
              rounded-full
              bg-[#2d6ff3]
              hover:bg-[#3b7cff]
              text-white
              text-[15px]
              font-medium
              transition-all
              duration-200
              hover:-translate-y-0.5
              active:translate-y-0
            "
          >
            Go Back Home
          </Link>
        </div>

        {/* Decorative app logos */}
        <div
          className="
            relative
            w-[800px]
            h-[310px]
            max-w-[100vw]
            mt-[-5px]
            scale-[0.72]
            sm:scale-[0.82]
            md:scale-[0.92]
            lg:scale-100
            origin-top
            pointer-events-none
            opacity-90
          "
        >
          {apps.map((app, index) => (
            <div
              key={`${app.text}-${index}`}
              className="
                absolute
                w-[45px]
                h-[45px]
                rounded-[9px]
                flex
                items-center
                justify-center
                font-bold
                text-[17px]
                shadow-[0_6px_18px_rgba(0,0,0,0.2)]
              "
              style={{
                left: `${app.x}px`,
                top: `${app.y}px`,
                backgroundColor: app.bg,
                color: app.color,
              }}
            >
              {app.text}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};