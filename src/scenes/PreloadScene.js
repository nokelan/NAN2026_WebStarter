import Phaser from 'phaser';
import { log } from '../utils/DebugLogger.js';

// 48시간 중엔 에셋을 placeholder(도형)로 시작해서 나중에 이미지로 교체하는 흐름을 권장.
// 실제 에셋 로드는 이 preload()에 추가.
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const { width, height } = this.scale;
    const bar = this.add.rectangle(width / 2, height / 2, 4, 20, 0xffffff).setOrigin(0, 0.5);
    this.load.on('progress', (value) => {
      bar.width = 4 + value * (width * 0.5);
    });

    // 여기에 this.load.image(...) / this.load.spritesheet(...) 등 실제 에셋 추가
  }

  create() {
    log('Preload', '에셋 로드 완료 → Menu로 전환');
    this.scene.start('Menu');
  }
}
