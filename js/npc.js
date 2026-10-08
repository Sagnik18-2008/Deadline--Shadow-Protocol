// DEADLINE: SHADOW PROTOCOL - Living NPC & Target AI System
// 3D Procedural Humanoid Rigs, Daily Schedule Routines, Bodyguards, 3-Stage Awareness, Hit Reaction & Ragdoll Collapse.

class NPCSystem {
    constructor(scene) {
        this.scene = scene;
        this.npcs = [];
        this.targetNPC = null;
        this.awarenessState = 0; // 0: Normal, 1: Suspicious, 2: Alert
        this.awarenessTimer = 0;
    }

    clearNPCs() {
        this.npcs.forEach(npc => {
            if (npc.mesh) {
                this.scene.remove(npc.mesh);
                npc.mesh.traverse(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                        else child.material.dispose();
                    }
                });
            }
        });
        this.npcs = [];
        this.targetNPC = null;
        this.awarenessState = 0;
    }

    createHumanoidMesh(config) {
        const group = new THREE.Group();

        // Materials
        const skinMat = new THREE.MeshStandardMaterial({ color: config.skinColor || 0xdcb898, roughness: 0.6 });
        const coatMat = new THREE.MeshStandardMaterial({
            color: config.coatColor || 0x22262e,
            roughness: 0.5,
            metalness: config.coatMetalness || 0.1
        });
        const pantsMat = new THREE.MeshStandardMaterial({ color: config.pantsColor || 0x181a20, roughness: 0.7 });
        const shoesMat = new THREE.MeshStandardMaterial({ color: 0x0f1114, roughness: 0.8 });

        // Torso / Coat
        const torsoGeo = new THREE.BoxGeometry(0.8, 1.2, 0.45);
        const torso = new THREE.Mesh(torsoGeo, coatMat);
        torso.position.y = 2.0;
        group.add(torso);

        // Head & Neck
        const headGeo = new THREE.SphereGeometry(0.3, 12, 12);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 2.95;
        group.add(head);

        // Glasses if applicable
        if (config.hasGlasses) {
            const glassesGeo = new THREE.BoxGeometry(0.42, 0.1, 0.25);
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 });
            const glasses = new THREE.Mesh(glassesGeo, goldMat);
            glasses.position.set(0, 2.96, 0.2);
            group.add(glasses);
        }

        // Left & Right Arms
        const armGeo = new THREE.BoxGeometry(0.24, 1.0, 0.24);
        const leftArm = new THREE.Mesh(armGeo, coatMat);
        leftArm.position.set(-0.52, 1.9, 0);
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, coatMat);
        rightArm.position.set(0.52, 1.9, 0);
        group.add(rightArm);

        // Briefcase / Datapad in hand if specified
        if (config.hasBriefcase) {
            const caseGeo = new THREE.BoxGeometry(0.12, 0.45, 0.6);
            const caseMat = new THREE.MeshStandardMaterial({ color: 0x2a333d, metalness: 0.8 });
            const briefcase = new THREE.Mesh(caseGeo, caseMat);
            briefcase.position.set(0.65, 1.3, 0.1);
            group.add(briefcase);
        }

        if (config.hasDatapad) {
            const padGeo = new THREE.BoxGeometry(0.06, 0.35, 0.4);
            const padMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
            const datapad = new THREE.Mesh(padGeo, padMat);
            datapad.position.set(0.55, 1.6, 0.25);
            datapad.rotation.x = 0.5;
            group.add(datapad);
        }

        // Left & Right Legs
        const legGeo = new THREE.BoxGeometry(0.3, 1.2, 0.3);
        const leftLeg = new THREE.Mesh(legGeo, pantsMat);
        leftLeg.position.set(-0.25, 0.7, 0);
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, pantsMat);
        rightLeg.position.set(0.25, 0.7, 0);
        group.add(rightLeg);

        // Shoes
        const shoeGeo = new THREE.BoxGeometry(0.32, 0.2, 0.48);
        const leftShoe = new THREE.Mesh(shoeGeo, shoesMat);
        leftShoe.position.set(-0.25, 0.1, 0.08);
        group.add(leftShoe);

        const rightShoe = new THREE.Mesh(shoeGeo, shoesMat);
        rightShoe.position.set(0.25, 0.1, 0.08);
        group.add(rightShoe);

        // Marker indicator (overhead diamond for drone/tactical view)
        const tagGeo = new THREE.OctahedronGeometry(0.25);
        const tagMat = new THREE.MeshBasicMaterial({
            color: config.isTarget ? 0xff2a48 : 0x00e5ff,
            wireframe: true,
            visible: false
        });
        const tagMesh = new THREE.Mesh(tagGeo, tagMat);
        tagMesh.position.y = 3.6;
        group.add(tagMesh);

        group.userData = {
            id: config.id,
            name: config.name || "Civ/Security",
            isTarget: !!config.isTarget,
            isBodyguard: !!config.isBodyguard,
            hasLimp: !!config.hasLimp,
            alive: true,
            leftLeg,
            rightLeg,
            leftArm,
            rightArm,
            tagMesh,
            clues: config.clues || [],
            walkCycle: Math.random() * 10
        };

        return group;
    }

    spawnMissionNPCs(mission) {
        this.clearNPCs();

        // 1. Spawn Target NPC with specific attributes from mission
        let targetConfig = {
            id: "target_primary",
            name: mission.targetName,
            isTarget: true,
            skinColor: 0xdcb898,
            coatColor: 0xeeeeee, // White coat for Vector, dark for Reznik, etc.
            coatMetalness: 0.1,
            pantsColor: 0x111317,
            hasBriefcase: false,
            hasDatapad: false,
            hasGlasses: false,
            hasLimp: false,
            clues: mission.targetClues
        };

        if (mission.id === "contract_01") {
            targetConfig.coatColor = 0xf0f4f8; // White high-collar trenchcoat
            targetConfig.hasDatapad = true;
        } else if (mission.id === "contract_02") {
            targetConfig.coatColor = 0x242e29; // Bulky dark military parka
            targetConfig.coatMetalness = 0.4;
        } else if (mission.id === "contract_03") {
            targetConfig.coatColor = 0x3d352e;
            targetConfig.hasGlasses = true;
            targetConfig.hasLimp = true;
        } else if (mission.id === "contract_04") {
            targetConfig.coatColor = 0x152845; // Navy blazer
            targetConfig.pantsColor = 0xf0f0f0;
        } else if (mission.id === "contract_05") {
            targetConfig.coatColor = 0x8a1c2f; // Crimson festival disguise
        } else if (mission.id === "contract_06") {
            targetConfig.coatColor = 0x090b0e; // Obsidian Director suit
            targetConfig.coatMetalness = 0.8;
        }

        const targetMesh = this.createHumanoidMesh(targetConfig);
        const initPos = mission.targetRoutine[0].pos;
        targetMesh.position.set(initPos[0], initPos[1], initPos[2]);
        this.scene.add(targetMesh);

        this.targetNPC = {
            mesh: targetMesh,
            data: targetMesh.userData,
            routine: mission.targetRoutine,
            routineIndex: 0,
            waitTimer: mission.targetRoutine[0].wait,
            currentWaypoint: new THREE.Vector3(...initPos),
            targetWaypoint: new THREE.Vector3(...initPos),
            speed: 1.8
        };
        this.npcs.push(this.targetNPC);

        // 2. Spawn Bodyguards flanking target
        const guardCount = mission.id === "contract_06" ? 3 : 2;
        for (let g = 0; g < guardCount; g++) {
            const guardMesh = this.createHumanoidMesh({
                id: `guard_${g}`,
                name: `Tactical Escort ${g + 1}`,
                isTarget: false,
                isBodyguard: true,
                coatColor: 0x111318,
                pantsColor: 0x111318,
                skinColor: 0xcca080
            });
            const offset = (g === 0) ? -2.8 : 2.8;
            guardMesh.position.set(initPos[0] + offset, initPos[1], initPos[2] + 1.2);
            this.scene.add(guardMesh);
            this.npcs.push({
                mesh: guardMesh,
                data: guardMesh.userData,
                offsetZ: 1.5,
                offsetX: offset,
                speed: 1.8
            });
        }

        // 3. Spawn Civilians / Suspects / Workers in the mission area
        const civCount = (mission.id === "contract_05") ? 22 : (mission.id === "contract_03" ? 6 : 10);
        const colors = [0x4a5b6e, 0x8a4b38, 0x2d5a42, 0x5a4d6b, 0x3b3d42];

        for (let c = 0; c < civCount; c++) {
            const isMission3Decoy = (mission.id === "contract_03" && (c === 0 || c === 1));
            const civMesh = this.createHumanoidMesh({
                id: `civ_${c}`,
                name: isMission3Decoy ? (c === 0 ? "Researcher Kroll" : "Dr. Soren Lind") : `Civilian 0${c + 1}`,
                isTarget: false,
                coatColor: colors[c % colors.length],
                pantsColor: 0x181a20,
                hasGlasses: c % 3 === 0,
                hasBriefcase: c % 4 === 0
            });

            // Position civilians around target area
            const cx = initPos[0] + (Math.random() - 0.5) * 45;
            const cz = initPos[2] + (Math.random() - 0.5) * 35;
            civMesh.position.set(cx, initPos[1], cz);
            civMesh.rotation.y = Math.random() * Math.PI * 2;
            this.scene.add(civMesh);

            this.npcs.push({
                mesh: civMesh,
                data: civMesh.userData,
                patrolOrigin: new THREE.Vector3(cx, initPos[1], cz),
                patrolTarget: new THREE.Vector3(cx + (Math.random() - 0.5) * 12, initPos[1], cz + (Math.random() - 0.5) * 12),
                speed: 1.2 + Math.random() * 0.5,
                waitTimer: 4 + Math.random() * 8
            });
        }
    }

    setAwareness(state) {
        if (this.awarenessState !== state) {
            this.awarenessState = state;
            if (window.soundEngine) {
                window.soundEngine.setTensionLevel(state);
            }
            const hudStatus = document.getElementById('target-status-indicator');
            if (hudStatus) {
                if (state === 0) {
                    hudStatus.innerText = "STATUS: UNAWARE";
                    hudStatus.className = "status-green";
                } else if (state === 1) {
                    hudStatus.innerText = "STATUS: SUSPICIOUS";
                    hudStatus.className = "status-yellow";
                } else {
                    hudStatus.innerText = "STATUS: ALERT";
                    hudStatus.className = "status-red";
                }
            }
        }
    }

    checkHit(raycaster) {
        const hitMeshes = [];
        this.npcs.forEach(npc => {
            if (npc.data.alive && npc.mesh) {
                hitMeshes.push(npc.mesh);
            }
        });

        const intersects = raycaster.intersectObjects(hitMeshes, true);
        if (intersects.length > 0) {
            let hitObj = intersects[0].object;
            // Climb up to root humanoid group
            while (hitObj.parent && !hitObj.userData.id) {
                hitObj = hitObj.parent;
            }

            if (hitObj.userData && hitObj.userData.alive) {
                this.eliminateNPC(hitObj);
                return {
                    hit: true,
                    isTarget: hitObj.userData.isTarget,
                    npcData: hitObj.userData,
                    point: intersects[0].point
                };
            }
        }
        return { hit: false };
    }

    eliminateNPC(humanoidGroup) {
        humanoidGroup.userData.alive = false;
        if (window.soundEngine) {
            window.soundEngine.playTargetEliminated();
        }

        // Ragdoll / Fall backward animation
        let fallProgress = 0;
        const startY = humanoidGroup.position.y;
        const anim = () => {
            fallProgress += 0.08;
            humanoidGroup.rotation.x = -fallProgress * (Math.PI / 2);
            humanoidGroup.position.y = startY - Math.sin(fallProgress) * 0.8;
            if (fallProgress < 1.0) {
                requestAnimationFrame(anim);
            } else {
                humanoidGroup.rotation.x = -Math.PI / 2;
                humanoidGroup.position.y = startY + 0.2;
            }
        };
        requestAnimationFrame(anim);

        // Cause immediate alert if anyone sees the body
        this.setAwareness(2);
    }

    update(delta) {
        // Update Target Routine Schedule
        if (this.targetNPC && this.targetNPC.data.alive) {
            const t = this.targetNPC;
            if (t.waitTimer > 0) {
                t.waitTimer -= delta;
                // Idle posture
                t.data.leftLeg.rotation.x = 0;
                t.data.rightLeg.rotation.x = 0;
            } else {
                // Move towards current routine waypoint
                const targetWp = new THREE.Vector3(...t.routine[t.routineIndex].pos);
                const dir = targetWp.clone().sub(t.mesh.position);
                const dist = dir.length();

                if (dist > 0.4) {
                    dir.normalize();
                    const walkSpeed = t.data.hasLimp ? t.speed * 0.6 : t.speed;
                    t.mesh.position.addScaledVector(dir, walkSpeed * delta);
                    t.mesh.rotation.y = Math.atan2(dir.x, dir.z);

                    // Animate legs walking
                    t.data.walkCycle += delta * (t.data.hasLimp ? 5 : 8);
                    const legAngle = Math.sin(t.data.walkCycle) * 0.45;
                    t.data.leftLeg.rotation.x = legAngle;
                    t.data.rightLeg.rotation.x = -legAngle;
                    t.data.leftArm.rotation.x = -legAngle * 0.7;
                    t.data.rightArm.rotation.x = legAngle * 0.7;
                } else {
                    // Waypoint reached, advance routine
                    t.routineIndex = (t.routineIndex + 1) % t.routine.length;
                    t.waitTimer = t.routine[t.routineIndex].wait;
                }
            }
        }

        // Update Bodyguards (follow target)
        this.npcs.forEach(npc => {
            if (npc.data.isBodyguard && npc.data.alive && this.targetNPC && this.targetNPC.data.alive) {
                const targetPos = this.targetNPC.mesh.position.clone();
                const targetRot = this.targetNPC.mesh.rotation.y;
                const flankOffset = new THREE.Vector3(npc.offsetX, 0, npc.offsetZ).applyAxisAngle(new THREE.Vector3(0, 1, 0), targetRot);
                const desiredPos = targetPos.add(flankOffset);

                const dir = desiredPos.clone().sub(npc.mesh.position);
                const dist = dir.length();
                if (dist > 0.5) {
                    dir.normalize();
                    npc.mesh.position.addScaledVector(dir, npc.speed * delta);
                    npc.mesh.rotation.y = Math.atan2(dir.x, dir.z);

                    npc.data.walkCycle += delta * 7;
                    const legAngle = Math.sin(npc.data.walkCycle) * 0.4;
                    npc.data.leftLeg.rotation.x = legAngle;
                    npc.data.rightLeg.rotation.x = -legAngle;
                } else {
                    npc.data.leftLeg.rotation.x = 0;
                    npc.data.rightLeg.rotation.x = 0;
                }
            } else if (!npc.data.isTarget && !npc.data.isBodyguard && npc.data.alive) {
                // Civilians wandering
                if (npc.waitTimer > 0) {
                    npc.waitTimer -= delta;
                    npc.data.leftLeg.rotation.x = 0;
                    npc.data.rightLeg.rotation.x = 0;
                } else {
                    const dir = npc.patrolTarget.clone().sub(npc.mesh.position);
                    const dist = dir.length();
                    if (dist > 0.4) {
                        dir.normalize();
                        npc.mesh.position.addScaledVector(dir, npc.speed * delta);
                        npc.mesh.rotation.y = Math.atan2(dir.x, dir.z);
                        npc.data.walkCycle += delta * 6;
                        npc.data.leftLeg.rotation.x = Math.sin(npc.data.walkCycle) * 0.35;
                        npc.data.rightLeg.rotation.x = -Math.sin(npc.data.walkCycle) * 0.35;
                    } else {
                        npc.patrolTarget = npc.patrolOrigin.clone().add(new THREE.Vector3((Math.random() - 0.5) * 16, 0, (Math.random() - 0.5) * 16));
                        npc.waitTimer = 5 + Math.random() * 8;
                    }
                }
            }
        });
    }
}

window.NPCSystem = NPCSystem;
