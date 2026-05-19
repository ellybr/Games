import GameState from '../GameState.js';
import { drawButton, showNotification } from '../utils/DrawUtils.js';
import AudioSystem from '../systems/AudioSystem.js';

const UPGRADES = [
  {
    id:    'cafetera',
    icon:  '☕',
    name:  'Cafetera Italiana',
    desc:  'El café premium vale más. +$2 por cada café vendido.',
    cost:  300,
    effect: 'Ingresos de café +$2',
  },
  {
    id:    'estantes',
    icon:  '🗄️',
    name:  'Estantes Nuevos',
    desc:  'Clientes más pacientes. +4 segundos de paciencia.',
    cost:  400,
    effect: 'Paciencia del cliente +4s',
  },
  {
    id:    'refrigerador',
    icon:  '🧊',
    name:  'Refrigerador Grande',
    desc:  'Cerveza premium y jugos. +$3 por bebida fría vendida.',
    cost:  500,
    effect: 'Bebidas frías +$3',
  },
  {
    id:    'aireacondicionado',
    icon:  '❄️',
    name:  'Aire Acondicionado',
    desc:  'Más clientes por día. Los clientes llegan más rápido.',
    cost:  600,
    effect: 'Velocidad de clientes +30%',
  },
  {
    id:    'letreros',
    icon:  '💡',
    name:  'Letreros de Neón',
    desc:  'El bodega brilla en la noche. Confianza +8 permanente.',
    cost:  200,
    effect: '+8 Confianza al instalar',
  },
  {
    id:    'musica',
    icon:  '🎵',
    name:  'Sistema de Música',
    desc:  'Bachata todo el día. Clientes contentos permanecen más.',
    cost:  350,
    effect: 'Paciencia del cliente +2s extra',
  },
];

export default class UpgradeScene extends Phaser.Scene {
  constructor() { super({ key: 'UpgradeScene' }); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(500);

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x080818, 0x080818, 0x0d1a2e, 0x0d1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // Header
    const headerG = this.add.graphics();
    headerG.fillStyle(0x0a0a20, 0.95);
    headerG.fillRect(0, 0, width, 72);
    headerG.lineStyle(1, 0xF4A261, 0.5);
    headerG.strokeRect(0, 71, width, 1);

    this.add.text(width / 2, 22, '🔧  Mejoras del Bodega García', {
      fontSize: '28px', color: '#F4A261', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, 52, `Efectivo disponible: $${Math.floor(GameState.finances.cash).toLocaleString()}`, {
      fontSize: '17px', color: '#2ECC71', fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Upgrade grid (2 columns × 3 rows)
    const cols   = 2;
    const cardW  = 560, cardH = 140;
    const padX   = (width - cols * cardW) / (cols + 1);
    const startY = 96;

    UPGRADES.forEach((up, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx  = padX + col * (cardW + padX) + cardW / 2;
      const cy  = startY + row * (cardH + 16) + cardH / 2;

      this._drawCard(up, cx, cy, cardW, cardH);
    });

    // Back button
    const { zone } = drawButton(this, 90, height - 36, 150, 46, '← Volver', {
      fillColor: 0x333355, fillColorHover: 0x4444AA, fontSize: '19px', radius: 8, depth: 10,
    });
    zone.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('BodegaScene'));
    });

    // ESC
    this.input.keyboard.once('keydown-ESC', () => {
      this.cameras.main.fadeOut(350, 0, 0, 0);
      this.time.delayedCall(350, () => this.scene.start('BodegaScene'));
    });
  }

  _drawCard(up, cx, cy, w, h) {
    const owned   = (GameState.bodega.upgrades || []).includes(up.id);
    const canBuy  = !owned && GameState.finances.cash >= up.cost;

    const cardG = this.add.graphics();
    const paintCard = (hover) => {
      cardG.clear();
      const col = owned ? 0x0d2a0d : hover ? 0x152230 : 0x0d1a28;
      cardG.fillStyle(col, 1);
      cardG.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 12);
      cardG.lineStyle(2, owned ? 0x2A9D8F : hover ? 0xF4A261 : 0x334466, 1);
      cardG.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 12);
    };
    paintCard(false);

    // Icon
    this.add.text(cx - w / 2 + 36, cy, up.icon, { fontSize: '42px' }).setOrigin(0.5).setDepth(5);

    // Name
    this.add.text(cx - w / 2 + 76, cy - 42, up.name, {
      fontSize: '20px', color: owned ? '#2A9D8F' : '#FFFFFF',
      fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setDepth(5);

    // Description
    this.add.text(cx - w / 2 + 76, cy - 14, up.desc, {
      fontSize: '15px', color: '#AAAAAA', fontFamily: 'Arial',
      wordWrap: { width: w - 160 },
    }).setDepth(5);

    // Effect tag
    const tagG = this.add.graphics().setDepth(5);
    const tagCol = owned ? 0x1a4a1a : 0x1a2a3a;
    tagG.fillStyle(tagCol, 1);
    tagG.fillRoundedRect(cx - w / 2 + 76, cy + 36, up.effect.length * 9 + 16, 26, 6);
    this.add.text(cx - w / 2 + 84, cy + 49, up.effect, {
      fontSize: '13px', color: owned ? '#2A9D8F' : '#A8DADC', fontFamily: 'Arial',
    }).setOrigin(0, 0.5).setDepth(6);

    // Cost / owned badge
    const badgeX = cx + w / 2 - 80;
    if (owned) {
      this.add.text(badgeX, cy, '✅ Instalado', {
        fontSize: '15px', color: '#2A9D8F', fontFamily: 'Arial', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(6);
    } else {
      const priceG = this.add.graphics().setDepth(5);
      priceG.fillStyle(canBuy ? 0x1a3a1a : 0x2a1a1a, 1);
      priceG.fillRoundedRect(badgeX - 55, cy - 18, 110, 36, 8);
      this.add.text(badgeX, cy, `$${up.cost.toLocaleString()}`, {
        fontSize: '20px', color: canBuy ? '#2ECC71' : '#E74C3C',
        fontFamily: 'Georgia, serif', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(6);

      if (canBuy) {
        const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true }).setDepth(7);
        zone.on('pointerover', () => paintCard(true));
        zone.on('pointerout',  () => paintCard(false));
        zone.on('pointerdown', () => this._buy(up));
      } else {
        this.add.text(badgeX, cy + 22, `Faltan $${(up.cost - GameState.finances.cash).toLocaleString()}`, {
          fontSize: '12px', color: '#666666', fontFamily: 'Arial',
        }).setOrigin(0.5).setDepth(6);
      }
    }
  }

  _buy(up) {
    if (!GameState.spendCash(up.cost)) return;
    if (!GameState.bodega.upgrades) GameState.bodega.upgrades = [];
    GameState.bodega.upgrades.push(up.id);

    // Apply immediate effects
    if (up.id === 'letreros')        GameState.addTrust(8);
    if (up.id === 'aireacondicionado') GameState.addGentriPressure(-3);

    GameState.save();
    AudioSystem.upgrade();
    showNotification(this, this.scale.width / 2, 100,
      `✅ ${up.name} instalado!`, { bgColor: 0x2A9D8F, duration: 2000 });

    this.time.delayedCall(400, () => this.scene.restart());
  }
}
