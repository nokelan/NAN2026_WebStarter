import Phaser from 'phaser';
import { AIAgentController } from '../ai/AIAgentController.js';
import { log, setDebugVisible } from '../utils/DebugLogger.js';

// 실제 게임 로직을 넣는 씬. 지금은 "AI가 조종하는 NPC 한 마리"라는 최소 예시만 들어있다.
// 본선 주제가 정해지면 이 씬을 주제에 맞게 갈아끼우면 된다 — 구조(agent.decide() 호출 패턴)는 그대로 재사용.
export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    setDebugVisible(true);

    this.agent = new AIAgentController({
      endpoint: '', // 본선에서 프록시 URL로 교체
    });

    this.npc = this.add.circle(this.scale.width / 2, this.scale.height / 2, 16, 0xff3355);
    this.npcState = { hp: 100, mood: 'neutral' };

    this.player = this.add.rectangle(80, 80, 24, 24, 0xffffff);
    this.cursors = this.input.keyboard.createCursorKeys();

    // 3초마다 AI에게 NPC 행동을 물어보는 예시 루프
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => this.askAgentForNpcAction()
    });

    log('Game', '씬 시작');
  }

  async askAgentForNpcAction() {
    const context = {
      instruction: 'NPC의 다음 행동을 idle/chase/flee 중 하나로 결정하고 짧은 대사를 만들어줘.',
      npcState: this.npcState,
      playerPos: { x: this.player.x, y: this.player.y }
    };
    const result = await this.agent.decide(context);
    log('Game', 'NPC 행동 결정', result);
    // TODO: result.action 값에 따라 실제 NPC 이동/애니메이션 반영
  }

  update() {
    const speed = 3;
    if (this.cursors.left.isDown) this.player.x -= speed;
    if (this.cursors.right.isDown) this.player.x += speed;
    if (this.cursors.up.isDown) this.player.y -= speed;
    if (this.cursors.down.isDown) this.player.y += speed;
  }
}
