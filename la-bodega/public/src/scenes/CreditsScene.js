import GameState from '../GameState.js';
import { drawButton } from '../utils/DrawUtils.js';

export default class CreditsScene extends Phaser.Scene {
  constructor() { super({ key: 'CreditsScene' }); }

  init(data) {
    this.returnTo = data?.returnTo || 'BootScene';
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(700);

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x1a0d30, 0x0d1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // Stars
    for (let i = 0; i < 60; i++) {
      bg.fillStyle(0xFFFFFF, Phaser.Math.FloatBetween(0.1, 0.7));
      bg.fillCircle(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height * 0.8), Phaser.Math.FloatBetween(0.5, 2));
    }

    // DR flag accent
    const bar = this.add.graphics();
    bar.fillStyle(0xD32F2F, 1); bar.fillRect(0, 0, width / 2, 5);
    bar.fillStyle(0x1565C0, 1); bar.fillRect(width / 2, 0, width / 2, 5);
    bar.fillStyle(0xD32F2F, 1); bar.fillRect(0, height - 5, width / 2, 5);
    bar.fillStyle(0x1565C0, 1); bar.fillRect(width / 2, height - 5, width / 2, 5);

    const cx = width / 2;
    let y = 60;

    // Title
    this.add.text(cx, y, 'LA BODEGA', {
      fontSize: '52px', color: '#F4A261', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      stroke: '#B83000', strokeThickness: 3,
    }).setOrigin(0.5);
    y += 55;

    this.add.text(cx, y, 'Un legado. Una comunidad. Tu historia.', {
      fontSize: '20px', color: '#A8DADC', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    }).setOrigin(0.5);
    y += 55;

    const sections = [
      {
        heading: '🎮 Diseño y Desarrollo',
        lines: ['Creado con Phaser 3', 'Arte generativo / sin assets externos'],
      },
      {
        heading: '🇩🇴 Inspiración Cultural',
        lines: [
          'Para todas las familias inmigrantes',
          'que sostienen sus comunidades',
          'con trabajo, fe y La San.',
        ],
      },
      {
        heading: '🎵 Ambiente Musical',
        lines: ['Bachata · Merengue · Dembow', '(referenciado, no incluido)'],
      },
      {
        heading: '📖 Mecánica de La San',
        lines: [
          'La San es una junta — ROSCA (Rotating Savings',
          'and Credit Association). Es una herramienta de',
          'inteligencia financiera comunitaria, no caridad.',
        ],
      },
      {
        heading: '❤️ Dedicatoria',
        lines: [
          '"Para mi abuelo, y para todos los abuelos',
          'que construyeron sus barrios con las manos."',
        ],
      },
    ];

    sections.forEach(sec => {
      y += 10;
      const headText = this.add.text(cx, y, sec.heading, {
        fontSize: '20px', color: '#F4A261', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      }).setOrigin(0.5);
      headText.setAlpha(0);
      this.tweens.add({ targets: headText, alpha: 1, duration: 600, delay: 200 });
      y += 30;

      sec.lines.forEach(line => {
        const t = this.add.text(cx, y, line, {
          fontSize: '17px', color: '#DDDDDD', fontFamily: 'Georgia, serif',
          fontStyle: line.startsWith('"') ? 'italic' : 'normal',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: t, alpha: 1, duration: 500, delay: 400 });
        y += 26;
      });
      y += 16;
    });

    // Version tag
    this.add.text(cx, y + 10, 'v1.0  ·  2025', {
      fontSize: '14px', color: '#555555', fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Back button
    const { zone } = drawButton(this, cx, height - 44, 200, 46, '← Volver', {
      fillColor: 0x333355, fillColorHover: 0x4444AA, fontSize: '20px', radius: 10, depth: 10,
    });
    zone.on('pointerdown', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => this.scene.start(this.returnTo));
    });

    // ESC also returns
    this.input.keyboard.once('keydown-ESC', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start(this.returnTo));
    });
  }
}
