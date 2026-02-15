/**
 * BRONLY - Dashboard Preview Component
 * Auto-generated realistic dashboard mockup
 */

import { animateNumber } from './utils.js';

export class DashboardPreview {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.tiltX = 0;
        this.tiltY = 0;
        
        this.render();
        this.setupInteractions();
        this.animateStats();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="dashboard-mockup" id="dashboard-mockup">
                <div class="dashboard-mockup-sidebar">
                    <div class="dashboard-mockup-logo"></div>
                    <div class="dashboard-mockup-nav-item active"></div>
                    <div class="dashboard-mockup-nav-item"></div>
                    <div class="dashboard-mockup-nav-item"></div>
                    <div class="dashboard-mockup-nav-item"></div>
                    <div style="flex: 1;"></div>
                    <div class="dashboard-mockup-nav-item"></div>
                </div>
                <div class="dashboard-mockup-main">
                    <div class="dashboard-mockup-header">
                        <div class="dashboard-mockup-title">Dashboard Overview</div>
                        <div class="dashboard-mockup-actions">
                            <div class="dashboard-mockup-action"></div>
                            <div class="dashboard-mockup-action"></div>
                        </div>
                    </div>
                    <div class="dashboard-mockup-stats">
                        <div class="dashboard-mockup-stat">
                            <div class="dashboard-mockup-stat-header">
                                <span class="dashboard-mockup-stat-label">Total Reservations</span>
                                <div class="dashboard-mockup-stat-icon"></div>
                            </div>
                            <div class="dashboard-mockup-stat-value" data-value="2847">0</div>
                        </div>
                        <div class="dashboard-mockup-stat">
                            <div class="dashboard-mockup-stat-header">
                                <span class="dashboard-mockup-stat-label">Active Tables</span>
                                <div class="dashboard-mockup-stat-icon"></div>
                            </div>
                            <div class="dashboard-mockup-stat-value" data-value="42">0</div>
                        </div>
                        <div class="dashboard-mockup-stat">
                            <div class="dashboard-mockup-stat-header">
                                <span class="dashboard-mockup-stat-label">Revenue Today</span>
                                <div class="dashboard-mockup-stat-icon"></div>
                            </div>
                            <div class="dashboard-mockup-stat-value" data-value="8420">$0</div>
                        </div>
                        <div class="dashboard-mockup-stat">
                            <div class="dashboard-mockup-stat-header">
                                <span class="dashboard-mockup-stat-label">Occupancy Rate</span>
                                <div class="dashboard-mockup-stat-icon"></div>
                            </div>
                            <div class="dashboard-mockup-stat-value" data-value="87">0%</div>
                        </div>
                    </div>
                    <div class="dashboard-mockup-chart" id="mini-chart">
                        ${this.generateChartBars()}
                    </div>
                    <div class="dashboard-mockup-list">
                        ${this.generateListItems()}
                    </div>
                </div>
            </div>
        `;
    }
    
    generateChartBars() {
        const heights = [45, 72, 58, 89, 65, 92, 78, 85, 68, 95, 74, 88];
        return heights.map((height, i) => `
            <div class="dashboard-mockup-chart-bar" style="height: ${height}%; animation-delay: ${i * 0.05}s;"></div>
        `).join('');
    }
    
    generateListItems() {
        const items = [
            { title: 'The Golden Spoon', subtitle: 'Table 12 • 4 guests', status: 'Seated' },
            { title: 'Marco\'s Bistro', subtitle: 'Table 8 • 2 guests', status: 'Reserved' },
            { title: 'Bella Vista', subtitle: 'Table 15 • 6 guests', status: 'Seated' },
            { title: 'The Oak Room', subtitle: 'Table 3 • 2 guests', status: 'Available' }
        ];
        
        return items.map(item => `
            <div class="dashboard-mockup-list-item">
                <div class="dashboard-mockup-list-info">
                    <div class="dashboard-mockup-list-avatar"></div>
                    <div class="dashboard-mockup-list-text">
                        <div class="dashboard-mockup-list-title">${item.title}</div>
                        <div class="dashboard-mockup-list-subtitle">${item.subtitle}</div>
                    </div>
                </div>
                <div class="dashboard-mockup-list-badge">${item.status}</div>
            </div>
        `).join('');
    }
    
    setupInteractions() {
        const mockup = this.container.querySelector('#dashboard-mockup');
        if (!mockup) return;
        
        // 3D tilt on mouse move
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate tilt
            this.tiltX = (y - centerY) / centerY * 5; // Max 5 degrees
            this.tiltY = (centerX - x) / centerX * 5;
            
            requestAnimationFrame(() => {
                mockup.style.transform = `
                    perspective(1500px)
                    rotateX(${this.tiltX}deg)
                    rotateY(${this.tiltY}deg)
                    translateZ(20px)
                `;
            });
        });
        
        // Reset on mouse leave
        this.container.addEventListener('mouseleave', () => {
            this.tiltX = 0;
            this.tiltY = 0;
            
            mockup.style.transform = `
                perspective(1500px)
                rotateX(0deg)
                rotateY(0deg)
                translateZ(0px)
            `;
        });
        
        // Scroll reveal
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    mockup.classList.add('visible');
                    this.animateStats();
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(this.container);
    }
    
    animateStats() {
        const statValues = this.container.querySelectorAll('.dashboard-mockup-stat-value');
        
        statValues.forEach(el => {
            const value = parseInt(el.dataset.value);
            const isCurrency = el.textContent.includes('$');
            const isPercent = el.textContent.includes('%');
            
            let start = 0;
            const duration = 2000;
            const startTime = performance.now();
            
            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(start + (value - start) * easeOut);
                
                let display = current.toLocaleString();
                if (isCurrency) display = '$' + display;
                if (isPercent) display = current + '%';
                
                el.textContent = display;
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };
            
            requestAnimationFrame(update);
        });
    }
}

// Initialize
export function initDashboardPreview() {
    const container = document.getElementById('dashboard-preview');
    if (!container) return null;
    
    return new DashboardPreview('dashboard-preview');
}

export default DashboardPreview;
