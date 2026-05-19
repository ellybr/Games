const GameState = {
  player: {
    name: 'Maria',
    skinTone: 3,
    hairStyle: 'Rizos',
  },

  finances: {
    cash: 500,
    weeklyIncome: 0,
    weeklyExpenses: 150,
    totalEarned: 0,
  },

  stats: {
    communityTrust: 50,
    gentrificationPressure: 0,
    customersServed: 0,
    customersFailed: 0,
    totalRevenue: 0,
  },

  time: {
    day: 1,
    week: 1,
    dayOfWeek: 1, // 1–7
  },

  laSan: {
    active: false,
    pot: 0,
    contribution: 100,
    members: ['Doña Carmen', 'Mrs. Rodríguez', 'Tío Pedro'],
    currentWinner: 0, // index 0–2 = member, 3 = player
    playerPaidThisWeek: false,
    consecutivePayments: 0,
    totalRounds: 0,
  },

  bodega: {
    level: 1,
    signFixed: false,
    shelvesStocked: [false, false, false],
    isOpen: false,
    allDay1TasksDone: false,
    stock: {
      cafe: 20, platanos: 15, arroz: 12,
      pollo: 8, cerveza: 10, snacks: 20,
    },
  },

  buildings: [
    { id: 'restaurante', name: 'Restaurante',      unlocked: false, cost: 5000, trustRequired: 70 },
    { id: 'salon',       name: 'Salón de Belleza',  unlocked: false, cost: 3500, trustRequired: 65 },
    { id: 'bodega',      name: 'Bodega García',     unlocked: true },
    { id: 'laundromat',  name: 'Lavandería',        unlocked: false, cost: 2000, trustRequired: 60 },
    { id: 'apartamento', name: 'Apartamentos',      unlocked: false, cost: 8000, trustRequired: 75 },
  ],

  drMap: {
    unlocked: false,
    unlockCash: 15000,
    unlockTrust: 80,
    unlockWeek: 12,
  },

  flags: {
    seenIntro: false,
    seenLaSanIntro: false,
    day1TasksExplained: false,
  },

  // ── Mutations ──────────────────────────────────────────
  addCash(amount) {
    this.finances.cash += amount;
    if (amount > 0) {
      this.finances.weeklyIncome += amount;
      this.finances.totalEarned += amount;
      this.stats.totalRevenue += amount;
    }
  },

  spendCash(amount) {
    if (this.finances.cash >= amount) {
      this.finances.cash -= amount;
      return true;
    }
    return false;
  },

  addTrust(amount) {
    this.stats.communityTrust = Math.min(100, Math.max(0, this.stats.communityTrust + amount));
  },

  addGentriPressure(amount) {
    this.stats.gentrificationPressure = Math.min(100, Math.max(0,
      this.stats.gentrificationPressure + amount));
  },

  // Returns true if a new week started
  advanceDay() {
    this.time.day++;
    this.time.dayOfWeek++;
    this.finances.weeklyIncome = 0;

    if (this.time.dayOfWeek > 7) {
      this.time.dayOfWeek = 1;
      this.time.week++;
      this._endOfWeek();
      return true;
    }
    return false;
  },

  _endOfWeek() {
    this.finances.cash -= this.finances.weeklyExpenses;
    this.addGentriPressure(5);
    this.laSan.playerPaidThisWeek = false;
    if (this.time.week >= 2 && !this.laSan.active) {
      this.laSan.active = true;
    }
  },

  payLaSan() {
    if (this.spendCash(this.laSan.contribution)) {
      this.laSan.playerPaidThisWeek = true;
      this.laSan.pot += this.laSan.contribution;
      this.laSan.consecutivePayments++;
      this.addTrust(10);
      return true;
    }
    return false;
  },

  skipLaSan() {
    this.laSan.playerPaidThisWeek = false;
    this.laSan.consecutivePayments = 0;
    this.addTrust(-15);
  },

  receiveLaSanPot() {
    const received = this.laSan.pot;
    this.addCash(received);
    this.laSan.pot = 0;
    this.laSan.totalRounds++;
    this.laSan.currentWinner = (this.laSan.currentWinner + 1) % 4;
    return received;
  },

  isPlayersTurn() {
    return this.laSan.active && (this.time.week % 4 === 0) && this.laSan.consecutivePayments >= 3;
  },

  canUnlockDR() {
    return (
      this.finances.cash >= this.drMap.unlockCash &&
      this.stats.communityTrust >= this.drMap.unlockTrust &&
      this.time.week >= this.drMap.unlockWeek
    );
  },

  save() {
    try {
      const data = {
        player:    { ...this.player },
        finances:  { ...this.finances },
        stats:     { ...this.stats },
        time:      { ...this.time },
        laSan:     { ...this.laSan },
        bodega:    { ...this.bodega, shelvesStocked: [...this.bodega.shelvesStocked], stock: { ...this.bodega.stock } },
        buildings: this.buildings.map(b => ({ ...b })),
        drMap:     { ...this.drMap },
        flags:     { ...this.flags },
      };
      localStorage.setItem('laBodega_save', JSON.stringify(data));
    } catch (e) { /* storage unavailable */ }
  },

  load() {
    try {
      const saved = localStorage.getItem('laBodega_save');
      if (!saved) return false;
      const d = JSON.parse(saved);
      Object.assign(this.player, d.player);
      Object.assign(this.finances, d.finances);
      Object.assign(this.stats, d.stats);
      Object.assign(this.time, d.time);
      Object.assign(this.laSan, d.laSan);
      Object.assign(this.bodega, d.bodega);
      if (d.buildings) this.buildings = d.buildings;
      Object.assign(this.drMap, d.drMap);
      Object.assign(this.flags, d.flags);
      return true;
    } catch (e) { return false; }
  },

  reset() {
    try { localStorage.removeItem('laBodega_save'); } catch (e) {}
    location.reload();
  },
};

export default GameState;
