import GameState from '../GameState.js';
import { drawButton, drawCharacter } from '../utils/DrawUtils.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  init(data) {
    this.reason = data?.reason || 'gentrification'; // 'gentrification' | 'bankrupt'
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(1200);

    // Red/dark overlay
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0000, 0x1a0000, 0x2d0808, 0x0d0d0d, 1);
    bg.fillRect(0, 0, width, height);

    // Construction tape / developer boards effect
    for (let i = 0; i < 5; i++) {
      const gg = this.add.graphics();
      gg.fillStyle(0xFFD700, 0.08);
      gg.fillRect(0, i * 155, width, 70);
      gg.lineStyle(2, 0xFFD700, 0.15);
      for (let x = -height; x < width + height; x += 40) {
        gg.strokeRect(x + i * 20, i * 155, 30, 70);
      }
    }

    // Broken bodega silhouette
    const bodG = this.add.graphics();
    bodG.fillStyle(0x333333, 0.6);
    bodG.fillRect(width / 2 - 130, height * 0.52, 260, 140);
    bodG.fillStyle(0x222222, 0.8);
    bodG.fillRect(width / 2 - 136, height * 0.52 - 18, 272, 22);
    // Boards over windows
    bodG.fillStyle(0x5C3317, 0.8);
    bodG.fillRect(width / 2 - 115, height * 0.56, 80, 55);
    bodG.fillRect(width / 2 + 35, height * 0.56, 80, 55);
    bodG.lineStyle(3, 0x8B4513, 0.7);
    bodG.strokeLine(width / 2 - 115, height * 0.56, width / 2 - 35, height * 0.611);
    bodG.strokeLine(width / 2 - 35, height * 0.56, width / 2 - 115, height * 0.611);
    bodG.strokeLine(width / 2 + 35, height * 0.56, width / 2 + 115, height * 0.611);
    bodG.strokeLine(width / 2 + 115, height * 0.56, width / 2 + 35, height * 0.611);
    // FOR SALE sign
    bodG.fillStyle(0xFFFFFF, 0.9);
    bodG.fillRect(width / 2 - 60, height * 0.53, 120, 28);
    this.add.text(width / 2, height * 0.53 + 14, 'FOR SALE — DeveloperCo LLC', {
      fontSize: '12px', color: '#E63946', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5);

    // Main message
    const mainMsg = this.reason === 'bankrupt'
      ? 'Sin fondos...'
      : '🏗️ Los developers ganaron.';

    this.add.text(width / 2, 80, mainMsg, {
      fontSize: '54px', color: '#E63946', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 4,
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 8, fill: true },
    }).setOrigin(0.5);

    const subMsg = this.reason === 'bankrupt'
      ? `${GameState.player.name}, el bodega no pudo sostenerse esta vez.`
      : `El barrio de tu abuelo fue vendido. ${GameState.player.name}, lo intentaste.`;

    this.add.text(width / 2, 148, subMsg, {
      fontSize: '22px', color: '#AAAAAA', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    }).setOrigin(0.5);

    // Stats panel
    const stats = [
      ['⏳ Semanas sobrevividas',  GameState.time.week],
      ['👥 Clientes atendidos',     GameState.stats.customersServed],
      ['💵 Ingresos totales',       `$${(GameState.finances.totalEarned || 0).toLocaleString()}`],
      ['🤝 Confianza final',        `${GameState.stats.communityTrust}/100`],
      ['💰 La San pagada',          `${GameState.laSan.consecutivePayments} sem.`],
    ];

    const panelG = this.add.graphics().setDepth(5);
    panelG.fillStyle(0x0a0a18, 0.88);
    panelG.fillRoundedRect(width / 2 - 260, 180, 520, 200, 12);
    panelG.lineStyle(2, 0x555555, 1);
    panelG.strokeRoundedRect(width / 2 - 260, 180, 520, 200, 12);

    stats.forEach(([label, val], i) => {
      const row = i % 2 === 0 ? '#DDDDDD' : '#BBBBBB';
      this.add.text(width / 2 - 230, 198 + i * 34, label, {
        fontSize: '18px', color: row, fontFamily: 'Arial',
      }).setDepth(6);
      this.add.text(width / 2 + 230, 198 + i * 34, String(val), {
        fontSize: '18px', color: '#F4A261', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      }).setOrigin(1, 0).setDepth(6);
    });

    // Motivational quote
    this.add.text(width / 2, 410, [
      '"El fracaso no es caerse — es quedarse caído.',
      'Abuelo García cayó tres veces antes de quedarse."',
    ].join('\n'), {
      fontSize: '18px', color: '#888888', fontFamily: 'Georgia, serif', fontStyle: 'italic',
      align: 'center', lineSpacing: 6,
    }).setOrigin(0.5);

    // Buttons
    const { zone: retryZone } = drawButton(this, width / 2 - 140, height - 70, 250, 52, '🔄 Intentar de nuevo', {
      fillColor: 0xE63946, fillColorHover: 0xFF5566, fontSize: '20px', radius: 10, depth: 10,
    });
    retryZone.on('pointerdown', () => {
      GameState.reset(); // clears localStorage + reloads
    });

    const { zone: contZone } = drawButton(this, width / 2 + 140, height - 70, 220, 52, '📖 Ver historia', {
      fillColor: 0x333355, fillColorHover: 0x4444AA, fontSize: '20px', radius: 10, depth: 10,
    });
    contZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.time.delayedCall(600, () => this.scene.start('BlockViewScene'));
    });
  }
}
