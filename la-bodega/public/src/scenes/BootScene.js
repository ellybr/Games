import GameState from '../GameState.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  create() {
    const { width, height } = this.scale;

    // Night sky
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a18, 0x0a0a18, 0x0d1b35, 0x0d1b35, 1);
    bg.fillRect(0, 0, width, height);

    // Stars
    for (let i = 0; i < 90; i++) {
      const sx = Phaser.Math.Between(0, width);
      const sy = Phaser.Math.Between(0, height * 0.65);
      const star = this.add.graphics();
      star.fillStyle(0xFFFFFF, Phaser.Math.FloatBetween(0.3, 1));
      star.fillCircle(sx, sy, Phaser.Math.FloatBetween(0.6, 2.4));
      star.setAlpha(0);
      this.tweens.add({
        targets: star, alpha: 1,
        duration: Phaser.Math.Between(1000, 3000),
        delay: Phaser.Math.Between(0, 2000),
        yoyo: true, repeat: -1,
      });
    }

    // City silhouette
    this._skyline(bg, width, height);

    // DR flag accent bar at bottom
    const bar = this.add.graphics();
    bar.fillStyle(0xD32F2F, 1);
    bar.fillRect(0, height - 5, width / 2, 5);
    bar.fillStyle(0x1565C0, 1);
    bar.fillRect(width / 2, height - 5, width / 2, 5);

    // Small bodega illustration above title
    this._bodegaIllo(width / 2, height * 0.38);

    // Title
    const title = this.add.text(width / 2, height * 0.6, 'LA BODEGA', {
      fontFamily: 'Georgia, serif',
      fontSize: '92px',
      color: '#F4A261',
      stroke: '#B83000',
      strokeThickness: 5,
      shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 12, fill: true },
    }).setOrigin(0.5).setAlpha(0);

    const sub = this.add.text(width / 2, height * 0.72, 'A legacy. A community. Your story.', {
      fontFamily: 'Georgia, serif',
      fontSize: '26px',
      color: '#A8DADC',
      fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0);

    const prompt = this.add.text(width / 2, height * 0.85, 'CLICK TO START', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#FFFFFF',
      letterSpacing: 5,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: title, alpha: 1, y: height * 0.595, duration: 1600, ease: 'Power2' });
    this.tweens.add({ targets: sub, alpha: 1, duration: 1400, delay: 900 });
    this.tweens.add({ targets: prompt, alpha: { from: 0, to: 1 }, duration: 900, delay: 2000, yoyo: true, repeat: -1 });

    // Continue saved game link
    const hasSave = GameState.load();
    if (hasSave) {
      const cont = this.add.text(
        width / 2, height * 0.91,
        `Continue — Week ${GameState.time.week}, Day ${GameState.time.day}  (${GameState.player.name})`,
        { fontSize: '17px', color: '#A8DADC', fontFamily: 'Arial' }
      ).setOrigin(0.5).setInteractive({ useHandCursor: true });
      cont.on('pointerover', () => cont.setStyle({ color: '#F4A261' }));
      cont.on('pointerout',  () => cont.setStyle({ color: '#A8DADC' }));
      cont.on('pointerdown', () => this._go('BlockViewScene'));
    }

    this.input.once('pointerdown', () => {
      if (!hasSave) this._go('CharacterCreationScene');
    });
  }

  _go(key) {
    this.cameras.main.fadeOut(700, 0, 0, 0);
    this.time.delayedCall(700, () => this.scene.start(key));
  }

  _skyline(g, width, height) {
    const baseY = height * 0.65;
    const buildings = [
      [0,80,130],[90,55,95],[155,95,165],[260,48,82],[318,78,148],
      [406,115,108],[530,68,195],[608,88,152],[706,58,115],
      [774,98,180],[882,76,135],[968,105,162],[1083,65,100],[1158,80,145],
    ];
    g.fillStyle(0x080810, 1);
    buildings.forEach(([x, w, h]) => {
      g.fillRect(x, baseY - h, w, h);
      g.fillStyle(0xFFFF88, 0.22);
      for (let wy = baseY - h + 10; wy < baseY - 8; wy += 20) {
        for (let wx = x + 7; wx < x + w - 7; wx += 16) {
          if (Math.random() > 0.45) g.fillRect(wx, wy, 8, 10);
        }
      }
      g.fillStyle(0x080810, 1);
    });
  }

  _bodegaIllo(x, y) {
    const g = this.add.graphics();
    // Building
    g.fillStyle(0xE8D5B7, 1); g.fillRect(x - 95, y - 85, 190, 85);
    // Roof
    g.fillStyle(0xD32F2F, 1); g.fillRect(x - 100, y - 100, 200, 18);
    // Awning
    g.fillStyle(0xD32F2F, 1);
    g.fillTriangle(x - 60, y - 82, x, y - 62, x - 60, y - 62);
    g.fillStyle(0x1565C0, 1);
    g.fillTriangle(x + 60, y - 82, x, y - 62, x + 60, y - 62);
    // Door
    g.fillStyle(0x6B3A1F, 1); g.fillRect(x - 20, y - 65, 40, 65);
    g.fillStyle(0xFFD700, 1); g.fillCircle(x + 14, y - 33, 4);
    // Window L
    g.fillStyle(0x87CEEB, 0.75); g.fillRect(x - 82, y - 70, 44, 34);
    g.lineStyle(2, 0x6B3A1F, 1); g.strokeRect(x - 82, y - 70, 44, 34);
    // Sign
    g.fillStyle(0xFFFFFF, 1); g.fillRect(x - 55, y - 96, 110, 22);
    g.lineStyle(1.5, 0xCCCCCC, 1); g.strokeRect(x - 55, y - 96, 110, 22);
    this.add.text(x, y - 84, 'BODEGA GARCÍA', {
      fontSize: '11px', color: '#D32F2F', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5);
    // Sidewalk
    g.fillStyle(0x666666, 1); g.fillRect(x - 105, y, 210, 14);
  }
}
