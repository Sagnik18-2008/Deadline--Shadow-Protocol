// DEADLINE: SHADOW PROTOCOL - 3D Environment, Weather, & Dynamic Lighting Generator
// Procedural Downtown, Industrial Docks, Mountain Resort, Coastal Marina, Night Festival & Black Veil Monolith HQ.

class EnvironmentSystem {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;

        this.levelGroup = new THREE.Group();
        this.scene.add(this.levelGroup);

        this.weatherParticles = null;
        this.particleCount = 2000;
        this.weatherType = 'Clear';

        this.trafficMeshes = [];
        this.fireworks = [];
        this.ferrisWheel = null;
        this.lighthouseLight = null;
        this.lightningTimer = 0;
        this.nextLightning = 8;
        this.directionalLight = null;
        this.ambientLight = null;
        this.streetLights = [];
    }

    clearLevel() {
        while (this.levelGroup.children.length > 0) {
            const obj = this.levelGroup.children[0];
            this.levelGroup.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        }
        if (this.weatherParticles) {
            this.scene.remove(this.weatherParticles);
            this.weatherParticles.geometry.dispose();
            this.weatherParticles.material.dispose();
            this.weatherParticles = null;
        }
        this.trafficMeshes = [];
        this.fireworks = [];
        this.ferrisWheel = null;
        this.lighthouseLight = null;
    }

    buildMissionEnvironment(missionIndex) {
        this.clearLevel();
        const mission = MISSIONS_DATA[missionIndex];
        this.weatherType = mission.weather;

        this.setupLightingAndTime(mission);
        this.setupWeatherSystem(mission.weather);

        switch (mission.id) {
            case "contract_01":
                this.buildDowntown();
                break;
            case "contract_02":
                this.buildIndustrialDocks();
                break;
            case "contract_03":
                this.buildMountainResort();
                break;
            case "contract_04":
                this.buildCoastalMarina();
                break;
            case "contract_05":
                this.buildNightFestival();
                break;
            case "contract_06":
                this.buildBlackVeilHQ();
                break;
            default:
                this.buildDowntown();
        }

        if (window.soundEngine) {
            window.soundEngine.setWeatherAmbience(mission.weather);
        }
    }

    setupLightingAndTime(mission) {
        if (!this.ambientLight) {
            this.ambientLight = new THREE.AmbientLight(0x1a2436, 0.7);
            this.scene.add(this.ambientLight);
        }
        if (!this.directionalLight) {
            this.directionalLight = new THREE.DirectionalLight(0x7aa2d6, 0.9);
            this.directionalLight.position.set(60, 120, 80);
            this.scene.add(this.directionalLight);
        }

        // Configure fog & sky color according to environment
        if (mission.weather === 'Snow') {
            this.scene.background = new THREE.Color(0x1b2230);
            this.scene.fog = new THREE.FogExp2(0x1b2230, 0.012);
            this.ambientLight.color.setHex(0x384a62);
            this.directionalLight.color.setHex(0x768fae);
        } else if (mission.weather === 'Heavy Rain' || mission.weather === 'Storm') {
            this.scene.background = new THREE.Color(0x0a0d14);
            this.scene.fog = new THREE.FogExp2(0x0d131f, 0.01);
            this.ambientLight.color.setHex(0x162235);
            this.directionalLight.color.setHex(0x426388);
        } else if (mission.id === 'contract_04') {
            // Sunset Crimson Marina
            this.scene.background = new THREE.Color(0x2a141e);
            this.scene.fog = new THREE.FogExp2(0x2a141e, 0.007);
            this.ambientLight.color.setHex(0x4a2a35);
            this.directionalLight.color.setHex(0xf38b4d);
            this.directionalLight.position.set(-100, 30, -80);
        } else {
            // Clear Dark Night
            this.scene.background = new THREE.Color(0x07090e);
            this.scene.fog = new THREE.FogExp2(0x07090e, 0.006);
            this.ambientLight.color.setHex(0x1a2638);
            this.directionalLight.color.setHex(0x5678a6);
        }
    }

    setupWeatherSystem(weatherType) {
        if (weatherType === 'Clear') return;

        const isSnow = weatherType === 'Snow';
        const count = isSnow ? 2500 : 3500;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 350;
            positions[i * 3 + 1] = Math.random() * 120;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 350;
            velocities[i] = isSnow ? 15 + Math.random() * 15 : 65 + Math.random() * 45;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particleVelocities = velocities;

        const mat = new THREE.PointsMaterial({
            color: isSnow ? 0xecf4ff : 0x7aa4cc,
            size: isSnow ? 0.65 : 0.45,
            transparent: true,
            opacity: isSnow ? 0.8 : 0.5,
            blending: THREE.AdditiveBlending
        });

        this.weatherParticles = new THREE.Points(geo, mat);
        this.scene.add(this.weatherParticles);
    }

    // MISSION 1: DOWNTOWN SKYLINE
    buildDowntown() {
        // Ground / Street Plane
        const groundGeo = new THREE.PlaneGeometry(400, 400);
        const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x0c0f14, roughness: 0.35, metalness: 0.4 });
        const ground = new THREE.Mesh(groundGeo, asphaltMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        this.levelGroup.add(ground);

        // Building Materials
        const darkConcrete = new THREE.MeshStandardMaterial({ color: 0x141820, roughness: 0.7, metalness: 0.2 });
        const glassBuilding = new THREE.MeshStandardMaterial({ color: 0x08101a, roughness: 0.1, metalness: 0.9 });
        const litWindowMat = new THREE.MeshBasicMaterial({ color: 0xffe29a });
        const cyanNeonMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const magentaNeonMat = new THREE.MeshBasicMaterial({ color: 0xff007f });

        // Player Vantage Rooftop (Apex Spire North)
        const playerRoof = new THREE.Mesh(new THREE.BoxGeometry(40, 50, 40), darkConcrete);
        playerRoof.position.set(0, 25, 120);
        this.levelGroup.add(playerRoof);

        // Parapet ledge on player roof
        const parapet = new THREE.Mesh(new THREE.BoxGeometry(40.2, 1.2, 1), darkConcrete);
        parapet.position.set(0, 50.6, 100);
        this.levelGroup.add(parapet);

        // Target Penthouse Building (Balcony Lounge)
        const targetTower = new THREE.Mesh(new THREE.BoxGeometry(44, 46, 50), glassBuilding);
        targetTower.position.set(0, 11, -30);
        this.levelGroup.add(targetTower);

        // Target Balcony Terrace
        const terraceGeo = new THREE.BoxGeometry(32, 2, 16);
        const terrace = new THREE.Mesh(terraceGeo, darkConcrete);
        terrace.position.set(0, 21.5, -10);
        this.levelGroup.add(terrace);

        // Terrace Glass Railing
        const railGeo = new THREE.BoxGeometry(32, 1.2, 0.2);
        const glassRailMat = new THREE.MeshPhysicalMaterial({ color: 0x4488aa, transparent: true, opacity: 0.4, transmission: 0.8 });
        const rail = new THREE.Mesh(railGeo, glassRailMat);
        rail.position.set(0, 22.8, -2);
        this.levelGroup.add(rail);

        // Terrace Bar & Canopy
        const barCounter = new THREE.Mesh(new THREE.BoxGeometry(10, 1.5, 2), darkConcrete);
        barCounter.position.set(-6, 22.8, -12);
        this.levelGroup.add(barCounter);

        const neonSign = new THREE.Mesh(new THREE.BoxGeometry(14, 2, 0.4), magentaNeonMat);
        neonSign.position.set(0, 26, -18);
        this.levelGroup.add(neonSign);

        // Surrounding City Skyscrapers (35+ procedural towers with lit windows)
        for (let i = 0; i < 35; i++) {
            const bx = (Math.random() - 0.5) * 360;
            const bz = (Math.random() - 0.5) * 360;
            // Avoid clipping directly into player or target area
            if (Math.abs(bx) < 30 && Math.abs(bz - 120) < 35) continue;
            if (Math.abs(bx) < 25 && Math.abs(bz + 30) < 35) continue;

            const bHeight = 40 + Math.random() * 90;
            const bWidth = 25 + Math.random() * 25;
            const bDepth = 25 + Math.random() * 25;

            const bMesh = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bDepth), (i % 3 === 0) ? glassBuilding : darkConcrete);
            bMesh.position.set(bx, bHeight / 2, bz);
            this.levelGroup.add(bMesh);

            // Add Rooftop HVAC or Antennas
            if (Math.random() > 0.4) {
                const ac = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 5), darkConcrete);
                ac.position.set(bx + 2, bHeight + 1.5, bz + 2);
                this.levelGroup.add(ac);

                const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 15, 6), darkConcrete);
                ant.position.set(bx - 4, bHeight + 7.5, bz - 4);
                this.levelGroup.add(ant);
            }

            // Neon roof billboards on some buildings
            if (Math.random() > 0.7) {
                const billboard = new THREE.Mesh(new THREE.BoxGeometry(bWidth * 0.7, 4, 0.5), (i % 2 === 0) ? cyanNeonMat : magentaNeonMat);
                billboard.position.set(bx, bHeight + 3, bz);
                this.levelGroup.add(billboard);
            }
        }

        // Moving Street Traffic (Glowing headlight lines)
        this.createStreetTraffic();
    }

    createStreetTraffic() {
        const carCount = 18;
        const carGeo = new THREE.BoxGeometry(3.8, 1.4, 1.8);
        const headLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });

        for (let i = 0; i < carCount; i++) {
            const isNorth = i % 2 === 0;
            const carMat = isNorth ? headLightMat : tailLightMat;
            const car = new THREE.Mesh(carGeo, carMat);
            car.position.set((isNorth ? -18 : 18) + (Math.random() - 0.5) * 6, 0.8, -150 + Math.random() * 300);
            car.userData = { speed: (isNorth ? 25 : -25) + (Math.random() - 0.5) * 10, dir: isNorth ? 1 : -1 };
            this.levelGroup.add(car);
            this.trafficMeshes.push(car);
        }
    }

    // MISSION 2: INDUSTRIAL HARBOR & DOCKS
    buildIndustrialDocks() {
        // Wet Concrete & Ocean Plane
        const dockGeo = new THREE.BoxGeometry(220, 10, 160);
        const wetConcrete = new THREE.MeshStandardMaterial({ color: 0x11161d, roughness: 0.15, metalness: 0.6 });
        const dock = new THREE.Mesh(dockGeo, wetConcrete);
        dock.position.set(0, 5, 0);
        this.levelGroup.add(dock);

        const waterGeo = new THREE.PlaneGeometry(400, 400);
        const waterMat = new THREE.MeshStandardMaterial({ color: 0x050c14, roughness: 0.05, metalness: 0.85 });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0.5;
        this.levelGroup.add(water);

        // Huge Cargo Shipping Containers (Multi-colored stacks)
        const containerColors = [0xbf360c, 0x0d47a1, 0x004d40, 0xf57f17, 0x263238];
        const contGeo = new THREE.BoxGeometry(14, 5.5, 6);

        for (let x = -4; x <= 4; x++) {
            for (let z = -3; z <= 2; z++) {
                if (Math.abs(x) < 2 && Math.abs(z) < 2) continue; // Clear central yard for targets
                const stackHeight = 1 + Math.floor(Math.random() * 4);
                for (let h = 0; h < stackHeight; h++) {
                    const mat = new THREE.MeshStandardMaterial({
                        color: containerColors[(Math.abs(x + z + h)) % containerColors.length],
                        roughness: 0.5,
                        metalness: 0.4
                    });
                    const cont = new THREE.Mesh(contGeo, mat);
                    cont.position.set(x * 16 + (Math.random() - 0.5) * 2, 10 + 2.75 + h * 5.6, z * 14);
                    this.levelGroup.add(cont);

                    // Add evidence tag to container 402
                    if (x === 1 && z === 0 && h === 0) {
                        const manifestTag = new THREE.Mesh(
                            new THREE.PlaneGeometry(2, 1.4),
                            new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
                        );
                        manifestTag.position.set(cont.position.x + 7.05, cont.position.y, cont.position.z);
                        manifestTag.rotation.y = Math.PI / 2;
                        manifestTag.name = "EVIDENCE_MANIFEST_402";
                        this.levelGroup.add(manifestTag);
                    }
                }
            }
        }

        // Giant Crane 04 (Vantage Point Gantry)
        this.buildGiantCrane(-25, 10, 110);

        // Industrial Warehouse
        const wareMat = new THREE.MeshStandardMaterial({ color: 0x1c222b, roughness: 0.6, metalness: 0.5 });
        const warehouse = new THREE.Mesh(new THREE.BoxGeometry(60, 24, 70), wareMat);
        warehouse.position.set(65, 22, -30);
        this.levelGroup.add(warehouse);

        // Pier Floodlights
        [-30, 0, 30].forEach(px => {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 18, 8), wetConcrete);
            pole.position.set(px, 19, -45);
            this.levelGroup.add(pole);

            const light = new THREE.PointLight(0xffeedd, 1.5, 50);
            light.position.set(px, 27, -43);
            this.levelGroup.add(light);
        });
    }

    buildGiantCrane(x, y, z) {
        const steel = new THREE.MeshStandardMaterial({ color: 0xd35400, roughness: 0.5, metalness: 0.6 });
        // 4 Support Legs
        [-5, 5].forEach(ox => {
            [-5, 5].forEach(oz => {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 45, 6), steel);
                leg.position.set(x + ox, y + 22.5, z + oz);
                this.levelGroup.add(leg);
            });
        });

        // Crane Gantry Platform (Player Vantage)
        const platform = new THREE.Mesh(new THREE.BoxGeometry(16, 2, 16), steel);
        platform.position.set(x, y + 45, z);
        this.levelGroup.add(platform);

        // Crane Boom Arm extending over docks
        const boom = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 75), steel);
        boom.position.set(x, y + 50, z - 30);
        this.levelGroup.add(boom);

        // Cable & Hook
        const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 25, 6), steel);
        cable.position.set(x, y + 36, z - 45);
        this.levelGroup.add(cable);
    }

    // MISSION 3: ALPINE RIDGE SNOW RESORT
    buildMountainResort() {
        // Snow Ground Plane
        const snowMat = new THREE.MeshStandardMaterial({ color: 0xe6edf7, roughness: 0.85, metalness: 0.05 });
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(350, 350), snowMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        this.levelGroup.add(ground);

        // Timber / Glass VIP Conservatory (The Target Pavilion)
        const timberMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 });
        const warmGlass = new THREE.MeshPhysicalMaterial({ color: 0xfff0c2, transparent: true, opacity: 0.35, transmission: 0.7 });

        const pavBase = new THREE.Mesh(new THREE.BoxGeometry(32, 2, 28), timberMat);
        pavBase.position.set(0, 8.5, -20);
        this.levelGroup.add(pavBase);

        const pavWalls = new THREE.Mesh(new THREE.BoxGeometry(30, 8, 26), warmGlass);
        pavWalls.position.set(0, 13.5, -20);
        this.levelGroup.add(pavWalls);

        const pavRoof = new THREE.Mesh(new THREE.ConeGeometry(24, 7, 4), timberMat);
        pavRoof.rotation.y = Math.PI / 4;
        pavRoof.position.set(0, 20.5, -20);
        this.levelGroup.add(pavRoof);

        // Warm interior chandelier light
        const pavLight = new THREE.PointLight(0xffa737, 2.5, 45);
        pavLight.position.set(0, 14, -20);
        this.levelGroup.add(pavLight);

        // Timber Watchtower (Player Vantage)
        const towerLegs = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 38, 8), timberMat);
        towerLegs.position.set(0, 19, 130);
        this.levelGroup.add(towerLegs);

        const towerCabin = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 10), timberMat);
        towerCabin.position.set(0, 38, 130);
        this.levelGroup.add(towerCabin);

        // Pine Trees with Snow Caps (50+ procedural winter pines)
        for (let i = 0; i < 50; i++) {
            const tx = (Math.random() - 0.5) * 300;
            const tz = (Math.random() - 0.5) * 300;
            if (Math.abs(tx) < 25 && Math.abs(tz + 20) < 30) continue; // Keep pavilion clear
            if (Math.abs(tx) < 15 && Math.abs(tz - 130) < 20) continue; // Keep tower clear

            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 8, 6), timberMat);
            trunk.position.set(tx, 4, tz);
            this.levelGroup.add(trunk);

            const foliage = new THREE.Mesh(new THREE.ConeGeometry(3.5, 12, 6), snowMat);
            foliage.position.set(tx, 12, tz);
            this.levelGroup.add(foliage);
        }
    }

    // MISSION 4: COASTAL MARINA & LIGHTHOUSE
    buildCoastalMarina() {
        // Ocean & Boardwalk
        const waterGeo = new THREE.PlaneGeometry(400, 400);
        const oceanMat = new THREE.MeshStandardMaterial({ color: 0x071e2e, roughness: 0.1, metalness: 0.85 });
        const ocean = new THREE.Mesh(waterGeo, oceanMat);
        ocean.rotation.x = -Math.PI / 2;
        ocean.position.y = 0;
        this.levelGroup.add(ocean);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a3628, roughness: 0.7 });
        const dock = new THREE.Mesh(new THREE.BoxGeometry(40, 2, 140), woodMat);
        dock.position.set(10, 2, 20);
        this.levelGroup.add(dock);

        // Luxury Superyacht 'The Aegis' (Target Location)
        const yachtHullMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.2, metalness: 0.3 });
        const yachtTeak = new THREE.MeshStandardMaterial({ color: 0xa87343, roughness: 0.6 });

        const yachtHull = new THREE.Mesh(new THREE.BoxGeometry(16, 7, 55), yachtHullMat);
        yachtHull.position.set(10, 4.5, -18);
        this.levelGroup.add(yachtHull);

        const yachtDeck = new THREE.Mesh(new THREE.BoxGeometry(14, 1, 52), yachtTeak);
        yachtDeck.position.set(10, 8.2, -18);
        this.levelGroup.add(yachtDeck);

        const yachtCabin = new THREE.Mesh(new THREE.BoxGeometry(11, 4.5, 26), yachtHullMat);
        yachtCabin.position.set(10, 10.8, -22);
        this.levelGroup.add(yachtCabin);

        // Power Junction Box on dock (Secondary Objective)
        const juncBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.8), new THREE.MeshStandardMaterial({ color: 0xffaa00 }));
        juncBox.position.set(15, 3.8, -30);
        juncBox.name = "POWER_JUNCTION_BOX";
        this.levelGroup.add(juncBox);

        // Lighthouse Tower (Player Vantage Point)
        const whiteStone = new THREE.MeshStandardMaterial({ color: 0xededed, roughness: 0.6 });
        const lighthouse = new THREE.Mesh(new THREE.CylinderGeometry(4, 7, 55, 16), whiteStone);
        lighthouse.position.set(-40, 27.5, 105);
        this.levelGroup.add(lighthouse);

        const lhGallery = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 5.8, 3, 16), woodMat);
        lhGallery.position.set(-40, 52, 105);
        this.levelGroup.add(lhGallery);

        // Sweeping Volumetric Lighthouse Light
        const lhLight = new THREE.SpotLight(0xfff7d6, 4.0, 200, Math.PI / 8, 0.4);
        lhLight.position.set(-40, 56, 105);
        lhLight.target.position.set(0, 0, 0);
        this.scene.add(lhLight.target);
        this.levelGroup.add(lhLight);
        this.lighthouseLight = lhLight;
    }

    // MISSION 5: NEO-TOKYO NIGHT FESTIVAL
    buildNightFestival() {
        // Cobblestone ground
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.6 });
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(350, 350), stoneMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        this.levelGroup.add(ground);

        // Clocktower Vantage (Player perch)
        const brickMat = new THREE.MeshStandardMaterial({ color: 0x22262e, roughness: 0.7 });
        const tower = new THREE.Mesh(new THREE.BoxGeometry(18, 48, 18), brickMat);
        tower.position.set(0, 24, 115);
        this.levelGroup.add(tower);

        // Giant Rotating Ferris Wheel
        this.buildFerrisWheel(45, 32, -40);

        // Festive Torii Gates & Food Stalls
        const redMat = new THREE.MeshStandardMaterial({ color: 0xcc1100, roughness: 0.4 });
        const goldMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

        for (let i = -3; i <= 3; i++) {
            const torii = new THREE.Group();
            const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 9, 8), redMat);
            p1.position.set(-5, 4.5, 0);
            const p2 = p1.clone();
            p2.position.set(5, 4.5, 0);
            const beam = new THREE.Mesh(new THREE.BoxGeometry(13, 0.8, 0.8), redMat);
            beam.position.set(0, 8.5, 0);
            torii.add(p1, p2, beam);
            torii.position.set(0, 0, i * 18);
            this.levelGroup.add(torii);

            // Glowing Lanterns
            [-4, 4].forEach(lx => {
                const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), goldMat);
                lantern.position.set(lx, 7.5, i * 18);
                this.levelGroup.add(lantern);
            });
        }
    }

    buildFerrisWheel(x, y, z) {
        const wheelGroup = new THREE.Group();
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.8, roughness: 0.2 });
        const neonLightMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

        // Outer Ring
        const ringGeo = new THREE.TorusGeometry(26, 0.8, 8, 32);
        const ring = new THREE.Mesh(ringGeo, neonLightMat);
        wheelGroup.add(ring);

        // Spokes & Cabins
        const cabinCount = 12;
        const cabinMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
        for (let i = 0; i < cabinCount; i++) {
            const angle = (i / cabinCount) * Math.PI * 2;
            const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 26, 6), metalMat);
            spoke.rotation.z = angle;
            wheelGroup.add(spoke);

            const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3, 2.5), cabinMat);
            cabin.position.set(Math.cos(angle) * 26, Math.sin(angle) * 26, 0);
            wheelGroup.add(cabin);
        }

        wheelGroup.position.set(x, y, z);
        this.levelGroup.add(wheelGroup);
        this.ferrisWheel = wheelGroup;
    }

    triggerFirework() {
        const colors = [0xff0055, 0x00ffff, 0xffd700, 0x00ff66, 0xaa00ff];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const count = 90;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const vel = new Float32Array(count * 3);

        const origin = new THREE.Vector3((Math.random() - 0.5) * 120, 60 + Math.random() * 30, -50 + Math.random() * 40);

        for (let i = 0; i < count; i++) {
            pos[i * 3] = origin.x;
            pos[i * 3 + 1] = origin.y;
            pos[i * 3 + 2] = origin.z;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 12 + Math.random() * 18;
            vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
            vel[i * 3 + 1] = Math.cos(phi) * speed;
            vel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color: color,
            size: 1.2,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });

        const fwMesh = new THREE.Points(geo, mat);
        this.scene.add(fwMesh);
        this.fireworks.push({ mesh: fwMesh, velocities: vel, life: 1.0 });

        if (window.soundEngine) {
            window.soundEngine.playThunder();
        }
    }

    // MISSION 6: BLACK VEIL HEADQUARTERS (CLIMAX)
    buildBlackVeilHQ() {
        const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x07090c, roughness: 0.15, metalness: 0.95 });
        const redSecMat = new THREE.MeshBasicMaterial({ color: 0xff002b });
        const highGlass = new THREE.MeshPhysicalMaterial({ color: 0x111c28, transparent: true, opacity: 0.4, transmission: 0.85 });

        // Obsidian Monolith Tower
        const monolith = new THREE.Mesh(new THREE.BoxGeometry(60, 90, 60), obsidianMat);
        monolith.position.set(0, 15, -25);
        this.levelGroup.add(monolith);

        // Director's Penthouse Suite (Glass Sanctum)
        const penthouse = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 12, 24), highGlass);
        penthouse.position.set(0, 36, -25);
        this.levelGroup.add(penthouse);

        // Obsidian Executive Desk & Holo-Projector
        const desk = new THREE.Mesh(new THREE.BoxGeometry(8, 1.4, 3.5), obsidianMat);
        desk.position.set(0, 31, -26);
        this.levelGroup.add(desk);

        const holoLight = new THREE.PointLight(0x00f0ff, 2.0, 20);
        holoLight.position.set(0, 33, -26);
        this.levelGroup.add(holoLight);

        // Player Infiltration Helipad Spire (North Vantage)
        const helipad = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 4, 16), obsidianMat);
        helipad.position.set(0, 54, 125);
        this.levelGroup.add(helipad);

        // Helipad Yellow Markings
        const markH = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide }));
        markH.rotation.x = -Math.PI / 2;
        markH.position.set(0, 56.1, 125);
        this.levelGroup.add(markH);

        // Sweeping Security Lasers & Beacons
        [-20, 20].forEach(sx => {
            const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), redSecMat);
            beacon.position.set(sx, 61, -25);
            this.levelGroup.add(beacon);
        });
    }

    update(delta) {
        // Animate weather particles (Rain / Snow)
        if (this.weatherParticles) {
            const positions = this.weatherParticles.geometry.attributes.position.array;
            const count = positions.length / 3;
            const isSnow = this.weatherType === 'Snow';

            for (let i = 0; i < count; i++) {
                positions[i * 3 + 1] -= this.particleVelocities[i] * delta;
                if (isSnow) {
                    positions[i * 3] += Math.sin(positions[i * 3 + 1] * 0.1) * delta * 2;
                }
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3 + 1] = 110;
                }
            }
            this.weatherParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Animate street traffic
        this.trafficMeshes.forEach(car => {
            car.position.z += car.userData.speed * delta;
            if (car.position.z > 160) car.position.z = -150;
            if (car.position.z < -150) car.position.z = 160;
        });

        // Rotate Ferris wheel in festival
        if (this.ferrisWheel) {
            this.ferrisWheel.rotation.z += delta * 0.15;
            // Trigger periodic fireworks
            if (Math.random() < 0.015) {
                this.triggerFirework();
            }
        }

        // Rotate Lighthouse spotlight
        if (this.lighthouseLight) {
            const time = performance.now() * 0.001;
            this.lighthouseLight.target.position.x = Math.cos(time * 0.8) * 90;
            this.lighthouseLight.target.position.z = Math.sin(time * 0.8) * 90;
        }

        // Update active fireworks
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            fw.life -= delta * 0.8;
            const pos = fw.mesh.geometry.attributes.position.array;
            for (let p = 0; p < pos.length / 3; p++) {
                pos[p * 3] += fw.velocities[p * 3] * delta;
                pos[p * 3 + 1] += (fw.velocities[p * 3 + 1] - 9.8 * (1 - fw.life)) * delta;
                pos[p * 3 + 2] += fw.velocities[p * 3 + 2] * delta;
            }
            fw.mesh.geometry.attributes.position.needsUpdate = true;
            fw.mesh.material.opacity = Math.max(0, fw.life);

            if (fw.life <= 0) {
                this.scene.remove(fw.mesh);
                fw.mesh.geometry.dispose();
                fw.mesh.material.dispose();
                this.fireworks.splice(i, 1);
            }
        }

        // Dynamic lightning flashes during storms
        if (this.weatherType === 'Storm') {
            this.lightningTimer += delta;
            if (this.lightningTimer > this.nextLightning) {
                this.lightningTimer = 0;
                this.nextLightning = 6 + Math.random() * 8;
                if (this.directionalLight) {
                    this.directionalLight.intensity = 4.5;
                    setTimeout(() => { if (this.directionalLight) this.directionalLight.intensity = 0.9; }, 90);
                    setTimeout(() => { if (this.directionalLight) this.directionalLight.intensity = 3.0; }, 160);
                    setTimeout(() => { if (this.directionalLight) this.directionalLight.intensity = 0.9; }, 220);
                }
                if (window.soundEngine) {
                    setTimeout(() => window.soundEngine.playThunder(), 300);
                }
            }
        }
    }
}

window.EnvironmentSystem = EnvironmentSystem;
