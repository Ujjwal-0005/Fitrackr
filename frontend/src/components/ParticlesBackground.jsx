import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const ParticlesBackground = () => {
    const particlesInit = useCallback(async (engine) => {
        // Load the slim version for better performance
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                background: {
                    color: {
                        value: "transparent"
                    }
                },
                fpsLimit: 120,
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: "repulse"
                        },
                        resize: true
                    },
                    modes: {
                        repulse: {
                            distance: 100,
                            duration: 0.4
                        }
                    }
                },
                particles: {
                    color: {
                        value: "#FE9A00"
                    },
                    links: {
                        color: "#FE9A00",
                        distance: 150,
                        enable: true,
                        opacity: 0.1,
                        width: 1
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "out"
                        },
                        random: true,
                        speed: 1,
                        straight: false
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800
                        },
                        value: 80
                    },
                    opacity: {
                        value: 0.15,
                        random: true,
                        animation: {
                            enable: true,
                            speed: 0.5,
                            minimumValue: 0.05,
                            sync: false
                        }
                    },
                    shape: {
                        type: "circle"
                    },
                    size: {
                        value: { min: 0.5, max: 3 },
                        random: true,
                        animation: {
                            enable: true,
                            speed: 2,
                            minimumValue: 0.5,
                            sync: false
                        }
                    }
                },
                detectRetina: true
            }}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -1,
                background: "linear-gradient(135deg, #0f1115 0%, #1a1d23 50%, #0f1115 100%)"
            }}
        />
    );
};

export default ParticlesBackground;
