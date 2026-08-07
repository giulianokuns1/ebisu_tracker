import React from 'react';
import { loadSlim } from "tsparticles-slim";
import { useCallback } from "react";
import Particles from "react-particles";
import styles from './ParticlesBackground.module.scss';

const ParticlesBackground = () => {
    const particlesInit = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    const particlesLoaded = useCallback(async container => {
        // await console.log(container);
    }, []);


    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            height='700px'
            canvasClassName={styles.canvas}
            options={{
                particles: {
                    fpsLimit: 120,
                    number: {
                        value: 43,
                        density: { enable: true, value_area: 473.4885849793636 }
                    },
                    color: { value: "#51E0CF" },
                    shape: {
                        type: "circle",
                        stroke: { width: 0, color: "#51E0CF" },
                        polygon: { nb_sides: 6 },
                        image: { src: "img/github.svg" }
                    },
                    opacity: {
                        value: 0.3286994724774322,
                        random: false,
                        anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false }
                    },
                    size: {
                        value: 3,
                        random: false,
                        anim: { enable: false, speed: 40, size_min: 0.1, sync: false }
                    },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: "#51E0CF",
                        opacity: 0.4,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 1,
                        direction: "none",
                        random: false,
                        straight: false,
                        out_mode: "out",
                        bounce: false,
                        attract: { enable: false, rotateX: 600, rotateY: 1200 }
                    }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: { enable: false, mode: "grab" },
                        onclick: { enable: false, mode: "push" },
                        resize: true
                    },
                    modes: {
                        grab: { distance: 400, line_linked: { opacity: 1 } },
                        bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
                        repulse: { distance: 200, duration: 0.4 },
                        push: { particles_nb: 4 },
                        remove: { particles_nb: 2 }
                    }
                },
                detectRetina: true,
                fullScreen: { enable: false }
            }}
        />
    );
};

export default ParticlesBackground;
