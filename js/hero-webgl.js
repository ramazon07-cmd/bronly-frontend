/**
 * BRONLY - WebGL Hero Background
 * Animated particle grid with connections
 */

export class HeroWebGL {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.warn('WebGL not supported, falling back to CSS');
            return;
        }
        
        this.particles = [];
        this.connections = [];
        this.mouse = { x: 0, y: 0, active: false };
        this.scrollProgress = 0;
        
        // Settings
        this.settings = {
            particleCount: window.innerWidth < 768 ? 30 : 60,
            connectionDistance: 150,
            particleSize: 2,
            baseSpeed: 0.3,
            mouseRadius: 200,
            mouseForce: 0.02,
            gridSpacing: 80
        };
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createParticles();
        this.setupEventListeners();
        this.compileShaders();
        this.createBuffers();
        this.animate();
    }
    
    resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        const rect = this.canvas.parentElement.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
        this.width = rect.width;
        this.height = rect.height;
        this.dpr = dpr;
    }
    
    createParticles() {
        this.particles = [];
        
        // Create grid-based particles with randomness
        const cols = Math.ceil(this.width / this.settings.gridSpacing);
        const rows = Math.ceil(this.height / this.settings.gridSpacing);
        
        for (let i = 0; i < this.settings.particleCount; i++) {
            // Grid position with random offset
            const col = (i % cols);
            const row = Math.floor(i / cols);
            
            const baseX = (col / cols) * this.width;
            const baseY = (row / rows) * this.height;
            
            const x = baseX + (Math.random() - 0.5) * this.settings.gridSpacing * 0.5;
            const y = baseY + (Math.random() - 0.5) * this.settings.gridSpacing * 0.5;
            
            this.particles.push({
                x: x,
                y: y,
                baseX: x,
                baseY: y,
                vx: (Math.random() - 0.5) * this.settings.baseSpeed,
                vy: (Math.random() - 0.5) * this.settings.baseSpeed,
                size: this.settings.particleSize + Math.random() * 2,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 0.5,
                connections: 0
            });
        }
    }
    
    compileShaders() {
        const gl = this.gl;
        
        // Vertex shader
        const vertexSource = `
            attribute vec2 a_position;
            attribute float a_size;
            attribute vec3 a_color;
            
            varying vec3 v_color;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                gl_PointSize = a_size;
                v_color = a_color;
            }
        `;
        
        // Fragment shader
        const fragmentSource = `
            precision mediump float;
            varying vec3 v_color;
            
            void main() {
                float dist = distance(gl_PointCoord, vec2(0.5));
                if (dist > 0.5) discard;
                
                float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                gl_FragColor = vec4(v_color, alpha);
            }
        `;
        
        // Compile vertex shader
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);
        
        // Compile fragment shader
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);
        
        // Create program
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        
        // Get attribute locations
        this.positionLoc = gl.getAttribLocation(this.program, 'a_position');
        this.sizeLoc = gl.getAttribLocation(this.program, 'a_size');
        this.colorLoc = gl.getAttribLocation(this.program, 'a_color');
    }
    
    createBuffers() {
        const gl = this.gl;
        
        // Create buffers
        this.positionBuffer = gl.createBuffer();
        this.sizeBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
    }
    
    updateParticles() {
        const time = performance.now() * 0.001;
        
        this.particles.forEach(p => {
            // Wave motion based on sine waves
            const waveX = Math.sin(time * p.speed + p.phase) * 20;
            const waveY = Math.cos(time * p.speed * 0.7 + p.phase) * 15;
            
            // Mouse interaction
            if (this.mouse.active) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.settings.mouseRadius) {
                    const force = (this.settings.mouseRadius - dist) / this.settings.mouseRadius;
                    const angle = Math.atan2(dy, dx);
                    p.vx -= Math.cos(angle) * force * this.settings.mouseForce * 10;
                    p.vy -= Math.sin(angle) * force * this.settings.mouseForce * 10;
                }
            }
            
            // Apply velocity with damping
            p.vx *= 0.98;
            p.vy *= 0.98;
            
            // Base movement
            p.x += p.vx + Math.sin(time * 0.5 + p.phase) * 0.2;
            p.y += p.vy + Math.cos(time * 0.3 + p.phase) * 0.2;
            
            // Keep particles in bounds with soft boundaries
            const margin = 50;
            if (p.x < margin) p.vx += 0.1;
            if (p.x > this.width - margin) p.vx -= 0.1;
            if (p.y < margin) p.vy += 0.1;
            if (p.y > this.height - margin) p.vy -= 0.1;
            
            // Reset connections count
            p.connections = 0;
        });
    }
    
    drawConnections() {
        const gl = this.gl;
        
        // Draw connections as lines
        const linePositions = [];
        const lineColors = [];
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.settings.connectionDistance) {
                    const opacity = 1 - (dist / this.settings.connectionDistance);
                    
                    // WebGL coordinates (-1 to 1)
                    const x1 = (p1.x / this.width) * 2 - 1;
                    const y1 = 1 - (p1.y / this.height) * 2;
                    const x2 = (p2.x / this.width) * 2 - 1;
                    const y2 = 1 - (p2.y / this.height) * 2;
                    
                    linePositions.push(x1, y1, x2, y2);
                    lineColors.push(
                        0.988, 0.639, 0.067, opacity * 0.5,
                        0.988, 0.639, 0.067, opacity * 0.5
                    );
                    
                    p1.connections++;
                    p2.connections++;
                }
            }
        }
        
        if (linePositions.length === 0) return;
        
        // Use a simple line shader
        const lineVertexSource = `
            attribute vec2 a_position;
            attribute vec4 a_color;
            varying vec4 v_color;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_color = a_color;
            }
        `;
        
        const lineFragmentSource = `
            precision mediump float;
            varying vec4 v_color;
            
            void main() {
                gl_FragColor = v_color;
            }
        `;
        
        // Create line program (cache this in production)
        const lineProgram = gl.createProgram();
        const lineVert = gl.createShader(gl.VERTEX_SHADER);
        const lineFrag = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(lineVert, lineVertexSource);
        gl.shaderSource(lineFrag, lineFragmentSource);
        gl.compileShader(lineVert);
        gl.compileShader(lineFrag);
        gl.attachShader(lineProgram, lineVert);
        gl.attachShader(lineProgram, lineFrag);
        gl.linkProgram(lineProgram);
        
        gl.useProgram(lineProgram);
        
        // Position buffer
        const linePosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, linePosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linePositions), gl.STATIC_DRAW);
        
        const linePosLoc = gl.getAttribLocation(lineProgram, 'a_position');
        gl.enableVertexAttribArray(linePosLoc);
        gl.vertexAttribPointer(linePosLoc, 2, gl.FLOAT, false, 0, 0);
        
        // Color buffer
        const lineColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineColors), gl.STATIC_DRAW);
        
        const lineColorLoc = gl.getAttribLocation(lineProgram, 'a_color');
        gl.enableVertexAttribArray(lineColorLoc);
        gl.vertexAttribPointer(lineColorLoc, 4, gl.FLOAT, false, 0, 0);
        
        // Enable blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        
        gl.drawArrays(gl.LINES, 0, linePositions.length / 2);
        
        // Cleanup
        gl.deleteBuffer(linePosBuffer);
        gl.deleteBuffer(lineColorBuffer);
        gl.deleteProgram(lineProgram);
        gl.deleteShader(lineVert);
        gl.deleteShader(lineFrag);
    }
    
    drawParticles() {
        const gl = this.gl;
        
        gl.useProgram(this.program);
        
        // Prepare particle data
        const positions = [];
        const sizes = [];
        const colors = [];
        
        this.particles.forEach(p => {
            // WebGL coordinates (-1 to 1)
            const x = (p.x / this.width) * 2 - 1;
            const y = 1 - (p.y / this.height) * 2;
            
            positions.push(x, y);
            
            // Size based on connections (glow effect)
            const sizeMultiplier = 1 + (p.connections * 0.2);
            sizes.push(p.size * sizeMultiplier * this.dpr);
            
            // Color: orange accent with variation
            const brightness = 0.5 + (p.connections * 0.1);
            colors.push(0.988 * brightness, 0.639 * brightness, 0.067);
        });
        
        // Update buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(this.positionLoc);
        gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(this.sizeLoc);
        gl.vertexAttribPointer(this.sizeLoc, 1, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(this.colorLoc);
        gl.vertexAttribPointer(this.colorLoc, 3, gl.FLOAT, false, 0, 0);
        
        // Enable blending for glow effect
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        
        // Draw particles
        gl.drawArrays(gl.POINTS, 0, this.particles.length);
    }
    
    animate() {
        const gl = this.gl;
        
        // Clear with transparent background
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        this.updateParticles();
        this.drawConnections();
        this.drawParticles();
        
        requestAnimationFrame(() => this.animate());
    }
    
    setupEventListeners() {
        // Mouse tracking
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left);
            this.mouse.y = (e.clientY - rect.top);
            this.mouse.active = true;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.active = false;
        });
        
        // Touch support
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouse.x = (touch.clientX - rect.left);
            this.mouse.y = (touch.clientY - rect.top);
            this.mouse.active = true;
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', () => {
            this.mouse.active = false;
        });
        
        // Resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resize();
                this.createParticles();
            }, 250);
        });
        
        // Scroll zoom effect
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroHeight = this.canvas.parentElement.offsetHeight;
            this.scrollProgress = Math.min(scrollY / heroHeight, 1);
            
            // Adjust particle speed based on scroll
            this.settings.baseSpeed = 0.3 * (1 + this.scrollProgress * 2);
        }, { passive: true });
    }
    
    destroy() {
        // Cleanup
        this.gl.deleteProgram(this.program);
        this.gl.deleteBuffer(this.positionBuffer);
        this.gl.deleteBuffer(this.sizeBuffer);
        this.gl.deleteBuffer(this.colorBuffer);
    }
}

// Initialize
export function initHeroWebGL() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return null;
    
    return new HeroWebGL('hero-canvas');
}

export default HeroWebGL;
