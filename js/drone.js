// DEADLINE: SHADOW PROTOCOL - Reconnaissance Drone System
// Aerial FPV Recon, 6-DOF Flight Controls, Biometric Clue Scanner, Target Tagging, Evidence Photography.

class DroneSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.isActive = false;

        // Drone position and movement
        this.position = new THREE.Vector3(0, 35, 60);
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.speed = 22;
        this.battery = 100;
        this.maxBattery = 100;

        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false
        };

        // Scanning state
        this.scannedNPC = null;
        this.scanProgress = 0;
        this.isScanning = false;

        // Saved player perch camera position
        this.savedCamPos = new THREE.Vector3();
        this.savedCamRot = new THREE.Euler();
    }

    deploy(startPos) {
        this.isActive = true;
        this.battery = 100;
        this.position.set(startPos.x, startPos.y - 4, startPos.z - 15);
        this.rotation.set(0, Math.PI, 0);

        if (window.soundEngine) {
            window.soundEngine.setDroneActive(true);
            window.soundEngine.playUIClick();
        }

        const droneOverlay = document.getElementById('drone-overlay');
        if (droneOverlay) droneOverlay.classList.add('active');

        const hudCenter = document.getElementById('hud-center-reticle');
        if (hudCenter) hudCenter.style.display = 'none';
    }

    recall() {
        this.isActive = false;
        this.isScanning = false;
        this.scanProgress = 0;

        if (window.soundEngine) {
            window.soundEngine.setDroneActive(false);
            window.soundEngine.playUIClick();
        }

        const droneOverlay = document.getElementById('drone-overlay');
        if (droneOverlay) droneOverlay.classList.remove('active');

        const hudCenter = document.getElementById('hud-center-reticle');
        if (hudCenter) hudCenter.style.display = 'block';

        // Clear scan box UI
        const scanBox = document.getElementById('drone-scan-box');
        if (scanBox) scanBox.style.display = 'none';
    }

    toggle(startPos) {
        if (this.isActive) this.recall();
        else this.deploy(startPos);
    }

    takeEvidencePhoto(gameManager) {
        if (!this.isActive) return;
        if (window.soundEngine) {
            window.soundEngine.playCameraShutter();
        }

        // Camera flash effect
        const flash = document.getElementById('photo-flash-overlay');
        if (flash) {
            flash.style.opacity = '1';
            setTimeout(() => { flash.style.opacity = '0'; }, 120);
        }

        // Check if looking at evidence target in Mission 2 or others
        if (gameManager) {
            gameManager.checkEvidencePhoto(this.position, this.camera.getWorldDirection(new THREE.Vector3()));
        }
    }

    scanTarget(npcSystem) {
        if (!this.isActive || !npcSystem) return;

        // Cast ray from drone forward direction
        const raycaster = new THREE.Raycaster();
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        raycaster.set(this.position, dir);

        const hitMeshes = [];
        npcSystem.npcs.forEach(npc => {
            if (npc.mesh && npc.data.alive) hitMeshes.push(npc.mesh);
        });

        const intersects = raycaster.intersectObjects(hitMeshes, true);
        const scanBox = document.getElementById('drone-scan-box');

        if (intersects.length > 0 && intersects[0].distance < 75) {
            let hitObj = intersects[0].object;
            while (hitObj.parent && !hitObj.userData.id) {
                hitObj = hitObj.parent;
            }

            const data = hitObj.userData;
            this.scannedNPC = data;

            if (window.soundEngine) {
                window.soundEngine.playDroneScan();
            }

            // Tag NPC with overhead marker
            if (data.tagMesh) data.tagMesh.visible = true;

            // Update Drone UI scanner display
            if (scanBox) {
                scanBox.style.display = 'block';
                const isTarget = data.isTarget;
                const matchPct = isTarget ? 98 : (data.isBodyguard ? 45 : 12);

                if (window.soundEngine) {
                    setTimeout(() => window.soundEngine.playTargetIdentified(isTarget), 300);
                }

                scanBox.innerHTML = `
                    <div class="scan-header ${isTarget ? 'target-match' : 'civ-match'}">
                        <span>[BIOMETRIC ANALYSIS]</span>
                        <span>CONFIDENCE: ${matchPct}%</span>
                    </div>
                    <div class="scan-body">
                        <div class="scan-name">${data.name.toUpperCase()}</div>
                        <div class="scan-role">${data.isTarget ? 'CLASSIFIED TARGET' : (data.isBodyguard ? 'SECURITY DETAIL' : 'CIVILIAN')}</div>
                        <div class="scan-traits">
                            ${(data.clues && data.clues.length > 0) ? data.clues.map(c => `• ${c}`).join('<br>') : '• No threat signatures detected.'}
                        </div>
                        <div class="scan-verdict ${isTarget ? 'text-red' : 'text-green'}">
                            ${isTarget ? '⚠ DESIGNATED CONTRACT TARGET CONFIRMED' : 'NON-COMBATANT / DO NOT ENGAGE'}
                        </div>
                    </div>
                `;
            }
        } else {
            if (scanBox) {
                scanBox.style.display = 'block';
                scanBox.innerHTML = `
                    <div class="scan-header">
                        <span>[TARGET SCANNER]</span>
                        <span>SCANNING...</span>
                    </div>
                    <div class="scan-body text-yellow">
                        NO BIOMETRIC SIGNATURE IN RETICLE RANGE.
                    </div>
                `;
                setTimeout(() => { if (scanBox) scanBox.style.display = 'none'; }, 1500);
            }
        }
    }

    update(delta, npcSystem) {
        if (!this.isActive) return;

        // Drain battery
        this.battery = Math.max(0, this.battery - delta * 1.8);
        if (this.battery <= 0) {
            this.recall();
            return;
        }

        const batteryFill = document.getElementById('drone-battery-fill');
        const batteryText = document.getElementById('drone-battery-text');
        if (batteryFill) batteryFill.style.width = `${this.battery}%`;
        if (batteryText) batteryText.innerText = `${Math.floor(this.battery)}%`;

        // Flight vectors
        const moveVector = new THREE.Vector3();
        if (this.keys.forward) moveVector.z -= 1;
        if (this.keys.backward) moveVector.z += 1;
        if (this.keys.left) moveVector.x -= 1;
        if (this.keys.right) moveVector.x += 1;
        if (this.keys.up) moveVector.y += 1;
        if (this.keys.down) moveVector.y -= 1;

        moveVector.normalize();
        moveVector.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
        this.position.addScaledVector(moveVector, this.speed * delta);

        // Clamp boundaries
        this.position.y = Math.max(6, Math.min(85, this.position.y));
        this.position.x = Math.max(-140, Math.min(140, this.position.x));
        this.position.z = Math.max(-120, Math.min(150, this.position.z));

        // Update Camera
        this.camera.position.copy(this.position);
        this.camera.rotation.copy(this.rotation);

        // Update telemetry UI
        const altText = document.getElementById('drone-altitude-text');
        if (altText) altText.innerText = `ALT: ${Math.floor(this.position.y)}m`;

        const distText = document.getElementById('drone-dist-text');
        if (distText && npcSystem && npcSystem.targetNPC) {
            const d = Math.floor(this.position.distanceTo(npcSystem.targetNPC.mesh.position));
            distText.innerText = `RNG: ${d}m`;
        }
    }
}

window.DroneSystem = DroneSystem;
