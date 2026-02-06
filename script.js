document.addEventListener('DOMContentLoaded', () => {
    // Tailwind Configuration
    tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                colors: {
                    "primary": "#ee2b8c",
                    "background-light": "#fdf8f9",
                    "background-dark": "#221019",
                },
                fontFamily: {
                    "display": ["Plus Jakarta Sans", "sans-serif"]
                },
                borderRadius: {
                    "DEFAULT": "1rem",
                    "lg": "2rem",
                    "xl": "3rem",
                    "full": "9999px"
                },
            },
        },
    };

    // Prank Logic (Only runs if elements exist)
    const noBtn = document.getElementById('noButton');
    const yesBtn = document.getElementById('yesBtn');
    const playArea = document.getElementById('playArea');

    if (noBtn && yesBtn && playArea) {
        let yesScale = 1;
        const dangerRadius = 120; // Radius where "No" starts running

        // Initial positioning: Place "No" button nicely next to "Yes" button
        function setInitialPosition() {
            const containerRect = playArea.getBoundingClientRect();
            const yesRect = yesBtn.getBoundingClientRect();

            // Calculate position relative to container
            // Place to the right of Yes button with some gap
            // We use transform for everything, so left/top are 0
            const initialX = (yesRect.right - containerRect.left) + 40;
            const initialY = (yesRect.top - containerRect.top) + (yesRect.height - noBtn.offsetHeight) / 2;

            // Make sure it's within bounds (simple check)
            const maxX = containerRect.width - noBtn.offsetWidth;
            const x = Math.min(initialX, maxX - 10);

            noBtn.style.transform = `translate(${x}px, ${initialY}px)`;
        }

        // Run initial position after a slight delay to ensure layout is settled
        setTimeout(setInitialPosition, 100);
        window.addEventListener('resize', setInitialPosition);

        function escapeNo(e) {
            const containerRect = playArea.getBoundingClientRect();
            const btnRect = noBtn.getBoundingClientRect();

            const maxX = containerRect.width - btnRect.width;
            const maxY = containerRect.height - btnRect.height;

            // Mouse position (if triggered by event)
            const mx = e ? (e.clientX || (e.touches ? e.touches[0].clientX : 0)) : 0;
            const my = e ? (e.clientY || (e.touches ? e.touches[0].clientY : 0)) : 0;

            let newX, newY, dist;
            let safe = false;

            // Retry up to 10 times to find a safe spot
            for (let i = 0; i < 10; i++) {
                newX = Math.random() * maxX;
                newY = Math.random() * maxY;

                // Convert new container-relative coord to screen coord to check distance
                const screenX = containerRect.left + newX + btnRect.width / 2;
                const screenY = containerRect.top + newY + btnRect.height / 2;

                dist = Math.hypot(mx - screenX, my - screenY);

                if (dist > 150) { // Safe distance from mouse
                    safe = true;
                    break;
                }
            }

            // Apply move
            noBtn.style.transform = `translate(${newX}px, ${newY}px)`;

            // Grow YES
            growYes();
        }

        function growYes() {
            if (yesScale < 2.2) {
                yesScale += 0.08;
                yesBtn.style.transform = `scale(${yesScale})`;

                // Enhance glow/shadow
                const shadowIntensity = (yesScale - 1) * 20 + 20; // Base 20, grows
                yesBtn.style.boxShadow = `0 10px ${shadowIntensity}px -5px rgba(238,43,140,${0.5 + (yesScale - 1) * 0.3})`;
            }
        }

        // 1. Proximity Dodge (Desktop)
        window.addEventListener('mousemove', (e) => {
            const rect = noBtn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

            if (dist < dangerRadius) {
                escapeNo(e);
            }
        });

        // 2. Hover Dodge (Backup)
        noBtn.addEventListener('mouseenter', (e) => {
            escapeNo(e);
        });

        // 3. Click/Touch Dodge (Mobile + Anti-click)
        noBtn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            escapeNo(e);
        });

        // Also prevent click just in case
        noBtn.addEventListener('click', (e) => {
            e.preventDefault();
        });
    }
});
