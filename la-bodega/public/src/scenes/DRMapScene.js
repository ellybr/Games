import GameState from '../GameState.js';
import { drawButton, showNotification } from '../utils/DrawUtils.js';

// DR city dots: [name, x%, y%, description]
const DR_CITIES = [
  ['Santo Domingo', 0.52, 0.72, 'La capital. Familia de Abuelo.'],
  ['Santiago',      0.38, 0.38, 'Tierra del Cibao.'],
  ['La Romana',     0.70, 0.68, 'Caña de azúcar e historia.'],
  ['Puerto Plata',  0.34, 0.22, 'Costa norte, turismo.'],
  ['San Pedro',     0.66, 0.74, 'Béisbol y tradición.'],
  ['Samaná',        0.72, 0.28, 'Ballenas y naturaleza.'],
];

export default class DRMapScene extends Phaser.Scene {
  constructor() { super({ key: 'DRMapScene' }); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(700);

    // Ocean background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0D3B66, 0x0D3B66, 0x1A6B9A, 0x0D3B66, 1);
    bg.fillRect(0, 0, width, height);

    // Waves
    for (let i = 0; i < 6; i++) {
      bg.lineStyle(1.5, 0x4ECDC4, 0.2);
      bg.beginPath();
      for (let x = 0; x < width; x += 8) {
        const y = 60 + i * 100 + Math.sin(x * 0.04 + i) * 12;
        if (x === 0) bg.moveTo(x, y); else bg.lineTo(x, y);
      }
      bg.strokePath();
    }

    // ── Title ──────────────────────────────────────────
    this.add.text(width / 2, 32, '🇩🇴  República Dominicana', {
      fontSize: '30px', color: '#FFFFFF', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.add.text(width / 2, 68, 'La tierra de tus raíces', {
      fontSize: '18px', color: '#A8DADC', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    }).setOrigin(0.5);

    // ── DR Island shape (simplified polygon) ──────────
    const MAP_X = 180, MAP_Y = 110, MAP_W = 920, MAP_H = 460;

    const islandG = this.add.graphics();

    // Haiti (west, darker)
    islandG.fillStyle(0x5C8A4A, 0.6);
    islandG.fillEllipse(MAP_X + MAP_W * 0.18, MAP_Y + MAP_H * 0.5, MAP_W * 0.32, MAP_H * 0.7);

    // DR (east, lush green)
    islandG.fillStyle(0x4A9B3C, 0.85);
    islandG.fillEllipse(MAP_X + MAP_W * 0.58, MAP_Y + MAP_H * 0.5, MAP_W * 0.75, MAP_H * 0.82);

    // Mountain ranges (lighter green ridges)
    islandG.fillStyle(0x6BAD5A, 0.6);
    islandG.fillEllipse(MAP_X + MAP_W * 0.45, MAP_Y + MAP_H * 0.4, MAP_W * 0.5, MAP_H * 0.28);
    islandG.fillStyle(0x7EC96E, 0.4);
    islandG.fillEllipse(MAP_X + MAP_W * 0.55, MAP_Y + MAP_H * 0.45, MAP_W * 0.35, MAP_H * 0.18);

    // Coast outline
    islandG.lineStyle(2, 0xF4D03F, 0.5);
    islandG.strokeEllipse(MAP_X + MAP_W * 0.58, MAP_Y + MAP_H * 0.5, MAP_W * 0.75, MAP_H * 0.82);

    // Dividing line (DR/Haiti)
    islandG.lineStyle(2, 0xCCCCCC, 0.4);
    islandG.strokeRect(MAP_X + MAP_W * 0.3, MAP_Y + MAP_H * 0.1, 2, MAP_H * 0.8);

    // Labels
    this.add.text(MAP_X + MAP_W * 0.18, MAP_Y + MAP_H * 0.5, 'Haití', {
      fontSize: '16px', color: '#CCCCCC', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    }).setOrigin(0.5);
    this.add.text(MAP_X + MAP_W * 0.6, MAP_Y + MAP_H * 0.15, 'REPÚBLICA\nDOMINICANA', {
      fontSize: '18px', color: '#FFFFFF', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // ── City dots ──────────────────────────────────────
    const isUnlocked = GameState.drMap.unlocked;
    DR_CITIES.forEach(([name, xPct, yPct, desc]) => {
      const cx = MAP_X + MAP_W * xPct;
      const cy = MAP_Y + MAP_H * yPct;

      const dotG = this.add.graphics();
      if (isUnlocked) {
        dotG.fillStyle(0xFFD700, 1); dotG.fillCircle(cx, cy, 9);
        dotG.lineStyle(2, 0xFFFFFF, 0.8); dotG.strokeCircle(cx, cy, 9);
        this.tweens.add({ targets: dotG, alpha: { from: 1, to: 0.5 }, duration: 1200, yoyo: true, repeat: -1,
          delay: Phaser.Math.Between(0, 800) });

        const label = this.add.text(cx + 13, cy - 8, name, {
          fontSize: '14px', color: '#FFFFFF', fontFamily: 'Arial',
          stroke: '#000', strokeThickness: 2,
        });
        const zone = this.add.zone(cx, cy, 80, 40).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => this._showCityInfo(cx, cy, name, desc));
        zone.on('pointerout',  () => { if (this._cityInfo) { this._cityInfo.destroy(); this._cityInfo = null; } });
        zone.on('pointerdown', () => this._investCity(name, cx, cy));
      } else {
        dotG.fillStyle(0x888888, 0.5); dotG.fillCircle(cx, cy, 7);
      }
    });

    // ── Lock / Unlock panel ────────────────────────────
    this._drawStatusPanel(width, height, isUnlocked);

    // ── Back button ────────────────────────────────────
    const { zone: backZone } = drawButton(this, 80, height - 35, 130, 44, '← Volver', {
      fillColor: 0x333355, fillColorHover: 0x4444AA, fontSize: '17px', radius: 8, depth: 15,
    });
    backZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => this.scene.start('BlockViewScene'));
    });
  }

  _drawStatusPanel(width, height, isUnlocked) {
    const panelG = this.add.graphics().setDepth(10);
    panelG.fillStyle(0x080815, 0.92);
    panelG.fillRoundedRect(width - 330, 85, 310, isUnlocked ? 200 : 320, 12);
    panelG.lineStyle(2, isUnlocked ? 0xF4A261 : 0x555555, 1);
    panelG.strokeRoundedRect(width - 330, 85, 310, isUnlocked ? 200 : 320, 12);

    const px = width - 175;

    if (isUnlocked) {
      this.add.text(px, 105, '🇩🇴 Mapa desbloqueado', {
        fontSize: '17px', color: '#2A9D8F', fontFamily: 'Arial', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(11);
      this.add.text(px, 135, [
        `Efectivo: $${Math.floor(GameState.finances.cash).toLocaleString()}`,
        `Confianza: ${GameState.stats.communityTrust}/100`,
        `Semana: ${GameState.time.week}`,
        '',
        'Haz clic en una ciudad para invertir.',
      ].join('\n'), {
        fontSize: '15px', color: '#DDDDDD', fontFamily: 'Arial', lineSpacing: 4,
      }).setOrigin(0.5).setDepth(11);
    } else {
      this.add.text(px, 105, '🔒 Mapa bloqueado', {
        fontSize: '18px', color: '#E63946', fontFamily: 'Arial', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(11);

      const gs = GameState;
      const conds = [
        { label: 'Efectivo', cur: gs.finances.cash, req: gs.drMap.unlockCash, prefix: '$', done: gs.finances.cash >= gs.drMap.unlockCash },
        { label: 'Confianza', cur: gs.stats.communityTrust, req: gs.drMap.unlockTrust, prefix: '', suffix: '/100', done: gs.stats.communityTrust >= gs.drMap.unlockTrust },
        { label: 'Semana',   cur: gs.time.week, req: gs.drMap.unlockWeek, prefix: '', done: gs.time.week >= gs.drMap.unlockWeek },
      ];

      conds.forEach((c, i) => {
        const col = c.done ? '#2A9D8F' : '#AAAAAA';
        const icon = c.done ? '✅' : '⬜';
        const val  = c.prefix + Math.floor(c.cur).toLocaleString() + (c.suffix || '');
        const req  = c.prefix + c.req.toLocaleString() + (c.suffix || '');
        this.add.text(px, 145 + i * 42, `${icon}  ${c.label}: ${val} / ${req}`, {
          fontSize: '16px', color: col, fontFamily: 'Arial',
        }).setOrigin(0.5).setDepth(11);

        // Progress mini bar
        const bx = px - 120, by = 160 + i * 42;
        const barG = this.add.graphics().setDepth(11);
        barG.fillStyle(0x222222, 1); barG.fillRoundedRect(bx, by, 240, 8, 3);
        const pct = Math.min(1, c.cur / c.req);
        barG.fillStyle(c.done ? 0x2A9D8F : 0xF4A261, 1);
        if (pct > 0) barG.fillRoundedRect(bx + 1, by + 1, (238 * pct), 6, 2);
      });

      this.add.text(px, 280, [
        'Sigue sirviendo a tu comunidad y',
        'ahorrando para desbloquear tu',
        'inversión en la tierra de Abuelo.',
      ].join('\n'), {
        fontSize: '14px', color: '#888888', fontFamily: 'Georgia, serif', fontStyle: 'italic',
        align: 'center', lineSpacing: 4,
      }).setOrigin(0.5).setDepth(11);

      // Check if can unlock now
      if (gs.canUnlockDR()) {
        const { zone } = drawButton(this, px, 370, 260, 48, '🇩🇴 ¡Desbloquear!', {
          fillColor: 0xF4A261, fillColorHover: 0xFFCC44, textColor: '#1a1a1a',
          fontSize: '20px', radius: 10, depth: 12,
        });
        zone.on('pointerdown', () => {
          gs.drMap.unlocked = true;
          gs.save();
          showNotification(this, width / 2, height / 2, '🇩🇴 ¡El Mapa RD está desbloqueado!', {
            bgColor: 0xF4A261, duration: 2500,
          });
          this.time.delayedCall(800, () => this.scene.restart());
        });
      }
    }
  }

  _showCityInfo(cx, cy, name, desc) {
    if (this._cityInfo) { this._cityInfo.destroy(); }
    const g = this.add.graphics();
    const tw = desc.length * 8 + 24;
    g.fillStyle(0x050510, 0.95); g.fillRoundedRect(-tw / 2, -30, tw, 50, 6);
    g.lineStyle(1.5, 0xF4A261, 1); g.strokeRoundedRect(-tw / 2, -30, tw, 50, 6);
    const t = this.add.text(0, -5, desc, {
      fontSize: '14px', color: '#FFFFFF', fontFamily: 'Arial',
    }).setOrigin(0.5);
    this._cityInfo = this.add.container(cx, cy - 55, [g, t]).setDepth(30);
  }

  _investCity(name, cx, cy) {
    if (!GameState.drMap.unlocked) return;
    const cost = 2000;
    if (!GameState.spendCash(cost)) {
      showNotification(this, cx, cy - 60, `Necesitas $${cost}`, { bgColor: 0xE63946 });
      return;
    }
    GameState.addTrust(8);
    GameState.drMap.investments = GameState.drMap.investments || [];
    GameState.drMap.investments.push({ city: name, week: GameState.time.week });
    GameState.save();
    showNotification(this, cx, cy - 60, `+Inversión en ${name}! 🇩🇴`, { bgColor: 0x2A9D8F, duration: 2500 });
    this.scene.restart();
  }
}
