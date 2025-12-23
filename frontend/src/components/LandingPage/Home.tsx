import React from "react";
import { Link } from "react-router-dom";
import Background from "./Background";


const Home = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Background with glowing blobs */}
      <Background count={5} seed={11} strength="strong" blendMode="screen" />
      
      {/* Hero Content */}
      <div className="relative z-10 max-w-2xl text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
          Smarter Budgeting.
          <br className="hidden md:block" />
          <span className="text-yellow-400"> Simplified Finance.</span>
        </h1>

        <p className="mt-6 text-gray-300 text-lg">
          Take control of your spending and savings with real-time insights —
          no spreadsheets, no stress.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/signup"
            className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-md hover:bg-yellow-300 transition"
          >
            Create Account
          </a>
          
          <a
            href="/signin"
            className="border border-yellow-400 text-yellow-400 px-6 py-3 rounded-md font-medium hover:bg-yellow-400 hover:text-black transition"
          >
            Sign In
          </a>
        </div>

        <p className="mt-4 text-sm text-gray-400">
          Free to use • Cancel anytime
        </p>
      </div>
    </section>
  );
};
export default Home;