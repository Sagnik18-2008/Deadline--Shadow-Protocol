// DEADLINE: SHADOW PROTOCOL - High-Fidelity Tactical Web Audio Synthesizer Engine
// Fully procedural zero-dependency audio system for guns, optics, drone, weather, ambience & dynamic tension music.

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.ambienceGain = null;
        this.initialized = false;
        this.isMuted = false;

        // Dynamic tension music state
        this.musicOsc1 = null;
        this.musicOsc2 = null;
        this.musicFilter = null;
        this.musicInterval = null;
        this.musicTempo = 85; // BPM
        this.currentTension = 0; // 0: Ambient, 1: Suspicious, 2: Alert

        // Ambience nodes
        this.rainSource = null;
        this.rainGain = null;
        this.droneOsc = null;
        this.droneGain = null;
        this.sirenOsc = null;
        this.sirenGain = null;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain);

            this.ambienceGain = this.ctx.createGain();
            this.ambienceGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
            this.ambienceGain.connect(this.masterGain);

            this.initialized = true;
            this.startAmbience();
            this.startTensionMusic();
        } catch (e) {
            console.warn('Web Audio API not supported or user interaction required', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    // Procedural Noise Buffer Generator (White/Pink)
    createNoiseBuffer(seconds = 1, type = 'white') {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * seconds;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            if (type === 'pink') {
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
            } else {
                data[i] = white;
            }
        }
        return buffer;
    }

    // SNIPER RIFLE FIRING SFX (Heavy vs Suppressed)
    playSniperShot(suppressed = false) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        if (suppressed) {
            // Whisper Pop + Suppressor baffle hiss
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createNoiseBuffer(0.25, 'white');
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, now);
            filter.frequency.exponentialRampToValueAtTime(300, now + 0.18);
            filter.Q.value = 3.5;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.7, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            noise.start(now);

            // Subtle sub thud
            const sub = this.ctx.createOscillator();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(95, now);
            sub.frequency.exponentialRampToValueAtTime(25, now + 0.15);
            const subGain = this.ctx.createGain();
            subGain.gain.setValueAtTime(0.5, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            sub.connect(subGain);
            subGain.connect(this.sfxGain);
            sub.start(now);
            sub.stop(now + 0.16);
        } else {
            // Unsuppressed: Loud supersonic crack + massive boom + distant city echo
            // 1. Supersonic crack transient
            const crack = this.ctx.createBufferSource();
            crack.buffer = this.createNoiseBuffer(0.6, 'white');
            const crackFilter = this.ctx.createBiquadFilter();
            crackFilter.type = 'highpass';
            crackFilter.frequency.setValueAtTime(2500, now);
            crackFilter.frequency.exponentialRampToValueAtTime(400, now + 0.35);

            const crackGain = this.ctx.createGain();
            crackGain.gain.setValueAtTime(1.0, now);
            crackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

            crack.connect(crackFilter);
            crackFilter.connect(crackGain);
            crackGain.connect(this.sfxGain);
            crack.start(now);

            // 2. Heavy explosive sub-bass
            const sub = this.ctx.createOscillator();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(180, now);
            sub.frequency.exponentialRampToValueAtTime(32, now + 0.55);

            const subGain = this.ctx.createGain();
            subGain.gain.setValueAtTime(1.2, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

            sub.connect(subGain);
            subGain.connect(this.sfxGain);
            sub.start(now);
            sub.stop(now + 0.7);

            // 3. Reverberant urban echo
            const echo = this.ctx.createBufferSource();
            echo.buffer = this.createNoiseBuffer(1.8, 'pink');
            const echoFilter = this.ctx.createBiquadFilter();
            echoFilter.type = 'lowpass';
            echoFilter.frequency.setValueAtTime(900, now);
            echoFilter.frequency.exponentialRampToValueAtTime(150, now + 1.8);

            const echoGain = this.ctx.createGain();
            echoGain.gain.setValueAtTime(0.6, now + 0.08);
            echoGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

            echo.connect(echoFilter);
            echoFilter.connect(echoGain);
            echoGain.connect(this.sfxGain);
            echo.start(now + 0.05);
        }
    }

    // BOLT CYCLING SFX
    playBoltAction() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Click 1: Bolt unlock / lift
        this.playMetallicClick(now, 1800, 0.06);
        // Click 2: Bolt back / shell eject
        this.playMetallicClick(now + 0.18, 1400, 0.08);
        // Click 3: Bolt chambering round
        this.playMetallicClick(now + 0.42, 2200, 0.06);
        // Click 4: Bolt lock down
        this.playMetallicClick(now + 0.55, 950, 0.1);
    }

    playMetallicClick(time, freq, duration) {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(time);
        osc.stop(time + duration);
    }

    // SCOPE ZOOM OPTIC CLICK
    playScopeZoom(zoomLevel) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        const baseFreq = 800 + (zoomLevel * 180);
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.07);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.09);
    }

    // HEARTBEAT WHEN HOLDING BREATH
    playHeartbeat(intensity = 1.0) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Lub
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(75, now);
        osc1.frequency.exponentialRampToValueAtTime(38, now + 0.12);

        const gain1 = this.ctx.createGain();
        gain1.gain.setValueAtTime(0.55 * intensity, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc1.connect(gain1);
        gain1.connect(this.sfxGain);
        osc1.start(now);
        osc1.stop(now + 0.15);

        // Dub
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(65, now + 0.18);
        osc2.frequency.exponentialRampToValueAtTime(32, now + 0.32);

        const gain2 = this.ctx.createGain();
        gain2.gain.setValueAtTime(0.45 * intensity, now + 0.18);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        osc2.start(now + 0.18);
        osc2.stop(now + 0.35);
    }

    // BREATH IN / OUT
    playBreathIn() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.8, 'pink');

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.linearRampToValueAtTime(600, now + 0.7);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
    }

    // HIT IMPACT & TARGET DOWN
    playTargetEliminated() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Flesh / body armor thud
        const thud = this.ctx.createOscillator();
        thud.type = 'triangle';
        thud.frequency.setValueAtTime(140, now);
        thud.frequency.exponentialRampToValueAtTime(35, now + 0.25);

        const thudGain = this.ctx.createGain();
        thudGain.gain.setValueAtTime(0.8, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        thud.connect(thudGain);
        thudGain.connect(this.sfxGain);
        thud.start(now);
        thud.stop(now + 0.3);

        // Tactical confirmation ping
        const ping = this.ctx.createOscillator();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(1240, now + 0.08);
        ping.frequency.setValueAtTime(1650, now + 0.18);

        const pingGain = this.ctx.createGain();
        pingGain.gain.setValueAtTime(0.4, now + 0.08);
        pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        ping.connect(pingGain);
        pingGain.connect(this.sfxGain);
        ping.start(now + 0.08);
        ping.stop(now + 0.65);
    }

    // DRONE ENGINE HUM
    setDroneActive(active) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        if (active) {
            if (this.droneOsc) return;
            this.droneOsc = this.ctx.createOscillator();
            this.droneOsc.type = 'sawtooth';
            this.droneOsc.frequency.setValueAtTime(190, now);

            // Tremolo / rotor flutter
            const lfo = this.ctx.createOscillator();
            lfo.frequency.setValueAtTime(24, now);
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(30, now);
            lfo.connect(this.droneOsc.frequency);
            lfo.start(now);
            this.droneLfo = lfo;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(950, now);

            this.droneGain = this.ctx.createGain();
            this.droneGain.gain.setValueAtTime(0.001, now);
            this.droneGain.gain.linearRampToValueAtTime(0.22, now + 0.4);

            this.droneOsc.connect(filter);
            filter.connect(this.droneGain);
            this.droneGain.connect(this.sfxGain);
            this.droneOsc.start(now);
        } else {
            if (this.droneGain) {
                this.droneGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
                setTimeout(() => {
                    if (this.droneOsc) {
                        this.droneOsc.stop();
                        this.droneOsc.disconnect();
                        this.droneOsc = null;
                    }
                    if (this.droneLfo) {
                        this.droneLfo.stop();
                        this.droneLfo.disconnect();
                        this.droneLfo = null;
                    }
                    this.droneGain = null;
                }, 350);
            }
        }
    }

    // DRONE SCANNER SFX
    playDroneScan() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(2600, now + 0.22);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.Q.value = 5.0;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.26);
    }

    // TARGET IDENTIFICATION POSITIVE / NEGATIVE
    playTargetIdentified(isMatch = true) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        if (isMatch) {
            // Ascending high-tech two-tone
            [1320, 1760, 2200].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.25, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.22);
            });
        } else {
            // Neutral / Civilian low tone
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.setValueAtTime(240, now + 0.12);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.32);
        }
    }

    // CAMERA SHUTTER SFX FOR EVIDENCE PHOTOS
    playCameraShutter() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.playMetallicClick(now, 1600, 0.03);
        this.playMetallicClick(now + 0.05, 1200, 0.04);
        this.playMetallicClick(now + 0.12, 1900, 0.03);
    }

    // SUSPICION & ALERT STINGER
    playSuspicionStinger() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Dissonant interval swell
        [220, 233.08].forEach(freq => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, now);
            filter.frequency.linearRampToValueAtTime(1400, now + 0.5);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.25, now + 0.4);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 1.3);
        });
    }

    // ALARM SIREN TOGGLE
    setAlarm(active) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        if (active) {
            if (this.sirenOsc) return;
            this.sirenOsc = this.ctx.createOscillator();
            this.sirenOsc.type = 'sawtooth';

            const lfo = this.ctx.createOscillator();
            lfo.frequency.setValueAtTime(0.7, now); // 0.7 Hz siren cycle
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(250, now);
            this.sirenOsc.frequency.setValueAtTime(750, now);
            lfo.connect(this.sirenOsc.frequency);
            lfo.start(now);
            this.sirenLfo = lfo;

            this.sirenGain = this.ctx.createGain();
            this.sirenGain.gain.setValueAtTime(0.001, now);
            this.sirenGain.gain.linearRampToValueAtTime(0.22, now + 0.5);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1800, now);

            this.sirenOsc.connect(filter);
            filter.connect(this.sirenGain);
            this.sirenGain.connect(this.sfxGain);
            this.sirenOsc.start(now);
        } else {
            if (this.sirenGain) {
                this.sirenGain.gain.linearRampToValueAtTime(0.001, now + 0.5);
                setTimeout(() => {
                    if (this.sirenOsc) {
                        this.sirenOsc.stop();
                        this.sirenOsc.disconnect();
                        this.sirenOsc = null;
                    }
                    if (this.sirenLfo) {
                        this.sirenLfo.stop();
                        this.sirenLfo.disconnect();
                        this.sirenLfo = null;
                    }
                    this.sirenGain = null;
                }, 550);
            }
        }
    }

    // WEATHER & AMBIENCE (Rain, Wind, Thunder)
    startAmbience() {
        if (!this.ctx || this.rainSource) return;
        const now = this.ctx.currentTime;

        // Continuous filtered rain/wind wash
        this.rainSource = this.ctx.createBufferSource();
        this.rainSource.buffer = this.createNoiseBuffer(5, 'pink');
        this.rainSource.loop = true;

        this.rainFilter = this.ctx.createBiquadFilter();
        this.rainFilter.type = 'lowpass';
        this.rainFilter.frequency.setValueAtTime(1200, now);

        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(0.25, now);

        this.rainSource.connect(this.rainFilter);
        this.rainFilter.connect(this.rainGain);
        this.rainGain.connect(this.ambienceGain);
        this.rainSource.start(now);
    }

    setWeatherAmbience(weatherType) {
        if (!this.rainGain || !this.rainFilter) return;
        const now = this.ctx.currentTime;

        if (weatherType === 'Clear') {
            this.rainGain.gain.linearRampToValueAtTime(0.05, now + 1.0); // faint city wind
            this.rainFilter.frequency.linearRampToValueAtTime(400, now + 1.0);
        } else if (weatherType === 'Rain') {
            this.rainGain.gain.linearRampToValueAtTime(0.3, now + 1.0);
            this.rainFilter.frequency.linearRampToValueAtTime(1400, now + 1.0);
        } else if (weatherType === 'Heavy Rain' || weatherType === 'Storm') {
            this.rainGain.gain.linearRampToValueAtTime(0.5, now + 1.0);
            this.rainFilter.frequency.linearRampToValueAtTime(2200, now + 1.0);
        } else if (weatherType === 'Snow') {
            this.rainGain.gain.linearRampToValueAtTime(0.18, now + 1.0);
            this.rainFilter.frequency.linearRampToValueAtTime(600, now + 1.0);
        } else if (weatherType === 'Fog') {
            this.rainGain.gain.linearRampToValueAtTime(0.12, now + 1.0);
            this.rainFilter.frequency.linearRampToValueAtTime(500, now + 1.0);
        }
    }

    playThunder() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(3.5, 'pink');

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, now);
        filter.frequency.linearRampToValueAtTime(80, now + 3.0);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.7, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambienceGain);
        noise.start(now);
    }

    // PROCEDURAL DYNAMIC TENSION MUSIC
    startTensionMusic() {
        if (!this.ctx || this.musicInterval) return;

        let step = 0;
        const notes = [
            // Dark stealth bassline (C minor / D minor brooding tones)
            [65.41, 77.78, 98.00, 116.54], // C2, Eb2, G2, Bb2
            [73.42, 87.31, 110.00, 130.81] // D2, F2, A2, C3
        ];

        this.musicInterval = setInterval(() => {
            if (!this.ctx || this.isMuted) return;
            const now = this.ctx.currentTime;
            const bar = Math.floor(step / 8) % 2;
            const noteIdx = step % 4;
            const freq = notes[bar][noteIdx];

            // Bass pulse
            const osc = this.ctx.createOscillator();
            osc.type = (this.currentTension === 2) ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            const cutoff = (this.currentTension === 0) ? 350 : (this.currentTension === 1 ? 750 : 1800);
            filter.frequency.setValueAtTime(cutoff, now);

            const gain = this.ctx.createGain();
            const vol = (this.currentTension === 0) ? 0.18 : (this.currentTension === 1 ? 0.28 : 0.4);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            osc.start(now);
            osc.stop(now + 0.38);

            // Add high tension synth plinks when suspicious or alert
            if (this.currentTension >= 1 && step % 2 === 0) {
                const arp = this.ctx.createOscillator();
                arp.type = 'sine';
                arp.frequency.setValueAtTime(freq * 8, now + 0.05);
                const arpGain = this.ctx.createGain();
                arpGain.gain.setValueAtTime(0.12, now + 0.05);
                arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                arp.connect(arpGain);
                arpGain.connect(this.musicGain);
                arp.start(now + 0.05);
                arp.stop(now + 0.22);
            }

            step = (step + 1) % 16;
        }, (60 / this.musicTempo) * 500); // 16th-like intervals
    }

    setTensionLevel(level) { // 0: Normal, 1: Suspicious, 2: Alert
        if (this.currentTension !== level) {
            this.currentTension = level;
            if (level === 1) this.playSuspicionStinger();
            if (level === 2) this.setAlarm(true);
            else this.setAlarm(false);
        }
    }

    // UI SFX
    playUIClick() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.05);
    }

    playUIHover() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1100, now + 0.02);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.035);
    }

    playEvidenceFound() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [880, 1108.73, 1318.51, 1760].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.2, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.28);
        });
    }
}

window.soundEngine = new SoundEngine();
