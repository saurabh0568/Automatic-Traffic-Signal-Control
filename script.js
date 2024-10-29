const vehicleCounts = [0, 0, 0, 0];
let activeGreenIndex = 0; 
let greenDuration = 5000; 
let yellowDuration = 3000; 
let phase = 'green'; 

function updateSignals() {
    for (let i = 0; i < 4; i++) {
        const redLight = document.querySelector(`#signal${i + 1} .red`);
        const yellowLight = document.querySelector(`#signal${i + 1} .yellow`);
        const greenLight = document.querySelector(`#signal${i + 1} .green`);
        const vehicleDisplay = document.getElementById(`vehicleCount${i + 1}`);

        redLight.classList.remove('active');
        yellowLight.classList.remove('active');
        greenLight.classList.remove('active');

        if (i === activeGreenIndex) {
            if (phase === 'green') {
                greenLight.classList.add('active');
                vehicleCounts[i] = 0; 
            } else if (phase === 'yellow') {
                yellowLight.classList.add('active');
                vehicleCounts[i] = Math.max(0, vehicleCounts[i] - 1); 
            } else {
                redLight.classList.add('active');
            }
        } else {
            redLight.classList.add('active'); 
        }

        vehicleDisplay.innerText = `${vehicleCounts[i]} Vehicles`;
    }
}

function simulateTraffic() {
    for (let i = 0; i < 4; i++) {
        if (i !== activeGreenIndex) {
            
            if (Math.random() < 0.5) { 
                vehicleCounts[i] += Math.floor(Math.random() * 15) + 5; 
            }
        }
    }

    updateSignals();
}

function changePhase() {
    if (phase === 'green') {
        phase = 'yellow';
        setTimeout(() => {
            phase = 'red';
            activeGreenIndex = getMaxVehicleSignal(); 
            phase = 'green';
            updateSignals();
        }, yellowDuration);
    }
    updateSignals();
}

function getMaxVehicleSignal() {
    let maxIndex = 0;
    for (let i = 1; i < vehicleCounts.length; i++) {
        if (vehicleCounts[i] > vehicleCounts[maxIndex]) {
            maxIndex = i;
        }
    }
    return maxIndex;
}

setInterval(simulateTraffic, 1000); 
setInterval(changePhase, greenDuration); 
