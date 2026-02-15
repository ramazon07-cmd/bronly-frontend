/**
 * BRONLY WebGL2 Hero Effects
 * Particle system, glow effects, and animations
 * Inline version - no ES6 modules
 */

function initWebGLHero() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) {
        console.log('WebGL canvas not found, using fallback');
        initFallbackHero();
        return;
    }

    // Check for WebGL2 support
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.log('WebGL2 not supported, using fallback');
        initFallbackHero();
        return;
    }

    // Resize canvas
    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Vertex shader
    const vertexShaderSource = `#version 300 es
        in vec2 a_position;
        in float a_size;
        in vec3 a_color;
        
        uniform float u_time;
        uniform vec2 u_resolution;
        
        out vec3 v_color;
        out float v_size;
        
        void main() {
            v_color = a_color;
            v_size = a_size;
            
            vec2 position = a_position;
            
            // Subtle floating animation
            position.y += sin(u_time * 0.5 + position.x * 3.0) * 0.02;
            position.x += cos(u_time * 0.3 + position.y * 3.0) * 0.015;
            
            gl_Position = vec4(position, 0.0, 1.0);
            gl_PointSize = a_size * (u_resolution.y / 1080.0);
        }
    `;

    // Fragment shader
    const fragmentShaderSource = `#version 300 es
        precision highp float;
        
        in vec3 v_color;
        in float v_size;
        
        out vec4 outColor;
        
        void main() {
            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            
            if (dist > 0.5) {
                discard;
            }
            
            // Soft glow effect
            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            alpha = pow(alpha, 1.5);
            
            outColor = vec4(v_color, alpha * 0.8);
        }
    `;

    // Create shaders
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
        initFallbackHero();
        return;
    }

    // Create program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        initFallbackHero();
        return;
    }

    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const sizeLocation = gl.getAttribLocation(program, 'a_size');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    // Create particles
    const particleCount = 80;
    const positions = new Float32Array(particleCount * 2);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        // Random position
        positions[i * 2] = (Math.random() - 0.5) * 2;
        positions[i * 2 + 1] = (Math.random() - 0.5) * 2;
        
        // Random size
        sizes[i] = Math.random() * 4 + 2;
        
        // Golden/orange color palette
        const hue = 30 + Math.random() * 20; // 30-50 (golden/orange)
        const saturation = 0.7 + Math.random() * 0.3;
        const lightness = 0.5 + Math.random() * 0.3;
        
        const color = hslToRgb(hue / 360, saturation, lightness);
        colors[i * 3] = color[0];
        colors[i * 3 + 1] = color[1];
        colors[i * 3 + 2] = color[2];
    }

    // Create buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Animation loop
    let startTime = performance.now();
    let animationId;

    function render() {
        const currentTime = (performance.now() - startTime) / 1000;

        // Clear canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Use program
        gl.useProgram(program);

        // Set uniforms
        gl.uniform1f(timeLocation, currentTime);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Bind size buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
        gl.enableVertexAttribArray(sizeLocation);
        gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);

        // Bind color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        // Draw particles
        gl.drawArrays(gl.POINTS, 0, particleCount);

        animationId = requestAnimationFrame(render);
    }

    // Start animation
    render();

    // Cleanup on page hide
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            render();
        }
    });
}

// Fallback for no WebGL support
function initFallbackHero() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    // Create CSS-based particle animation
    canvas.style.background = `
        radial-gradient(circle at 20% 30%, rgba(252, 163, 17, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(252, 163, 17, 0.1) 0%, transparent 35%),
        radial-gradient(circle at 50% 50%, rgba(20, 33, 61, 0.5) 0%, transparent 60%)
    `;

    // Add floating particles via CSS
    const particleContainer = document.createElement('div');
    particleContainer.style.cssText = `
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
    `;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 4 + 2;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 10 + Math.random() * 10;

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(252, 163, 17, ${0.3 + Math.random() * 0.4});
            border-radius: 50%;
            left: ${x}%;
            top: ${y}%;
            animation: float ${duration}s ease-in-out ${delay}s infinite;
            box-shadow: 0 0 ${size * 2}px rgba(252, 163, 17, 0.5);
        `;

        particleContainer.appendChild(particle);
    }

    canvas.parentElement.appendChild(particleContainer);
}

// HSL to RGB conversion
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r, g, b];
}
