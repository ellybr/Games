import GameState from '../GameState.js';
import { drawCharacter, drawButton, showNotification } from '../utils/DrawUtils.js';

export default class LaSanScene extends Phaser.Scene {
  constructor() { super({ key: 'LaSanScene' }); }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(600);

    // Dimmed background
    const overlay = this.add.graphics();
    overlay.fillStyle(0x050510, 0.96);
    overlay.fillRect(0, 0, width, height);

    // Background pattern
    for (let i = 0; i < 30; i++) {
      const pg = this.add.graphics();
      pg.fillStyle(0xF4A261, 0.04);
      pg.fillCircle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(40, 120),
      );
    }

    // Main panel
    const panelW = 900, panelH = 580;
    const panelG = this.add.graphics().setDepth(5);
    panelG.fillStyle(0x0a0a20, 0.97);
    panelG.fillRoundedRect((width - panelW) / 2, (height - panelH) / 2, panelW, panelH, 18);
    panelG.lineStyle(3, 0xF4A261, 1);
    panelG.strokeRoundedRect((width - panelW) / 2, (height - panelH) / 2, panelW, panelH, 18);

    const px = width / 2;
    const py = height / 2;

    // ── Title ──────────────────────────────────────────
    this.add.text(px, py - 264, '💰  LA SAN', {
      fontSize: '38px', color: '#F4A261', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10);

    this.add.text(px, py - 222, `Semana ${GameState.time.week} · Junta de Ahorros Comunitaria`, {
      fontSize: '17px', color: '#A8DADC', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    }).setOrigin(0.5).setDepth(10);

    // ── Explanation (first time) ───────────────────────
    if (!GameState.flags.seenLaSanIntro) {
      GameState.flags.seenLaSanIntro = true;
      this._showExplainer(px, py);
      return;
    }

    this._buildMainUI(px, py);
  }

  _showExplainer(px, py) {
    this.add.text(px, py - 150, [
      'La San es una junta — un sistema de ahorro comunitario.',
      '',
      'Cada semana, 4 personas contribuyen $100 al pot.',
      'Cada mes, un miembro recibe todo: $400.',
      '',
      'Es la misma lógica que los bancos — pero entre vecinos.',
      'La San es inteligencia financiera, no caridad.',
      '',
      'Si pagas: +10 Confianza Comunitaria',
      'Si saltas: −15 Confianza Comunitaria',
    ].join('\n'), {
      fontSize: '18px', color: '#FFFFFF', fontFamily: 'Georgia, serif',
      align: 'center', lineSpacing: 6,
    }).setOrigin(0.5).setDepth(10);

    const { zone } = drawButton(this, px, py + 220, 260, 50, '¡Entendido! →', {
      fillColor: 0xE63946, fillColorHover: 0xFF5566, fontSize: '22px', radius: 10, depth: 12,
    });
    zone.on('pointerdown', () => {
      // Rebuild scene with actual UI
      this.scene.restart();
    });
  }

  _buildMainUI(px, py) {
    const gs = GameState;
    const isYourTurn = gs.isPlayersTurn();
    const canAfford  = gs.finances.cash >= gs.laSan.contribution;

    // ── Pot visualization ──────────────────────────────
    const potG = this.add.graphics().setDepth(10);
    // Pot shape
    potG.fillStyle(0x8B5A2B, 1);
    potG.fillEllipse(px - 280, py - 80, 120, 60);
    potG.fillStyle(0xC4935A, 1);
    potG.fillRect(px - 340, py - 80, 120, 120);
    potG.fillEllipse(px - 280, py + 40, 120, 40);
    potG.fillStyle(0x8B5A2B, 1);
    potG.fillEllipse(px - 280, py - 80, 120, 50);
    // Coin stack
    const fillH = Math.min(80, (gs.laSan.pot / 400) * 80);
    if (fillH > 0) {
      potG.fillStyle(0xFFD700, 0.85);
      potG.fillRect(px - 328, py - 80 + (80 - fillH), 96, fillH);
    }
    potG.fillStyle(0x8B5A2B, 0.7); potG.fillEllipse(px - 280, py - 80, 120, 50);

    this.add.text(px - 280, py - 135, 'El Pot', {
      fontSize: '14px', color: '#F4A261', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(11);
    this.add.text(px - 280, py + 65, `$${gs.laSan.pot}`, {
      fontSize: '20px', color: '#FFD700', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(11);

    // ── Members ────────────────────────────────────────
    const memberConfig = [
      { name: 'Doña\nCarmen',  skin: 4, hair: 'Recogido', color: 0x7B2D8B, x: px - 80,  isPlayer: false, paid: true },
      { name: 'Mrs.\nRodríguez', skin: 3, hair: 'Trenzas', color: 0x2D6A4F, x: px + 30, isPlayer: false, paid: true },
      { name: 'Tío\nPedro',    skin: 4, hair: 'Recogido', color: 0x1565C0, x: px + 140, isPlayer: false, paid: gs.time.week > 1 },
      { name: gs.player.name,  skin: gs.player.skinTone, hair: gs.player.hairStyle, color: 0xE63946, x: px + 250, isPlayer: true, paid: gs.laSan.playerPaidThisWeek },
    ];

    memberConfig.forEach(m => {
      const charY = py - 30;
      drawCharacter(this, m.x, charY, { skinTone: m.skin, hairStyle: m.hair, clothingColor: m.color, scale: 1.2 }).setDepth(10);

      this.add.text(m.x, charY - 140, m.name, {
        fontSize: '13px', color: '#FFFFFF', fontFamily: 'Arial', align: 'center',
      }).setOrigin(0.5).setDepth(11);

      // Paid indicator
      const badge = m.paid ? '✅ Pagó' : (m.isPlayer ? '⏳ Tú' : '✅ Pagó');
      this.add.text(m.x, charY + 110, badge, {
        fontSize: '14px',
        color: m.paid ? '#2A9D8F' : '#F4A261',
        fontFamily: 'Arial', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(11);

      // This week's winner highlight
      const winnerNames = [...gs.laSan.members, gs.player.name];
      const winnerIdx   = gs.laSan.currentWinner;
      if (winnerNames[winnerIdx] === (m.isPlayer ? gs.player.name : m.name.replace('\n', ' '))) {
        const hg = this.add.graphics().setDepth(9);
        hg.lineStyle(3, 0xFFD700, 1);
        hg.strokeCircle(m.x, charY - 100, 68);
        this.add.text(m.x, charY - 178, '⭐ Recibe', {
          fontSize: '13px', color: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(11);
      }
    });

    // ── Your turn to receive? ──────────────────────────
    if (isYourTurn) {
      const received = gs.laSan.pot;
      this.add.text(px, py + 145, `🎉 ¡Esta semana RECIBES el pot! Total: $${received}`, {
        fontSize: '20px', color: '#FFD700', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(11);

      const { zone } = drawButton(this, px, py + 200, 320, 50, `¡Cobrar $${received}!  🎉`, {
        fillColor: 0xF4A261, fillColorHover: 0xFFCC44, textColor: '#1a1a1a',
        fontSize: '22px', radius: 10, depth: 12,
      });
      zone.on('pointerdown', () => {
        const amt = gs.receiveLaSanPot();
        showNotification(this, px, py - 50, `+$${amt} ¡La San te llegó!`, { bgColor: 0xFFD700, duration: 2500 });
        gs.save();
        this.time.delayedCall(2500, () => this._exit());
      });
      return;
    }

    // ── Pay / Skip buttons ─────────────────────────────
    if (gs.laSan.playerPaidThisWeek) {
      this.add.text(px, py + 170, `✅ Ya contribuiste esta semana. ¡Gracias, ${gs.player.name}!`, {
        fontSize: '20px', color: '#2A9D8F', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(11);
      const { zone } = drawButton(this, px, py + 225, 220, 48, 'Continuar →', {
        fillColor: 0x1565C0, fontSize: '20px', radius: 10, depth: 12,
      });
      zone.on('pointerdown', () => this._exit());
      return;
    }

    this.add.text(px, py + 140, [
      `Contribución semanal: $${gs.laSan.contribution}`,
      `Tu efectivo: $${Math.floor(gs.finances.cash)}`,
      `Pagos consecutivos: ${gs.laSan.consecutivePayments}`,
    ].join('   ·   '), {
      fontSize: '16px', color: '#CCCCCC', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(11);

    const payLabel = canAfford
      ? `💰 Contribuir $${gs.laSan.contribution}  (+10 Confianza)`
      : `❌ Sin fondos ($${gs.laSan.contribution} necesarios)`;

    const { zone: payZone } = drawButton(this, px - 140, py + 195, 260, 52, payLabel, {
      fillColor: canAfford ? 0x2A9D8F : 0x555555,
      fillColorHover: canAfford ? 0x3BB8A8 : 0x555555,
      fontSize: '16px', radius: 10, depth: 12,
    });
    if (canAfford) {
      payZone.on('pointerdown', () => {
        const ok = gs.payLaSan();
        if (ok) {
          showNotification(this, px, py - 50, '+10 Confianza · ¡Gracias, vecina!', { bgColor: 0x2A9D8F });
          gs.save();
          this.time.delayedCall(1800, () => this._exit());
        }
      });
    }

    const { zone: skipZone } = drawButton(this, px + 140, py + 195, 240, 52, 'Saltar (−15 Confianza)', {
      fillColor: 0x880000, fillColorHover: 0xAA2222, fontSize: '16px', radius: 10, depth: 12,
    });
    skipZone.on('pointerdown', () => {
      gs.skipLaSan();
      showNotification(this, px, py - 50, '−15 Confianza · Los vecinos están decepcionados.', {
        bgColor: 0xE63946, duration: 2500,
      });
      gs.save();
      this.time.delayedCall(2500, () => this._exit());
    });

    // Streak bonus hint
    if (gs.laSan.consecutivePayments > 0) {
      this.add.text(px, py + 248, `🔥 Racha de pagos: ${gs.laSan.consecutivePayments} semanas. ¡Sigue así!`, {
        fontSize: '14px', color: '#F4A261', fontFamily: 'Arial',
      }).setOrigin(0.5).setDepth(11);
    }
  }

  _exit() {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(600, () => this.scene.start('BlockViewScene'));
  }
}
