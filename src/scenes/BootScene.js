import Phaser from 'phaser';
import { log } from '../utils/DebugLogger.js';

// 해상도/렌더러 등 최소 설정만 하고 바로 Preload로 넘어간다.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    log('Boot', '부팅 완료 → Preload로 전환');
    this.scene.start('Preload');
  }
}
