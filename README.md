# 🎯 DEADLINE: SHADOW PROTOCOL
### 3D Tactical Sniper • Stealth • Covert Intelligence Action

![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PC%20%7C%20Mobile-cyan)
![Engine](https://img.shields.io/badge/Engine-Three.js%20r128%20%2B%20HTML5%20Canvas-blue)
![Audio](https://img.shields.io/badge/Audio-Procedural%20Web%20Audio%20API-emerald)
![License](https://img.shields.io/badge/License-MIT-gold)
![Deployment](https://img.shields.io/badge/Deploy-GitHub%20Pages%20Ready-success)

---

## 📖 STORY & CONTEXT
You are **Agent 0-Shadow**, a top-tier covert marksman operating under the command of **BLACK VEIL**, a shadow intelligence syndicate. What begins as high-value precision contracts across the globe soon unravels into a conspiracy reaching the highest echelon of the agency itself.

Someone inside BLACK VEIL is systematically eliminating key figures connected to **PROJECT OBLIVION**—a covert global assassination protocol. In the climax, infiltrate the **Obsidian Citadel** to confront Director Kaelen and decide the fate of Black Veil across **4 branching narrative endings**.

---

## 🕹️ CORE GAMEPLAY LOOP
```
MISSION BRIEFING (Phase 1)
       ↓
STUDY ENVIRONMENT & WEATHER (Phase 2)
       ↓
DEPLOY RECON DRONE & SCAN TARGET (Phase 3)
       ↓
SELECT VANTAGE POINT (Phase 4)
       ↓
WAIT FOR ROUTINE OPPORTUNITY (Phase 5)
       ↓
HOLD BREATH & TAKE THE SHOT
       ↓
ESCAPE / REMAIN UNDETECTED (Exposure Meter)
       ↓
MISSION EVALUATION & RATING (1 - 5 Stars)
       ↓
UPGRADE WEAPONS IN ARMORY / NEXT CONTRACT
```

---

## 🎮 CONTROLS REFERENCE
| Action | Key / Input | Description |
| :--- | :--- | :--- |
| **Aim** | `Mouse Movement` | Look around vantage or direct drone camera |
| **Toggle Scope** | `Right Click` | Switch between Hipfire and High-Power Scope |
| **Fire Sniper Rifle** | `Left Click` | Fire .338 Lapua Magnum round |
| **Hold Breath** | `Shift` (Hold) | Steady reticle, eliminates scope sway |
| **Cycle Magnification** | `Z` | Cycle optical zoom (`2X`, `4X`, `8X`, `16X`) |
| **FLIR Thermal Vision** | `T` | Toggle thermal imaging overlay *(Armory upgrade)* |
| **Deploy / Recall Drone** | `D` / `Esc` | Launch miniature aerial reconnaissance drone |
| **Switch Vantage Point** | `V` or `Q` | Reposition between vantage positions |
| **Drone Flight** | `W / A / S / D` | Fly drone forward, left, backward, right |
| **Drone Altitude** | `Space` / `C` | Ascend / Descend |
| **Biometric Scan** | `Left Click` or `E` | Scan suspects in drone view to confirm contract identity |
| **Photograph Evidence** | `F` | Capture surveillance photos of manifests/dossiers |
| **Reload** | `R` | Chamber new magazine |

---

## 🗺️ 6-MISSION CAMPAIGN

### Contract 01 — Operation Glass Horizon
- **Location:** Apex District Downtown Skyline
- **Target:** Viktor "Vector" Chen (Cyber Warfare Broker)
- **Environment:** Clear Night, towering neon skyscrapers, moving traffic
- **Clues:** Illuminated white trenchcoat, glowing cyan datapad, dual security detail

### Contract 02 — Operation Rust Tide
- **Location:** Khorov Industrial Docks, Pier 9
- **Target:** Dmitri "Ironclad" Reznik (Munitions Supplier)
- **Environment:** Heavy Rain, reflective wet concrete, cargo crane, shipping container stacks
- **Secondary:** Deploy drone to photograph shipping manifest on container 402

### Contract 03 — Operation White Crucible
- **Location:** Valen Alpine Chalet Resort
- **Target:** Dr. Alexey Vance (Neuro-Cybernetic Researcher)
- **Environment:** Blizzard Snow, timber chalets, VIP heated glass pavilion
- **Detective Mechanic:** 3 suspects in the pavilion—identify Vance by his limp, spectacles, and bio-cylinder

### Contract 04 — Operation Crimson Marina
- **Location:** Porto Serena Marina & Lighthouse
- **Target:** Senator Corbin Vales (Black Veil Oversight)
- **Environment:** Golden Sunset, superyacht "The Aegis", sweeping lighthouse beacon
- **Secondary:** Shoot dock electrical junction box to cut yacht security power

### Contract 05 — Operation Neon Labyrinth
- **Location:** Neo-Tokyo Night Festival
- **Target:** Kasumi "Phantasm" Mori (Master Impersonator)
- **Environment:** Bustling crowds, illuminated torii gates, rotating Ferris wheel & fireworks
- **Tactical Feature:** Mask rifle report with fireworks explosions to eliminate target undetected

### Contract 06 — Operation The Last Contract (CLIMAX)
- **Location:** The Obsidian Citadel (Black Veil Central Command)
- **Target:** Director Cornelius Kaelen
- **Environment:** Violent lightning storm, volumetric fog, helipad infiltration
- **4 Branching Endings:**
  - **Ending A — Obedience:** Execute Kaelen and take his seat as the new Director
  - **Ending B — Betrayal:** Broadcast Project OBLIVION to global media
  - **Ending C — Escape:** Erase your digital identity and vanish with project files
  - **Ending D — Truth:** Confront Kaelen and break the simulation loop

---

## 🛠️ WEAPONS & ARMORY SYSTEM
Earn **Intel Points** on contract completion to unlock equipment:
1. **Whisper Carbon Suppressor:** Eliminates muzzle flash, cuts exposure gain by 75%
2. **Digital Thermal Overlay:** FLIR thermal sensor highlighting body heat signatures
3. **Tactical Laser Rangefinder:** Live distance computation and wind drift compensation
4. **Hydro-Stabilized Bipod:** 60% reduction in weapon sway
5. **Active Camouflage Suit:** Optical refraction reduces guard detection speed by 50%
6. **Extended 8-Round Magazine:** Increases rifle capacity from 5 to 8 rounds

---

## 🔊 PROCEDURAL AUDIO ENGINE
Zero external audio files required! Built entirely with the **Web Audio API**:
- Synthesized supersonic crack, muzzle blast, and urban reverb echo
- Suppressed whisper pop and bolt cycling mechanics
- Organic heartbeat thumping and deep breath exhalations
- Quadcopter drone motor hum with rotor flutter
- Dynamic tension music that dynamically intensifies between **Normal**, **Suspicious**, and **Alert** states
- Procedural rain washes, wind howling, and thunder rumbles

---

## 🚀 1-CLICK GITHUB DEPLOYMENT (GitHub Pages)

This project is completely self-contained with zero build steps or compilation needed:

1. Create a new repository on GitHub:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git branch -M main
   git push -u origin main
   ```
2. In your repository on GitHub:
   - Go to **Settings** → **Pages**
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**
   - Branch: select `main` / `root` and click **Save**
3. Your game is immediately live at `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`!

### Local Development / Offline Play
Simply serve with any local HTTP server or double-click:
```bash
# Python
python -m http.server 8000

# Open in browser:
http://localhost:8000/
```

---

*DEADLINE: SHADOW PROTOCOL — Built with HTML5, CSS3, JavaScript, WebGL (Three.js), and Web Audio API.*
