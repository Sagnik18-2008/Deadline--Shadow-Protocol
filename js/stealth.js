// DEADLINE: SHADOW PROTOCOL - Stealth, Sightlines & Exposure Meter Engine
// Dynamically calculates player visibility, guard detection cones, noise dissipation, and cover mitigation.

class StealthSystem {
    constructor() {
        this.exposure = 0; // 0 to 100%
        this.maxExposure = 100;
        this.isInCover = true;
        this.isCrouched = false;

        // Upgrade benefits
        this.hasGhostCamo = false;
    }

    addExposure(amount) {
        const factor = this.hasGhostCamo ? 0.5 : 1.0;
        this.exposure = Math.min(this.maxExposure, this.exposure + amount * factor);
        this.updateUI();
    }

    onWeaponFired(isSuppressed) {
        if (isSuppressed) {
            this.addExposure(12); // Minimal suppressed signature
        } else {
            this.addExposure(45); // Unsuppressed gunshot sonic boom
        }
    }

    update(delta, npcSystem, playerPos, isScoped, isDroneActive) {
        // Base recovery when staying concealed
        let decayRate = this.hasGhostCamo ? 14 : 9;

        // Check if any alive bodyguards or alert NPCs have line of sight to player vantage
        let spotted = false;

        if (npcSystem && !isDroneActive) {
            npcSystem.npcs.forEach(npc => {
                if (npc.data.alive && (npc.data.isBodyguard || npcSystem.awarenessState >= 1)) {
                    const npcPos = npc.mesh.position;
                    const dist = npcPos.distanceTo(playerPos);

                    // If scoped, rifle glint / silhouette is slightly more visible
                    const detectionRange = isScoped ? 180 : 130;
                    if (dist < detectionRange) {
                        // Check if NPC is facing general direction of player
                        const toPlayer = playerPos.clone().sub(npcPos).normalize();
                        const npcForward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), npc.mesh.rotation.y);
                        const dot = npcForward.dot(toPlayer);

                        if (dot > 0.4) { // In 60 degree forward field of view
                            spotted = true;
                            const gain = (1.0 - (dist / detectionRange)) * 18 * delta;
                            this.addExposure(gain);
                        }
                    }
                }
            });
        }

        if (!spotted) {
            this.exposure = Math.max(0, this.exposure - decayRate * delta);
        }

        // Trigger awareness state changes based on exposure levels
        if (npcSystem) {
            if (this.exposure >= 80) {
                npcSystem.setAwareness(2); // ALERT
            } else if (this.exposure >= 35) {
                npcSystem.setAwareness(1); // SUSPICIOUS
            } else if (this.exposure < 15 && npcSystem.awarenessState === 1) {
                npcSystem.setAwareness(0); // Return to NORMAL
            }
        }

        this.updateUI();
    }

    updateUI() {
        const fill = document.getElementById('exposure-fill');
        const text = document.getElementById('exposure-text');
        const badge = document.getElementById('exposure-badge');

        const pct = Math.floor(this.exposure);
        if (fill) fill.style.width = `${pct}%`;
        if (text) text.innerText = `${pct}%`;

        if (badge) {
            if (pct >= 80) {
                badge.className = 'tactical-badge alert-glow';
            } else if (pct >= 35) {
                badge.className = 'tactical-badge warn-glow';
            } else {
                badge.className = 'tactical-badge normal-glow';
            }
        }
    }
}

window.stealthSystem = new StealthSystem();
