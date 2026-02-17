import React, { useEffect, useState } from 'react';

const ClickSparkles = () => {
    const [sparkles, setSparkles] = useState([]);

    useEffect(() => {
        const handleClick = (e) => {
            const newSparkles = Array.from({ length: 8 }).map((_, i) => ({
                id: Date.now() + i,
                x: e.clientX,
                y: e.clientY,
                angle: (Math.PI * 2 * i) / 8,
                speed: 2 + Math.random() * 2,
                color: `hsl(${Math.random() * 360}, 100%, 70%)`,
            }));

            setSparkles((prev) => [...prev, ...newSparkles]);

            // Cleanup sparkles
            setTimeout(() => {
                setSparkles((prev) => prev.filter((s) => s.id < Date.now()));
            }, 800);
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 99999 }}>
            {sparkles.map((sparkle) => (
                <Sparkle key={sparkle.id} {...sparkle} />
            ))}
        </div>
    );
};

const Sparkle = ({ x, y, angle, speed, color }) => {
    const [position, setPosition] = useState({ x, y });
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const animate = () => {
            setPosition((prev) => ({
                x: prev.x + Math.cos(angle) * speed,
                y: prev.y + Math.sin(angle) * speed,
            }));
            setOpacity((prev) => prev - 0.04);
        };

        const interval = setInterval(animate, 20);
        return () => clearInterval(interval);
    }, [angle, speed]);

    if (opacity <= 0) return null;

    return (
        <div
            style={{
                position: 'absolute',
                top: position.y,
                left: position.x,
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: color,
                transform: 'translate(-50%, -50%)',
                opacity: opacity,
                boxShadow: `0 0 4px ${color}`,
            }}
        />
    );
};

export default ClickSparkles;
