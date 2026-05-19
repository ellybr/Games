import GameState from '../GameState.js';
import { drawCharacter, showNotification, drawButton } from '../utils/DrawUtils.js';

// ── Constants ──────────────────────────────────────────
const FLOOR_Y   = 580;
const COUNTER_X = 920;
const DOOR_X    = 90;

const ITEMS = [
  { key: 'cafe',      label: 'Café ☕',     price: 3,  color: 0x4A2C0A },
  { key: 'platanos',  label: 'Plátanos 🍌', price: 4,  color: 0xFFD700 },
  { key: 'arroz',     label: 'Arroz 🍚',    price: 5,  color: 0xF5F5DC },
  { key: 'pollo',     label: 'Pollo 🍗',    price: 8,  color: 0xD4A017 },
  { key: 'cerveza',   label: 'Cerveza 🍺',  price: 4,  color: 0xF4A261 },
  { key: 'snacks',    label: 'Snacks 🍬',   price: 2,  color: 0xFF69B4 },
];

const CUSTOMER_NAMES = [
  'Miguel','Carmen','Rosa','Julio','Ana','Pedro','Isabel','Roberto','Luz','Diego',
];
const CUSTOMER_COLORS = [0x3A7BD5, 0xE63946, 0x2A9D8F, 0x8338EC, 0xF4A261, 0x2D6A4F, 0xFF6B35, 0x457B9D];
const SKIN_OPTS = [2, 3, 4, 4, 5, 3, 2, 4];

// ── Customer class ─────────────────────────────────────
class Customer {
  constructor(scene, slotX) {
    this.scene      = scene;
    this.slotX      = slotX;
    this.item       = ITEMS[Phaser.Math.Between(0, ITEMS.length - 1)];
    this.patience   = 1.0; // 0–1
    this.maxTime    = 9000; // ms
    this.elapsed    = 0;
    this.state      = 'entering'; // entering | waiting | served | leaving
    this.container  = null;
    this.patienceBar = null;
    this.patienceBarFill = null;
    this.bubble     = null;
    this.skinIdx    = Phaser.Math.Between(0, SKIN_OPTS.length - 1);
    this.clothColor = CUSTOMER_COLORS[Phaser.Math.Between(0, CUSTOMER_COLORS.length - 1)];
    this.name       = CUSTOMER_NAMES[Phaser.Math.Between(0, CUSTOMER_NAMES.length - 1)];
  }

  spawn() {
    const s = this.scene;
    this.container = drawCharacter(s, -60, FLOOR_Y, {
      skinTone: SKIN_OPTS[this.skinIdx],
      hairStyle: ['Rizos','Blowout','Trenzas','Recogido','Locs'][Phaser.Math.Between(0,4)],
      clothingColor: this.clothColor,
      scale: 1.4,
      label: this.name,
    });
    this.container.setDepth(10);

    // Patience bar (above character)
    const barY = FLOOR_Y - 145;
    const barG  = s.add.graphics();
    barG.fillStyle(0x222222, 1); barG.fillRoundedRect(-30, barY, 60, 10, 3);
    const fillG = s.add.graphics();
    this.patienceBarFill = fillG;
    this.container.add([barG, fillG]);
    this._updateBar();

    // Thought bubble
    this.bubble = this._makeBubble();
    this.container.add(this.bubble);

    // Walk-in tween
    s.tweens.add({
      targets: this.container, x: this.slotX, duration: 1600, ease: 'Power1',
      onComplete: () => { this.state = 'waiting'; },
    });

    // Click to serve
    const zone = s.add.zone(this.slotX, FLOOR_Y - 70, 90, 150).setInteractive({ useHandCursor: true });
    zone.setDepth(15);
    zone.on('pointerdown', () => this.serve());
    zone.on('pointerover', () => { if (this.state === 'waiting') s.input.setDefaultCursor('pointer'); });
    zone.on('pointerout',  () => s.input.setDefaultCursor('default'));
    this._zone = zone;
  }

  _makeBubble() {
    const bx = 20, by = FLOOR_Y - 250;
    const g = this.scene.add.graphics();
    const tw = this.item.label.length * 9 + 20;
    g.fillStyle(0xFFFFFF, 0.95);
    g.fillRoundedRect(bx - tw / 2, by - 22, tw, 38, 8);
    g.lineStyle(1.5, 0x888888, 0.7);
    g.strokeRoundedRect(bx - tw / 2, by - 22, tw, 38, 8);
    // Tail
    g.fillStyle(0xFFFFFF, 0.95);
    g.fillTriangle(bx - 8, by + 16, bx + 8, by + 16, bx - 4, by + 30);

    const t = this.scene.add.text(bx, by - 3, this.item.label, {
      fontSize: '16px', color: '#111111', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5);
    const cont = this.scene.add.container(0, 0, [g, t]);
    return cont;
  }

  _updateBar() {
    if (!this.patienceBarFill) return;
    const barY = FLOOR_Y - 145;
    this.patienceBarFill.clear();
    const col = this.patience > 0.5 ? 0x2A9D8F : this.patience > 0.25 ? 0xF4A261 : 0xE63946;
    this.patienceBarFill.fillStyle(col, 1);
    const fw = Math.max(0, this.patience) * 56;
    if (fw > 0) this.patienceBarFill.fillRoundedRect(-28, barY + 2, fw, 6, 2);
  }

  update(delta) {
    if (this.state !== 'waiting') return;
    this.elapsed += delta;
    this.patience = Math.max(0, 1 - this.elapsed / this.maxTime);
    this._updateBar();

    // Sync zone position
    if (this._zone) {
      this._zone.setPosition(this.slotX, FLOOR_Y - 70);
    }

    if (this.patience <= 0) this.leave(false);
  }

  serve() {
    if (this.state !== 'waiting') return;
    this.state = 'served';
    if (this._zone) { this._zone.destroy(); this._zone = null; }

    GameState.addCash(this.item.price);
    GameState.addTrust(2);
    GameState.stats.customersServed++;

    showNotification(this.scene, this.slotX, FLOOR_Y - 200,
      `+$${this.item.price}  ¡Gracias!`, { bgColor: 0x2A9D8F });

    // Walk out to counter then exit right
    this.scene.tweens.add({
      targets: this.container, x: COUNTER_X - 40, duration: 800, ease: 'Power1',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.container, x: 1400, duration: 800, ease: 'Power1',
          onComplete: () => this._cleanup(),
        });
      },
    });
  }

  leave(served = false) {
    if (this.state === 'leaving' || this.state === 'served') return;
    this.state = 'leaving';
    if (this._zone) { this._zone.destroy(); this._zone = null; }

    if (!served) {
      GameState.addTrust(-3);
      GameState.stats.customersFailed = (GameState.stats.customersFailed || 0) + 1;
      showNotification(this.scene, this.slotX, FLOOR_Y - 200,
        '😤 Se fue sin comprar', { bgColor: 0xE63946, duration: 1200 });
    }

    this.scene.tweens.add({
      targets: this.container, x: -100, duration: 1000, ease: 'Power1',
      onComplete: () => this._cleanup(),
    });
  }

  _cleanup() {
    if (this.container) { this.container.destroy(); this.container = null; }
    if (this._zone)     { this._zone.destroy(); this._zone = null; }
    this.state = 'done';
  }
}

// ── Scene ──────────────────────────────────────────────
export default class BodegaScene extends Phaser.Scene {
  constructor() { super({ key: 'BodegaScene' }); }

  init() {
    this.customers       = [];
    this.customerSlots   = [260, 440, 620, 780]; // x positions
    this.slotOccupied    = [false, false, false, false];
    this.spawnTimer      = null;
    this.dayActive       = false;
    this.taskMarkers     = {};
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(600);

    // ── Interior drawing ──────────────────────────────
    this._drawInterior(width, height);

    // ── Day 1 tasks or open for business ──────────────
    if (!GameState.bodega.allDay1TasksDone) {
      this._setupDay1Tasks();
    } else {
      this._openForBusiness();
    }

    // ── Abuelo's photo ────────────────────────────────
    const photoG = this.add.graphics().setDepth(4);
    photoG.fillStyle(0x2C3E50, 1); photoG.fillRoundedRect(1040, 160, 110, 90, 5);
    photoG.fillStyle(0xF4D03F, 0.9); photoG.fillRoundedRect(1036, 156, 118, 98, 6);
    photoG.lineStyle(3, 0xB8860B, 1); photoG.strokeRoundedRect(1036, 156, 118, 98, 6);
    photoG.fillStyle(0xD4956A, 1); photoG.fillCircle(1095, 190, 20);
    photoG.fillStyle(0x1A0A00, 1); photoG.fillRoundedRect(1075, 170, 40, 12, 8);
    photoG.fillStyle(0x2C3E50, 1); photoG.fillRoundedRect(1080, 202, 30, 26, 3);
    this.add.text(1095, 263, 'Abuelo García', {
      fontSize: '12px', color: '#F4A261', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    }).setOrigin(0.5).setDepth(5);

    // Decorative calendar on wall
    const calG = this.add.graphics().setDepth(4);
    calG.fillStyle(0xFFFFFF, 0.9); calG.fillRect(170, 165, 70, 80);
    calG.fillStyle(0xE63946, 1); calG.fillRect(170, 165, 70, 22);
    calG.lineStyle(1, 0xCCCCCC, 1); calG.strokeRect(170, 165, 70, 80);
    this.add.text(205, 176, 'MAY', { fontSize: '13px', color: '#FFF', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5).setDepth(5);
    this.add.text(205, 215, `${GameState.time.day}`, { fontSize: '26px', color: '#E63946', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5).setDepth(5);

    // ── HUD ───────────────────────────────────────────
    if (!this.scene.isActive('HUDScene')) this.scene.launch('HUDScene');
    this.scene.bringToTop('HUDScene');

    // ── Back button ───────────────────────────────────
    const { zone: backZone } = drawButton(this, 80, height - 30, 130, 42, '← Salir', {
      fillColor: 0x333355, fillColorHover: 0x4444AA, fontSize: '17px', radius: 8, depth: 20,
    });
    backZone.on('pointerdown', () => {
      this._stopSpawner();
      GameState.save();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.stop('HUDScene');
        this.scene.start('BlockViewScene');
      });
    });

    // ── End Day button ─────────────────────────────────
    const { zone: endZone } = drawButton(this, width - 100, height - 30, 170, 42, '🌙 Cerrar', {
      fillColor: 0x1565C0, fillColorHover: 0x1976D2, fontSize: '17px', radius: 8, depth: 20,
    });
    endZone.on('pointerdown', () => this._closeDay());

    // ── Radio (atmosphere) ────────────────────────────
    this.add.text(width - 28, 75, '🎵', { fontSize: '22px' }).setOrigin(1, 0).setDepth(5);
    this.add.text(width - 28, 100, 'La Mega', {
      fontSize: '13px', color: '#888', fontFamily: 'Arial',
    }).setOrigin(1, 0).setDepth(5);
  }

  update(time, delta) {
    this.customers = this.customers.filter(c => c.state !== 'done');
    this.customers.forEach(c => c.update(delta));

    // Release occupied slots from done/leaving customers
    this.slotOccupied = this.slotOccupied.map((occ, i) => {
      if (!occ) return false;
      const still = this.customers.some(c => c.slotX === this.customerSlots[i] && (c.state === 'entering' || c.state === 'waiting'));
      return still;
    });
  }

  // ── Interior Drawing ───────────────────────────────
  _drawInterior(width, height) {
    // Back wall
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0xF5ECD7, 1); g.fillRect(0, 0, width, FLOOR_Y);
    // Wall texture lines
    g.lineStyle(0.5, 0xE0D0B8, 0.5);
    for (let ty = 80; ty < FLOOR_Y - 40; ty += 40) g.strokeRect(0, ty, width, 40);

    // Ceiling
    g.fillStyle(0xE8E0D0, 1); g.fillRect(0, 0, width, 75);
    g.lineStyle(1, 0xCCBBAA, 0.6); g.strokeRect(0, 0, width, 75);

    // Fluorescent lights
    [200, 520, 840, 1120].forEach(lx => {
      g.fillStyle(0xFFFDE7, 0.95); g.fillRoundedRect(lx - 50, 20, 100, 18, 4);
      g.fillStyle(0xFFFFFF, 0.3); g.fillRect(lx - 48, 38, 96, 4);
      // Light glow on ceiling
      g.fillStyle(0xFFFDE7, 0.12); g.fillEllipse(lx, 75, 180, 60);
    });

    // Floor
    g.fillStyle(0xCCBB99, 1); g.fillRect(0, FLOOR_Y, width, height - FLOOR_Y);
    // Tile pattern
    g.lineStyle(1, 0xBBAA88, 0.5);
    for (let ty = FLOOR_Y; ty < height; ty += 36) {
      for (let tx = 0; tx < width; tx += 48) g.strokeRect(tx, ty, 48, 36);
    }

    // Back wall shelving units (x: 100–1000)
    this._drawShelves(g);

    // Counter / register area (right side)
    this._drawCounter(g, width);

    // Left wall / door area
    this._drawDoorWall(g, height);
  }

  _drawShelves(g) {
    const shelfData = [
      { x: 100, y: 110, w: 260, label: 'Comida', items: ['Café','Plátanos','Arroz'], idx: 0 },
      { x: 400, y: 110, w: 260, label: 'Carnes', items: ['Pollo','Mofongo','Sancocho'], idx: 1 },
      { x: 690, y: 110, w: 220, label: 'Bebidas', items: ['Cerveza','Jugo','Agua'], idx: 2 },
    ];

    shelfData.forEach((sh, si) => {
      // Shelf unit back board
      g.fillStyle(0xA0724A, 1);
      g.fillRect(sh.x, sh.y, sh.w, 250);
      g.lineStyle(2, 0x7A5230, 1);
      g.strokeRect(sh.x, sh.y, sh.w, 250);

      // Shelf boards
      [0, 82, 164].forEach(dy => {
        g.fillStyle(0xC4935A, 1);
        g.fillRect(sh.x, sh.y + dy + 70, sh.w, 14);
        g.lineStyle(1, 0xA07040, 1);
        g.strokeRect(sh.x, sh.y + dy + 70, sh.w, 14);
      });

      // Label
      g.fillStyle(0xFFF8E7, 1);
      g.fillRoundedRect(sh.x + 5, sh.y + 3, sh.w - 10, 20, 3);
      this.add.text(sh.x + sh.w / 2, sh.y + 13, sh.label, {
        fontSize: '12px', color: '#5A3010', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(3);

      // Stock items
      if (GameState.bodega.shelvesStocked[si]) {
        this._drawStockItems(g, sh, si);
      } else {
        // Empty shelf dust
        g.fillStyle(0xE8DCC8, 0.3);
        g.fillRect(sh.x + 4, sh.y + 15, sh.w - 8, 240);
      }

      this.taskMarkers[`shelf_${si}`] = { x: sh.x + sh.w / 2, y: sh.y + 125, stocked: GameState.bodega.shelvesStocked[si] };
    });
  }

  _drawStockItems(g, sh, si) {
    const cols = 3;
    const colW = sh.w / cols;
    const rows = [sh.y + 85, sh.y + 165, sh.y + 245];
    rows.forEach((ry, ri) => {
      for (let ci = 0; ci < cols; ci++) {
        const ix = sh.x + ci * colW + colW * 0.2;
        const iw = colW * 0.55;
        const ih = 28 + Math.random() * 14;
        const col = ITEMS[(si * 2 + ci) % ITEMS.length].color;
        g.fillStyle(col, 1); g.fillRoundedRect(ix, ry - ih, iw, ih, 3);
        g.lineStyle(1, 0x333333, 0.3); g.strokeRoundedRect(ix, ry - ih, iw, ih, 3);
      }
    });
  }

  _drawCounter(g, width) {
    // Counter surface
    g.fillStyle(0x6B3A1F, 1);
    g.fillRect(COUNTER_X, 380, width - COUNTER_X, FLOOR_Y - 380);
    g.lineStyle(2, 0x4A1E08, 1);
    g.strokeRect(COUNTER_X, 380, width - COUNTER_X, FLOOR_Y - 380);

    // Counter top
    g.fillStyle(0x8B4513, 1);
    g.fillRect(COUNTER_X - 10, 370, width - COUNTER_X + 10, 20);

    // Cash register
    g.fillStyle(0x2C2C2C, 1); g.fillRoundedRect(COUNTER_X + 30, 280, 110, 95, 5);
    g.fillStyle(0x1a1a1a, 1); g.fillRect(COUNTER_X + 40, 290, 90, 55);
    g.fillStyle(0x222222, 1); g.fillRect(COUNTER_X + 44, 355, 82, 18);
    // Screen
    g.fillStyle(0x00AA55, 0.9); g.fillRect(COUNTER_X + 44, 294, 82, 47);
    this.add.text(COUNTER_X + 85, 317, `$${Math.floor(GameState.finances.cash)}`, {
      fontSize: '13px', color: '#00FF88', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(5);
    // Keys
    g.fillStyle(0x444444, 1);
    [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]].forEach(([r,c]) => {
      g.fillRoundedRect(COUNTER_X + 48 + r * 26, 348 + c * 8, 18, 6, 2);
    });

    // Newspaper on counter
    g.fillStyle(0xFFFDE7, 0.9); g.fillRoundedRect(COUNTER_X + 155, 350, 80, 60, 3);
    this.add.text(COUNTER_X + 195, 376, '📰', { fontSize: '20px' }).setOrigin(0.5).setDepth(5);
  }

  _drawDoorWall(g, height) {
    // Left wall
    g.fillStyle(0xF0E6D0, 1); g.fillRect(0, 0, 90, FLOOR_Y);
    g.lineStyle(1.5, 0xD0C0A0, 0.5); g.strokeRect(0, 0, 90, FLOOR_Y);

    // Door frame
    g.fillStyle(0x6B3A1F, 1); g.fillRect(DOOR_X - 10, 280, 8, FLOOR_Y - 280);
    g.fillRect(DOOR_X + 95, 280, 8, FLOOR_Y - 280);
    g.fillRect(DOOR_X - 10, 270, 113, 12);

    // Door itself
    g.fillStyle(0x8B5E3C, 1); g.fillRect(DOOR_X, 282, 95, FLOOR_Y - 282);
    g.lineStyle(2, 0x5A2E0A, 1); g.strokeRect(DOOR_X, 282, 95, FLOOR_Y - 282);
    // Door glass
    g.fillStyle(0x87CEEB, 0.45); g.fillRect(DOOR_X + 10, 295, 75, 130);
    g.lineStyle(1, 0x6699AA, 0.5);
    g.strokeRect(DOOR_X + 10, 295, 75, 130);
    // Door handle
    g.fillStyle(0xFFD700, 1); g.fillCircle(DOOR_X + 78, FLOOR_Y - 100, 7);

    // Open/closed sign on door
    const isOpen = GameState.bodega.isOpen;
    g.fillStyle(isOpen ? 0x006600 : 0x880000, 0.9);
    g.fillRoundedRect(DOOR_X + 15, 435, 65, 22, 4);
    this.add.text(DOOR_X + 47, 446, isOpen ? 'ABIERTO' : 'CERRADO', {
      fontSize: '11px', color: '#FFFFFF', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3);

    // Bell above door
    this.add.text(DOOR_X + 47, 278, '🔔', { fontSize: '18px' }).setOrigin(0.5).setDepth(5);
  }

  // ── Day 1 Task System ──────────────────────────────
  _setupDay1Tasks() {
    const tasks = [
      { key: 'sign',    done: GameState.bodega.signFixed,        label: '🔧 Arreglar el letrero' },
      { key: 'shelf_0', done: GameState.bodega.shelvesStocked[0], label: '📦 Llenar estante 1' },
      { key: 'shelf_1', done: GameState.bodega.shelvesStocked[1], label: '📦 Llenar estante 2' },
      { key: 'shelf_2', done: GameState.bodega.shelvesStocked[2], label: '📦 Llenar estante 3' },
      { key: 'door',    done: GameState.bodega.isOpen,            label: '🚪 Abrir el bodega' },
    ];

    // Task list panel
    const panelG = this.add.graphics().setDepth(8);
    panelG.fillStyle(0x080818, 0.88); panelG.fillRoundedRect(8, 68, 248, 200, 10);
    panelG.lineStyle(2, 0xF4A261, 1); panelG.strokeRoundedRect(8, 68, 248, 200, 10);
    this.add.text(132, 82, '📋 Día 1 — Tareas', {
      fontSize: '15px', color: '#F4A261', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(9);

    this._taskTexts = {};
    tasks.forEach((t, i) => {
      this._taskTexts[t.key] = this.add.text(20, 100 + i * 30, t.done ? `✅ ${t.label}` : `⬜ ${t.label}`, {
        fontSize: '14px',
        color: t.done ? '#2A9D8F' : '#CCCCCC',
        fontFamily: 'Arial',
      }).setDepth(9);
    });

    // Interactive task zones
    this._addSignTask();
    this._addShelfTasks();
    this._addDoorTask();
    this._checkAllTasksDone();
  }

  _addSignTask() {
    if (GameState.bodega.signFixed) return;
    const sx = 240, sy = 130;
    const pulse = this.add.text(sx, sy, '⚠️ GARC_A', {
      fontSize: '16px', color: '#FF8888', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: pulse, alpha: { from: 1, to: 0.3 }, duration: 700, yoyo: true, repeat: -1 });

    const hint = this.add.text(sx, sy + 24, 'Haz clic para arreglar ($20)', {
      fontSize: '13px', color: '#F4A261', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(10);

    const zone = this.add.zone(sx, sy, 160, 60).setInteractive({ useHandCursor: true }).setDepth(11);
    zone.on('pointerdown', () => {
      if (!GameState.spendCash(20)) {
        showNotification(this, sx, sy - 40, '¡No tienes suficiente dinero!', { bgColor: 0xE63946 });
        return;
      }
      GameState.bodega.signFixed = true;
      pulse.destroy(); hint.destroy(); zone.destroy();
      showNotification(this, sx, sy - 40, '✅ ¡Letrero arreglado!', { bgColor: 0x2A9D8F });
      this._updateTaskText('sign', true);
      this._checkAllTasksDone();
    });
    this._signPulse = pulse;
  }

  _addShelfTasks() {
    const shelfX = [230, 530, 800];
    const shelfY = 230;
    GameState.bodega.shelvesStocked.forEach((stocked, i) => {
      if (stocked) return;
      const marker = this.add.text(shelfX[i], shelfY, '📦 Vacío\n(Haz clic: $50)', {
        fontSize: '15px', color: '#F4A261', fontFamily: 'Arial', align: 'center',
      }).setOrigin(0.5).setDepth(10);
      this.tweens.add({ targets: marker, y: shelfY - 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      const zone = this.add.zone(shelfX[i], shelfY, 200, 140).setInteractive({ useHandCursor: true }).setDepth(11);
      zone.on('pointerdown', () => {
        if (!GameState.spendCash(50)) {
          showNotification(this, shelfX[i], shelfY - 50, 'Necesitas $50', { bgColor: 0xE63946 });
          return;
        }
        GameState.bodega.shelvesStocked[i] = true;
        marker.destroy(); zone.destroy();
        showNotification(this, shelfX[i], shelfY - 50, `✅ ¡Estante ${i + 1} listo!`, { bgColor: 0x2A9D8F });
        this._updateTaskText(`shelf_${i}`, true);
        this._checkAllTasksDone();
        // Redraw shelves
        this.scene.restart();
      });
    });
  }

  _addDoorTask() {
    if (GameState.bodega.isOpen) return;
    const dx = DOOR_X + 47, dy = FLOOR_Y - 70;
    const marker = this.add.text(dx, dy, '🚪 ¡Abrir!', {
      fontSize: '17px', color: '#2ECC71', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: marker, alpha: { from: 1, to: 0.4 }, duration: 600, yoyo: true, repeat: -1 });

    const zone = this.add.zone(dx, FLOOR_Y - 120, 100, 260).setInteractive({ useHandCursor: true }).setDepth(11);
    zone.on('pointerdown', () => {
      // Check if shelves are stocked first
      if (!GameState.bodega.shelvesStocked.every(Boolean)) {
        showNotification(this, dx, dy - 50, '¡Llena los estantes primero!', { bgColor: 0xF4A261 });
        return;
      }
      GameState.bodega.isOpen = true;
      marker.destroy(); zone.destroy();
      showNotification(this, dx, dy - 50, '🎉 ¡El bodega está ABIERTO!', { bgColor: 0x2A9D8F });
      this._updateTaskText('door', true);
      this._checkAllTasksDone();
    });
  }

  _updateTaskText(key, done) {
    if (!this._taskTexts?.[key]) return;
    const labels = {
      sign:    '🔧 Arreglar el letrero',
      shelf_0: '📦 Llenar estante 1',
      shelf_1: '📦 Llenar estante 2',
      shelf_2: '📦 Llenar estante 3',
      door:    '🚪 Abrir el bodega',
    };
    const t = this._taskTexts[key];
    if (done) {
      t.setText(`✅ ${labels[key]}`);
      t.setStyle({ color: '#2A9D8F' });
    }
  }

  _checkAllTasksDone() {
    const allDone =
      GameState.bodega.signFixed &&
      GameState.bodega.shelvesStocked.every(Boolean) &&
      GameState.bodega.isOpen;

    if (allDone && !GameState.bodega.allDay1TasksDone) {
      GameState.bodega.allDay1TasksDone = true;
      GameState.save();
      this.time.delayedCall(600, () => {
        showNotification(this, 640, 340, '🎉 ¡Todas las tareas completas! Los clientes llegan...', {
          bgColor: 0x2A9D8F, duration: 3000,
        });
        this.time.delayedCall(2000, () => this._openForBusiness());
      });
    }
  }

  // ── Customer System ────────────────────────────────
  _openForBusiness() {
    this.dayActive = true;
    const delay = Math.max(3000, 6000 - GameState.time.week * 300);
    this.spawnTimer = this.time.addEvent({
      delay,
      callback: this._trySpawnCustomer,
      callbackScope: this,
      loop: true,
    });
    // Spawn first customer quickly
    this.time.delayedCall(1500, () => this._trySpawnCustomer());
  }

  _trySpawnCustomer() {
    if (!this.dayActive) return;
    const freeSlots = this.customerSlots
      .map((x, i) => ({ x, i }))
      .filter(({ i }) => !this.slotOccupied[i]);

    if (freeSlots.length === 0) return;

    const slot = Phaser.Math.RND.pick(freeSlots);
    this.slotOccupied[slot.i] = true;

    const c = new Customer(this, slot.x);
    c.spawn();
    this.customers.push(c);
  }

  _stopSpawner() {
    this.dayActive = false;
    if (this.spawnTimer) { this.spawnTimer.remove(); this.spawnTimer = null; }
  }

  _closeDay() {
    this._stopSpawner();
    // Send remaining customers home
    this.customers.forEach(c => { if (c.state === 'waiting') c.leave(false); });
    GameState.save();

    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(600, () => {
      this.scene.stop('HUDScene');
      this.scene.start('BlockViewScene');
    });
  }
}
