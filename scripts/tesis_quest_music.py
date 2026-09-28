"""Genera la música chiptune (8 bits) de TESIS QUEST sin dependencias externas.

Los tiempos coinciden con src/tesis-quest/timeline.ts.
Uso: python3 scripts/tesis_quest_music.py
"""
import math
import random
import struct
import wave

SR = 22050
FPS = 30
TITLE, LEVEL, END = 90, 150, 180
N_LEVELS = 7
JUMP_START, STOMP, CLEAR = 55, 78, 108
TOTAL = TITLE + LEVEL * N_LEVELS + END
N = int(TOTAL / FPS * SR)
buf = [0.0] * N

def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def square(t0, dur, freq, vol, duty=0.5, slide=0.0):
    s0, n = int(t0 * SR), int(dur * SR)
    phase = 0.0
    for i in range(n):
        if s0 + i >= N:
            break
        f = freq + slide * i / SR
        phase = (phase + f / SR) % 1.0
        env = min(1.0, (n - i) / (0.02 * SR))
        buf[s0 + i] += (vol if phase < duty else -vol) * env

def triangle(t0, dur, freq, vol):
    s0, n = int(t0 * SR), int(dur * SR)
    for i in range(n):
        if s0 + i >= N:
            break
        p = (i * freq / SR) % 1.0
        env = min(1.0, (n - i) / (0.01 * SR))
        buf[s0 + i] += (4 * abs(p - 0.5) - 1) * vol * env

def noise(t0, dur, vol):
    s0, n = int(t0 * SR), int(dur * SR)
    for i in range(n):
        if s0 + i >= N:
            break
        buf[s0 + i] += random.uniform(-vol, vol) * (1 - i / n)

random.seed(7)
E = 60 / 150 / 2  # corchea a 150 bpm
C4, D4, E4, F4, G4, A4, B4 = 60, 62, 64, 65, 67, 69, 71
C5, D5, E5, F5, G5, A5, B5, C6 = 72, 74, 76, 77, 79, 81, 83, 84

MELODY = [
    [E5, G5, C6, G5, E5, G5, D5, E5],
    [C5, E5, A5, E5, C5, E5, B4, C5],
    [A4, C5, F5, C5, A4, C5, G5, F5],
    [D5, G5, B5, G5, D5, B4, D5, G5],
    [E5, None, E5, G5, C6, None, B5, A5],
    [A5, None, C6, B5, A5, E5, None, E5],
    [F5, A5, C6, A5, G5, F5, E5, D5],
    [D5, E5, F5, G5, B5, None, G5, None],
]
BASS = [C4 - 12, A4 - 24, F4 - 12, G4 - 12] * 2

music_end = (TOTAL - END) / FPS
t, bar = 0.0, 0
while t < music_end:
    notes = MELODY[bar % 8]
    root = BASS[bar % 8]
    for k in range(8):
        nt = t + k * E
        if nt >= music_end:
            break
        if notes[k] is not None:
            square(nt, E * 0.85, hz(notes[k]), 0.10, duty=0.25)
        triangle(nt, E * 0.9, hz(root + (12 if k % 2 else 0)), 0.16)
        noise(nt, 0.03 if k % 2 else 0.06, 0.05 if k % 2 else 0.09)
    t += 8 * E
    bar += 1

# Efectos de sonido de cada nivel
for i in range(N_LEVELS):
    base = (TITLE + i * LEVEL) / FPS
    square(base + JUMP_START / FPS, 0.18, 380, 0.14, duty=0.5, slide=2200)  # salto
    square(base + STOMP / FPS, 0.07, hz(B5), 0.14, duty=0.5)  # moneda
    square(base + STOMP / FPS + 0.07, 0.35, hz(E5 + 12), 0.14, duty=0.5)
    for j, m in enumerate([C5, E5, G5, C6]):  # nivel superado
        square(base + CLEAR / FPS + j * 0.07, 0.12 if j < 3 else 0.3, hz(m + 12), 0.10, 0.25)

# "PRESS START"
square(62 / FPS, 0.08, hz(C6), 0.15)
square(62 / FPS + 0.08, 0.2, hz(G5 + 12), 0.15)

# Fanfarria final
fan = (TOTAL - END) / FPS
seq = [(G4, 1), (C5, 1), (E5, 1), (G5, 3), (E5, 1), (G5, 6),
       (A4, 1), (C5, 1), (F5, 1), (A5, 3), (F5, 1), (A5, 6),
       (B4, 1), (D5, 1), (G5, 1), (B5, 3), (A5, 1), (B5, 2), (C6, 12)]
tt = fan
for m, d in seq:
    square(tt, d * E * 0.9, hz(m), 0.12, duty=0.25)
    square(tt, d * E * 0.9, hz(m - 12), 0.07, duty=0.5)
    tt += d * E
for k in range(int((TOTAL / FPS - fan) / E)):
    triangle(fan + k * E, E * 0.9, hz((C4 - 12) + (12 if k % 2 else 0)), 0.14)

peak = max(abs(x) for x in buf) or 1
fade_n = int(0.6 * SR)
with wave.open("public/audio/tesis-quest-chiptune.wav", "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for i, x in enumerate(buf):
        g = min(1.0, (N - i) / fade_n)
        frames += struct.pack("<h", int(x / peak * 0.8 * g * 32767))
    w.writeframes(bytes(frames))
print("ok", TOTAL / FPS, "s")
