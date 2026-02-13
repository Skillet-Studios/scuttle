import React from "react";
import Overview from "../components/Overview";
import Resources from "../components/Resources";
import About from "../components/About";
import Commands from "../components/Commands";

import { useEffect, useState } from "react";
import Footer from "../components/Footer";

const Home = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [screenSize]);

  return (
    <>
      <div className="mx-8">
        <div className="sm:max-w-screen-sm sm:mx-auto md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl my-16">
          <Overview />
          <div className="mt-20">
            <Resources />
          </div>
          <div className="mt-20">
            <About />
          </div>
          <div className="mt-20">
            <Commands />
          </div>
          <div className="mt-36">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
