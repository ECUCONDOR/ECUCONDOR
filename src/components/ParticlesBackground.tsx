'use client';

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "@tsparticles/engine";
import { ISourceOptions } from "@tsparticles/engine";

const particlesOptions: ISourceOptions = {
  fullScreen: {
    enable: true,
    zIndex: 0
  },
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 60,
  particles: {
    color: {
      value: "#FFD700",
    },
    links: {
      enable: true,
      color: "#FFD700",
      distance: 150,
      opacity: 0.2,
      width: 1,
    },
    move: {
      enable: true,
      direction: "none",
      outModes: {
        default: "bounce",
      },
      random: true,
      speed: 2,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 80,
    },
    opacity: {
      value: 0.3,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 3 },
    },
    twinkle: {
      particles: {
        enable: true,
        frequency: 0.05,
        opacity: 1
      }
    }
  },
  detectRetina: true,
};

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
    />
  );
}
