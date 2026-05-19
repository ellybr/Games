export default class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'PreloadScene' }); }

  create() {
    const { width, height } = this.scale;

    // ── Flag animation (DR colors sweep in) ──────────────
    const redLeft = this.add.graphics();
    redLeft.fillStyle(0xD32F2F, 1);
    redLeft.fillRect(0, 0, width / 2, height / 2);
    redLeft.fillRect(width / 2, height / 2, width / 2, height / 2);

    const blueRight = this.add.graphics();
    blueRight.fillStyle(0x1565C0, 1);
    blueRight.fillRect(width / 2, 0, width / 2, height / 2);
    blueRight.fillRect(0, height / 2, width / 2, height / 2);

    // White cross
    const cross = this.add.graphics();
    cross.fillStyle(0xFFFFFF, 1);
    cross.fillRect(0, height / 2 - 20, width, 40);
    cross.fillRect(width / 2 - 20, 0, 40, height);

    // DR coat of arms placeholder (shield shape)
    const shield = this.add.graphics();
    shield.fillStyle(0xFFFFFF, 0.95);
    shield.fillTriangle(width / 2, height / 2 - 36, width / 2 - 28, height / 2 + 20, width / 2 + 28, height / 2 + 20);
    shield.fillRect(width / 2 - 28, height / 2 - 36, 56, 56);

    // Flag starts off-screen scaled to 0, animates in
    const flagGroup = this.add.container(width / 2, height / 2, [redLeft, blueRight, cross, shield]);
    flagGroup.setScale(0);

    this.tweens.add({
      targets: flagGroup,
      scaleX: 1, scaleY: 1,
      duration: 900,
      ease: 'Back.out',
    });

    // ── Dark vignette overlay ────────────────────────────
    this.time.delayedCall(600, () => {
      const vignette = this.add.graphics();
      vignette.fillStyle(0x000000, 0);
      vignette.fillRect(0, 0, width, height);
      this.tweens.add({ targets: vignette, fillAlpha: 0.65, duration: 600 });
    });

    // ── Game title ───────────────────────────────────────
    const title = this.add.text(width / 2, height / 2 - 80, 'LA BODEGA', {
      fontFamily: 'Georgia, serif',
      fontSize: '96px',
      color: '#F4A261',
      stroke: '#B83000',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 14, fill: true },
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    const tagline = this.add.text(width / 2, height / 2 + 20, 'Un legado. Una comunidad. Tu historia.', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#FFFFFF',
      fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    this.time.delayedCall(800, () => {
      this.tweens.add({ targets: title, alpha: 1, y: height / 2 - 90, duration: 1000, ease: 'Power2' });
      this.tweens.add({ targets: tagline, alpha: 1, duration: 900, delay: 300 });
    });

    // ── Loading bar ──────────────────────────────────────
    const barY = height / 2 + 110;
    const barW = 400;

    const barBg = this.add.graphics().setDepth(10);
    barBg.fillStyle(0x222222, 0.9);
    barBg.fillRoundedRect(width / 2 - barW / 2, barY, barW, 12, 5);

    const barFill = this.add.graphics().setDepth(11);
    const loadText = this.add.text(width / 2, barY + 26, 'Cargando...', {
      fontSize: '16px', color: '#AAAAAA', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(11).setAlpha(0);

    this.time.delayedCall(900, () => {
      this.tweens.add({ targets: loadText, alpha: 1, duration: 400 });
      this._animateBar(barFill, width / 2 - barW / 2, barY, barW);
    });

    // ── Proceed after 2.8 seconds ─────────────────────────
    this.time.delayedCall(2900, () => {
      this.cameras.main.fadeOut(700, 0, 0, 0);
      this.time.delayedCall(700, () => this.scene.start('BootScene'));
    });
  }

  _animateBar(g, bx, by, bw) {
    let progress = 0;
    const step = this.time.addEvent({
      delay: 28,
      repeat: 62,
      callback: () => {
        progress = Math.min(1, progress + 0.016);
        g.clear();
        g.fillStyle(0xF4A261, 1);
        g.fillRoundedRect(bx + 1, by + 1, (bw - 2) * progress, 10, 4);
      },
    });
  }
}
