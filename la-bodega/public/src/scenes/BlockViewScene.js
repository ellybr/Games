import GameState from '../GameState.js';
import { drawButton, showNotification } from '../utils/DrawUtils.js';
import { shouldFireEvent } from '../scenes/EventScene.js';

// Building layout data (x, width, height, floors)
const BLOCK = [
  { id: 'restaurante', name: 'Restaurante',     x: 20,   w: 210, h: 280, floors: 2 },
  { id: 'salon',       name: 'Salón Belleza',    x: 248,  w: 170, h: 200, floors: 1 },
  { id: 'bodega',      name: 'Bodega García',    x: 436,  w: 344, h: 320, floors: 2 },
  { id: 'laundromat',  name: 'Lavandería',       x: 798,  w: 190, h: 220, floors: 1 },
  { id: 'apartamento', name: 'Apartamentos',     x: 1006, w: 258, h: 350, floors: 4 },
];

const SIDEWALK_Y = 590;

export default class BlockViewScene extends Phaser.Scene {
  constructor() { super({ key: 'BlockViewScene' }); }

  init() {
    this.tooltip = null;
    this.dayEnded = false;
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(700);

    // ── Sky gradient (sunset) ────────────────────────────
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x0d1b2a, 0x1a3a6e, 0x3D1A5C, 0xC65102, 1);
    sky.fillRect(0, 0, width, SIDEWALK_Y);

    // Moon
    const moon = this.add.graphics();
    moon.fillStyle(0xFFFDE7, 1); moon.fillCircle(80, 80, 30);
    moon.fillStyle(0x1a3a6e, 1); moon.fillCircle(90, 72, 26);

    // Stars
    for (let i = 0; i < 60; i++) {
      const sg = this.add.graphics();
      sg.fillStyle(0xFFFFFF, Phaser.Math.FloatBetween(0.2, 0.9));
      sg.fillCircle(Phaser.Math.Between(0, width), Phaser.Math.Between(0, 200), Phaser.Math.FloatBetween(0.5, 2));
    }

    // Street lamp glow
    [200, 600, 950, 1200].forEach(lx => {
      const glow = this.add.graphics();
      glow.fillStyle(0xFFFF88, 0.06);
      glow.fillCircle(lx, SIDEWALK_Y - 10, 120);
      glow.fillStyle(0x555555, 1); glow.fillRect(lx - 4, SIDEWALK_Y - 140, 8, 140);
      glow.fillStyle(0xFFFF88, 1); glow.fillCircle(lx, SIDEWALK_Y - 140, 8);
    });

    // ── Sidewalk & street ────────────────────────────────
    const ground = this.add.graphics();
    ground.fillStyle(0xAAAAAA, 1); ground.fillRect(0, SIDEWALK_Y, width, 38);
    // Sidewalk cracks & tiles
    ground.lineStyle(1, 0x999999, 0.4);
    for (let tx = 0; tx < width; tx += 50) ground.strokeRect(tx, SIDEWALK_Y, 50, 38);

    // Street
    ground.fillStyle(0x444444, 1); ground.fillRect(0, SIDEWALK_Y + 38, width, height - SIDEWALK_Y - 38);
    ground.fillStyle(0xFFFF88, 0.8);
    for (let cx = 0; cx < width; cx += 80) ground.fillRect(cx, SIDEWALK_Y + 62, 50, 8);

    // ── Buildings ────────────────────────────────────────
    this._buildingInteractives = [];
    BLOCK.forEach(b => {
      const bState = GameState.buildings.find(x => x.id === b.id);
      const locked = !bState?.unlocked;
      const by = SIDEWALK_Y - b.h;
      this._drawBuilding(b, by, locked);
      this._addBuildingInteractive(b, by, locked, bState);
    });

    // ── Gentrification developer (antagonist) ────────────
    if (GameState.stats.gentrificationPressure > 30) {
      this._drawDeveloper(width - 80, SIDEWALK_Y + 10);
    }

    // ── HUD Scene ────────────────────────────────────────
    if (!this.scene.isActive('HUDScene')) this.scene.launch('HUDScene');
    this.scene.bringToTop('HUDScene');

    // ── Bottom UI bar ─────────────────────────────────────
    const bottomBar = this.add.graphics();
    bottomBar.fillStyle(0x080815, 0.88);
    bottomBar.fillRect(0, height - 62, width, 62);

    // End Day button
    const { zone: endDayZone } = drawButton(
      this, width - 120, height - 31, 200, 44, '🌙  Cerrar el Día',
      { fillColor: 0x1565C0, fillColorHover: 0x1976D2, fontSize: '18px', radius: 8, depth: 15 }
    );
    endDayZone.on('pointerdown', () => this._endDay());

    // DR Map button
    const drUnlocked = GameState.drMap.unlocked;
    const { container: drBtn, zone: drZone } = drawButton(
      this, 100, height - 31, 170, 44, drUnlocked ? '🇩🇴  RD Map' : '🔒  Mapa RD',
      { fillColor: drUnlocked ? 0x2A9D8F : 0x333333, fontSize: '17px', radius: 8, depth: 15 }
    );
    drZone.on('pointerdown', () => this.scene.start('DRMapScene'));

    // Weekly summary hint
    if (GameState.time.dayOfWeek === 7) {
      showNotification(this, width / 2, height - 80, '¡Fin de semana! Cierra el día para ver el resumen.', {
        bgColor: 0x1565C0, duration: 4000,
      });
    }

    // Day 1 welcome
    if (GameState.time.day === 1 && !GameState.flags.day1TasksExplained) {
      this.time.delayedCall(800, () => this._showWelcome());
    }

    // La San alert (if week 2+ and not paid)
    if (GameState.laSan.active && !GameState.laSan.playerPaidThisWeek && GameState.time.dayOfWeek >= 5) {
      showNotification(this, width / 2, 120, '💰 La San está esperando tu contribución semanal', {
        bgColor: 0xF4A261, duration: 3500,
      });
    }
  }

  _drawBuilding(b, by, locked) {
    const g = this.add.graphics();
    const wallCol = locked ? 0x6E6E6E : (b.id === 'bodega' ? 0xE8D5B7 : 0xCFBFA0);
    const roofCol = locked ? 0x555555 : 0xD32F2F;

    // Shadow
    g.fillStyle(0x000000, 0.25);
    g.fillRect(b.x + 6, by + 6, b.w, b.h);

    // Wall
    g.fillStyle(wallCol, 1); g.fillRect(b.x, by, b.w, b.h);
    // Roof band
    g.fillStyle(roofCol, 1); g.fillRect(b.x - 4, by - 16, b.w + 8, 20);
    g.lineStyle(1.5, locked ? 0x444444 : 0xA05020, 0.7);
    g.strokeRect(b.x, by, b.w, b.h);

    // Windows
    const cols = Math.max(1, Math.floor(b.w / 60));
    const padX  = (b.w - cols * 32) / (cols + 1);
    for (let fl = 0; fl < b.floors; fl++) {
      const wy = by + 20 + fl * Math.floor(b.h / b.floors);
      for (let c = 0; c < cols; c++) {
        const wx = b.x + padX + c * (32 + padX);
        const lit = !locked && Math.random() > 0.3;
        g.fillStyle(lit ? 0x87CEEB : 0x334455, lit ? 0.85 : 0.6);
        g.fillRect(wx, wy, 32, 24);
        g.lineStyle(1, locked ? 0x444444 : 0x336688, 0.6);
        g.strokeRect(wx, wy, 32, 24);
      }
    }

    // Bodega-specific details
    if (b.id === 'bodega' && !locked) {
      this._drawBodegaFacade(b, by);
    }

    // Locked overlay
    if (locked) {
      g.fillStyle(0x000000, 0.28);
      g.fillRect(b.x, by, b.w, b.h);
      // Padlock
      const px = b.x + b.w / 2, py = by + b.h / 2;
      g.fillStyle(0xFFD700, 1);
      g.fillRoundedRect(px - 18, py - 10, 36, 32, 5);
      g.fillStyle(0x080808, 1);
      g.fillRoundedRect(px - 13, py - 4, 26, 22, 3);
      g.lineStyle(5, 0xFFD700, 1);
      g.beginPath(); g.arc(px, py - 14, 14, Math.PI, 0, false); g.strokePath();
      g.fillStyle(0xFFD700, 1); g.fillCircle(px, py + 8, 5);
    }
  }

  _drawBodegaFacade(b, by) {
    const g   = this.add.graphics();
    const cx  = b.x + b.w / 2;
    const bot = SIDEWALK_Y;

    // DR-flag awning
    g.fillStyle(0xD32F2F, 1);
    g.fillTriangle(b.x + 10, by + b.h * 0.56, cx, by + b.h * 0.46, b.x + 10, by + b.h * 0.46);
    g.fillStyle(0x1565C0, 1);
    g.fillTriangle(b.x + b.w - 10, by + b.h * 0.56, cx, by + b.h * 0.46, b.x + b.w - 10, by + b.h * 0.46);

    // Door
    g.fillStyle(0x6B3A1F, 1); g.fillRect(cx - 28, by + b.h * 0.56, 56, bot - (by + b.h * 0.56));
    g.lineStyle(2, 0x4A1E08, 1); g.strokeRect(cx - 28, by + b.h * 0.56, 56, bot - (by + b.h * 0.56));
    g.fillStyle(0xFFD700, 1); g.fillCircle(cx + 20, bot - 55, 5);

    // ABIERTO / CERRADO sign
    const isOpen = GameState.bodega.isOpen;
    const signText = isOpen ? 'ABIERTO' : 'CERRADO';
    const signCol  = isOpen ? 0x006600 : 0x880000;
    g.fillStyle(signCol, 0.95); g.fillRoundedRect(cx - 35, by + b.h * 0.57 + 10, 70, 22, 4);
    this.add.text(cx, by + b.h * 0.57 + 21, signText, {
      fontSize: '12px', color: '#FFFFFF', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3);

    // Store windows
    [[b.x + 22, by + b.h * 0.57], [b.x + b.w - 105, by + b.h * 0.57]].forEach(([wx, wy]) => {
      g.fillStyle(0x87CEEB, 0.6); g.fillRect(wx, wy, 88, 68);
      g.lineStyle(2, 0x6B3A1F, 1); g.strokeRect(wx, wy, 88, 68);
    });

    // Store sign (with "broken" Í on day 1)
    g.fillStyle(0xFFFFFF, 1); g.fillRect(b.x + 50, by - 12, b.w - 100, 26);
    g.lineStyle(1.5, 0xDDCCBB, 1); g.strokeRect(b.x + 50, by - 12, b.w - 100, 26);

    const signFixed = GameState.bodega.signFixed;
    const signLabel = signFixed ? 'BODEGA GARCÍA' : 'BODEGA GARC_A';
    this.add.text(cx, by + 2, signLabel, {
      fontSize: '15px', color: signFixed ? '#D32F2F' : '#AA2222', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3);

    // DR flag above door
    g.fillStyle(0xD32F2F, 1); g.fillRect(cx + 34, by + b.h * 0.35, 18, 12);
    g.fillStyle(0x1565C0, 1); g.fillRect(cx + 34, by + b.h * 0.35 + 12, 18, 12);
    g.fillStyle(0x555555, 1); g.fillRect(cx + 32, by + b.h * 0.27, 2, 30);
  }

  _addBuildingInteractive(b, by, locked, bState) {
    const zone = this.add.zone(b.x, by, b.w, b.h)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      if (this.tooltip) { this.tooltip.destroy(); this.tooltip = null; }
      if (!locked) {
        this.tooltip = this._makeTooltip(
          b.x + b.w / 2, by - 10,
          b.id === 'bodega' ? `Entrar a ${b.name} →` : `${b.name} (abierto)`,
          0x2A9D8F,
        );
      } else {
        const trust = `${bState?.trustRequired ?? 0} confianza`;
        const cost  = `$${(bState?.cost ?? 0).toLocaleString()}`;
        this.tooltip = this._makeTooltip(
          b.x + b.w / 2, by - 10,
          `🔒 ${b.name}\n${cost} · ${trust}`,
          0xE63946,
        );
      }
    });

    zone.on('pointerout', () => {
      if (this.tooltip) { this.tooltip.destroy(); this.tooltip = null; }
    });

    zone.on('pointerdown', () => {
      if (locked) {
        const cash   = GameState.finances.cash;
        const trust  = GameState.stats.communityTrust;
        const cost   = bState?.cost ?? 0;
        const treq   = bState?.trustRequired ?? 0;

        if (cash >= cost && trust >= treq) {
          GameState.spendCash(cost);
          bState.unlocked = true;
          GameState.save();
          showNotification(this, b.x + b.w / 2, by, `¡${b.name} desbloqueado! 🎉`, { bgColor: 0x2A9D8F });
          this.time.delayedCall(500, () => this.scene.restart());
        } else {
          const msgs = [];
          if (cash < cost)  msgs.push(`Necesitas $${(cost - cash).toLocaleString()} más`);
          if (trust < treq) msgs.push(`${treq - trust} puntos de confianza más`);
          showNotification(this, b.x + b.w / 2, by, msgs.join(' · '), { bgColor: 0xE63946 });
        }
        return;
      }

      if (b.id === 'bodega') {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
          this.scene.stop('HUDScene');
          this.scene.start('BodegaScene');
        });
      }
    });
  }

  _makeTooltip(x, y, text, color) {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map(l => l.length));
    const tw = maxLen * 11 + 24;
    const th = lines.length * 24 + 16;
    const container = this.add.container(x, y - th / 2 - 10).setDepth(30);
    const bg = this.add.graphics();
    bg.fillStyle(0x050510, 0.92);
    bg.fillRoundedRect(-tw / 2, -th / 2, tw, th, 8);
    bg.lineStyle(2, color, 1);
    bg.strokeRoundedRect(-tw / 2, -th / 2, tw, th, 8);
    const t = this.add.text(0, 0, text, {
      fontSize: '16px', color: '#FFFFFF', fontFamily: 'Arial',
      align: 'center', lineSpacing: 4,
    }).setOrigin(0.5);
    container.add([bg, t]);
    return container;
  }

  _drawDeveloper(x, y) {
    const g = this.add.graphics();
    // Simple suited figure
    g.fillStyle(0x333333, 1);
    g.fillRect(x - 12, y - 55, 24, 30);
    g.fillStyle(0xFFDBB4, 1);
    g.fillCircle(x, y - 65, 14);
    g.fillStyle(0x111111, 1);
    g.fillRect(x - 10, y - 25, 20, 25);
    this.add.text(x, y - 85, '👔', { fontSize: '22px' }).setOrigin(0.5);
    this.add.text(x, y + 8, 'Developer\nCo.', {
      fontSize: '11px', color: '#FF4444', fontFamily: 'Arial', align: 'center',
    }).setOrigin(0.5);
  }

  _showWelcome() {
    const { width, height } = this.scale;
    const box = this.add.container(width / 2, height / 2).setDepth(40);

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1a, 0.95);
    bg.fillRoundedRect(-310, -190, 620, 380, 16);
    bg.lineStyle(2, 0xF4A261, 1);
    bg.strokeRoundedRect(-310, -190, 620, 380, 16);

    const title = this.add.text(0, -160, '¡Bienvenida, ' + GameState.player.name + '!', {
      fontSize: '28px', color: '#F4A261', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5);

    const body = this.add.text(0, -60, [
      'Esta es la calle García — tu bloque.',
      '',
      '🏪  El Bodega García es tuyo. Haz clic para entrar.',
      '🔒  Los otros negocios están cerrados por ahora.',
      '    Gana dinero y confianza comunitaria para abrirlos.',
      '',
      '🌙  Usa "Cerrar el Día" para avanzar al siguiente día.',
      '',
      '¡Que empiece el trabajo! ¡Dale!',
    ].join('\n'), {
      fontSize: '18px', color: '#E0E0E0', fontFamily: 'Georgia, serif',
      align: 'center', lineSpacing: 6,
    }).setOrigin(0.5);

    const btnG = this.add.graphics();
    btnG.fillStyle(0xE63946, 1);
    btnG.fillRoundedRect(-80, 140, 160, 44, 8);
    const btnT = this.add.text(0, 162, '¡Dale!', {
      fontSize: '22px', color: '#FFFFFF', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5);
    const btnZ = this.add.zone(0, 162, 160, 44).setInteractive({ useHandCursor: true });
    btnZ.on('pointerdown', () => {
      box.destroy();
      GameState.flags.day1TasksExplained = true;
    });

    box.add([bg, title, body, btnG, btnT, btnZ]);
  }

  _endDay() {
    if (this.dayEnded) return;
    this.dayEnded = true;

    // Check immediate game-over conditions before advancing
    if (GameState.stats.gentrificationPressure >= 100) {
      this.cameras.main.fadeOut(700, 0, 0, 0);
      this.time.delayedCall(700, () => this.scene.start('GameOverScene', { reason: 'gentrification' }));
      return;
    }
    if (GameState.finances.cash < -500) {
      this.cameras.main.fadeOut(700, 0, 0, 0);
      this.time.delayedCall(700, () => this.scene.start('GameOverScene', { reason: 'bankrupt' }));
      return;
    }

    const income   = GameState.finances.weeklyIncome;
    const served   = GameState.stats.customersServed;
    const newWeek  = GameState.advanceDay();
    const fireEv   = newWeek && shouldFireEvent(GameState.time.week);
    GameState.save();

    const { width, height } = this.scale;
    const box = this.add.container(width / 2, height / 2).setDepth(50);

    const bg = this.add.graphics();
    bg.fillStyle(0x050510, 0.96);
    bg.fillRoundedRect(-280, -230, 560, 460, 16);
    bg.lineStyle(2, 0x1565C0, 1);
    bg.strokeRoundedRect(-280, -230, 560, 460, 16);

    const moonIcon = this.add.text(0, -200, '🌙', { fontSize: '38px' }).setOrigin(0.5);
    const dayTitle = this.add.text(0, -158, `Día ${GameState.time.day - 1} — Resumen`, {
      fontSize: '26px', color: '#A8DADC', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Milestone banners
    const milestones = [];
    if (income >= 100) milestones.push('🔥 ¡Gran día! +$100 o más');
    if (GameState.stats.communityTrust >= 75 && !GameState._shownTrust75) {
      milestones.push('⭐ ¡75 de Confianza!'); GameState._shownTrust75 = true;
    }
    if (newWeek) milestones.push(`✨ Semana ${GameState.time.week} completada`);

    const lines = [
      `💵  Ingresos del día:     $${income.toLocaleString()}`,
      `👥  Clientes atendidos:   ${served}`,
      `🤝  Confianza:            ${GameState.stats.communityTrust}/100`,
      `🏗️   Presión gentrific.:  ${GameState.stats.gentrificationPressure}/100`,
      `💰  Efectivo total:       $${Math.floor(GameState.finances.cash).toLocaleString()}`,
    ];
    const summary = this.add.text(0, -30, lines.join('\n'), {
      fontSize: '19px', color: '#FFFFFF', fontFamily: 'Georgia, serif', lineSpacing: 10,
    }).setOrigin(0.5);

    let milestoneText = null;
    if (milestones.length > 0) {
      milestoneText = this.add.text(0, 130, milestones.join('   '), {
        fontSize: '16px', color: '#F4A261', fontFamily: 'Arial', fontStyle: 'bold', align: 'center',
      }).setOrigin(0.5);
    }

    // Determine where "next" leads
    const goNext = () => {
      box.destroy();
      // Game-over check after week expenses
      if (GameState.stats.gentrificationPressure >= 100) {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.time.delayedCall(600, () => this.scene.start('GameOverScene', { reason: 'gentrification' }));
        return;
      }
      if (GameState.finances.cash < -500) {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.time.delayedCall(600, () => this.scene.start('GameOverScene', { reason: 'bankrupt' }));
        return;
      }
      if (fireEv) {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => this.scene.start('EventScene', { afterScene: newWeek && GameState.laSan.active ? 'LaSanScene' : 'BlockViewScene' }));
      } else if (newWeek && GameState.laSan.active) {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => this.scene.start('LaSanScene'));
      } else {
        this.dayEnded = false;
        this.scene.restart();
      }
    };

    const nextLabel = fireEv
      ? '¡Hay novedades en el barrio!  →'
      : newWeek && GameState.laSan.active
        ? '¡Nueva semana! Ver La San  →'
        : 'Siguiente Día  →';

    const btnG = this.add.graphics();
    btnG.fillStyle(fireEv ? 0xE63946 : 0x1565C0, 1);
    btnG.fillRoundedRect(-150, 170, 300, 46, 8);
    const btnT = this.add.text(0, 193, nextLabel, {
      fontSize: '18px', color: '#FFFFFF', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);
    const btnZ = this.add.zone(0, 193, 300, 46).setInteractive({ useHandCursor: true });
    btnZ.on('pointerdown', goNext);

    const children = [bg, moonIcon, dayTitle, summary, btnG, btnT, btnZ];
    if (milestoneText) children.push(milestoneText);
    box.add(children);
  }
}
