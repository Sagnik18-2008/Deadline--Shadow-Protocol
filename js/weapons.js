// DEADLINE: SHADOW PROTOCOL - Sniper Weapon & Ballistic Optics System
// Procedural 3D Weapon Model, Recoil Kick, Bolt Cycle, Sway Lissajous, Breath Stamina, Scope Zoom.

class WeaponSystem {
    constructor() {
        this.rifleMesh = null;
        this.boltMesh = null;
        this.muzzleFlashLight = null;
        this.muzzleFlashMesh = null;

        // Weapon Stats & Upgrades
        this.upgrades = {
            suppressor: false,
            thermalOptic: false,
            rangefinder: false,
            bipod: false,
            extendedMag: false
        };

        // State
        this.isScoped = false;
        this.zoomLevels = [2, 4, 8, 16];
        this.currentZoomIndex = 1; // Default 4x
        this.isHoldingBreath = false;
        this.breathStamina = 100;
        this.maxBreathStamina = 100;
        this.isCyclingBolt = false;
        this.ammoInMag = 5;
        this.maxAmmo = 5;

        // Recoil & Sway
        this.recoilOffset = { x: 0, y: 0, z: 0, rotX: 0, rotY: 0 };
        this.swayTime = 0;
        this.swayAmount = 0.008;

        // Scope Thermal Mode
        this.thermalActive = false;
    }

    createRifleModel() {
        const rifleGroup = new THREE.Group();

        // High-end tactical materials
        const gunMetalMat = new THREE.MeshStandardMaterial({
            color: 0x1a1c20,
            metalness: 0.85,
            roughness: 0.28
        });

        const darkCompositeMat = new THREE.MeshStandardMaterial({
            color: 0x111215,
            metalness: 0.2,
            roughness: 0.65
        });

        const steelBoltMat = new THREE.MeshStandardMaterial({
            color: 0x8a929a,
            metalness: 0.95,
            roughness: 0.15
        });

        const scopeGlassMat = new THREE.MeshPhysicalMaterial({
            color: 0x0a202a,
            metalness: 0.1,
            roughness: 0.05,
            transmission: 0.7,
            transparent: true,
            opacity: 0.85
        });

        const highlightGoldMat = new THREE.MeshStandardMaterial({
            color: 0xc89b3c,
            metalness: 0.8,
            roughness: 0.3
        });

        // 1. Main Receiver
        const receiverGeo = new THREE.BoxGeometry(0.08, 0.11, 0.65);
        const receiver = new THREE.Mesh(receiverGeo, gunMetalMat);
        receiver.position.set(0, 0, 0);
        rifleGroup.add(receiver);

        // 2. Fluted Heavy Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.95, 16);
        const barrel = new THREE.Mesh(barrelGeo, gunMetalMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.02, -0.78);
        rifleGroup.add(barrel);

        // 3. Muzzle Brake / Suppressor
        const muzzleGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.28, 16);
        const muzzle = new THREE.Mesh(muzzleGeo, gunMetalMat);
        muzzle.rotation.x = Math.PI / 2;
        muzzle.position.set(0, 0.02, -1.35);
        this.muzzleMesh = muzzle;
        rifleGroup.add(muzzle);

        // Suppressor sleeve (hidden initially if not upgraded)
        const suppressorGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.42, 16);
        this.suppressorMesh = new THREE.Mesh(suppressorGeo, darkCompositeMat);
        this.suppressorMesh.rotation.x = Math.PI / 2;
        this.suppressorMesh.position.set(0, 0.02, -1.42);
        this.suppressorMesh.visible = this.upgrades.suppressor;
        rifleGroup.add(this.suppressorMesh);

        // 4. Picatinny Rail
        const railGeo = new THREE.BoxGeometry(0.045, 0.02, 0.45);
        const rail = new THREE.Mesh(railGeo, gunMetalMat);
        rail.position.set(0, 0.065, -0.05);
        rifleGroup.add(rail);

        // 5. Tactical High-Magnification Scope
        const scopeTubeGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.42, 16);
        const scopeTube = new THREE.Mesh(scopeTubeGeo, gunMetalMat);
        scopeTube.rotation.x = Math.PI / 2;
        scopeTube.position.set(0, 0.12, -0.05);
        rifleGroup.add(scopeTube);

        // Scope Bell (Front objective lens housing)
        const scopeFrontBellGeo = new THREE.CylinderGeometry(0.056, 0.035, 0.14, 16);
        const scopeFrontBell = new THREE.Mesh(scopeFrontBellGeo, gunMetalMat);
        scopeFrontBell.rotation.x = -Math.PI / 2;
        scopeFrontBell.position.set(0, 0.12, -0.28);
        rifleGroup.add(scopeFrontBell);

        // Scope Ocular Eyepiece (Rear lens housing)
        const scopeRearBellGeo = new THREE.CylinderGeometry(0.048, 0.035, 0.1, 16);
        const scopeRearBell = new THREE.Mesh(scopeRearBellGeo, gunMetalMat);
        scopeRearBell.rotation.x = Math.PI / 2;
        scopeRearBell.position.set(0, 0.12, 0.18);
        rifleGroup.add(scopeRearBell);

        // Scope Lenses (Front & Rear)
        const lensGeo = new THREE.CircleGeometry(0.048, 16);
        const frontLens = new THREE.Mesh(lensGeo, scopeGlassMat);
        frontLens.position.set(0, 0.12, -0.35);
        rifleGroup.add(frontLens);

        const rearLens = new THREE.Mesh(lensGeo, scopeGlassMat);
        rearLens.position.set(0, 0.12, 0.23);
        rifleGroup.add(rearLens);

        // Scope Elevation / Windage Turrets
        const turretGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.035, 12);
        const topTurret = new THREE.Mesh(turretGeo, highlightGoldMat);
        topTurret.position.set(0, 0.165, -0.05);
        rifleGroup.add(topTurret);

        const sideTurret = new THREE.Mesh(turretGeo, highlightGoldMat);
        sideTurret.rotation.z = Math.PI / 2;
        sideTurret.position.set(0.045, 0.12, -0.05);
        rifleGroup.add(sideTurret);

        // 6. Tactical Stock & Cheek Rest
        const stockGeo = new THREE.BoxGeometry(0.065, 0.12, 0.48);
        const stock = new THREE.Mesh(stockGeo, darkCompositeMat);
        stock.position.set(0, -0.04, 0.52);
        rifleGroup.add(stock);

        const cheekRestGeo = new THREE.BoxGeometry(0.055, 0.035, 0.2);
        const cheekRest = new THREE.Mesh(cheekRestGeo, darkCompositeMat);
        cheekRest.position.set(0, 0.035, 0.45);
        rifleGroup.add(cheekRest);

        const buttPadGeo = new THREE.BoxGeometry(0.07, 0.14, 0.04);
        const buttPad = new THREE.Mesh(buttPadGeo, gunMetalMat);
        buttPad.position.set(0, -0.04, 0.77);
        rifleGroup.add(buttPad);

        // 7. Pistol Grip & Trigger
        const gripGeo = new THREE.BoxGeometry(0.055, 0.16, 0.08);
        const grip = new THREE.Mesh(gripGeo, darkCompositeMat);
        grip.rotation.x = -0.35;
        grip.position.set(0, -0.15, 0.15);
        rifleGroup.add(grip);

        const triggerGuardGeo = new THREE.TorusGeometry(0.04, 0.008, 8, 16, Math.PI);
        const triggerGuard = new THREE.Mesh(triggerGuardGeo, gunMetalMat);
        triggerGuard.rotation.x = Math.PI / 2;
        triggerGuard.position.set(0, -0.08, 0.06);
        rifleGroup.add(triggerGuard);

        // 8. Box Magazine
        const magGeo = new THREE.BoxGeometry(0.05, 0.18, 0.12);
        const magazine = new THREE.Mesh(magGeo, gunMetalMat);
        magazine.position.set(0, -0.12, -0.08);
        magazine.rotation.x = 0.12;
        rifleGroup.add(magazine);

        // 9. Bolt Handle (Movable part)
        const boltGroup = new THREE.Group();
        const boltRodGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.22, 12);
        const boltRod = new THREE.Mesh(boltRodGeo, steelBoltMat);
        boltRod.rotation.x = Math.PI / 2;
        boltGroup.add(boltRod);

        const boltHandleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.09, 8);
        const boltHandle = new THREE.Mesh(boltHandleGeo, steelBoltMat);
        boltHandle.rotation.z = Math.PI / 2;
        boltHandle.position.set(0.05, 0, 0);
        boltGroup.add(boltHandle);

        const boltKnobGeo = new THREE.SphereGeometry(0.016, 12, 12);
        const boltKnob = new THREE.Mesh(boltKnobGeo, gunMetalMat);
        boltKnob.position.set(0.1, 0, 0);
        boltGroup.add(boltKnob);

        boltGroup.position.set(0, 0.03, 0.1);
        rifleGroup.add(boltGroup);
        this.boltMesh = boltGroup;

        // 10. Tactical Bipod Legs
        const bipodBaseGeo = new THREE.BoxGeometry(0.06, 0.03, 0.06);
        const bipodBase = new THREE.Mesh(bipodBaseGeo, gunMetalMat);
        bipodBase.position.set(0, -0.02, -0.9);
        rifleGroup.add(bipodBase);

        const legGeo = new THREE.CylinderGeometry(0.009, 0.007, 0.32, 8);
        const leftLeg = new THREE.Mesh(legGeo, gunMetalMat);
        leftLeg.position.set(-0.1, -0.15, -0.9);
        leftLeg.rotation.z = 0.35;
        rifleGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, gunMetalMat);
        rightLeg.position.set(0.1, -0.15, -0.9);
        rightLeg.rotation.z = -0.35;
        rifleGroup.add(rightLeg);

        // 11. Muzzle Flash Light & Mesh
        this.muzzleFlashLight = new THREE.PointLight(0xffaa44, 0, 15);
        this.muzzleFlashLight.position.set(0, 0.02, -1.6);
        rifleGroup.add(this.muzzleFlashLight);

        const flashGeo = new THREE.ConeGeometry(0.12, 0.35, 8);
        const flashMat = new THREE.MeshBasicMaterial({
            color: 0xffd97d,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        this.muzzleFlashMesh = new THREE.Mesh(flashGeo, flashMat);
        this.muzzleFlashMesh.rotation.x = -Math.PI / 2;
        this.muzzleFlashMesh.position.set(0, 0.02, -1.6);
        rifleGroup.add(this.muzzleFlashMesh);

        // Scale & Initial Position relative to FPS camera
        rifleGroup.scale.set(1.4, 1.4, 1.4);
        rifleGroup.position.set(0.24, -0.26, -0.65);
        rifleGroup.rotation.set(0.02, 0.05, 0);

        this.rifleMesh = rifleGroup;
        return rifleGroup;
    }

    applyUpgrade(upgradeKey) {
        if (this.upgrades[upgradeKey] !== undefined) {
            this.upgrades[upgradeKey] = true;
            if (upgradeKey === 'suppressor' && this.suppressorMesh) {
                this.suppressorMesh.visible = true;
            }
            if (upgradeKey === 'extendedMag') {
                this.maxAmmo = 8;
                this.ammoInMag = 8;
            }
            return true;
        }
        return false;
    }

    setScope(scoped) {
        this.isScoped = scoped;
        if (window.soundEngine) {
            window.soundEngine.playScopeZoom(this.currentZoomIndex);
        }

        const scopeOverlay = document.getElementById('scope-overlay');
        const weaponHud = document.getElementById('weapon-hud');

        if (scopeOverlay) {
            if (this.isScoped) {
                scopeOverlay.classList.add('active');
                if (this.rifleMesh) this.rifleMesh.visible = false;
            } else {
                scopeOverlay.classList.remove('active');
                if (this.rifleMesh) this.rifleMesh.visible = true;
                this.isHoldingBreath = false;
            }
        }
        this.updateScopeUI();
    }

    cycleZoom() {
        if (!this.isScoped) return;
        this.currentZoomIndex = (this.currentZoomIndex + 1) % this.zoomLevels.length;
        if (window.soundEngine) {
            window.soundEngine.playScopeZoom(this.currentZoomIndex);
        }
        this.updateScopeUI();
    }

    getZoomValue() {
        return this.isScoped ? this.zoomLevels[this.currentZoomIndex] : 1.0;
    }

    toggleThermal() {
        if (!this.upgrades.thermalOptic || !this.isScoped) return;
        this.thermalActive = !this.thermalActive;
        const scopeContainer = document.getElementById('scope-overlay');
        if (scopeContainer) {
            if (this.thermalActive) {
                scopeContainer.classList.add('thermal-mode');
            } else {
                scopeContainer.classList.remove('thermal-mode');
            }
        }
    }

    updateScopeUI() {
        const zoomText = document.getElementById('scope-zoom-text');
        if (zoomText) {
            zoomText.innerText = `${this.zoomLevels[this.currentZoomIndex]}X MAGNIFICATION`;
        }
        const thermalBadge = document.getElementById('thermal-badge');
        if (thermalBadge) {
            thermalBadge.style.display = this.upgrades.thermalOptic ? 'inline-block' : 'none';
            thermalBadge.classList.toggle('active', this.thermalActive);
        }
    }

    holdBreath(start) {
        if (!this.isScoped) return;
        if (start && this.breathStamina > 20) {
            this.isHoldingBreath = true;
            if (window.soundEngine) window.soundEngine.playBreathIn();
        } else if (!start) {
            this.isHoldingBreath = false;
        }
    }

    fire() {
        if (this.isCyclingBolt) return false;
        if (this.ammoInMag <= 0) {
            if (window.soundEngine) window.soundEngine.playMetallicClick(window.soundEngine.ctx.currentTime, 800, 0.05);
            this.reload();
            return false;
        }

        this.ammoInMag--;
        this.isCyclingBolt = true;

        // Sound
        const isSuppressed = this.upgrades.suppressor;
        if (window.soundEngine) {
            window.soundEngine.playSniperShot(isSuppressed);
        }

        // Recoil Kick
        const recoilIntensity = isSuppressed ? 0.6 : 1.0;
        this.recoilOffset.z = 0.12 * recoilIntensity;
        this.recoilOffset.rotX = 0.09 * recoilIntensity;
        this.recoilOffset.y = 0.04 * recoilIntensity;

        // Muzzle Flash
        if (!isSuppressed && this.muzzleFlashLight && this.muzzleFlashMesh) {
            this.muzzleFlashLight.intensity = 8.0;
            this.muzzleFlashMesh.material.opacity = 0.9;
            setTimeout(() => {
                if (this.muzzleFlashLight) this.muzzleFlashLight.intensity = 0;
                if (this.muzzleFlashMesh) this.muzzleFlashMesh.material.opacity = 0;
            }, 60);
        }

        // Bolt cycling sequence
        setTimeout(() => {
            if (window.soundEngine) window.soundEngine.playBoltAction();
            this.animateBoltAction();
        }, 320);

        setTimeout(() => {
            this.isCyclingBolt = false;
        }, 1100);

        this.updateAmmoUI();
        return true;
    }

    animateBoltAction() {
        if (!this.boltMesh) return;
        // Lift & pull
        let start = performance.now();
        const duration = 750;
        const tick = () => {
            const elapsed = performance.now() - start;
            const progress = Math.min(elapsed / duration, 1);

            if (progress < 0.3) {
                // Lift bolt handle
                this.boltMesh.rotation.z = (progress / 0.3) * -0.6;
            } else if (progress < 0.6) {
                // Slide back
                const p = (progress - 0.3) / 0.3;
                this.boltMesh.position.z = 0.1 + p * 0.12;
            } else if (progress < 0.85) {
                // Slide forward
                const p = (progress - 0.6) / 0.25;
                this.boltMesh.position.z = 0.22 - p * 0.12;
            } else {
                // Lock down
                const p = (progress - 0.85) / 0.15;
                this.boltMesh.rotation.z = -0.6 + p * 0.6;
            }

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                this.boltMesh.rotation.z = 0;
                this.boltMesh.position.z = 0.1;
            }
        };
        requestAnimationFrame(tick);
    }

    reload() {
        if (this.ammoInMag === this.maxAmmo || this.isCyclingBolt) return;
        this.isCyclingBolt = true;
        if (window.soundEngine) {
            window.soundEngine.playMetallicClick(window.soundEngine.ctx.currentTime, 1100, 0.1);
            setTimeout(() => window.soundEngine.playBoltAction(), 600);
        }
        setTimeout(() => {
            this.ammoInMag = this.maxAmmo;
            this.isCyclingBolt = false;
            this.updateAmmoUI();
        }, 1500);
    }

    updateAmmoUI() {
        const ammoCounter = document.getElementById('ammo-counter');
        if (ammoCounter) {
            ammoCounter.innerText = `${this.ammoInMag} / ${this.maxAmmo}`;
        }
    }

    update(delta) {
        this.swayTime += delta * 1.5;

        // Breath Stamina calculation
        if (this.isHoldingBreath) {
            this.breathStamina = Math.max(0, this.breathStamina - delta * 22);
            if (this.breathStamina <= 0) {
                this.isHoldingBreath = false;
            }
            if (window.soundEngine && Math.random() < 0.05) {
                window.soundEngine.playHeartbeat(1.0 + (1 - this.breathStamina / 100));
            }
        } else {
            this.breathStamina = Math.min(this.maxBreathStamina, this.breathStamina + delta * 16);
        }

        const breathMeter = document.getElementById('breath-meter-fill');
        if (breathMeter) {
            breathMeter.style.width = `${(this.breathStamina / this.maxBreathStamina) * 100}%`;
        }

        // Sway computation
        const bipodFactor = this.upgrades.bipod ? 0.4 : 1.0;
        const breathFactor = this.isHoldingBreath ? 0.08 : 1.0;
        const currentSway = this.swayAmount * bipodFactor * breathFactor;

        const swayX = Math.sin(this.swayTime * 1.2) * currentSway;
        const swayY = Math.cos(this.swayTime * 2.4) * currentSway * 0.6;

        // Ease recoil back to rest
        this.recoilOffset.z *= 0.88;
        this.recoilOffset.rotX *= 0.85;
        this.recoilOffset.y *= 0.88;

        if (this.rifleMesh) {
            const basePos = this.isScoped ? new THREE.Vector3(0, -0.18, -0.3) : new THREE.Vector3(0.24, -0.26, -0.65);
            this.rifleMesh.position.x = basePos.x + swayX;
            this.rifleMesh.position.y = basePos.y + swayY + this.recoilOffset.y;
            this.rifleMesh.position.z = basePos.z + this.recoilOffset.z;
            this.rifleMesh.rotation.x = 0.02 + this.recoilOffset.rotX;
        }

        return { swayX, swayY };
    }
}

window.weaponSystem = new WeaponSystem();
