import GameState from '../GameState.js';
import { drawCharacter, SKIN_TONES, SKIN_TONE_NAMES, HAIR_STYLES, drawButton, drawPanel } from '../utils/DrawUtils.js';

const CLOTHING_COLORS = [0x3A7BD5, 0xE63946, 0x2A9D8F, 0x8338EC, 0xF4A261, 0x2D6A4F];

export default class CharacterCreationScene extends Phaser.Scene {
  constructor() { super({ key: 'CharacterCreationScene' }); }

  init() {
    this.selectedSkin    = 3;
    this.selectedHair    = 1; // Rizos
    this.selectedClothing = 0;
    this.playerName      = '';
    this.previewChar     = null;
    this.cursorVisible   = true;
    this.nameDisplay     = null;
  }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x1a0d30, 0x0d1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // DR flag cross (decorative)
    const cross = this.add.graphics();
    cross.fillStyle(0xFFFFFF, 0.04);
    cross.fillRect(width / 2 - 3, 0, 6, height);
    cross.fillRect(0, height / 2 - 3, width, 6);

    // ── Panel borders ───────────────────────────────────
    // Left: character preview (x 0–380)
    drawPanel(this, 190, height / 2, 360, height - 40, {
      fillColor: 0x0a0a20, fillAlpha: 0.7, strokeColor: 0xF4A261,
    });
    // Center: options (x 390–870)
    drawPanel(this, 630, height / 2, 460, height - 40, {
      fillColor: 0x080818, fillAlpha: 0.7, strokeColor: 0xA8DADC,
    });
    // Right: story (x 880–1270)
    drawPanel(this, 1075, height / 2, 370, height - 40, {
      fillColor: 0x0a0a20, fillAlpha: 0.7, strokeColor: 0x2A9D8F,
    });

    // ── Section titles ──────────────────────────────────
    this.add.text(190, 32, 'TU PROTAGONISTA', {
      fontSize: '16px', color: '#F4A261', fontFamily: 'Arial', fontStyle: 'bold', letterSpacing: 3,
    }).setOrigin(0.5);

    this.add.text(630, 32, 'CREA TU PERSONAJE', {
      fontSize: '16px', color: '#A8DADC', fontFamily: 'Arial', fontStyle: 'bold', letterSpacing: 3,
    }).setOrigin(0.5);

    this.add.text(1075, 32, 'TU HISTORIA', {
      fontSize: '16px', color: '#2A9D8F', fontFamily: 'Arial', fontStyle: 'bold', letterSpacing: 3,
    }).setOrigin(0.5);

    // ── Character preview ───────────────────────────────
    this._buildPreview();

    // ── Name input ──────────────────────────────────────
    this.add.text(630, 75, 'Tu nombre:', {
      fontSize: '20px', color: '#FFFFFF', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);

    const nameBg = this.add.graphics();
    nameBg.lineStyle(2, 0xF4A261, 1);
    nameBg.fillStyle(0x111130, 1);
    nameBg.fillRoundedRect(420, 90, 420, 48, 8);
    nameBg.strokeRoundedRect(420, 90, 420, 48, 8);

    this.nameDisplay = this.add.text(630, 114, '|', {
      fontSize: '26px', color: '#FFFFFF', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);

    // Cursor blink
    this.time.addEvent({
      delay: 500, repeat: -1,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        const cursor = this.cursorVisible ? '|' : '';
        this.nameDisplay.setText((this.playerName || '') + cursor);
      },
    });

    this.input.keyboard.on('keydown', (evt) => {
      if (evt.key === 'Backspace') {
        this.playerName = this.playerName.slice(0, -1);
      } else if (evt.key === 'Enter') {
        this._confirm();
      } else if (evt.key.length === 1 && this.playerName.length < 18) {
        this.playerName += evt.key;
      }
    });

    // ── Skin tone picker ────────────────────────────────
    this.add.text(630, 158, 'Tono de piel:', {
      fontSize: '19px', color: '#FFFFFF', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);

    this.skinSelectors = [];
    const skinStartX = 420 + 35;
    SKIN_TONES.forEach((hex, i) => {
      const sx = skinStartX + i * 70;
      const sy = 195;
      const circle = this.add.graphics();
      circle.fillStyle(hex, 1);
      circle.fillCircle(sx, sy, 24);
      circle.lineStyle(3, 0xFFFFFF, 0.5);
      circle.strokeCircle(sx, sy, 24);

      const zone = this.add.zone(sx, sy, 52, 52).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => { circle.clear(); circle.fillStyle(hex, 1); circle.fillCircle(sx, sy, 27); circle.lineStyle(4, 0xF4A261, 1); circle.strokeCircle(sx, sy, 27); });
      zone.on('pointerout',  () => this._drawSkinCircle(circle, sx, sy, hex, i));
      zone.on('pointerdown', () => { this.selectedSkin = i; this._updateSkinSelectors(); this._rebuildPreview(); });

      this.skinSelectors.push({ circle, hex, idx: i, sx, sy });
    });

    this.skinLabel = this.add.text(630, 232, SKIN_TONE_NAMES[this.selectedSkin], {
      fontSize: '15px', color: '#F4A261', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    }).setOrigin(0.5);

    // ── Hair style picker ────────────────────────────────
    this.add.text(630, 268, 'Tu cabello:', {
      fontSize: '19px', color: '#FFFFFF', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);

    this.hairButtons = [];
    const hairY = [298, 338, 378, 418, 458];
    const hairDescriptions = [
      'Blowout — Afro esponjoso y radiante',
      'Rizos — Rizos naturales libres',
      'Trenzas — Trenzas con elegancia',
      'Recogido — Moño sofisticado',
      'Locs — Locs auténticos y poderosos',
    ];
    HAIR_STYLES.forEach((style, i) => {
      const btn = this.add.graphics();
      const ty = hairY[i];
      this._drawHairBtn(btn, 630, ty, style, i === this.selectedHair);

      const zone = this.add.zone(630, ty, 400, 34).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        this.selectedHair = i;
        this._updateHairButtons();
        this._rebuildPreview();
      });
      zone.on('pointerover', () => this.add.text(630, ty + 22, hairDescriptions[i], {
        fontSize: '12px', color: '#A8DADC', fontFamily: 'Arial',
      }).setOrigin(0.5).setName('hairDesc').setDepth(20));
      zone.on('pointerout', () => {
        const desc = this.children.getByName('hairDesc');
        if (desc) desc.destroy();
      });

      this.hairButtons.push({ btn, style, idx: i });
    });

    // ── Clothing color picker ────────────────────────────
    this.add.text(630, 498, 'Color de ropa:', {
      fontSize: '19px', color: '#FFFFFF', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);

    this.clothingSelectors = [];
    CLOTHING_COLORS.forEach((hex, i) => {
      const cx = 430 + i * 68;
      const cy = 536;
      const cg = this.add.graphics();
      cg.fillStyle(hex, 1);
      cg.fillRoundedRect(cx, cy, 40, 40, 6);

      const cz = this.add.zone(cx + 20, cy + 20, 44, 44).setInteractive({ useHandCursor: true });
      cz.on('pointerdown', () => {
        this.selectedClothing = i;
        this._updateClothingSelectors();
        this._rebuildPreview();
      });
      this.clothingSelectors.push({ cg, hex, idx: i, cx, cy });
    });
    this._updateClothingSelectors();

    // ── Story panel (right) ──────────────────────────────
    const storyLines = [
      { text: '"Mija, tienes que quedarte',    color: '#F4A261', italic: true },
      { text: ' con el bodega."',               color: '#F4A261', italic: true },
      { text: '',                              color: '#FFFFFF' },
      { text: 'Tu abuelo García pasó',         color: '#E0E0E0' },
      { text: '40 años sirviendo a este',       color: '#E0E0E0' },
      { text: 'barrio en Washington Heights.', color: '#E0E0E0' },
      { text: '',                              color: '#FFFFFF' },
      { text: 'Eres una universitaria que',    color: '#E0E0E0' },
      { text: 'no esperaba esto — pero',       color: '#E0E0E0' },
      { text: 'la comunidad te necesita.',     color: '#E0E0E0' },
      { text: '',                              color: '#FFFFFF' },
      { text: 'El barrio está cambiando.',     color: '#FF8888' },
      { text: 'Los developers ya rondan.',     color: '#FF8888' },
      { text: '',                              color: '#FFFFFF' },
      { text: 'Tú puedes salvarlo.',           color: '#A8DADC' },
      { text: '¿Estás lista?',                 color: '#A8DADC' },
    ];
    storyLines.forEach((line, i) => {
      this.add.text(1075, 70 + i * 28, line.text, {
        fontSize: '17px', color: line.color,
        fontFamily: 'Georgia, serif',
        fontStyle: line.italic ? 'italic' : 'normal',
      }).setOrigin(0.5);
    });

    // Abuelo's photo placeholder
    const photoG = this.add.graphics();
    photoG.fillStyle(0x2C3E50, 1);
    photoG.fillRoundedRect(1015, 555, 120, 100, 6);
    photoG.lineStyle(3, 0xF4A261, 1);
    photoG.strokeRoundedRect(1015, 555, 120, 100, 6);
    this.add.text(1075, 585, '📷', { fontSize: '36px' }).setOrigin(0.5);
    this.add.text(1075, 638, 'Abuelo García', {
      fontSize: '13px', color: '#F4A261', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    }).setOrigin(0.5);

    // ── Confirm button ───────────────────────────────────
    const { container, zone: confirmZone } = drawButton(
      this, width / 2, height - 38, 340, 52, '¡Vamos, mi amor!  →',
      { fillColor: 0xE63946, fillColorHover: 0xFF5566, fontSize: '24px', radius: 12, depth: 20 }
    );
    confirmZone.on('pointerdown', () => this._confirm());

    this._updateSkinSelectors();
    this._updateHairButtons();
  }

  _buildPreview() {
    if (this.previewChar) this.previewChar.destroy();
    this.previewChar = drawCharacter(this, 190, 440, {
      skinTone: this.selectedSkin,
      hairStyle: HAIR_STYLES[this.selectedHair],
      clothingColor: CLOTHING_COLORS[this.selectedClothing],
      scale: 2.8,
    });
    this.previewChar.setDepth(5);
  }

  _rebuildPreview() {
    if (this.skinLabel) this.skinLabel.setText(SKIN_TONE_NAMES[this.selectedSkin]);
    this._buildPreview();
  }

  _drawSkinCircle(g, sx, sy, hex, i) {
    g.clear();
    const selected = this.selectedSkin === i;
    g.fillStyle(hex, 1);
    g.fillCircle(sx, sy, selected ? 27 : 24);
    g.lineStyle(selected ? 4 : 2, selected ? 0xF4A261 : 0xFFFFFF, selected ? 1 : 0.4);
    g.strokeCircle(sx, sy, selected ? 27 : 24);
    if (selected) {
      g.lineStyle(2, 0xFFFFFF, 0.9);
      g.strokeCircle(sx, sy, 18);
    }
  }

  _updateSkinSelectors() {
    this.skinSelectors.forEach(({ circle, hex, idx, sx, sy }) => {
      this._drawSkinCircle(circle, sx, sy, hex, idx);
    });
    if (this.skinLabel) this.skinLabel.setText(SKIN_TONE_NAMES[this.selectedSkin]);
  }

  _drawHairBtn(g, x, y, style, selected) {
    g.clear();
    g.fillStyle(selected ? 0x1565C0 : 0x1a1a3a, 1);
    g.fillRoundedRect(x - 200, y - 15, 400, 32, 6);
    if (selected) {
      g.lineStyle(2, 0xA8DADC, 1);
      g.strokeRoundedRect(x - 200, y - 15, 400, 32, 6);
    }
  }

  _updateHairButtons() {
    this.hairButtons.forEach(({ btn, style, idx }) => {
      const selected = this.selectedHair === idx;
      this._drawHairBtn(btn, 630, [298, 338, 378, 418, 458][idx], style, selected);

      // Re-draw label
    });
    // Re-draw all hair labels
    if (this._hairLabels) this._hairLabels.forEach(t => t.destroy());
    this._hairLabels = HAIR_STYLES.map((style, i) => {
      const selected = this.selectedHair === i;
      return this.add.text(630, [298, 338, 378, 418, 458][i], style, {
        fontSize: '18px',
        color: selected ? '#FFFFFF' : '#888888',
        fontFamily: 'Georgia, serif',
        fontStyle: selected ? 'bold' : 'normal',
      }).setOrigin(0.5).setDepth(6);
    });
  }

  _updateClothingSelectors() {
    this.clothingSelectors.forEach(({ cg, hex, idx, cx, cy }) => {
      cg.clear();
      const sel = this.selectedClothing === idx;
      cg.fillStyle(hex, 1);
      cg.fillRoundedRect(cx, cy, 40, 40, 6);
      if (sel) {
        cg.lineStyle(3, 0xFFFFFF, 1);
        cg.strokeRoundedRect(cx - 2, cy - 2, 44, 44, 7);
        cg.fillStyle(0xFFFFFF, 0.9);
        cg.fillCircle(cx + 36, cy + 4, 7);
        cg.fillStyle(0x00AA00, 1);
        cg.fillCircle(cx + 36, cy + 4, 5);
      }
    });
  }

  _confirm() {
    const name = this.playerName.trim() || 'Maria';
    GameState.player.name     = name;
    GameState.player.skinTone  = this.selectedSkin;
    GameState.player.hairStyle = HAIR_STYLES[this.selectedHair];
    GameState.save();

    this.cameras.main.fadeOut(700, 0, 0, 0);
    this.time.delayedCall(700, () => this.scene.start('CutsceneScene'));
  }
}
