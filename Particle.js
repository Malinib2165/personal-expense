import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import "../App.css";


const Particle = () => {
  const particlesInit = useCallback(async (engine) => {
    console.log(engine);
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    await console.log(container);
  }, []);
  return (
    <>
    <div className="w-full h-full">
    <Particles
      id="firefly-particles"
      className="w-full h-screen"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        fullScreen: {
          enable: true,
          fullScreen: false,
        },
        background: {
          image: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        },
        fpsLimit: 60,
        particles: {
          number: {
            value: 160,
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: ["#6366f1", "#a855f7", "#ec4899", "#ffcc00"],
          },
          shape: {
            type: 'circle',
          },
          opacity: {
            value: { min: 0.1, max: 0.6 },
            animation: { enable: true, speed: 1, sync: false },
          },
          size: {
            value: { min: 2, max: 6 },
            animation: { enable: true, speed: 2, sync: false },
          },
          shadow: {
            enable: true,
            color: "#ffffff",
            blur: 8,
          },
          links: {
            enable: false,
          },
          move: {
            enable: true,
            speed: 0.6,
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: 'out',
            },
            attract: { enable: true, rotateX: 600, rotateY: 1200 },
          },
          life: {
            duration: {
              sync: false,
              value: 3,
            },
            count: 0,
            delay: {
              random: {
                enable: true,
                minimumValue: 0.5,
              },
              value: 1,
            },
          },
        },
      }}
    />
    </div>
    </>
  );
};

export default Particle;
