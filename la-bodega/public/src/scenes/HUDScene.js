import GameState from '../GameState.js';

// Always-on overlay — launched alongside BlockViewScene and BodegaScene
export default class HUDScene extends Phaser.Scene {
  constructor() { super({ key: 'HUDScene' }); }

  create() {
    const { width } = this.scale;

    // Top bar background
    const bar = this.add.graphics();
    bar.fillStyle(0x050510, 0.82);
    bar.fillRect(0, 0, width, 58);
    bar.lineStyle(1, 0xF4A261, 0.4);
    bar.strokeRect(0, 57, width, 1);

    // ── Cash ─────────────────────────────────────────────
    this.add.text(18, 12, '💵', { fontSize: '26px' });
    this.cashText = this.add.text(52, 15, '$0', {
      fontSize: '22px', color: '#2ECC71', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    });

    // ── Day / Week ────────────────────────────────────────
    this.timeText = this.add.text(width / 2, 16, 'Semana 1 · Día 1', {
      fontSize: '20px', color: '#FFFFFF', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);

    // ── Community Trust ──────────────────────────────────
    const trustLabelX = width - 340;
    this.add.text(trustLabelX, 10, 'Confianza Comunitaria', {
      fontSize: '13px', color: '#A8DADC', fontFamily: 'Arial',
    });
    this.trustBarBg = this.add.graphics();
    this.trustBarBg.fillStyle(0x222244, 1);
    this.trustBarBg.fillRoundedRect(trustLabelX, 27, 200, 16, 4);

    this.trustBarFill = this.add.graphics();
    this.add.text(trustLabelX + 205, 27, '🤝', { fontSize: '18px' });

    // ── Gentrification meter ─────────────────────────────
    this.add.text(width - 120, 10, '🏗️', { fontSize: '18px' });
    this.gentBarBg = this.add.graphics();
    this.gentBarBg.fillStyle(0x221111, 1);
    this.gentBarBg.fillRoundedRect(width - 112, 27, 96, 16, 4);
    this.gentBarFill = this.add.graphics();
    this.add.text(width - 112, 12, 'Presión', {
      fontSize: '13px', color: '#FF8888', fontFamily: 'Arial',
    });

    // ── La San indicator ─────────────────────────────────
    this.laSanBadge = this.add.text(18, 36, '', {
      fontSize: '14px', color: '#F4A261', fontFamily: 'Arial',
    });

    // ── Pause button (⚙) ─────────────────────────────────
    const pauseBtn = this.add.text(width - 20, 12, '⚙', {
      fontSize: '28px', color: '#AAAAAA',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(5);
    pauseBtn.on('pointerover', () => pauseBtn.setStyle({ color: '#FFFFFF' }));
    pauseBtn.on('pointerout',  () => pauseBtn.setStyle({ color: '#AAAAAA' }));
    pauseBtn.on('pointerdown', () => this._togglePause());

    // ESC key
    this.input.keyboard.on('keydown-ESC', () => this._togglePause());

    this.paused = false;
    this.pauseOverlay = null;

    this._refresh();
  }

  update() {
    if (!this.paused) this._refresh();
  }

  // ── Pause Menu ─────────────────────────────────────────
  _togglePause() {
    if (this.paused) {
      this._hidePause();
    } else {
      this._showPause();
    }
  }

  _showPause() {
    this.paused = true;
    const { width, height } = this.scale;

    // Pause all sibling scenes
    this.scene.manager.scenes.forEach(s => {
      if (s.scene.key !== 'HUDScene' && s.scene.isActive()) {
        s.scene.pause();
      }
    });

    const ov = this.add.container(width / 2, height / 2).setDepth(100);

    // Dim
    const dim = this.add.graphics();
    dim.fillStyle(0x000000, 0.75);
    dim.fillRect(-width / 2, -height / 2, width, height);

    // Panel
    const panG = this.add.graphics();
    panG.fillStyle(0x080818, 0.97);
    panG.fillRoundedRect(-200, -240, 400, 480, 16);
    panG.lineStyle(3, 0xF4A261, 1);
    panG.strokeRoundedRect(-200, -240, 400, 480, 16);

    const titleT = this.add.text(0, -205, '⚙  PAUSA', {
      fontSize: '28px', color: '#F4A261', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5);

    const nameT = this.add.text(0, -162, GameState.player.name, {
      fontSize: '18px', color: '#A8DADC', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    }).setOrigin(0.5);

    const statsT = this.add.text(0, -120, [
      `Semana ${GameState.time.week}  ·  Día ${GameState.time.day}`,
      `💵 $${Math.floor(GameState.finances.cash).toLocaleString()}`,
      `🤝 Confianza: ${GameState.stats.communityTrust}/100`,
      `🏗️ Presión: ${GameState.stats.gentrificationPressure}/100`,
    ].join('\n'), {
      fontSize: '16px', color: '#CCCCCC', fontFamily: 'Arial', align: 'center', lineSpacing: 6,
    }).setOrigin(0.5);

    // Buttons
    const buttons = [
      { label: '▶  Reanudar',   color: 0x2A9D8F, hover: 0x3BB8A8, action: () => this._hidePause() },
      { label: '📖  Créditos',  color: 0x334466, hover: 0x4455AA, action: () => this._goCredits() },
      { label: '🔄  Reiniciar', color: 0x663333, hover: 0xAA4444, action: () => this._confirmRestart(ov) },
    ];

    const btnObjs = buttons.map((b, i) => {
      const by = -20 + i * 80;
      const bg = this.add.graphics();
      const paint = (h) => {
        bg.clear();
        bg.fillStyle(h ? b.hover : b.color, 1);
        bg.fillRoundedRect(-150, by - 22, 300, 46, 10);
      };
      paint(false);
      const t = this.add.text(0, by, b.label, {
        fontSize: '20px', color: '#FFFFFF', fontFamily: 'Georgia, serif',
      }).setOrigin(0.5);
      const z = this.add.zone(0, by, 300, 46).setInteractive({ useHandCursor: true });
      z.on('pointerover', () => paint(true));
      z.on('pointerout',  () => paint(false));
      z.on('pointerdown', () => b.action());
      return [bg, t, z];
    });

    // Keyboard hint
    const hintT = this.add.text(0, 220, 'ESC para reanudar', {
      fontSize: '14px', color: '#444444', fontFamily: 'Arial',
    }).setOrigin(0.5);

    ov.add([dim, panG, titleT, nameT, statsT, hintT]);
    buttons.forEach((_, i) => ov.add(btnObjs[i]));
    this.pauseOverlay = ov;
  }

  _hidePause() {
    this.paused = false;
    if (this.pauseOverlay) { this.pauseOverlay.destroy(); this.pauseOverlay = null; }
    // Resume all paused scenes
    this.scene.manager.scenes.forEach(s => {
      if (s.scene.key !== 'HUDScene' && s.scene.isPaused()) {
        s.scene.resume();
      }
    });
  }

  _goCredits() {
    this._hidePause();
    // Find which gameplay scene is active to return to
    const active = this.scene.manager.scenes.find(
      s => s.scene.key !== 'HUDScene' && s.scene.isActive()
    );
    const returnTo = active?.scene.key || 'BlockViewScene';
    this.scene.stop('HUDScene');
    this.scene.start('CreditsScene', { returnTo });
  }

  _confirmRestart(ov) {
    const { width, height } = this.scale;
    const conf = this.add.container(0, 0).setDepth(110);
    const cdim = this.add.graphics();
    cdim.fillStyle(0x000000, 0.6);
    cdim.fillRect(-width / 2, -height / 2, width, height);
    const cpan = this.add.graphics();
    cpan.fillStyle(0x0a0a1a, 0.98);
    cpan.fillRoundedRect(-180, -80, 360, 160, 12);
    cpan.lineStyle(2, 0xE63946, 1);
    cpan.strokeRoundedRect(-180, -80, 360, 160, 12);
    const ct = this.add.text(0, -48, '¿Reiniciar el juego?\nSe perderá el progreso.', {
      fontSize: '18px', color: '#FFFFFF', fontFamily: 'Georgia, serif', align: 'center', lineSpacing: 4,
    }).setOrigin(0.5);

    const yesG = this.add.graphics();
    yesG.fillStyle(0xE63946, 1); yesG.fillRoundedRect(-155, 18, 130, 40, 8);
    const yesT = this.add.text(-90, 38, 'Sí, reiniciar', { fontSize: '16px', color: '#FFF', fontFamily: 'Arial' }).setOrigin(0.5);
    const yesZ = this.add.zone(-90, 38, 130, 40).setInteractive({ useHandCursor: true });
    yesZ.on('pointerdown', () => { this._hidePause(); GameState.reset(); });

    const noG = this.add.graphics();
    noG.fillStyle(0x333355, 1); noG.fillRoundedRect(25, 18, 130, 40, 8);
    const noT = this.add.text(90, 38, 'Cancelar', { fontSize: '16px', color: '#FFF', fontFamily: 'Arial' }).setOrigin(0.5);
    const noZ = this.add.zone(90, 38, 130, 40).setInteractive({ useHandCursor: true });
    noZ.on('pointerdown', () => conf.destroy());

    conf.add([cdim, cpan, ct, yesG, yesT, yesZ, noG, noT, noZ]);
    ov.add(conf);
  }

  // ── Stats refresh ──────────────────────────────────────
  _refresh() {
    const { width } = this.scale;
    const gs = GameState;

    const cashStr = `$${Math.floor(gs.finances.cash).toLocaleString()}`;
    this.cashText.setText(cashStr);
    this.cashText.setStyle({ color: gs.finances.cash < 0 ? '#E74C3C' : gs.finances.cash < 200 ? '#F39C12' : '#2ECC71' });

    const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const dayName  = dayNames[(gs.time.dayOfWeek - 1) % 7];
    this.timeText.setText(`Semana ${gs.time.week}  ·  Día ${gs.time.day}  (${dayName})`);

    const trustX = width - 340;
    const trustFill = Math.max(0, Math.min(1, gs.stats.communityTrust / 100)) * 196;
    this.trustBarFill.clear();
    this.trustBarFill.fillStyle(
      gs.stats.communityTrust > 70 ? 0x2A9D8F : gs.stats.communityTrust > 40 ? 0xF4A261 : 0xE63946, 1
    );
    if (trustFill > 0) this.trustBarFill.fillRoundedRect(trustX + 2, 29, trustFill, 12, 3);

    const gentFill = Math.max(0, Math.min(1, gs.stats.gentrificationPressure / 100)) * 92;
    this.gentBarFill.clear();
    this.gentBarFill.fillStyle(
      gs.stats.gentrificationPressure > 70 ? 0xE63946 : gs.stats.gentrificationPressure > 40 ? 0xF4A261 : 0xAAAAAA, 1
    );
    if (gentFill > 0) this.gentBarFill.fillRoundedRect(width - 110, 29, gentFill, 12, 3);

    if (gs.laSan.active) {
      this.laSanBadge.setText(gs.laSan.playerPaidThisWeek ? '💰 La San ✓' : '💰 La San pendiente');
      this.laSanBadge.setStyle({ color: gs.laSan.playerPaidThisWeek ? '#2A9D8F' : '#F4A261' });
    }
  }
}
