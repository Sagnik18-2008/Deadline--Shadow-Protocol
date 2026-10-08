// DEADLINE: SHADOW PROTOCOL - Master Game Manager & State Controller
// Controls Gameplay Loop, 3D Rendering, Camera Transitions, Bullet-Cam, Mission Debrief & Upgrades.

class GameManager {
    constructor() {
        this.currentMissionIndex = 0;
        this.gameState = 'MENU'; // MENU, BRIEFING, PLAYING, DRONE, BULLETCAM, RESULTS, CLIMAX
        this.intelPoints = 100;
        this.completedMissions = [];
        this.evidenceCollected = false;
        this.powerDisabled = false;

        // Mission Stats
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.missionStartTime = 0;
        this.civilianCasualties = 0;

        // Three.js Core
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Subsystems
        this.envSystem = null;
        this.npcSystem = null;
        this.droneSystem = null;

        // Player / Camera control state
        this.playerVantageIndex = 0;
        this.currentVantage = null;
        this.cameraPitch = 0;
        this.cameraYaw = 0;
        this.baseYaw = 0;
        this.isPointerLocked = false;
        this.mouseSensitivity = 0.0022;

        // BulletCam State
        this.bulletCamActive = false;
        this.bulletCamMesh = null;
        this.bulletCamProgress = 0;
        this.bulletStartPos = new THREE.Vector3();
        this.bulletEndPos = new THREE.Vector3();

        // Armory Upgrades Catalog
        this.armoryCatalog = [
            { id: 'suppressor', name: 'Whisper Carbon Suppressor', cost: 150, desc: 'Dramatically dampens acoustic signature and eliminates muzzle flash. Reduces shot exposure by 75%.' },
            { id: 'thermalOptic', name: 'Digital Thermal Overlay', cost: 200, desc: 'Adds high-contrast FLIR thermal imaging to scope view. Highlights body heat signatures in low visibility.' },
            { id: 'rangefinder', name: 'Tactical Laser Rangefinder', cost: 100, desc: 'Projects real-time target distance and wind drift vector directly onto scope reticle.' },
            { id: 'bipod', name: 'Hydro-Stabilized Bipod', cost: 120, desc: 'Reduces aim sway by 60% when stationary at vantage points.' },
            { id: 'ghostCamo', name: 'Active Camouflage Suit', cost: 250, desc: 'Optical refraction fabric slows guard visual detection by 50%.' },
            { id: 'extendedMag', name: 'Extended 8-Round Mag', cost: 80, desc: 'Increases magazine capacity from 5 to 8 rounds of .338 Lapua Magnum.' }
        ];
    }

    init() {
        this.container = document.getElementById('canvas-container');
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 1. Three.js Scene, Camera, Renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.container.appendChild(this.renderer.domElement);

        // 2. Initialize Subsystems
        this.envSystem = new EnvironmentSystem(this.scene, this.renderer);
        this.npcSystem = new NPCSystem(this.scene);
        this.droneSystem = new DroneSystem(this.scene, this.camera);

        // 3. Attach Rifle Model to Camera
        const rifleModel = window.weaponSystem.createRifleModel();
        this.camera.add(rifleModel);
        this.scene.add(this.camera);

        // 4. Bind Events & Inputs
        this.bindInputEvents();
        window.addEventListener('resize', () => this.onWindowResize());

        // 5. Load Menu Scene
        this.envSystem.buildDowntown();
        this.camera.position.set(0, 48, 120);
        this.camera.lookAt(0, 25, -20);

        // Start render loop
        this.animate();
        this.updateIntelUI();
    }

    bindInputEvents() {
        const dom = this.renderer.domElement;

        // Pointer Lock & Aiming
        dom.addEventListener('click', (e) => {
            if (window.soundEngine && !window.soundEngine.initialized) {
                window.soundEngine.init();
            }
            if (this.gameState === 'PLAYING') {
                if (!this.isPointerLocked) {
                    dom.requestPointerLock();
                } else {
                    // Fire weapon
                    this.onPlayerShoot();
                }
            } else if (this.gameState === 'DRONE') {
                if (!this.isPointerLocked) {
                    dom.requestPointerLock();
                } else {
                    this.droneSystem.scanTarget(this.npcSystem);
                }
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = (document.pointerLockElement === dom);
        });

        // Mouse Move Aiming
        window.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked) return;

            let sens = this.mouseSensitivity;
            if (this.gameState === 'PLAYING' && window.weaponSystem.isScoped) {
                sens = this.mouseSensitivity / window.weaponSystem.getZoomValue();
            }

            if (this.gameState === 'PLAYING') {
                this.cameraYaw -= e.movementX * sens;
                this.cameraPitch -= e.movementY * sens;
                this.cameraPitch = Math.max(-0.65, Math.min(0.65, this.cameraPitch));
            } else if (this.gameState === 'DRONE') {
                this.droneSystem.rotation.y -= e.movementX * 0.003;
                this.droneSystem.rotation.x -= e.movementY * 0.003;
                this.droneSystem.rotation.x = Math.max(-1.1, Math.min(1.1, this.droneSystem.rotation.x));
            }
        });

        // Mouse Right Click for Scope Toggle
        window.addEventListener('mousedown', (e) => {
            if (e.button === 2 && this.gameState === 'PLAYING') {
                e.preventDefault();
                window.weaponSystem.setScope(!window.weaponSystem.isScoped);
            }
        });

        window.addEventListener('contextmenu', e => e.preventDefault());

        // Keyboard Controls
        window.addEventListener('keydown', (e) => {
            if (this.gameState === 'PLAYING') {
                if (e.code === 'KeyD') {
                    // Deploy Drone
                    this.startDroneMode();
                } else if (e.code === 'KeyV' || e.code === 'KeyQ') {
                    // Cycle Vantage Position
                    this.switchVantage();
                } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                    // Hold breath
                    window.weaponSystem.holdBreath(true);
                } else if (e.code === 'KeyZ') {
                    // Cycle zoom magnification
                    window.weaponSystem.cycleZoom();
                } else if (e.code === 'KeyT') {
                    // Toggle thermal optic
                    window.weaponSystem.toggleThermal();
                } else if (e.code === 'KeyR') {
                    // Reload
                    window.weaponSystem.reload();
                }
            } else if (this.gameState === 'DRONE') {
                if (e.code === 'KeyD' || e.code === 'Escape') {
                    this.exitDroneMode();
                } else if (e.code === 'KeyE') {
                    this.droneSystem.scanTarget(this.npcSystem);
                } else if (e.code === 'KeyF') {
                    this.droneSystem.takeEvidencePhoto(this);
                }
                // Drone Movement keys
                if (e.code === 'KeyW') this.droneSystem.keys.forward = true;
                if (e.code === 'KeyS') this.droneSystem.keys.backward = true;
                if (e.code === 'KeyA') this.droneSystem.keys.left = true;
                if (e.code === 'KeyD') this.droneSystem.keys.right = true;
                if (e.code === 'Space') this.droneSystem.keys.up = true;
                if (e.code === 'KeyC') this.droneSystem.keys.down = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.gameState === 'PLAYING') {
                if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                    window.weaponSystem.holdBreath(false);
                }
            } else if (this.gameState === 'DRONE') {
                if (e.code === 'KeyW') this.droneSystem.keys.forward = false;
                if (e.code === 'KeyS') this.droneSystem.keys.backward = false;
                if (e.code === 'KeyA') this.droneSystem.keys.left = false;
                if (e.code === 'Space') this.droneSystem.keys.up = false;
                if (e.code === 'KeyC') this.droneSystem.keys.down = false;
            }
        });
    }

    startMission(index) {
        this.currentMissionIndex = index;
        const mission = MISSIONS_DATA[index];

        // Reset stats
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.missionStartTime = Date.now();
        this.civilianCasualties = 0;
        this.evidenceCollected = false;
        this.powerDisabled = false;
        this.playerVantageIndex = 0;

        // Build 3D World & Spawn Characters
        this.envSystem.buildMissionEnvironment(index);
        this.npcSystem.spawnMissionNPCs(mission);

        // Position Player at Vantage Point 1
        this.setVantagePoint(0);

        this.setGameState('PLAYING');
        this.updateHUDMissionInfo(mission);

        // Resume Audio
        if (window.soundEngine) {
            window.soundEngine.resume();
            window.soundEngine.setTensionLevel(0);
        }
    }

    setVantagePoint(index) {
        const mission = MISSIONS_DATA[this.currentMissionIndex];
        this.playerVantageIndex = index % mission.vantagePoints.length;
        const vantage = mission.vantagePoints[this.playerVantageIndex];
        this.currentVantage = vantage;

        this.camera.position.set(vantage.pos[0], vantage.pos[1], vantage.pos[2]);

        const lookTarget = new THREE.Vector3(...vantage.lookAt);
        const dir = lookTarget.clone().sub(this.camera.position).normalize();
        this.baseYaw = Math.atan2(-dir.x, -dir.z);
        this.cameraYaw = this.baseYaw;
        this.cameraPitch = Math.asin(dir.y);

        const vantageBadge = document.getElementById('vantage-name-badge');
        if (vantageBadge) vantageBadge.innerText = vantage.name.toUpperCase();
    }

    switchVantage() {
        const mission = MISSIONS_DATA[this.currentMissionIndex];
        const nextIndex = (this.playerVantageIndex + 1) % mission.vantagePoints.length;
        this.setVantagePoint(nextIndex);
        if (window.soundEngine) window.soundEngine.playUIClick();
    }

    startDroneMode() {
        if (this.droneSystem.isActive) return;
        this.setGameState('DRONE');
        this.droneSystem.deploy(this.camera.position);
    }

    exitDroneMode() {
        this.droneSystem.recall();
        this.setGameState('PLAYING');
        // Restore player camera position
        this.setVantagePoint(this.playerVantageIndex);
    }

    onPlayerShoot() {
        const fired = window.weaponSystem.fire();
        if (!fired) return;

        this.shotsFired++;
        window.stealthSystem.onWeaponFired(window.weaponSystem.upgrades.suppressor);

        // Perform raycast from crosshair
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        // Check if hit power junction box in Mission 4
        if (MISSIONS_DATA[this.currentMissionIndex].id === 'contract_04') {
            const junction = this.scene.getObjectByName('POWER_JUNCTION_BOX');
            if (junction) {
                const jHit = raycaster.intersectObject(junction, true);
                if (jHit.length > 0) {
                    this.powerDisabled = true;
                    if (window.soundEngine) window.soundEngine.playEvidenceFound();
                    this.showNotification("SECONDARY COMPLETED: Power Grid Terminated");
                }
            }
        }

        const hitResult = this.npcSystem.checkHit(raycaster);

        if (hitResult.hit) {
            this.shotsHit++;

            if (hitResult.isTarget) {
                // Target Eliminated! Launch cinematic bullet cam or completion
                this.triggerBulletCam(hitResult.point, () => {
                    this.onTargetNeutralized();
                });
            } else {
                // Hit civilian or bodyguard
                if (hitResult.npcData.isBodyguard) {
                    this.showNotification("WARNING: Bodyguard Neutralized. Area Alerted!");
                } else {
                    this.civilianCasualties++;
                    this.showNotification("CRITICAL: Civilian Casualty Detected!");
                }
            }
        }
    }

    checkEvidencePhoto(dronePos, droneDir) {
        const mission = MISSIONS_DATA[this.currentMissionIndex];
        if (mission.id === 'contract_02' && !this.evidenceCollected) {
            const manifest = this.scene.getObjectByName('EVIDENCE_MANIFEST_402');
            if (manifest) {
                const dist = dronePos.distanceTo(manifest.position);
                const toManifest = manifest.position.clone().sub(dronePos).normalize();
                const dot = droneDir.dot(toManifest);

                if (dist < 35 && dot > 0.8) {
                    this.evidenceCollected = true;
                    if (window.soundEngine) window.soundEngine.playEvidenceFound();
                    this.showNotification("SECONDARY COMPLETED: Shipping Manifest Captured");
                }
            }
        }
    }

    triggerBulletCam(targetPoint, onComplete) {
        this.bulletCamActive = true;
        this.bulletCamProgress = 0;
        this.bulletStartPos.copy(this.camera.position);
        this.bulletEndPos.copy(targetPoint);

        // Close scope
        window.weaponSystem.setScope(false);

        // Temporary bullet mesh
        const bulletGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
        const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffe277 });
        this.bulletCamMesh = new THREE.Mesh(bulletGeo, bulletMat);
        this.bulletCamMesh.rotation.x = Math.PI / 2;
        this.scene.add(this.bulletCamMesh);

        const duration = 1500;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const p = Math.min(elapsed / duration, 1.0);
            this.bulletCamProgress = p;

            const currentPos = this.bulletStartPos.clone().lerp(this.bulletEndPos, p);
            this.bulletCamMesh.position.copy(currentPos);

            // Camera trails just behind bullet
            const camPos = currentPos.clone().add(new THREE.Vector3(0.5, 0.3, 1.8));
            this.camera.position.copy(camPos);
            this.camera.lookAt(currentPos);

            if (p < 1.0) {
                requestAnimationFrame(tick);
            } else {
                this.scene.remove(this.bulletCamMesh);
                this.bulletCamMesh.geometry.dispose();
                this.bulletCamMesh.material.dispose();
                this.bulletCamMesh = null;
                this.bulletCamActive = false;
                onComplete();
            }
        };
        requestAnimationFrame(tick);
    }

    onTargetNeutralized() {
        const mission = MISSIONS_DATA[this.currentMissionIndex];

        if (mission.isClimax) {
            // Show Climax Branching Ending Choice Modal!
            this.setGameState('CLIMAX');
            this.renderClimaxChoices(mission);
        } else {
            // Show Mission Results Screen
            setTimeout(() => {
                this.showMissionResults();
            }, 1200);
        }
    }

    showMissionResults() {
        this.setGameState('RESULTS');
        if (document.pointerLockElement) document.exitPointerLock();

        const mission = MISSIONS_DATA[this.currentMissionIndex];
        const elapsedSec = Math.floor((Date.now() - this.missionStartTime) / 1000);
        const minutes = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
        const seconds = String(elapsedSec % 60).padStart(2, '0');

        const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;
        const stealthPct = Math.max(0, 100 - Math.floor(window.stealthSystem.exposure));

        // Rating Stars (1 to 5)
        let stars = 5;
        if (window.stealthSystem.exposure > 50) stars--;
        if (accuracy < 70) stars--;
        if (this.civilianCasualties > 0) stars -= 2;
        stars = Math.max(1, Math.min(5, stars));

        const earnedIntel = mission.rewardIntel;
        this.intelPoints += earnedIntel;
        if (!this.completedMissions.includes(mission.id)) {
            this.completedMissions.push(mission.id);
        }

        // Render Results UI
        const resultsBox = document.getElementById('mission-results-card');
        if (resultsBox) {
            resultsBox.innerHTML = `
                <div class="results-header">
                    <span class="gold-text">CONTRACT ${mission.number} COMPLETE</span>
                    <h2>${mission.codename}</h2>
                </div>
                <div class="results-grid">
                    <div class="stat-row"><span>PRIMARY TARGET:</span><span class="text-green">ELIMINATED ✓</span></div>
                    <div class="stat-row"><span>ACCURACY:</span><span>${accuracy}% (${this.shotsHit}/${this.shotsFired})</span></div>
                    <div class="stat-row"><span>OPERATION TIME:</span><span>${minutes}:${seconds}</span></div>
                    <div class="stat-row"><span>CIVILIANS HARMED:</span><span class="${this.civilianCasualties === 0 ? 'text-green' : 'text-red'}">${this.civilianCasualties}</span></div>
                    <div class="stat-row"><span>STEALTH RATING:</span><span>${stealthPct}%</span></div>
                    <div class="stat-row"><span>INTEL EARNED:</span><span class="gold-text">+${earnedIntel} PTS</span></div>
                </div>
                <div class="lore-box">
                    <strong>[DECRYPTED INTEL DOSSIER]</strong>
                    <p>${mission.loreDrop}</p>
                </div>
                <div class="rating-stars">
                    OVERALL RATING: ${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}
                </div>
                <div class="results-actions">
                    <button class="tactical-btn" onclick="gameManager.returnToMenu()">RETURN TO HUB</button>
                    ${this.currentMissionIndex < MISSIONS_DATA.length - 1 ?
                    `<button class="tactical-btn btn-primary" onclick="gameManager.showBriefing(${this.currentMissionIndex + 1})">NEXT CONTRACT →</button>` :
                    `<button class="tactical-btn btn-gold" onclick="gameManager.showBriefing(0)">REPLAY CAMPAIGN</button>`}
                </div>
            `;
        }

        this.updateIntelUI();
    }

    renderClimaxChoices(mission) {
        if (document.pointerLockElement) document.exitPointerLock();
        const climaxModal = document.getElementById('climax-modal');
        if (climaxModal) {
            climaxModal.classList.add('active');
            const choicesContainer = document.getElementById('climax-choices');
            choicesContainer.innerHTML = mission.endings.map(end => `
                <div class="climax-choice-card" onclick="gameManager.selectEnding('${end.id}')">
                    <h3 style="color:${end.color}">${end.title}</h3>
                    <p>${end.desc}</p>
                    <button class="tactical-btn" style="border-color:${end.color}; color:${end.color}">EXECUTE DECISION</button>
                </div>
            `).join('');
        }
    }

    selectEnding(endingId) {
        const mission = MISSIONS_DATA[5];
        const ending = mission.endings.find(e => e.id === endingId);
        const climaxModal = document.getElementById('climax-modal');
        if (climaxModal) climaxModal.classList.remove('active');

        // Epilogue View
        const epilogue = document.getElementById('epilogue-modal');
        if (epilogue) {
            epilogue.classList.add('active');
            epilogue.innerHTML = `
                <div class="epilogue-content">
                    <h1 style="color: ${ending.color}">${ending.title}</h1>
                    <div class="epilogue-divider"></div>
                    <p class="epilogue-desc">${ending.desc}</p>
                    <p class="epilogue-lore">
                        "In the end, every bullet leaves a trajectory. Whether we were the weapon or the hand that pulled the trigger, the protocol is fulfilled."
                    </p>
                    <div class="epilogue-credits">
                        <span>DEADLINE: SHADOW PROTOCOL</span>
                        <span>CAMPAIGN COMPLETED</span>
                    </div>
                    <button class="tactical-btn btn-primary" onclick="location.reload()">RETURN TO TITLE</button>
                </div>
            `;
        }
    }

    showBriefing(index) {
        this.currentMissionIndex = index;
        const mission = MISSIONS_DATA[index];
        this.setGameState('BRIEFING');

        // Switch background environment to match mission
        this.envSystem.buildMissionEnvironment(index);

        const briefingContainer = document.getElementById('briefing-content');
        if (briefingContainer) {
            briefingContainer.innerHTML = `
                <div class="briefing-header">
                    <div class="dossier-tag">TOP SECRET // BLACK VEIL DIRECTIVE</div>
                    <h1>CONTRACT ${mission.number}: ${mission.codename}</h1>
                    <div class="briefing-meta">
                        <span>LOCATION: <strong>${mission.location}</strong></span>
                        <span>WEATHER: <strong>${mission.weather}</strong></span>
                        <span>TIME: <strong>${mission.timeOfDay}</strong></span>
                        <span>THREAT: <strong class="text-red">${mission.threatLevel}</strong></span>
                    </div>
                </div>

                <div class="briefing-columns">
                    <div class="briefing-col">
                        <h3>TARGET PROFILE</h3>
                        <div class="profile-card">
                            <div class="target-mugshot-placeholder">
                                <div class="crosshair-deco"></div>
                                <div class="target-code">[ ${mission.targetName} ]</div>
                            </div>
                            <div class="profile-details">
                                <div><strong>DESIGNATION:</strong> ${mission.targetTitle}</div>
                                <div><strong>STATUS:</strong> ARMED / HIGH PRIORITY</div>
                            </div>
                        </div>

                        <h3>CRITICAL IDENTIFICATION CLUES</h3>
                        <ul class="clues-list">
                            ${mission.targetClues.map(c => `<li>${c}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="briefing-col">
                        <h3>OPERATIONAL OBJECTIVES</h3>
                        <div class="objective-box primary">
                            <strong>PRIMARY OBJECTIVE:</strong>
                            <p>${mission.primaryObjective}</p>
                        </div>
                        <div class="objective-box secondary">
                            <strong>SECONDARY OBJECTIVE:</strong>
                            <p>${mission.secondaryObjective}</p>
                        </div>

                        <h3>TACTICAL RECON & SCHEDULE</h3>
                        <div class="schedule-table">
                            ${mission.targetRoutine.map(r => `
                                <div class="schedule-row">
                                    <span class="sched-time">${r.time}</span>
                                    <span class="sched-loc">${r.location}</span>
                                    <span class="sched-desc">${r.desc}</span>
                                </div>
                            `).join('')}
                        </div>

                        <div class="recommended-approach">
                            <strong>RECOMMENDED VANTAGE:</strong>
                            <p>${mission.recommendedApproach}</p>
                        </div>
                    </div>
                </div>

                <div class="briefing-footer">
                    <button class="tactical-btn" onclick="gameManager.returnToMenu()">← ABORT / BACK</button>
                    <button class="tactical-btn btn-primary" onclick="gameManager.startMission(${index})">DEPLOY TO VANTAGE →</button>
                </div>
            `;
        }
    }

    showArmory() {
        this.setGameState('ARMORY');
        const armoryList = document.getElementById('armory-items-list');
        if (armoryList) {
            armoryList.innerHTML = this.armoryCatalog.map(item => {
                const isUnlocked = window.weaponSystem.upgrades[item.id] || (item.id === 'ghostCamo' && window.stealthSystem.hasGhostCamo);
                const canAfford = this.intelPoints >= item.cost;
                return `
                    <div class="armory-card ${isUnlocked ? 'unlocked' : ''}">
                        <div class="armory-card-info">
                            <h4>${item.name}</h4>
                            <p>${item.desc}</p>
                            <span class="cost-badge">${isUnlocked ? 'EQUIPPED ✓' : `${item.cost} INTEL PTS`}</span>
                        </div>
                        <button class="tactical-btn ${isUnlocked ? 'btn-equipped' : (canAfford ? 'btn-buy' : 'btn-disabled')}"
                            onclick="gameManager.purchaseUpgrade('${item.id}', ${item.cost})"
                            ${isUnlocked || !canAfford ? 'disabled' : ''}>
                            ${isUnlocked ? 'EQUIPPED' : 'ACQUIRE'}
                        </button>
                    </div>
                `;
            }).join('');
        }
    }

    purchaseUpgrade(upgradeId, cost) {
        if (this.intelPoints >= cost) {
            this.intelPoints -= cost;
            if (upgradeId === 'ghostCamo') {
                window.stealthSystem.hasGhostCamo = true;
            } else {
                window.weaponSystem.applyUpgrade(upgradeId);
            }
            if (window.soundEngine) window.soundEngine.playEvidenceFound();
            this.updateIntelUI();
            this.showArmory();
        }
    }

    showIntelDatabase() {
        this.setGameState('INTEL');
        const intelContainer = document.getElementById('intel-files-list');
        if (intelContainer) {
            intelContainer.innerHTML = MISSIONS_DATA.map((m, idx) => {
                const isDecrypted = this.completedMissions.includes(m.id);
                return `
                    <div class="intel-dossier-card ${isDecrypted ? 'decrypted' : 'encrypted'}">
                        <h3>FILE #${m.number}: ${m.codename}</h3>
                        <div class="intel-status">${isDecrypted ? 'DECRYPTED // ACCESS GRANTED' : 'ENCRYPTED // COMPLETE CONTRACT TO UNLOCK'}</div>
                        <p>${isDecrypted ? m.loreDrop : '████████████████████████████████████████████████████████████'}</p>
                    </div>
                `;
            }).join('');
        }
    }

    returnToMenu() {
        this.setGameState('MENU');
        this.envSystem.buildDowntown();
        this.camera.position.set(0, 48, 120);
        this.camera.lookAt(0, 25, -20);
    }

    setGameState(state) {
        this.gameState = state;

        // Manage UI Screen overlays
        const screens = ['main-menu', 'briefing-screen', 'game-hud', 'mission-results-screen', 'armory-screen', 'intel-screen'];
        screens.forEach(s => {
            const el = document.getElementById(s);
            if (el) el.style.display = 'none';
        });

        if (state === 'MENU') {
            document.getElementById('main-menu').style.display = 'flex';
        } else if (state === 'BRIEFING') {
            document.getElementById('briefing-screen').style.display = 'flex';
        } else if (state === 'PLAYING') {
            document.getElementById('game-hud').style.display = 'block';
        } else if (state === 'RESULTS') {
            document.getElementById('mission-results-screen').style.display = 'flex';
        } else if (state === 'ARMORY') {
            document.getElementById('armory-screen').style.display = 'flex';
        } else if (state === 'INTEL') {
            document.getElementById('intel-screen').style.display = 'flex';
        }
    }

    updateHUDMissionInfo(mission) {
        const titleEl = document.getElementById('hud-contract-title');
        const objEl = document.getElementById('hud-primary-objective');
        if (titleEl) titleEl.innerText = `CONTRACT ${mission.number}: ${mission.title}`;
        if (objEl) objEl.innerText = mission.primaryObjective;
    }

    updateIntelUI() {
        const els = document.querySelectorAll('.intel-pts-counter');
        els.forEach(el => el.innerText = `${this.intelPoints} PTS`);
    }

    showNotification(msg) {
        const notif = document.getElementById('game-notification');
        if (notif) {
            notif.innerText = msg;
            notif.classList.add('show');
            setTimeout(() => { notif.classList.remove('show'); }, 3500);
        }
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = Math.min(this.clock.getDelta(), 0.1);

        // Update Environment Weather, Ferris Wheel, Traffic
        this.envSystem.update(delta);

        // Update NPCs
        if (this.gameState === 'PLAYING' || this.gameState === 'DRONE') {
            this.npcSystem.update(delta);
        }

        // Update Weapons Sway & Breath
        const sway = window.weaponSystem.update(delta);

        // Camera Orientation in Playing Mode
        if (this.gameState === 'PLAYING') {
            const euler = new THREE.Euler(this.cameraPitch + sway.swayY, this.cameraYaw + sway.swayX, 0, 'YXZ');
            this.camera.quaternion.setFromEuler(euler);

            // Update Stealth & Exposure
            window.stealthSystem.update(
                delta,
                this.npcSystem,
                this.camera.position,
                window.weaponSystem.isScoped,
                false
            );

            // Update Rangefinder HUD
            if (window.weaponSystem.upgrades.rangefinder && window.weaponSystem.isScoped) {
                const rfEl = document.getElementById('scope-range-text');
                if (rfEl && this.npcSystem.targetNPC) {
                    const dist = Math.floor(this.camera.position.distanceTo(this.npcSystem.targetNPC.mesh.position));
                    rfEl.innerText = `RNG: ${dist}M | ELEV: +0.2 MIL | WIND: 3.2 KT E`;
                }
            }
        } else if (this.gameState === 'DRONE') {
            this.droneSystem.update(delta, this.npcSystem);
        } else if (this.gameState === 'MENU') {
            // Slow cinematic orbit on menu
            const time = performance.now() * 0.00015;
            this.camera.position.x = Math.sin(time) * 45;
            this.camera.position.z = 110 + Math.cos(time) * 20;
            this.camera.lookAt(0, 25, -20);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.gameManager = new GameManager();
window.addEventListener('DOMContentLoaded', () => {
    window.gameManager.init();
});
