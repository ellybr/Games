import PreloadScene          from './scenes/PreloadScene.js';
import BootScene             from './scenes/BootScene.js';
import CharacterCreationScene from './scenes/CharacterCreationScene.js';
import CutsceneScene          from './scenes/CutsceneScene.js';
import BlockViewScene         from './scenes/BlockViewScene.js';
import BodegaScene            from './scenes/BodegaScene.js';
import HUDScene               from './scenes/HUDScene.js';
import LaSanScene             from './scenes/LaSanScene.js';
import DRMapScene             from './scenes/DRMapScene.js';
import EventScene             from './scenes/EventScene.js';
import GameOverScene          from './scenes/GameOverScene.js';
import CreditsScene           from './scenes/CreditsScene.js';
import UpgradeScene           from './scenes/UpgradeScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#0d0d1a',
  parent: 'game-container',
  scene: [
    PreloadScene,       // first — branded splash
    BootScene,
    CharacterCreationScene,
    CutsceneScene,
    BlockViewScene,
    BodegaScene,
    HUDScene,
    LaSanScene,
    DRMapScene,
    EventScene,
    GameOverScene,
    CreditsScene,
    UpgradeScene,
  ],
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias:    true,
    pixelArt:     false,
    roundPixels:  false,
  },
  input: {
    activePointers: 2,
  },
};

window.game = new Phaser.Game(config);
