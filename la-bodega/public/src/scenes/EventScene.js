import GameState from '../GameState.js';
import { drawButton, showNotification, drawCharacter } from '../utils/DrawUtils.js';

// ── Event definitions ─────────────────────────────────
const EVENTS = [
  {
    id: 'developer_offer',
    title: '🏗️ Oferta del Developer',
    npc: 'Developer (traje gris)',
    npcSkin: 1, npcHair: 'Recogido', npcColor: 0x555555,
    text: 'Un developer te da su tarjeta. "Le ofrezco $1,000 por su contrato de arrendamiento. Piénselo — el barrio está cambiando de todas formas."',
    options: [
      {
        label: '🚫 Rechazar',
        desc: 'Este barrio no está en venta.',
        cashDelta: 0, trustDelta: 20, gentDelta: -15,
        reaction: '¡La comunidad te aplaude! −15 presión gentrificadora.',
        reactionColor: 0x2A9D8F,
      },
      {
        label: '💵 Aceptar ($1,000)',
        desc: 'Solo esta vez... necesito el efectivo.',
        cashDelta: 1000, trustDelta: -25, gentDelta: 20,
        reaction: 'El dinero llega pero los vecinos te miran diferente.',
        reactionColor: 0xE63946,
      },
    ],
    minWeek: 2, weight: 3,
  },
  {
    id: 'block_party',
    title: '🎉 ¡Fiesta de Barrio!',
    npc: 'Doña Carmen',
    npcSkin: 4, npcHair: 'Recogido', npcColor: 0x7B2D8B,
    text: '"Mija, los vecinos quieren una fiesta en la calle. Tú eres la anfitriona ahora — ¿puedes patrocinar?"',
    options: [
      {
        label: '🎊 Patrocinar ($150)',
        desc: '¡Bachata, comida, y familia!',
        costAmount: 150, cashDelta: 0, trustDelta: 28, gentDelta: -8,
        reaction: '¡El bloque explota de alegría! Todos te conocen ahora.',
        reactionColor: 0xF4A261,
      },
      {
        label: '😔 No tengo fondos',
        desc: 'Prometo para la próxima.',
        cashDelta: 0, trustDelta: -5, gentDelta: 0,
        reaction: 'Los vecinos entienden... por ahora.',
        reactionColor: 0x888888,
      },
    ],
    minWeek: 1, weight: 3,
  },
  {
    id: 'pipe_burst',
    title: '🚰 ¡Se Reventó la Tubería!',
    npc: 'Tío Pedro',
    npcSkin: 4, npcHair: 'Recogido', npcColor: 0x1565C0,
    text: '"¡Mija! La tubería de atrás explotó. El piso está mojado. Hay que arreglarlo antes de abrir mañana."',
    options: [
      {
        label: '🔧 Arreglar ahora ($200)',
        desc: 'Lo arreglo esta noche.',
        costAmount: 200, cashDelta: 0, trustDelta: 8, gentDelta: 0,
        reaction: 'El bodega abre mañana en perfectas condiciones.',
        reactionColor: 0x2A9D8F,
      },
      {
        label: '⏳ Esperar (costo después)',
        desc: 'No tengo el dinero ahora mismo.',
        cashDelta: 0, trustDelta: -10, gentDelta: 5,
        reaction: 'Los clientes notan el problema. La comunidad murmura.',
        reactionColor: 0xE63946,
      },
    ],
    minWeek: 2, weight: 2,
  },
  {
    id: 'youth_donation',
    title: '🏫 Centro Comunitario',
    npc: 'Mrs. Rodríguez',
    npcSkin: 3, npcHair: 'Trenzas', npcColor: 0x2D6A4F,
    text: '"El centro juvenil necesita $250 para el programa de verano. Los niños del bloque dependen de eso, hermana."',
    options: [
      {
        label: '❤️ Donar ($250)',
        desc: 'Los niños del barrio son el futuro.',
        costAmount: 250, cashDelta: 0, trustDelta: 22, gentDelta: -6,
        reaction: '¡Gracias, vecina! La comunidad nunca olvida.',
        reactionColor: 0x2A9D8F,
      },
      {
        label: '🤷 No puedo ahora',
        desc: 'Tengo que pagar las cuentas primero.',
        cashDelta: 0, trustDelta: -8, gentDelta: 0,
        reaction: 'El programa se cancela este verano.',
        reactionColor: 0x888888,
      },
    ],
    minWeek: 3, weight: 2,
  },
  {
    id: 'new_neighbor',
    title: '🏠 Nueva Familia en el Bloque',
    npc: 'Joven vecino',
    npcSkin: 2, npcHair: 'Blowout', npcColor: 0x3A7BD5,
    text: '"Hola, somos nuevos aquí — acabamos de llegar de RD. ¿Hay un bodega cerca?" Te miran nerviosamente.',
    options: [
      {
        label: '👋 ¡Bienvenidos! (gratis)',
        desc: 'Los acompaño al bodega personalmente.',
        cashDelta: 0, trustDelta: 15, gentDelta: -3,
        reaction: 'Una nueva familia fiel al barrio. El bloque crece.',
        reactionColor: 0x2A9D8F,
      },
      {
        label: '😐 Solo señalar',
        desc: 'Estoy ocupada ahora mismo.',
        cashDelta: 0, trustDelta: 0, gentDelta: 0,
        reaction: 'Ellos encontraron el camino solos.',
        reactionColor: 0x888888,
      },
    ],
    minWeek: 1, weight: 2,
  },
  {
    id: 'remittance',
    title: '📞 Llamada de Familia en RD',
    npc: 'Mamá (por teléfono)',
    npcSkin: 4, npcHair: 'Rizos', npcColor: 0xE63946,
    text: '"Mija, tu tío está enfermo y necesitamos ayuda. No tienes que — pero si puedes mandar algo..." Su voz se quiebra.',
    options: [
      {
        label: '💸 Mandar remesa ($300)',
        desc: 'Familia primero, siempre.',
        costAmount: 300, cashDelta: 0, trustDelta: 12, gentDelta: 0,
        reaction: '"Dios te bendiga, mi amor." La familia está agradecida.',
        reactionColor: 0xF4A261,
      },
      {
        label: '😢 No puedo este mes',
        desc: 'Lo prometo para el próximo mes.',
        cashDelta: 0, trustDelta: -5, gentDelta: 0,
        reaction: 'Mamá entiende. Pero pesa en el corazón.',
        reactionColor: 0x888888,
      },
    ],
    minWeek: 3, weight: 2,
  },
  {
    id: 'health_inspection',
    title: '📋 ¡Inspección de Salud!',
    npc: 'Inspector',
    npcSkin: 1, npcHair: 'Recogido', npcColor: 0x333333,
    text: '"Señorita García, vengo a hacer una inspección. Su bodega necesita estantes nuevos y limpieza profunda. Tiene opciones."',
    options: [
      {
        label: '✅ Cumplir todo ($180)',
        desc: 'Todo en orden, inspector.',
        costAmount: 180, cashDelta: 0, trustDelta: 10, gentDelta: 0,
        reaction: '¡Puntuación perfecta! Los clientes lo notan.',
        reactionColor: 0x2A9D8F,
      },
      {
        label: '🤝 Negociar',
        desc: 'Solo lo esencial por ahora.',
        costAmount: 80, cashDelta: 0, trustDelta: 0, gentDelta: 3,
        reaction: 'Pasa la inspección mínima. Por ahora.',
        reactionColor: 0xF4A261,
      },
    ],
    minWeek: 2, weight: 2,
  },
];

// ── Scene ──────────────────────────────────────────────
export default class EventScene extends Phaser.Scene {
  constructor() { super({ key: 'EventScene' }); }

  init(data) {
    this.afterScene = data?.afterScene || 'BlockViewScene';
    this.event = this._pickEvent();
  }

  create() {
    if (!this.event) {
      this.scene.start(this.afterScene);
      return;
    }
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(700);

    // Background dim
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x050510, 0x050510, 0x0d0d22, 0x0d0d22, 1);
    bg.fillRect(0, 0, width, height);

    // Particle atmosphere
    for (let i = 0; i < 20; i++) {
      const pg = this.add.graphics();
      pg.fillStyle(0xF4A261, 0.04);
      pg.fillCircle(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), Phaser.Math.Between(60, 180));
    }

    const ev = this.event;
    const panelW = 860, panelH = 520;
    const px = width / 2, py = height / 2;

    // Panel
    const panelG = this.add.graphics().setDepth(5);
    panelG.fillStyle(0x080818, 0.96);
    panelG.fillRoundedRect(px - panelW / 2, py - panelH / 2, panelW, panelH, 16);
    panelG.lineStyle(3, 0xF4A261, 1);
    panelG.strokeRoundedRect(px - panelW / 2, py - panelH / 2, panelW, panelH, 16);

    // Week badge
    this.add.text(px - panelW / 2 + 18, py - panelH / 2 + 16, `Semana ${GameState.time.week}  ·  Evento`, {
      fontSize: '14px', color: '#888888', fontFamily: 'Arial',
    }).setDepth(10);

    // Title
    this.add.text(px, py - panelH / 2 + 50, ev.title, {
      fontSize: '32px', color: '#F4A261', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10);

    // NPC character
    drawCharacter(this, px - panelW / 2 + 90, py + 30, {
      skinTone: ev.npcSkin, hairStyle: ev.npcHair, clothingColor: ev.npcColor, scale: 1.5,
    }).setDepth(10);
    this.add.text(px - panelW / 2 + 90, py + 140, ev.npc, {
      fontSize: '13px', color: '#AAAAAA', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(10);

    // Dialogue text
    this.add.text(px - panelW / 2 + 190, py - 90, ev.text, {
      fontSize: '19px', color: '#FFFFFF', fontFamily: 'Georgia, serif', fontStyle: 'italic',
      wordWrap: { width: panelW - 220 }, lineSpacing: 6,
    }).setDepth(10);

    // Current stats mini
    const statsG = this.add.graphics().setDepth(9);
    statsG.fillStyle(0x111125, 0.7); statsG.fillRoundedRect(px - panelW / 2 + 180, py + 50, panelW - 220, 50, 8);
    this.add.text(px - 60, py + 75, [
      `💵 $${Math.floor(GameState.finances.cash).toLocaleString()}`,
      `🤝 ${GameState.stats.communityTrust}/100`,
      `🏗️ ${GameState.stats.gentrificationPressure}/100`,
    ].join('     '), {
      fontSize: '15px', color: '#CCCCCC', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(10);

    // Option buttons
    ev.options.forEach((opt, i) => {
      const bx = px - panelW / 2 + 200 + i * 310;
      const by = py + 160;

      const optG = this.add.graphics().setDepth(9);
      const paintOpt = (hover) => {
        optG.clear();
        optG.fillStyle(hover ? 0x1a2a4a : 0x0d1a30, 1);
        optG.fillRoundedRect(bx - 135, by - 55, 270, 110, 10);
        optG.lineStyle(2, hover ? 0xF4A261 : 0x334466, 1);
        optG.strokeRoundedRect(bx - 135, by - 55, 270, 110, 10);
      };
      paintOpt(false);

      this.add.text(bx, by - 34, opt.label, {
        fontSize: '18px', color: '#FFFFFF', fontFamily: 'Georgia, serif', fontStyle: 'bold', align: 'center',
        wordWrap: { width: 240 },
      }).setOrigin(0.5).setDepth(11);
      this.add.text(bx, by + 4, opt.desc, {
        fontSize: '14px', color: '#AAAAAA', fontFamily: 'Arial', align: 'center',
        wordWrap: { width: 240 },
      }).setOrigin(0.5).setDepth(11);

      // Effect previews
      const effects = [];
      if (opt.cashDelta > 0)  effects.push(`+$${opt.cashDelta}`);
      if (opt.costAmount > 0) effects.push(`-$${opt.costAmount}`);
      if (opt.trustDelta > 0) effects.push(`+${opt.trustDelta} confianza`);
      if (opt.trustDelta < 0) effects.push(`${opt.trustDelta} confianza`);
      if (opt.gentDelta  < 0) effects.push(`${opt.gentDelta} presión`);
      if (opt.gentDelta  > 0) effects.push(`+${opt.gentDelta} presión`);
      this.add.text(bx, by + 32, effects.join('  '), {
        fontSize: '13px', color: '#F4A261', fontFamily: 'Arial', align: 'center',
      }).setOrigin(0.5).setDepth(11);

      const zone = this.add.zone(bx, by, 270, 110).setInteractive({ useHandCursor: true }).setDepth(12);
      zone.on('pointerover', () => paintOpt(true));
      zone.on('pointerout',  () => paintOpt(false));
      zone.on('pointerdown', () => this._choose(opt));
    });
  }

  _choose(opt) {
    const gs = GameState;
    if (opt.costAmount > 0) {
      if (!gs.spendCash(opt.costAmount) ) {
        showNotification(this, this.scale.width / 2, 200,
          `Sin fondos — necesitas $${opt.costAmount}`, { bgColor: 0xE63946 });
        return;
      }
    }
    if (opt.cashDelta)  gs.addCash(opt.cashDelta);
    if (opt.trustDelta) gs.addTrust(opt.trustDelta);
    if (opt.gentDelta)  gs.addGentriPressure(opt.gentDelta);
    gs.save();

    // Check game over
    if (gs.stats.gentrificationPressure >= 100) {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.time.delayedCall(800, () => this.scene.start('GameOverScene', { reason: 'gentrification' }));
      return;
    }

    // Reaction message
    const { width, height } = this.scale;
    const col = opt.reactionColor || 0x2A9D8F;
    const reactionG = this.add.graphics().setDepth(20);
    reactionG.fillStyle(0x050510, 0.96);
    reactionG.fillRoundedRect(width / 2 - 300, height / 2 - 60, 600, 120, 14);
    reactionG.lineStyle(2, col, 1);
    reactionG.strokeRoundedRect(width / 2 - 300, height / 2 - 60, 600, 120, 14);
    this.add.text(width / 2, height / 2, opt.reaction, {
      fontSize: '20px', color: '#FFFFFF', fontFamily: 'Georgia, serif', fontStyle: 'italic',
      align: 'center', wordWrap: { width: 560 },
    }).setOrigin(0.5).setDepth(21);

    this.time.delayedCall(2200, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.time.delayedCall(600, () => this.scene.start(this.afterScene));
    });
  }

  _pickEvent() {
    const week = GameState.time.week;
    const eligible = EVENTS.filter(e => e.minWeek <= week);
    if (eligible.length === 0) return null;

    // Weighted random pick
    const totalWeight = eligible.reduce((s, e) => s + (e.weight || 1), 0);
    let r = Math.random() * totalWeight;
    for (const ev of eligible) {
      r -= ev.weight || 1;
      if (r <= 0) return ev;
    }
    return eligible[eligible.length - 1];
  }
}

// Helper: should an event fire this week?
export function shouldFireEvent(week) {
  // Events fire most weeks (70% chance), more reliably in early weeks
  if (week <= 3) return Math.random() < 0.85;
  return Math.random() < 0.70;
}
