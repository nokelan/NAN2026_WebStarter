import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 40, 'NAN2026 WEB STARTER', {
      fontFamily: 'monospace', fontSize: '28px', color: '#ffffff'
    }).setOrigin(0.5);

    const startText = this.add.text(width / 2, height / 2 + 20, '[ 클릭해서 시작 ]', {
      fontFamily: 'monospace', fontSize: '18px', color: '#0f0'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startText.on('pointerdown', () => this.scene.start('Game'));
  }
}
