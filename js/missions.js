// DEADLINE: SHADOW PROTOCOL - Mission Campaign Database & Intel Lore
// 6 Distinct Operations across Downtown, Industrial Docks, Mountain Resort, Coastal Marina, Night Festival & Black Veil HQ.

const MISSIONS_DATA = [
    {
        id: "contract_01",
        number: "01",
        codename: "OPERATION GLASS HORIZON",
        title: "DOWNTOWN SKYLINE",
        targetName: "VIKTOR 'VECTOR' CHEN",
        targetTitle: "Cyber Warfare Broker",
        location: "Apex District, Neo-Veridia",
        environment: "Clear Night / Urban Smog",
        weather: "Clear",
        timeOfDay: "23:15",
        threatLevel: "3/10",
        recommendedApproach: "High-altitude rooftop perch. Observe the penthouse balcony across the boulevard. Vector paces between the executive bar and open terrace.",
        briefingText: "Vector is auctioning decrypted Black Veil field agent ciphers to an offshore buyer. Terminate Vector before the transmission buffer completes. Ensure no collateral damage on civilian streets below.",
        primaryObjective: "Neutralize Viktor Chen",
        secondaryObjective: "Eliminate target while undetected",
        vantagePoints: [
            { id: "roof_a", name: "Apex Spire (North)", pos: [0, 48, 120], lookAt: [0, 22, -30], desc: "Elevated direct line of sight to the penthouse lounge." },
            { id: "roof_b", name: "HVAC Gantry (East)", pos: [55, 38, 70], lookAt: [0, 22, -30], desc: "Side angle, partial glass cover, sheltered from street lights." }
        ],
        targetClues: [
            "Wearing an illuminated high-collar white trenchcoat",
            "Carries a chrome datapad glowing cyan",
            "Flanked by two private corporate security escorts"
        ],
        targetRoutine: [
            { time: "23:15", location: "Terrace Bar", desc: "Pouring a drink with bodyguard", pos: [-6, 22, -32], wait: 12 },
            { time: "23:17", location: "Balcony Edge", desc: "Inspecting datapad overlooking skyline", pos: [2, 22, -38], wait: 14 },
            { time: "23:20", location: "Inside Suite", desc: "Reviewing server console through glass", pos: [8, 22, -26], wait: 10 }
        ],
        rewardIntel: 150,
        loreDrop: "Decrypted audio file extracted from Chen's pad: 'Black Veil didn't build the backdoor. Someone inside is erasing agent files from within.'"
    },
    {
        id: "contract_02",
        number: "02",
        codename: "OPERATION RUST TIDE",
        title: "INDUSTRIAL DOCKS",
        targetName: "DMITRI 'IRONCLAD' REZNIK",
        targetTitle: "Black Market Munitions Supplier",
        location: "Khorov Industrial Harbor, Pier 9",
        environment: "Heavy Rain & Wet Reflections",
        weather: "Heavy Rain",
        timeOfDay: "01:40",
        threatLevel: "5/10",
        recommendedApproach: "Perch atop Cargo Crane 04 gantry. Rain drastically lowers sound travel; unsuppressed rifle fire will echo off containers.",
        briefingText: "Reznik is overseeing the offloading of military-grade EMP warheads. Before neutralizing Reznik, use your recon drone to photograph the container shipping manifest for Black Veil intelligence.",
        primaryObjective: "Neutralize Dmitri Reznik",
        secondaryObjective: "Photograph shipping manifest on container 402",
        vantagePoints: [
            { id: "crane_gantry", name: "Crane 04 Gantry", pos: [-25, 42, 110], lookAt: [15, 6, -10], desc: "High vantage overlooking container yard and dock slipway." },
            { id: "warehouse_roof", name: "Warehouse B Silo", pos: [45, 30, 85], lookAt: [15, 6, -10], desc: "Closer distance, reduced wind drift, heavy rain cover." }
        ],
        targetClues: [
            "Bulky dark military parka with orange reflective patches",
            "Smokes electronic cigars, producing distinctive smoke puffs",
            "Paces between the yellow forklift and container cluster 402"
        ],
        targetRoutine: [
            { time: "01:40", location: "Cargo Stack", desc: "Arguing with cargo loader foreman", pos: [12, 6, -14], wait: 15 },
            { time: "01:43", location: "Open Dock", desc: "Inspecting open container manifest", pos: [18, 6, -6], wait: 14 },
            { time: "01:46", location: "Crane Footing", desc: "Lighting cigar under floodlight", pos: [6, 6, -18], wait: 12 }
        ],
        evidencePos: [19, 7.5, -5],
        rewardIntel: 200,
        loreDrop: "Manifest log confirms: The weapons shipment was billed directly to an internal Black Veil Black-Ops budget code: 'PROJECT OBLIVION'."
    },
    {
        id: "contract_03",
        number: "03",
        codename: "OPERATION WHITE CRUCIBLE",
        title: "ALPINE RIDGE RESORT",
        targetName: "DR. ALEXEY VANCE",
        targetTitle: "Lead Neuro-Cybernetic Researcher",
        location: "Valen Alpine Chalet Resort",
        environment: "Blizzard Snow & High Winds",
        weather: "Snow",
        timeOfDay: "16:20",
        threatLevel: "6/10",
        recommendedApproach: "South Ski Watchtower. The blizzard reduces thermal dissipation. Dr. Vance is meeting with two decoys in the glass pavilion. Identify the real Vance before firing.",
        briefingText: "Intelligence reports 3 scientists are sheltering in the heated VIP conservatory. Only ONE is Dr. Vance. Vance injured his knee during extraction and wears gold-rimmed optical specs. Do not neutralize the civilian researchers.",
        primaryObjective: "Correctly identify & eliminate Dr. Vance",
        secondaryObjective: "Zero civilian casualties among researchers",
        vantagePoints: [
            { id: "watchtower_south", name: "South Pine Watchtower", pos: [0, 36, 130], lookAt: [0, 10, -20], desc: "Elevated timber watchtower piercing through snow haze." },
            { id: "ski_lift_perch", name: "Old Cableway Platform", pos: [-60, 28, 90], lookAt: [0, 10, -20], desc: "Flank angle with direct view through east panoramic windows." }
        ],
        targetClues: [
            "Distinct limp when walking between laboratory tables",
            "Gold-rimmed tactical optical spectacles",
            "Carries an encrypted blue bio-sample cylinder in left hand"
        ],
        targetRoutine: [
            { time: "16:20", location: "Window Table", desc: "Examining bio-cylinder under chandelier", pos: [0, 10, -22], wait: 14 },
            { time: "16:23", location: "Fireplace Lounge", desc: "Limping to hearth to warm hands", pos: [-7, 10, -18], wait: 15 },
            { time: "16:26", location: "Balcony Door", desc: "Gazing outside at blizzard", pos: [6, 10, -24], wait: 12 }
        ],
        suspects: [
            { id: "suspect_a", name: "Dr. Alexey Vance", isTarget: true, cluesMatch: true, limp: true, glasses: true, cylinder: true },
            { id: "suspect_b", name: "Researcher Kroll", isTarget: false, cluesMatch: false, limp: false, glasses: false, cylinder: false },
            { id: "suspect_c", name: "Dr. Soren Lind", isTarget: false, cluesMatch: false, limp: false, glasses: true, cylinder: false }
        ],
        rewardIntel: 250,
        loreDrop: "Audio tape recovered from Vance: 'We weren't researching targets. We were profiling our own field operatives... including Agent 0-Shadow.'"
    },
    {
        id: "contract_04",
        number: "04",
        codename: "OPERATION CRIMSON MARINA",
        title: "COASTAL HARBOR",
        targetName: "SENATOR CORBIN VALES",
        targetTitle: "Corrupt Black Veil Oversight Committee Member",
        location: "Porto Serena Marina & Lighthouse",
        environment: "Golden Sunset & Ocean Reflections",
        weather: "Clear",
        timeOfDay: "18:45",
        threatLevel: "7/10",
        recommendedApproach: "Lighthouse observation balcony. The setting sun causes lens flare if aiming west; position high above the yacht moorings.",
        briefingText: "Vales is transferring an encrypted ledger on his superyacht 'The Aegis'. Primary order is to eliminate Vales. Secondary objective: shoot the yacht power junction box to disable security cameras before taking out Vales.",
        primaryObjective: "Neutralize Senator Vales",
        secondaryObjective: "Shoot power junction box to disable security",
        vantagePoints: [
            { id: "lighthouse_gallery", name: "Lighthouse Gallery", pos: [-40, 52, 105], lookAt: [10, 8, -15], desc: "Commanding 360 view of yacht moorings and marina boardwalk." },
            { id: "marina_breakwater", name: "Breakwater Gantry", pos: [50, 24, 75], lookAt: [10, 8, -15], desc: "Low water level vantage, zero sun flare, close range." }
        ],
        targetClues: [
            "Tailored navy double-breasted blazer with gold lapel anchor pin",
            "Holding a glass of champagne on the aft sundeck",
            "Constantly flanked by an athletic bodyguard in charcoal suit"
        ],
        targetRoutine: [
            { time: "18:45", location: "Aft Deck Sunbed", desc: "Sipping drink and toasting guest", pos: [10, 8.5, -15], wait: 14 },
            { time: "18:48", location: "Yacht Bridge Rail", desc: "Speaking on satellite phone", pos: [14, 11, -22], wait: 15 },
            { time: "18:52", location: "Boardwalk Gangway", desc: "Stepping onto dock to greet courier", pos: [4, 4, -8], wait: 12 }
        ],
        junctionBoxPos: [15, 6, -30],
        rewardIntel: 300,
        loreDrop: "Vales' satellite phone data: 'The clean-up is almost finished. Once Operative Shadow executes the final targets, issue contract #00 on Shadow's location.'"
    },
    {
        id: "contract_05",
        number: "05",
        codename: "OPERATION NEON LABYRINTH",
        title: "NEO-TOKYO NIGHT FESTIVAL",
        targetName: "KASUMI 'PHANTASM' MORI",
        targetTitle: "Black Veil Master Assassin & Impersonator",
        location: "Shibuya Festival District & Ferris Wheel",
        environment: "Bustling Crowds, Lanterns & Fireworks",
        weather: "Clear",
        timeOfDay: "22:30",
        threatLevel: "8/10",
        recommendedApproach: "Clocktower Rooftop overlooking Ferris Wheel plaza. Fireworks detonate every 8 seconds—use the thunderous explosions to mask unsuppressed rifle reports!",
        briefingText: "Phantasm has been dispatched to eliminate you if you step out of line. She is hiding in plain sight among festival celebrants. Deploy your drone to scan the crowd. Eliminate Phantasm without panicking the festival crowd.",
        primaryObjective: "Locate & eliminate Phantasm in festival crowd",
        secondaryObjective: "Mask your sniper shot with a firework explosion",
        vantagePoints: [
            { id: "clock_tower", name: "Clocktower Balcony", pos: [0, 44, 115], lookAt: [0, 4, -10], desc: "Overlooks festival food stalls, illuminated arches and Ferris wheel." },
            { id: "ferris_platform", name: "Maintenance Crane Overhang", pos: [-65, 36, 60], lookAt: [0, 4, -10], desc: "Intimate angle over the lantern alley." }
        ],
        targetClues: [
            "Traditional crimson kitsune fox mask worn on side of head",
            "Concealing an assassin's sleeve-blade mechanism",
            "Periodically glances upward toward rooftop vantage points"
        ],
        targetRoutine: [
            { time: "22:30", location: "Lantern Alley", desc: "Browsing mask stall among crowd", pos: [-8, 3, -12], wait: 14 },
            { time: "22:33", location: "Ferris Wheel Plaza", desc: "Watching rooftop spires suspiciously", pos: [5, 3, -6], wait: 16 },
            { time: "22:36", location: "Stage Archway", desc: "Walking past festival drum platform", pos: [-2, 3, -24], wait: 12 }
        ],
        rewardIntel: 400,
        loreDrop: "Audio recorder on Phantasm's body: 'Shadow has proven too capable. Director Kaelen has authorized Protocol Zero at Headquarters. You are the bait.'"
    },
    {
        id: "contract_06",
        number: "06",
        codename: "OPERATION THE LAST CONTRACT",
        title: "BLACK VEIL HEADQUARTERS",
        targetName: "DIRECTOR CORNELIUS KAELEN",
        targetTitle: "Director of Black Veil / Architect of Shadow Protocol",
        location: "The Obsidian Citadel - Black Veil Central Command",
        environment: "Severe Lightning Storm & Volumetric Fog",
        weather: "Storm",
        timeOfDay: "03:00",
        threatLevel: "10/10",
        recommendedApproach: "Helipad Vantage across Penthouse Atrium. Rain and lightning flashes illuminate the Director's obsidian boardroom. The ultimate confrontation.",
        briefingText: "All contracts were orchestrated by Director Kaelen to eliminate anyone with knowledge of Project OBLIVION—a global covert assassination algorithm. You are the last loose thread. Infiltrate his perimeter. Once face-to-face, the final choice is yours.",
        primaryObjective: "Infiltrate Director Kaelen's sanctum and decide Black Veil's fate",
        secondaryObjective: "Download full classified archive without raising alarm",
        vantagePoints: [
            { id: "citadel_helipad", name: "North Spire Helipad", pos: [0, 56, 125], lookAt: [0, 32, -25], desc: "High winds, direct glass sightline into the Director's circular office." },
            { id: "vent_walkway", name: "Catwalk Maintenance Span", pos: [45, 42, 70], lookAt: [0, 32, -25], desc: "Flanking angle beneath the antenna array." }
        ],
        targetClues: [
            "Tailored black carbon suit with cybernetic neural collar",
            "Pacing behind high-security obsidian desk",
            "Surrounded by encrypted holo-displays of all your previous contracts"
        ],
        targetRoutine: [
            { time: "03:00", location: "Central Holo-Desk", desc: "Reviewing operative dossier on you", pos: [0, 32, -26], wait: 16 },
            { time: "03:04", location: "Floor-to-Ceiling Glass", desc: "Staring out into the storm with a whiskey glass", pos: [4, 32, -32], wait: 16 },
            { time: "03:08", location: "Secure Terminal", desc: "Authorizing system wipe sequence", pos: [-6, 32, -22], wait: 14 }
        ],
        isClimax: true,
        endings: [
            {
                id: "ending_obedience",
                title: "ENDING A: OBEDIENCE",
                desc: "Execute Director Kaelen as ordered. Take his seat as the new Director of Black Veil. The Shadow Protocol continues under your command.",
                color: "#ff3b30"
            },
            {
                id: "ending_betrayal",
                title: "ENDING B: BETRAYAL",
                desc: "Broadcast Project OBLIVION and all Black Veil files to global media and intelligence networks. Destroy the organization from within.",
                color: "#34c759"
            },
            {
                id: "ending_escape",
                title: "ENDING C: ESCAPE",
                desc: "Extract the decrypted project core, erase your digital identity, and vanish into the global shadows forever. Become a ghost.",
                color: "#0a84ff"
            },
            {
                id: "ending_truth",
                title: "ENDING D: THE SIMULATION TRUTH",
                desc: "Confront Kaelen with the evidence. Discover that you were an autonomous test subject in an AI tactical combat protocol. Break the loop.",
                color: "#ffd60a"
            }
        ],
        rewardIntel: 1000
    }
];

window.MISSIONS_DATA = MISSIONS_DATA;
