export default class DialogueSystem {
  constructor(scene) {
    this.scene = scene;
    this.queue = [];
    this.isOpen = false;
    this.onComplete = null;
    this.container = null;
    this.canAdvance = false;
    this._pointerHandler = null;
    this._keyHandler = null;
    this._typeTimer = null;
  }

  show(dialogues, onComplete = null) {
    this.queue = [...dialogues];
    this.onComplete = onComplete;
    this.isOpen = true;
    this._next();
  }

  close() {
    this._clearHandlers();
    if (this.container) { this.container.destroy(); this.container = null; }
    if (this._typeTimer) { this._typeTimer.remove(); this._typeTimer = null; }
    this.isOpen = false;
    this.queue = [];
  }

  _next() {
    if (this.container) { this.container.destroy(); this.container = null; }
    this._clearHandlers();

    if (this.queue.length === 0) {
      this.isOpen = false;
      if (this.onComplete) this.onComplete();
      return;
    }
    this._render(this.queue.shift());
  }

  _render({ speaker = '', text = '', accent = 0xF4A261 }) {
    const { width, height } = this.scene.scale;
    const BOX_H = 160;
    const BOX_Y = height - BOX_H - 20;

    this.container = this.scene.add.container(0, 0).setDepth(60);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0a18, 0.93);
    bg.fillRoundedRect(24, BOX_Y - 4, width - 48, BOX_H + 8, 14);
    bg.lineStyle(2, accent, 1);
    bg.strokeRoundedRect(24, BOX_Y - 4, width - 48, BOX_H + 8, 14);

    // Speaker portrait block
    if (speaker) {
      bg.fillStyle(accent, 0.25);
      bg.fillRoundedRect(36, BOX_Y + 8, 88, 88, 6);
      bg.lineStyle(1.5, accent, 0.7);
      bg.strokeRoundedRect(36, BOX_Y + 8, 88, 88, 6);
    }

    const nameX = speaker ? 140 : 48;

    const nameText = this.scene.add.text(nameX, BOX_Y + 10, speaker, {
      fontSize: '19px', color: `#${accent.toString(16).padStart(6, '0')}`,
      fontFamily: 'Georgia, serif', fontStyle: 'bold',
    });

    const dialogText = this.scene.add.text(nameX, BOX_Y + 36, '', {
      fontSize: '20px', color: '#F0EEE8', fontFamily: 'Georgia, serif',
      wordWrap: { width: width - nameX - 60 }, lineSpacing: 5,
    });

    const arrow = this.scene.add.text(width - 44, BOX_Y + BOX_H - 20, '▼', {
      fontSize: '16px', color: '#F4A261',
    }).setOrigin(0.5).setAlpha(0);

    this.scene.tweens.add({ targets: arrow, alpha: { from: 0, to: 1 }, yoyo: true, repeat: -1, duration: 550 });

    this.container.add([bg, nameText, dialogText, arrow]);
    this.canAdvance = false;

    let idx = 0;
    if (this._typeTimer) { this._typeTimer.remove(); }
    this._typeTimer = this.scene.time.addEvent({
      delay: 30,
      repeat: text.length - 1,
      callback: () => {
        idx++;
        dialogText.setText(text.substring(0, idx));
        if (idx >= text.length) { this.canAdvance = true; }
      },
    });

    const advance = () => {
      if (!this.isOpen) return;
      if (!this.canAdvance) {
        if (this._typeTimer) { this._typeTimer.remove(); this._typeTimer = null; }
        dialogText.setText(text);
        this.canAdvance = true;
        return;
      }
      this._next();
    };

    this._pointerHandler = advance;
    this._keyHandler = advance;
    this.scene.time.delayedCall(200, () => {
      this.scene.input.on('pointerdown', this._pointerHandler);
      this.scene.input.keyboard?.on('keydown-SPACE', this._keyHandler);
    });
  }

  _clearHandlers() {
    if (this._pointerHandler) {
      this.scene.input.off('pointerdown', this._pointerHandler);
      this._pointerHandler = null;
    }
    if (this._keyHandler) {
      this.scene.input.keyboard?.off('keydown-SPACE', this._keyHandler);
      this._keyHandler = null;
    }
  }
}
