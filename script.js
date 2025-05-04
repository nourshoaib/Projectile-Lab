// Initialize Chart
let trajectoryChart = null;

// DOM Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set default values
    document.getElementById('x0').value = '0';
    document.getElementById('y0').value = '0';
    document.getElementById('gravity').value = '9.8';
    document.getElementById('yGround').value = '0';
    
    // Form Submission
    document.getElementById('projectileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateProjectile();
    });
});

// Main Calculation Function
// Main Calculation Function - Updated Version
function calculateProjectile() {
    // Get Input Values
    const v0 = parseFloat(document.getElementById('velocity').value);
    const angle = parseFloat(document.getElementById('angle').value);
    const x0 = parseFloat(document.getElementById('x0').value) || 0;
    let y0 = parseFloat(document.getElementById('y0').value) || 0;
    const g = parseFloat(document.getElementById('gravity').value) || 9.8;
    let yGround = parseFloat(document.getElementById('yGround').value) || 0;

    // Convert angle to radians
    const theta = angle * Math.PI / 180;

    // Handle case where y0 equals yGround
    if (y0 === yGround) {
        y0 += 0.0001; // Add tiny offset to ensure we have a trajectory
    }

    // Calculate Time of Flight (when projectile reaches yGround)
    const a = -0.5 * g;
    const b = v0 * Math.sin(theta);
    const c = y0 - yGround;
    
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
        alert("Projectile never reaches the specified ground level with these parameters!");
        return;
    }
    
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

    // Select the correct time based on yGround
    let timeOfFlight;
    timeOfFlight = Math.max(t1, t2);

    // Ensure we have at least some flight time
    if (timeOfFlight <= 0) {
        timeOfFlight = 0.1; // Minimum time to show small trajectory
    }

    // Calculate Maximum Height
    //const timeToMaxHeight = (v0 * Math.sin(theta)) / g;
    const maxHeight = y0 + (v0 * Math.sin(theta)) ** 2 / (2 * g);
    
    // Calculate Range
    const range = x0 + v0 * Math.cos(theta) * timeOfFlight;
    
    // Generate Trajectory Points 
    // ensure we always have at least 2 points
    const steps = Math.max(2, Math.min(50, Math.ceil(timeOfFlight * 10)));
    const timeStep = timeOfFlight / (steps - 1);
    const xPoints = [];
    const yPoints = [];

    
    for (let i = 0; i < steps; i++) {
        const t = i * timeStep;
        const x = x0 + v0 * Math.cos(theta) * t;
        const y = y0 + v0 * Math.sin(theta) * t - 0.5 * g * t * t;
        
      
        xPoints.push(x);
        yPoints.push(y);
        
    }

    // Ensure we have at least 2 points for the line
    if (xPoints.length < 2) {
        xPoints.push(x0, x0 + 0.1);
        yPoints.push(y0, y0);
    }
    
    // Display Results
    displayResults(v0, angle, x0, y0, g, yGround, timeOfFlight, maxHeight, range);
    
    // Plot Graph
    plotTrajectory(xPoints, yPoints, range, Math.max(maxHeight, y0));
}

// Display Results Function
function displayResults(v0, angle, x0, y0, g, yGround, time, height, range) {
    const thetaRad = angle * Math.PI / 180;
    const cosTheta = Math.cos(thetaRad);
    const sinTheta = Math.sin(thetaRad);
    
    const resultsDiv = document.getElementById('results');
    
    resultsDiv.innerHTML = `
        <div class="result-section">
            <h4>Basic Parameters</h4>
            <div class="result-item">
                <span class="result-label">Initial Velocity:</span>
                <span class="result-value">${v0.toFixed(2)} m/s at ${angle.toFixed(2)}°</span>
            </div>
            <div class="result-item">
                <span class="result-label">Initial Position:</span>
                <span class="result-value">(${x0.toFixed(2)}m, ${y0.toFixed(2)}m)</span>
            </div>
            <div class="result-item">
                <span class="result-label">Gravity:</span>
                <span class="result-value">${g.toFixed(2)} m/s²</span>
            </div>
        </div>
        
        <div class="result-section">
            <h4>Time Equations</h4>
            <div class="result-item">
                <span class="result-label">x(t):</span>
                <span class="result-value">${x0.toFixed(1)} + ${(v0 * cosTheta).toFixed(2)}·t</span>
            </div>
            <div class="result-item">
                <span class="result-label">y(t):</span>
                <span class="result-value">${y0.toFixed(1)} + ${(v0 * sinTheta).toFixed(2)}·t - ${(0.5 * g).toFixed(1)}·t²</span>
            </div>
        </div>
        
        <div class="result-section">
            <h4>Vectors</h4>
            <div class="result-item">
                <span class="result-label">Position r(t):</span>
                <span class="result-value">[${x0.toFixed(1)} + ${(v0 * cosTheta).toFixed(2)}·t, ${y0.toFixed(1)} + ${(v0 * sinTheta).toFixed(2)}·t - ${(0.5 * g).toFixed(1)}·t²]</span>
            </div>
            <div class="result-item">
                <span class="result-label">Velocity v(t):</span>
                <span class="result-value">[${(v0 * cosTheta).toFixed(2)}, ${(v0 * sinTheta).toFixed(2)} - ${g.toFixed(1)}·t]</span>
            </div>
            <div class="result-item">
                <span class="result-label">Acceleration a(t):</span>
                <span class="result-value">[0, -${g.toFixed(1)}] (constant)</span>
            </div>
        </div>
        
        <div class="result-section">
            <h4>Results</h4>
            <div class="result-item">
                <span class="result-label">Time to Hit Ground (y = ${yGround.toFixed(1)}m):</span>
                <span class="result-value">${time.toFixed(2)} s</span>
            </div>
            <div class="result-item">
                <span class="result-label">Maximum Height:</span>
                <span class="result-value">${height.toFixed(2)} m</span>
            </div>
            <div class="result-item">
                <span class="result-label">Range:</span>
                <span class="result-value">${range.toFixed(2)} m</span>
            </div>
            <div class="result-item">
                <span class="result-label">Trajectory Equation:</span>
                <span class="result-value">y = ${y0.toFixed(1)} + (x${x0 !== 0 ? `-${x0.toFixed(1)}` : ''})·tan(${angle.toFixed(1)}°) - ${(0.5 * g/(v0 * cosTheta)**2).toExponential(2)}·(x${x0 !== 0 ? `-${x0.toFixed(1)}` : ''})²</span>
            </div>
        </div>
    `;
}

function plotTrajectory(xPoints, yPoints, range, maxHeight) {
    const ctx = document.getElementById('trajectoryChart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (trajectoryChart) {
        trajectoryChart.destroy();
    }
    
    trajectoryChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Projectile Trajectory',
                data: xPoints.map((x, i) => ({x, y: yPoints[i]})),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                showLine: true,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Horizontal Distance (m)'
                    },
                    min: 0,
                    max: range * 1.1
                },
                y: {
                    title: {
                        display: true,
                        text: 'Vertical Height (m)'
                    },
                    min: 0,
                    max: maxHeight * 1.2
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `(${context.parsed.x.toFixed(1)}m, ${context.parsed.y.toFixed(1)}m)`;
                        }
                    }
                }
            }
        }
    });
}

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar-default');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Add some CSS for results display
const style = document.createElement('style');
style.textContent = `
    .result-item {
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }
    .result-label {
        font-weight: bold;
        color: #2c3e50;
        display: inline-block;
        width: 160px;
    }
    .result-value {
        color: #3498db;
    }
`;
document.head.appendChild(style);