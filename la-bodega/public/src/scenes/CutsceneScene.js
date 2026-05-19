import GameState from '../GameState.js';
import DialogueSystem from '../utils/DialogueSystem.js';
import { drawCharacter } from '../utils/DrawUtils.js';

export default class CutsceneScene extends Phaser.Scene {
  constructor() { super({ key: 'CutsceneScene' }); }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(800);

    // Background: exterior of bodega, evening
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d1b2a, 0x0d1b2a, 0x1a2C3D, 0x3D1A0A, 1);
    bg.fillRect(0, 0, width, height);

    // Stars
    for (let i = 0; i < 50; i++) {
      bg.fillStyle(0xFFFFFF, Phaser.Math.FloatBetween(0.2, 0.8));
      bg.fillCircle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height * 0.45),
        Phaser.Math.FloatBetween(0.8, 2),
      );
    }

    // Street
    const street = this.add.graphics();
    street.fillStyle(0x555555, 1); street.fillRect(0, height * 0.72, width, height * 0.28);
    street.fillStyle(0x444444, 1); street.fillRect(0, height * 0.82, width, 4);
    street.fillStyle(0xFFFF88, 0.7);
    for (let x = 0; x < width; x += 80) street.fillRect(x, height * 0.87, 50, 6);

    // Bodega building (exterior, centre)
    this._drawBodegaExterior(width / 2, height * 0.72);

    // Other buildings (blurry silhouettes)
    const otherG = this.add.graphics();
    otherG.fillStyle(0x1a1a2a, 0.85);
    [[30, 200, 180], [260, 140, 150], [840, 170, 160], [1030, 210, 200]].forEach(([x, w, h]) => {
      otherG.fillRect(x, height * 0.72 - h, w, h);
    });

    // Characters
    const playerX = width / 2 - 130;
    const donaX   = width / 2 + 140;
    const charY   = height * 0.72 - 10;

    const player = drawCharacter(this, playerX, charY, {
      skinTone:     GameState.player.skinTone,
      hairStyle:    GameState.player.hairStyle,
      clothingColor: 0x3A7BD5,
      scale:        1.7,
    });

    const dona = drawCharacter(this, donaX, charY, {
      skinTone: 4, hairStyle: 'Recogido', clothingColor: 0x7B2D8B, scale: 1.55,
    });

    this.add.text(donaX, charY - 145, 'Doña Carmen', {
      fontSize: '14px', color: '#F4A261', fontFamily: 'Arial',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(playerX, charY - 155, GameState.player.name, {
      fontSize: '14px', color: '#A8DADC', fontFamily: 'Arial',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Location caption
    const caption = this.add.text(width / 2, 28, 'Washington Heights, Nueva York', {
      fontSize: '18px', color: '#A8DADC', fontFamily: 'Georgia, serif', fontStyle: 'italic',
      stroke: '#000', strokeThickness: 1,
    }).setOrigin(0.5).setAlpha(0);

    const dateCaption = this.add.text(width / 2, 56, 'Una semana después del funeral...', {
      fontSize: '16px', color: '#888888', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [caption, dateCaption], alpha: 1, duration: 1200, delay: 400 });

    // Dialogue
    this.dialogue = new DialogueSystem(this);

    this.time.delayedCall(1400, () => {
      this.dialogue.show([
        {
          speaker: 'Doña Carmen',
          text: '¡Ay, mija! ¿Estás bien? Sé que esta semana ha sido muy dura para ti y tu familia.',
          accent: 0xF4A261,
        },
        {
          speaker: GameState.player.name,
          text: '...Sí, Doña Carmen. No puedo creer que Abuelo se fue. El bodega era su vida entera.',
          accent: 0xA8DADC,
        },
        {
          speaker: 'Doña Carmen',
          text: 'Tu abuelo me dijo: "Carmen, si algo me pasa, cuida a mi nieta." Y aquí estoy, mija.',
          accent: 0xF4A261,
        },
        {
          speaker: GameState.player.name,
          text: 'Hay una carta... dice que me deja todo. El bodega, el apartamento de arriba... todo.',
          accent: 0xA8DADC,
        },
        {
          speaker: 'Doña Carmen',
          text: '¡Claro que sí! Cuarenta años tu abuelo aquí. Este bloque es García. ¡Tú eres García!',
          accent: 0xF4A261,
        },
        {
          speaker: 'Doña Carmen',
          text: 'Pero ten cuidado, mija. Ya andan unos tipos preguntando por las propiedades del bloque. Developers.',
          accent: 0xE63946,
        },
        {
          speaker: GameState.player.name,
          text: '¿Developers? No van a tocar nada de esto. Primero tienen que pasar por mí.',
          accent: 0xA8DADC,
        },
        {
          speaker: 'Doña Carmen',
          text: 'Eso es, mija. La comunidad está contigo. ¡Tenemos La San, tenemos el bloque, tenemos fe!',
          accent: 0xF4A261,
        },
        {
          speaker: GameState.player.name,
          text: 'Voy a restaurar el bodega. Voy a servir este barrio como lo hizo Abuelo. Mejor.',
          accent: 0xA8DADC,
        },
        {
          speaker: '',
          text: '[ Doña Carmen te da las llaves del Bodega García. Tu historia comienza ahora. ]',
          accent: 0x2A9D8F,
        },
      ], () => this._proceed());
    });

    // Skip button
    const skip = this.add.text(width - 20, height - 20, 'Saltar →', {
      fontSize: '16px', color: '#555555', fontFamily: 'Arial',
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
    skip.on('pointerover', () => skip.setStyle({ color: '#AAAAAA' }));
    skip.on('pointerout',  () => skip.setStyle({ color: '#555555' }));
    skip.on('pointerdown', () => { this.dialogue.close(); this._proceed(); });
  }

  _drawBodegaExterior(cx, groundY) {
    const g = this.add.graphics();
    const bw = 320, bh = 280;
    const bx = cx - bw / 2, by = groundY - bh;

    // Main wall
    g.fillStyle(0xE8D5B7, 1); g.fillRect(bx, by, bw, bh);
    // Roof
    g.fillStyle(0xD32F2F, 1); g.fillRect(bx - 5, by - 18, bw + 10, 22);
    // Second floor outline
    g.lineStyle(1, 0xC4B09A, 0.5); g.strokeRect(bx, by, bw, bh / 2);
    // Second floor windows
    [[bx + 20, by + 20], [bx + bw / 2 + 20, by + 20]].forEach(([wx, wy]) => {
      g.fillStyle(0x87CEEB, 0.6); g.fillRect(wx, wy, 55, 45);
      g.lineStyle(2, 0xA08060, 1); g.strokeRect(wx, wy, 55, 45);
      // Curtains
      g.fillStyle(0xFFFFFF, 0.4); g.fillRect(wx, wy, 20, 45);
      g.fillRect(wx + 35, wy, 20, 45);
    });
    // DR flag awning
    g.fillStyle(0xD32F2F, 1);
    g.fillTriangle(bx + 10, by + bh * 0.52, cx, by + bh * 0.42, bx + 10, by + bh * 0.42);
    g.fillStyle(0x1565C0, 1);
    g.fillTriangle(bx + bw - 10, by + bh * 0.52, cx, by + bh * 0.42, bx + bw - 10, by + bh * 0.42);
    // Door
    g.fillStyle(0x6B3A1F, 1); g.fillRect(cx - 28, by + bh * 0.54, 56, bh * 0.46);
    g.lineStyle(2, 0x4A2010, 1); g.strokeRect(cx - 28, by + bh * 0.54, 56, bh * 0.46);
    g.fillStyle(0xFFD700, 1); g.fillCircle(cx + 20, groundY - 55, 5);
    // Store sign (broken neon effect)
    g.fillStyle(0xFFFFFF, 1); g.fillRect(bx + 40, by - 14, 240, 30);
    g.lineStyle(1.5, 0xCCCCCC, 1); g.strokeRect(bx + 40, by - 14, 240, 30);
    this.add.text(cx, by + 1, 'BODEGA GARC_A', {
      fontSize: '17px', color: '#D32F2F', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(cx + 48, by + 1, 'Í', {
      fontSize: '17px', color: '#FF000055', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5);
    // Window display
    g.fillStyle(0x87CEEB, 0.55); g.fillRect(bx + 20, by + bh * 0.54, 80, 65);
    g.lineStyle(2, 0x6B3A1F, 1); g.strokeRect(bx + 20, by + bh * 0.54, 80, 65);
    g.fillStyle(0x87CEEB, 0.55); g.fillRect(bx + bw - 100, by + bh * 0.54, 80, 65);
    g.strokeRect(bx + bw - 100, by + bh * 0.54, 80, 65);
    // Sidewalk
    g.fillStyle(0x888888, 1); g.fillRect(cx - 200, groundY, 400, 18);
    g.lineStyle(1, 0x999999, 0.4);
    for (let tx = cx - 200; tx < cx + 200; tx += 40) g.strokeRect(tx, groundY, 40, 18);
  }

  _proceed() {
    GameState.flags.seenIntro = true;
    GameState.save();
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.time.delayedCall(900, () => this.scene.start('BlockViewScene'));
  }
}
