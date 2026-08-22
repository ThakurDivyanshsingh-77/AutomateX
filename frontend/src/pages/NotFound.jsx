import React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const apps = [
  { name: "R", color: "#ffffff", text: "#111111" },
  { name: "K", color: "#292d32", text: "#ffffff" },
  { name: "Air", color: "#ff385c", text: "#ffffff" },
  { name: "◉", color: "#ffffff", text: "#111111" },
  { name: "7", color: "#7bdc55", text: "#111111" },
  { name: "F", color: "#111111", text: "#ffffff" },
  { name: "C", color: "#4285f4", text: "#ffffff" },
  { name: "✓", color: "#ffffff", text: "#111111" },

  { name: "▥", color: "#ffffff", text: "#111111" },
  { name: "✣", color: "#ffffff", text: "#111111" },
  { name: "P", color: "#123b8e", text: "#ffffff" },
  { name: "◒", color: "#222222", text: "#ffffff" },

  { name: "D", color: "#55c76a", text: "#ffffff" },
  { name: "●", color: "#8ce44d", text: "#111111" },
  { name: "N", color: "#ffffff", text: "#111111" },
  { name: "i", color: "#ff5538", text: "#ffffff" },
  { name: "deal.", color: "#202020", text: "#ffffff" },
  { name: "∞", color: "#181818", text: "#ffffff" },

  { name: "◎", color: "#ffffff", text: "#111111" },
  { name: "S", color: "#635bff", text: "#ffffff" },
  { name: "Z", color: "#181818", text: "#ffffff" },
  { name: "X", color: "#f3f3f3", text: "#111111" },
  { name: "Q", color: "#5227ff", text: "#ffffff" },
  { name: "B", color: "#27d98b", text: "#111111" },
  { name: "✦", color: "#ff69b4", text: "#ffffff" },
  { name: "◈", color: "#ffffff", text: "#111111" },

  { name: "SF", color: "#111111", text: "#ffffff" },
  { name: "U", color: "#7658ff", text: "#ffffff" },
  { name: "≡", color: "#eeeeee", text: "#111111" },
  { name: "◇", color: "#222222", text: "#ffffff" },
  { name: "✕", color: "#f5f5f5", text: "#111111" },
  { name: "◫", color: "#ffffff", text: "#111111" },

  { name: "✈", color: "#ffffff", text: "#111111" },
  { name: "H", color: "#ff6a3d", text: "#ffffff" },
  { name: "shop", color: "#633cff", text: "#ffffff" },
  { name: "8", color: "#ffb6bd", text: "#ffffff" },
];

const positions = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
  [0, 2],
  [1, 2],
  [2, 2],
  [2, 0],

  [3, 0],
  [3, 1],
  [3, 2],
  [4, 2],
  [4, 3],
  [4, 4],
  [5, 4],
  [5, 5],

  [7, 0],
  [7, 1],
  [7, 2],
  [8, 2],
  [8, 3],
  [8, 4],
  [8, 5],
  [9, 1],

  [10, 0],
  [10, 1],
  [10, 2],
  [10, 3],
  [10, 4],
  [10, 5],
  [9, 5],
  [6, 5],

  [6, 1],
  [6, 2],
  [6, 3],
  [5, 0],
];

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans overflow-hidden">
      {/* Navbar */}
      <header className="h-[100px] w-full flex items-center px-8 md:px-10">
        <div className="w-full flex items-center gap-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center shrink-0 group"
            aria-label="Home"
          >
            <div className="relative w-[48px] h-[30px]">
              <div className="absolute left-0 top-[7px] w-[16px] h-[13px] bg-white rounded-[2px] rotate-[45deg]" />
              <div className="absolute left-[12px] top-[7px] w-[23px] h-[13px] bg-white rounded-[2px]" />
              <div className="absolute right-0 top-0 w-[14px] h-[4px] bg-[#4385ff] rounded-sm" />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-[16px] text-[#dedede]">
            <Link
              to="/logos"
              className="hover:text-white transition-colors"
            >
              Logos
            </Link>

            <Link
              to="/og-images"
              className="hover:text-white transition-colors"
            >
              OG images
            </Link>

            <Link
              to="/blog"
              className="hover:text-white transition-colors"
            >
              Blog
            </Link>

            <Link
              to="/templates"
              className="hover:text-white transition-colors"
            >
              Templates
            </Link>

            <Link
              to="/html-to-figma"
              className="hover:text-white transition-colors"
            >
              Html to Figma
            </Link>
          </nav>

          {/* Search */}
          <div className="hidden md:flex flex-1 justify-center px-6">
            <div className="w-full max-w-[545px] h-[52px] rounded-full bg-[#252527] border border-[#38383a] flex items-center px-4 gap-3">
              <Search className="w-[21px] h-[21px] text-[#eeeeee]" />

              <input
                type="text"
                placeholder="Search sites..."
                className="flex-1 bg-transparent outline-none border-none text-[15px] text-white placeholder:text-[#77777c]"
              />
            </div>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-6 ml-auto">
            <Link
              to="/login"
              className="h-[45px] px-5 rounded-full border border-[#3d3d40] flex items-center justify-center text-[15px] text-white hover:bg-[#1d1d1f] transition-colors"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="h-[45px] px-6 rounded-full bg-white text-[#111111] flex items-center justify-center text-[15px] font-medium hover:bg-[#eeeeee] transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="min-h-[calc(100vh-100px)] flex flex-col items-center">
        {/* Floating logo composition */}
        <div className="relative mt-[115px] w-[690px] h-[400px] max-w-[90vw]">
          {apps.map((app, index) => {
            const position = positions[index];

            if (!position) return null;

            const [x, y] = position;

            return (
              <div
                key={`${app.name}-${index}`}
                className="absolute w-[45px] h-[45px] rounded-[9px] flex items-center justify-center font-bold text-[19px] shadow-[0_8px_25px_rgba(0,0,0,0.25)]"
                style={{
                  left: `${x * 74 + 12}px`,
                  top: `${y * 58}px`,
                  backgroundColor: app.color,
                  color: app.text,
                  transform: `translate(
                    ${Math.sin(index * 2.4) * 7}px,
                    ${Math.cos(index * 1.7) * 5}px
                  )`,
                }}
              >
                <span className="select-none">{app.name}</span>
              </div>
            );
          })}

          {/* Extra scattered logos */}
          <div className="absolute left-[80px] top-[120px] w-[45px] h-[45px] rounded-[9px] bg-[#00aaff] flex items-center justify-center text-white font-bold text-xl">
            C
          </div>

          <div className="absolute left-[210px] top-[195px] w-[45px] h-[45px] rounded-[9px] bg-[#ffffff] text-[#111] flex items-center justify-center font-bold">
            ◇
          </div>

          <div className="absolute left-[395px] top-[65px] w-[45px] h-[45px] rounded-[9px] bg-[#ffffff] text-[#111] flex items-center justify-center font-bold">
            ◎
          </div>

          <div className="absolute left-[515px] top-[195px] w-[45px] h-[45px] rounded-[9px] bg-[#ffffff] text-[#111] flex items-center justify-center font-bold">
            R
          </div>
        </div>

        {/* Error content */}
        <section className="text-center mt-[5px] px-5">
          <h1 className="text-[20px] md:text-[21px] font-normal tracking-[-0.02em] text-[#dddddd]">
            Oops! The page you&apos;re looking for doesn&apos;t exist.
          </h1>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center mt-7 h-[53px] px-8 rounded-full bg-[#2d6ff3] hover:bg-[#3b7cff] text-white text-[17px] font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Go Back Home
          </Link>
        </section>
      </main>
    </div>
  );
};