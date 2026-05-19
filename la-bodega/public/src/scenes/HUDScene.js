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
    this.trustIcon = this.add.text(trustLabelX + 205, 27, '🤝', { fontSize: '18px' });

    // ── Gentrification meter ─────────────────────────────
    const gentLabelX = width - 340;
    this.add.text(gentLabelX + 220, 10, '🏗️', { fontSize: '18px' });
    this.gentBarBg = this.add.graphics();
    this.gentBarBg.fillStyle(0x221111, 1);
    this.gentBarBg.fillRoundedRect(width - 112, 27, 96, 16, 4);
    this.gentBarFill = this.add.graphics();
    this.gentLabel   = this.add.text(width - 112, 12, 'Presión', {
      fontSize: '13px', color: '#FF8888', fontFamily: 'Arial',
    });

    // ── La San indicator ─────────────────────────────────
    this.laSanBadge = this.add.text(18, 36, '', {
      fontSize: '14px', color: '#F4A261', fontFamily: 'Arial',
    });

    this._refresh();
  }

  update() {
    this._refresh();
  }

  _refresh() {
    const { width } = this.scale;
    const gs = GameState;

    // Cash (colour changes based on amount)
    const cashStr = `$${Math.floor(gs.finances.cash).toLocaleString()}`;
    this.cashText.setText(cashStr);
    this.cashText.setStyle({ color: gs.finances.cash < 0 ? '#E74C3C' : gs.finances.cash < 200 ? '#F39C12' : '#2ECC71' });

    // Time
    const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const dayName  = dayNames[(gs.time.dayOfWeek - 1) % 7];
    this.timeText.setText(`Semana ${gs.time.week}  ·  Día ${gs.time.day}  (${dayName})`);

    // Trust bar
    const trustW = 200;
    const trustFill = Math.max(0, Math.min(1, gs.stats.communityTrust / 100)) * (trustW - 4);
    const trustX = width - 340;
    this.trustBarFill.clear();
    this.trustBarFill.fillStyle(
      gs.stats.communityTrust > 70 ? 0x2A9D8F :
      gs.stats.communityTrust > 40 ? 0xF4A261 : 0xE63946, 1
    );
    if (trustFill > 0) {
      this.trustBarFill.fillRoundedRect(trustX + 2, 29, trustFill, 12, 3);
    }

    // Gentrification bar
    const gentW = 96;
    const gentFill = Math.max(0, Math.min(1, gs.stats.gentrificationPressure / 100)) * (gentW - 4);
    this.gentBarFill.clear();
    this.gentBarFill.fillStyle(
      gs.stats.gentrificationPressure > 70 ? 0xE63946 :
      gs.stats.gentrificationPressure > 40 ? 0xF4A261 : 0xAAAAAA, 1
    );
    if (gentFill > 0) {
      this.gentBarFill.fillRoundedRect(width - 110, 29, gentFill, 12, 3);
    }

    // La San badge
    if (gs.laSan.active) {
      this.laSanBadge.setText(gs.laSan.playerPaidThisWeek ? '💰 La San ✓' : '💰 La San pendiente');
      this.laSanBadge.setStyle({ color: gs.laSan.playerPaidThisWeek ? '#2A9D8F' : '#F4A261' });
    }
  }
}
