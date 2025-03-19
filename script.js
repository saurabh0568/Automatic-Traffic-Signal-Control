class TrafficSignalSystem {
    constructor() {
        this.signals = Array(4).fill().map(() => ({
            vehicleCount: 0,
            waitTime: 0,
            vehiclesProcessed: 0,
            previousVehicleCount: 0
        }));
        
        this.activeGreenIndex = 0;
        this.greenDuration = 8000;
        this.yellowDuration = 3000;
        this.phase = 'green';
        this.timeInPhase = 0;
        this.totalVehiclesProcessed = 0;
        this.totalWaitTime = 0;
        this.cycleCount = 0;
        this.isAutoMode = true;
        this.trafficDensity = 5;
        this.emergencyMode = false;
        this.emergencyTimer = null;
        
        this.initializeControlListeners();
        this.updateSignals();
        
        this.trafficTimer = setInterval(() => this.simulateTraffic(), 1000);
        this.systemTimer = setInterval(() => this.updateSystem(), 100);
    }
    
    initializeControlListeners() {
        document.getElementById('greenDuration').addEventListener('input', (e) => {
            this.greenDuration = parseInt(e.target.value) * 1000;
            document.getElementById('greenValue').textContent = `${e.target.value} seconds`;
        });
        
        document.getElementById('yellowDuration').addEventListener('input', (e) => {
            this.yellowDuration = parseInt(e.target.value) * 1000;
            document.getElementById('yellowValue').textContent = `${e.target.value} seconds`;
        });
        
        document.getElementById('trafficDensity').addEventListener('input', (e) => {
            this.trafficDensity = parseInt(e.target.value);
            const densityText = this.trafficDensity <= 3 ? 'Low' : 
                               this.trafficDensity <= 7 ? 'Medium' : 'High';
            document.getElementById('densityValue').textContent = densityText;
        });
        
        document.getElementById('toggleAuto').addEventListener('click', () => {
            this.isAutoMode = !this.isAutoMode;
            const toggleBtn = document.getElementById('toggleAuto');
            toggleBtn.textContent = `Automatic Mode: ${this.isAutoMode ? 'ON' : 'OFF'}`;
            toggleBtn.classList.toggle('active', !this.isAutoMode);
            
            document.getElementById('systemInfo').textContent = 
                this.isAutoMode ? 'System running in automatic mode.' : 
                'System running in manual mode. Click on a signal to change.';
        });
        
        document.getElementById('emergencyButton').addEventListener('click', () => {
            if (!this.emergencyMode) {
                this.activateEmergencyMode();
            } else {
                this.deactivateEmergencyMode();
            }
        });
        
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`signal${i}`).addEventListener('click', () => {
                if (!this.isAutoMode && !this.emergencyMode) {
                    this.manualSignalChange(i - 1);
                }
            });
        }
    }
    
    updateSystem() {
        this.timeInPhase += 100;
        
        for (let i = 0; i < 4; i++) {
            if (i !== this.activeGreenIndex || this.phase === 'red') {
                this.signals[i].waitTime += this.signals[i].vehicleCount * 0.1;
            }
        }
        
        if (this.phase === 'green' && this.timeInPhase >= this.greenDuration) {
            this.changeToYellow();
        } else if (this.phase === 'yellow' && this.timeInPhase >= this.yellowDuration) {
            this.changeToRed();
        } else if (this.phase === 'red' && this.timeInPhase >= 1000) {
            this.changeToGreen();
        }
        
        this.updateStatistics();
    }
    
    changeToYellow() {
        this.phase = 'yellow';
        this.timeInPhase = 0;
        this.updateSignals();
        document.getElementById('systemInfo').textContent = `Signal ${this.activeGreenIndex + 1} changing to yellow.`;
    }
    
    changeToRed() {
        this.phase = 'red';
        this.timeInPhase = 0;
        this.updateSignals();
        
        const processedVehicles = Math.min(
            this.signals[this.activeGreenIndex].vehicleCount,
            Math.floor(this.greenDuration / 1000) * 3
        );
        
        this.signals[this.activeGreenIndex].vehiclesProcessed += processedVehicles;
        this.totalVehiclesProcessed += processedVehicles;
        this.signals[this.activeGreenIndex].vehicleCount = Math.max(
            0, 
            this.signals[this.activeGreenIndex].vehicleCount - processedVehicles
        );
        
        if (this.isAutoMode) {
            this.selectNextSignal();
        }
        
        document.getElementById('systemInfo').textContent = `Signal ${this.activeGreenIndex + 1} now red. Processed ${processedVehicles} vehicles.`;
    }
    
    changeToGreen() {
        this.phase = 'green';
        this.timeInPhase = 0;
        this.cycleCount++;
        this.updateSignals();
        document.getElementById('systemInfo').textContent = `Signal ${this.activeGreenIndex + 1} now green. Allowing traffic flow.`;
    }
    
    selectNextSignal() {
        // Calculate priority score for each signal based on multiple factors
        let maxScore = -1;
        let maxIndex = 0;
        
        for (let i = 0; i < 4; i++) {
            if (i !== this.activeGreenIndex) {
                // Score based on vehicle count, wait time, and trends
                const vehicleScore = this.signals[i].vehicleCount * 10;
                const waitScore = this.signals[i].waitTime * 2;
                const trendScore = (this.signals[i].vehicleCount - this.signals[i].previousVehicleCount) * 5;
                
                const totalScore = vehicleScore + waitScore + trendScore;
                
                if (totalScore > maxScore) {
                    maxScore = totalScore;
                    maxIndex = i;
                }
            }
        }
        
        this.activeGreenIndex = maxIndex;
    }
    
    manualSignalChange(signalIndex) {
        if (this.phase !== 'green' || this.activeGreenIndex === signalIndex) {
            return;
        }
        
        this.changeToYellow();
        setTimeout(() => {
            this.changeToRed();
            setTimeout(() => {
                this.activeGreenIndex = signalIndex;
                this.changeToGreen();
            }, 1000);
        }, this.yellowDuration);
    }
    
    activateEmergencyMode() {
        this.emergencyMode = true;
        document.getElementById('emergencyButton').textContent = 'Cancel Emergency';
        document.getElementById('systemInfo').textContent = 'EMERGENCY MODE ACTIVE - All signals red';
        
        // Store current state
        this.savedState = {
            activeGreenIndex: this.activeGreenIndex,
            phase: this.phase,
            timeInPhase: this.timeInPhase
        };
        
        // Set all signals to red
        this.phase = 'red';
        this.updateSignals(true);
        
        // Auto-cancel after 30 seconds
        this.emergencyTimer = setTimeout(() => this.deactivateEmergencyMode(), 30000);
    }
    
    deactivateEmergencyMode() {
        this.emergencyMode = false;
        document.getElementById('emergencyButton').textContent = 'Emergency Override';
        document.getElementById('systemInfo').textContent = 'Emergency mode deactivated. Resuming normal operation.';
        
        // Clear the timer if it's still running
        if (this.emergencyTimer) {
            clearTimeout(this.emergencyTimer);
            this.emergencyTimer = null;
        }
        
        // Restore previous state
        if (this.savedState) {
            this.activeGreenIndex = this.savedState.activeGreenIndex;
            this.phase = this.savedState.phase;
            this.timeInPhase = this.savedState.timeInPhase;
            this.updateSignals();
        } else {
            this.changeToGreen();
        }
    }
    
    simulateTraffic() {
        if (this.emergencyMode) return;
        
        for (let i = 0; i < 4; i++) {
            this.signals[i].previousVehicleCount = this.signals[i].vehicleCount;
        }
        
        // Simulate incoming traffic
        for (let i = 0; i < 4; i++) {
            // Skip adding vehicles if this signal is currently green
            if (i === this.activeGreenIndex && this.phase === 'green') continue;
            
            const chanceOfNewVehicles = this.trafficDensity / 10;
            if (Math.random() < chanceOfNewVehicles) {
                // Add more vehicles during peak times
                const baseVehicles = Math.floor(Math.random() * 5) + 1;
                const densityMultiplier = this.trafficDensity / 5;
                const newVehicles = Math.floor(baseVehicles * densityMultiplier);
                
                this.signals[i].vehicleCount += newVehicles;
            }
        }
        
        if (this.phase === 'green') {
            const vehiclesProcessingRate = 1 + (this.trafficDensity / 10);
            const processedVehicles = Math.floor(vehiclesProcessingRate);
            
            this.signals[this.activeGreenIndex].vehicleCount = Math.max(
                0, 
                this.signals[this.activeGreenIndex].vehicleCount - processedVehicles
            );
            
            if (processedVehicles > 0) {
                this.signals[this.activeGreenIndex].vehiclesProcessed += processedVehicles;
                this.totalVehiclesProcessed += processedVehicles;
            }
        }
        
        this.updateSignals();
    }
    
    updateSignals(forceAllRed = false) {
        for (let i = 0; i < 4; i++) {
            const redLight = document.querySelector(`#signal${i + 1} .red`);
            const yellowLight = document.querySelector(`#signal${i + 1} .yellow`);
            const greenLight = document.querySelector(`#signal${i + 1} .green`);
            const vehicleDisplay = document.getElementById(`vehicleCount${i + 1}`);
            
            redLight.classList.remove('active');
            yellowLight.classList.remove('active');
            greenLight.classList.remove('active');
            
            if (forceAllRed) {
                redLight.classList.add('active');
            } else if (i === this.activeGreenIndex) {
                if (this.phase === 'green') {
                    greenLight.classList.add('active');
                } else if (this.phase === 'yellow') {
                    yellowLight.classList.add('active');
                } else {
                    redLight.classList.add('active');
                }
            } else {
                redLight.classList.add('active');
            }
            
            vehicleDisplay.innerText = `${this.signals[i].vehicleCount} Vehicles`;
        }
    }
    
    updateStatistics() {
        document.getElementById('totalVehicles').textContent = this.totalVehiclesProcessed;
        
        let totalWaitTime = 0;
        let totalVehicles = 0;
        for (let i = 0; i < 4; i++) {
            totalWaitTime += this.signals[i].waitTime;
            totalVehicles += this.signals[i].vehicleCount;
        }
        
        const avgWaitTime = totalVehicles > 0 ? 
            Math.round(totalWaitTime / totalVehicles * 10) / 10 : 0;
        document.getElementById('avgWaitTime').textContent = `${avgWaitTime.toFixed(1)} sec`;
        
        const efficiency = this.cycleCount > 0 ? 
            Math.min(100, Math.round((this.totalVehiclesProcessed / (this.cycleCount * 10)) * 100)) : 0;
        document.getElementById('efficiency').textContent = `${efficiency}%`;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const trafficSystem = new TrafficSignalSystem();
});
