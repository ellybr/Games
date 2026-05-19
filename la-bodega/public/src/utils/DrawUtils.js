export const SKIN_TONES = [
  0xFFDBB4, // Triguena Clara
  0xF0C080, // Caramelo
  0xD4956A, // Canela
  0xC07850, // Café con Leche
  0x8B5A2B, // Chocolate
  0x5C3317, // Ébano
];

export const SKIN_TONE_NAMES = [
  'Triguena Clara', 'Caramelo', 'Canela',
  'Café con Leche', 'Chocolate', 'Ébano',
];

export const HAIR_STYLES = ['Blowout', 'Rizos', 'Trenzas', 'Recogido', 'Locs'];

const HAIR_COLORS = {
  Blowout: 0x2C1810, Rizos: 0x1A0A00, Trenzas: 0x2C1810,
  Recogido: 0x1A0A00, Locs: 0x3D2B1F,
};

// ── Character Drawing ──────────────────────────────────

export function drawCharacter(scene, x, y, opts = {}) {
  const {
    skinTone = 3,
    hairStyle = 'Rizos',
    clothingColor = 0x3A7BD5,
    scale: s = 1,
    label = '',
  } = opts;

  const container = scene.add.container(x, y);
  const g = scene.add.graphics();
  const skin = SKIN_TONES[skinTone] ?? SKIN_TONES[3];
  const hair = HAIR_COLORS[hairStyle] ?? 0x1A0A00;

  _drawHair(g, 0, -55 * s, hairStyle, s, hair);

  // Head
  g.fillStyle(skin, 1);
  g.fillCircle(0, -55 * s, 22 * s);

  // Eyes
  g.fillStyle(0x1a1a1a, 1);
  g.fillCircle(-8 * s, -58 * s, 3.5 * s);
  g.fillCircle(8 * s, -58 * s, 3.5 * s);
  g.fillStyle(0xFFFFFF, 1);
  g.fillCircle(-7 * s, -59 * s, 1.5 * s);
  g.fillCircle(9 * s, -59 * s, 1.5 * s);

  // Smile
  g.lineStyle(2 * s, 0x8B4513, 1);
  g.beginPath();
  g.arc(0, -50 * s, 7 * s, 0.2, Math.PI - 0.2);
  g.strokePath();

  // Neck
  g.fillStyle(skin, 1);
  g.fillRect(-6 * s, -35 * s, 12 * s, 14 * s);

  // Body
  g.fillStyle(clothingColor, 1);
  g.fillRoundedRect(-18 * s, -22 * s, 36 * s, 38 * s, 5 * s);

  // Arms
  g.fillStyle(skin, 1);
  g.fillRoundedRect(-30 * s, -20 * s, 12 * s, 28 * s, 4 * s);
  g.fillRoundedRect(18 * s, -20 * s, 12 * s, 28 * s, 4 * s);

  // Pants
  g.fillStyle(0x2C3E50, 1);
  g.fillRect(-18 * s, 15 * s, 36 * s, 28 * s);

  // Legs
  g.fillStyle(skin, 1);
  g.fillRect(-16 * s, 41 * s, 13 * s, 26 * s);
  g.fillRect(3 * s, 41 * s, 13 * s, 26 * s);

  // Shoes
  g.fillStyle(0x1a1a1a, 1);
  g.fillEllipse(-9 * s, 67 * s, 20 * s, 8 * s);
  g.fillEllipse(9 * s, 67 * s, 20 * s, 8 * s);

  container.add(g);

  if (label) {
    const t = scene.add.text(0, 82 * s, label, {
      fontSize: `${Math.round(13 * s)}px`,
      color: '#FFFFFF',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(t);
  }

  return container;
}

function _drawHair(g, x, y, style, s, color) {
  g.fillStyle(color, 1);
  switch (style) {
    case 'Blowout':
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        g.fillCircle(x + Math.cos(a) * 20 * s, y + Math.sin(a) * 20 * s - 2 * s, 13 * s);
      }
      g.fillCircle(x, y, 25 * s);
      break;
    case 'Rizos':
      g.fillCircle(x, y - 4 * s, 24 * s);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        g.fillCircle(x + Math.cos(a) * 22 * s, y + Math.sin(a) * 22 * s - 2 * s, 7 * s);
      }
      break;
    case 'Trenzas':
      g.fillEllipse(x, y - 18 * s, 46 * s, 22 * s);
      g.fillRoundedRect(x - 30 * s, y - 22 * s, 13 * s, 52 * s, 4 * s);
      g.fillRoundedRect(x + 17 * s, y - 22 * s, 13 * s, 52 * s, 4 * s);
      g.lineStyle(1.5 * s, 0xAA8840, 0.6);
      for (let i = 0; i < 6; i++) {
        const by = (y - 15 * s) + i * 8 * s;
        g.strokeRect(x - 30 * s, by, 13 * s, 4 * s);
        g.strokeRect(x + 17 * s, by, 13 * s, 4 * s);
      }
      break;
    case 'Recogido':
      g.fillEllipse(x, y - 20 * s, 32 * s, 14 * s);
      g.fillCircle(x, y - 36 * s, 14 * s);
      g.lineStyle(3 * s, 0xAA8840, 0.5);
      g.strokeCircle(x, y - 36 * s, 12 * s);
      break;
    case 'Locs':
      for (let i = 0; i < 8; i++) {
        const lx = x - 26 * s + i * 7.5 * s;
        const len = (28 + (i % 3) * 10) * s;
        g.fillRoundedRect(lx, y - 22 * s, 5 * s, len, 2 * s);
      }
      g.fillEllipse(x, y - 18 * s, 52 * s, 16 * s);
      break;
  }
}

// ── UI Helpers ─────────────────────────────────────────

export function drawButton(scene, x, y, w, h, text, opts = {}) {
  const {
    fillColor = 0xE63946,
    fillColorHover = 0xFF6B6B,
    fillColorActive = 0xC8390A,
    textColor = '#FFFFFF',
    fontSize = '22px',
    radius = 10,
    strokeColor = null,
    fontFamily = 'Georgia, serif',
    depth = 10,
  } = opts;

  const container = scene.add.container(x, y).setDepth(depth);
  const bg = scene.add.graphics();

  const paint = (col) => {
    bg.clear();
    if (strokeColor !== null) {
      bg.lineStyle(2, strokeColor, 1);
      bg.fillStyle(col, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
    } else {
      bg.fillStyle(col, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
    }
  };
  paint(fillColor);

  const label = scene.add.text(0, 0, text, {
    fontSize, color: textColor, fontFamily,
    stroke: 'rgba(0,0,0,0.25)', strokeThickness: 1,
  }).setOrigin(0.5);

  const zone = scene.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
  zone.on('pointerover',  () => paint(fillColorHover));
  zone.on('pointerout',   () => paint(fillColor));
  zone.on('pointerdown',  () => {
    paint(fillColorActive);
    scene.tweens.add({ targets: container, scaleX: 0.94, scaleY: 0.94, duration: 70, yoyo: true });
  });
  zone.on('pointerup', () => paint(fillColor));

  container.add([bg, label, zone]);
  return { container, zone, bg, label, paint };
}

export function drawPanel(scene, x, y, w, h, opts = {}) {
  const {
    fillColor = 0x0d0d1a,
    fillAlpha = 0.88,
    strokeColor = 0xF4A261,
    strokeWidth = 2,
    radius = 12,
    depth = 5,
  } = opts;

  const g = scene.add.graphics().setDepth(depth);
  g.lineStyle(strokeWidth, strokeColor, 1);
  g.fillStyle(fillColor, fillAlpha);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, radius);
  g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, radius);
  return g;
}

export function showNotification(scene, x, y, text, opts = {}) {
  const { color = '#FFFFFF', duration = 1800, bgColor = 0x2A9D8F, depth = 100 } = opts;
  const container = scene.add.container(x, y).setDepth(depth);
  const g = scene.add.graphics();
  const tw = text.length * 10 + 28;
  g.fillStyle(bgColor, 0.92);
  g.fillRoundedRect(-tw / 2, -20, tw, 40, 8);
  const t = scene.add.text(0, 0, text, {
    fontSize: '18px', color, fontFamily: 'Arial', fontStyle: 'bold',
  }).setOrigin(0.5);
  container.add([g, t]);

  scene.tweens.add({
    targets: container,
    y: y - 70,
    alpha: { from: 1, to: 0 },
    duration,
    ease: 'Power2',
    onComplete: () => container.destroy(),
  });
  return container;
}

// ── Building Draw ──────────────────────────────────────

export function drawBuilding(scene, bx, by, bw, bh, opts = {}) {
  const {
    locked = false,
    floors = 1,
    wallColor = 0xE8D5B7,
    roofColor = 0xD32F2F,
    isDominican = false,
  } = opts;

  const g = scene.add.graphics();
  const col = locked ? 0x808080 : wallColor;

  // Main wall
  g.fillStyle(col, 1);
  g.fillRect(bx, by, bw, bh);

  // Roof band
  g.fillStyle(locked ? 0x606060 : roofColor, 1);
  g.fillRect(bx - 3, by - 14, bw + 6, 18);

  // Windows (2 columns × floors rows)
  const winW = Math.min(30, bw * 0.2);
  const winH = 20;
  const cols = Math.max(1, Math.floor(bw / 55));
  const padX = (bw - cols * winW) / (cols + 1);
  for (let f = 0; f < floors; f++) {
    const wy = by + 16 + f * Math.floor(bh / floors);
    for (let c = 0; c < cols; c++) {
      const wx = bx + padX + c * (winW + padX);
      if (locked) {
        g.fillStyle(0x555555, 1);
        g.fillRect(wx, wy, winW, winH);
      } else {
        const lit = Math.random() > 0.35;
        g.fillStyle(lit ? 0x87CEEB : 0x334455, 0.9);
        g.fillRect(wx, wy, winW, winH);
        g.lineStyle(1, 0x224466, 0.5);
        g.strokeRect(wx, wy, winW, winH);
      }
    }
  }

  // Dominican bodega details
  if (isDominican && !locked) {
    // Awning stripes
    g.fillStyle(0xD32F2F, 1);
    g.fillTriangle(bx + 5, by + bh * 0.55, bx + bw * 0.5, by + bh * 0.45, bx + 5, by + bh * 0.45);
    g.fillStyle(0x1565C0, 1);
    g.fillTriangle(bx + bw - 5, by + bh * 0.55, bx + bw * 0.5, by + bh * 0.45, bx + bw - 5, by + bh * 0.45);
    // Door
    g.fillStyle(0x6B3A1F, 1);
    g.fillRect(bx + bw / 2 - 20, by + bh * 0.55, 40, bh * 0.45);
    g.fillStyle(0xFFD700, 1);
    g.fillCircle(bx + bw / 2 + 14, by + bh * 0.75, 4);
  }

  return g;
}

export function drawSkyGradient(scene, width, height) {
  const g = scene.add.graphics();
  // Sunset gradient: dark top → warm sunset bottom
  g.fillGradientStyle(0x0d1b2a, 0x0d1b2a, 0x3D1A5C, 0xC65102, 1);
  g.fillRect(0, 0, width, height * 0.55);
  g.fillGradientStyle(0x3D1A5C, 0xC65102, 0xE07B39, 0xE8C56A, 1);
  g.fillRect(0, height * 0.55, width, height * 0.45);
  return g;
}
