import Phaser from 'phaser';
import { AIAgentController } from '../ai/AIAgentController.js';
import { log, setDebugVisible } from '../utils/DebugLogger.js';

// AI 추격 서바이벌: 3초마다 AI가 고블린의 행동(idle/chase/flee)을 결정하고,
// 결정된 상태에 따라 매 프레임 고블린이 플레이어를 추격/회피/대기한다.
// 플레이어는 방향키로 이동하며 잡히지 않고 버티는 시간이 점수.
export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    setDebugVisible(false);

    this.agent = new AIAgentController({
      endpoint: '', // 본선에서 프록시 URL로 교체
    });

    this.createAnims();

    this.player = this.physics.add.sprite(160, 270, 'agent', 0).setCollideWorldBounds(true);
    this.player.body.setSize(28, 40).setOffset(18, 20);
    this.player.play('agent-idle');

    this.goblin = this.physics.add.sprite(800, 270, 'goblin', 12).setCollideWorldBounds(true);
    this.goblin.body.setSize(36, 44).setOffset(24, 16);
    this.goblin.play('goblin-idle');

    this.npcState = { hp: 100, mood: 'neutral', mode: 'idle' };
    this.chaseSpeed = 90;
    this.fleeSpeed = 70;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.overlap(this.player, this.goblin, () => this.onCaught());

    this.joyVector = { x: 0, y: 0 };
    if (this.sys.game.device.input.touch) {
      this.createVirtualJoystick();
    }

    this.gameOver = false;
    this.survivalMs = 0;

    this.scoreText = this.add.text(12, 10, '생존시간: 0.0s', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff'
    });

    this.decisionEvent = this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => this.askAgentForNpcAction()
    });
    this.askAgentForNpcAction();

    log('Game', '씬 시작');
  }

  createVirtualJoystick() {
    const baseX = 100, baseY = 440, radius = 50;
    this.joyBase = this.add.circle(baseX, baseY, radius, 0xffffff, 0.15)
      .setScrollFactor(0).setDepth(1000).setStrokeStyle(2, 0xffffff, 0.4);
    this.joyKnob = this.add.circle(baseX, baseY, 22, 0xffffff, 0.35).setScrollFactor(0).setDepth(1001);
    this.joyPointerId = null;

    this.input.on('pointerdown', (pointer) => {
      if (Phaser.Math.Distance.Between(pointer.x, pointer.y, baseX, baseY) <= radius * 1.5) {
        this.joyPointerId = pointer.id;
        this.updateJoystick(pointer, baseX, baseY, radius);
      }
    });
    this.input.on('pointermove', (pointer) => {
      if (pointer.id === this.joyPointerId) this.updateJoystick(pointer, baseX, baseY, radius);
    });
    const release = (pointer) => {
      if (pointer.id === this.joyPointerId) {
        this.joyPointerId = null;
        this.joyVector = { x: 0, y: 0 };
        this.joyKnob.setPosition(baseX, baseY);
      }
    };
    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);
  }

  updateJoystick(pointer, baseX, baseY, radius) {
    const dx = pointer.x - baseX;
    const dy = pointer.y - baseY;
    const dist = Math.min(Math.hypot(dx, dy), radius);
    const angle = Math.atan2(dy, dx);
    this.joyKnob.setPosition(baseX + Math.cos(angle) * dist, baseY + Math.sin(angle) * dist);
    this.joyVector = { x: dist < 8 ? 0 : Math.cos(angle) * (dist / radius), y: dist < 8 ? 0 : Math.sin(angle) * (dist / radius) };
  }

  createAnims() {
    if (!this.anims.exists('agent-idle')) {
      this.anims.create({ key: 'agent-idle', frames: [{ key: 'agent', frame: 0 }], frameRate: 1 });
    }
    if (!this.anims.exists('agent-walk')) {
      this.anims.create({
        key: 'agent-walk',
        frames: this.anims.generateFrameNumbers('agent', { start: 10, end: 14 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!this.anims.exists('goblin-idle')) {
      this.anims.create({
        key: 'goblin-idle',
        frames: this.anims.generateFrameNumbers('goblin', { start: 12, end: 13 }),
        frameRate: 3,
        repeat: -1
      });
    }
    if (!this.anims.exists('goblin-run')) {
      this.anims.create({
        key: 'goblin-run',
        frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 5 }),
        frameRate: 12,
        repeat: -1
      });
    }
  }

  async askAgentForNpcAction() {
    if (this.gameOver) return;
    const dist = Phaser.Math.Distance.Between(this.goblin.x, this.goblin.y, this.player.x, this.player.y);
    const context = {
      instruction: 'NPC의 다음 행동을 idle/chase/flee 중 하나로 결정하고 짧은 대사를 만들어줘.',
      npcState: this.npcState,
      playerPos: { x: this.player.x, y: this.player.y },
      npcPos: { x: this.goblin.x, y: this.goblin.y },
      distance: dist
    };
    const result = await this.agent.decide(context);
    log('Game', 'NPC 행동 결정', result);
    if (['idle', 'chase', 'flee'].includes(result.action)) {
      this.npcState.mode = result.action;
    }
  }

  onCaught() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.player.setVelocity(0, 0);
    this.goblin.setVelocity(0, 0);
    this.decisionEvent.remove();

    const seconds = (this.survivalMs / 1000).toFixed(1);
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.6);
    this.add.text(480, 250, `잡혔습니다! 생존시간: ${seconds}s`, {
      fontFamily: 'monospace', fontSize: '22px', color: '#ff5555'
    }).setOrigin(0.5);
    const retry = this.add.text(480, 290, '[ 클릭해서 재시작 ]', {
      fontFamily: 'monospace', fontSize: '16px', color: '#0f0'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retry.on('pointerdown', () => this.scene.restart());

    log('Game', '게임 오버', { seconds });
  }

  update(time, delta) {
    if (this.gameOver) return;

    this.survivalMs += delta;
    this.scoreText.setText(`생존시간: ${(this.survivalMs / 1000).toFixed(1)}s`);

    const speed = 140;
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown) vx -= speed;
    if (this.cursors.right.isDown) vx += speed;
    if (this.cursors.up.isDown) vy -= speed;
    if (this.cursors.down.isDown) vy += speed;
    if (this.joyVector.x !== 0 || this.joyVector.y !== 0) {
      vx = this.joyVector.x * speed;
      vy = this.joyVector.y * speed;
    }
    this.player.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      this.player.play('agent-walk', true);
      if (vx !== 0) this.player.setFlipX(vx < 0);
    } else {
      this.player.play('agent-idle', true);
    }

    this.updateGoblin();
  }

  updateGoblin() {
    const dx = this.player.x - this.goblin.x;
    const dy = this.player.y - this.goblin.y;
    const dist = Math.hypot(dx, dy) || 1;

    if (this.npcState.mode === 'chase') {
      this.goblin.setVelocity((dx / dist) * this.chaseSpeed, (dy / dist) * this.chaseSpeed);
      this.goblin.play('goblin-run', true);
      this.goblin.setFlipX(dx < 0);
    } else if (this.npcState.mode === 'flee') {
      this.goblin.setVelocity((-dx / dist) * this.fleeSpeed, (-dy / dist) * this.fleeSpeed);
      this.goblin.play('goblin-run', true);
      this.goblin.setFlipX(dx > 0);
    } else {
      this.goblin.setVelocity(0, 0);
      this.goblin.play('goblin-idle', true);
    }
  }
}
