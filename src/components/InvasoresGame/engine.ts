import { Player, Alien, Bullet, AnswerItem, Question, GameState, GameObject, GameResult } from './types';

// CONFIGURAÇÕES BASE
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const ALIEN_WIDTH = 45;
const ALIEN_HEIGHT = 40;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 12;
const ANSWER_WIDTH = 120;
const ANSWER_HEIGHT = 40;

export class InvasoresEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  // ESTADOS
  public player: Player;
  public aliens: Alien[] = [];
  public bullets: Bullet[] = [];
  public answers: AnswerItem[] = [];
  public particles: any[] = [];
  
  public score: number = 0;
  public combo: number = 0;
  public maxCombo: number = 0;
  public state: GameState = 'START';
  public currentQuestion: Question | null = null;
  
  // CONTROLES
  private keys: Set<string> = new Set();
  
  // TIMERS
  private lastShotTime: number = 0;
  private alienSpawnTimer: number = 0;
  private questionTimer: number = 0;
  
  // EFEITOS
  private stars: any[] = [];
  private frame: number = 0;
  private screenShake: number = 0;
  private flashAlpha: number = 0;
  private alertText: string = '';
  private alertTimer: number = 0;
  
  // CALLBACKS
  public onGameOver: (score: number) => void = () => {};
  public onResult: (result: GameResult) => void = () => {};
  public onQuestionStart: (q: Question) => void = () => {};
  public onQuestionEnd: (correct: boolean) => void = () => {};
  
  // STATS
  public aliensDestroyed: number = 0;
  public correctAnswers: number = 0;
  public wrongAnswersHit: number = 0;
  public wrongAnswersDestroyed: number = 0;
  private startTime: number = 0;
  
  // DIFICULDADE E POWERUPS
  private difficulty: number = 1.0;
  private maxDifficulty: number = 2.5;
  private powerups: any[] = [];
  public shieldActive: boolean = false;
  private shieldTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    this.player = {
      x: canvas.width / 2 - PLAYER_WIDTH / 2,
      y: canvas.height - 120, // Ajustado para mobile (mais margem do fundo)
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      lives: 3,
      speed: 10 // Aumentado para resposta mais rápida
    };

    this.initControls();
    this.initStars();
  }

  public resize() {
    this.player.y = this.canvas.height - 120;
    if (this.player.x > this.canvas.width - this.player.width) {
        this.player.x = this.canvas.width - this.player.width;
    }
    this.stars = [];
    this.initStars();
  }

  private initStars() {
    // Camada Longe (Lenta)
    for (let i = 0; i < 60; i++) {
        this.stars.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: 0.5 + Math.random(),
            speed: 0.2 + Math.random() * 0.3,
            color: 'rgba(255, 255, 255, 0.3)'
        });
    }
    // Camada Média
    for (let i = 0; i < 40; i++) {
        this.stars.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: 1 + Math.random(),
            speed: 0.8 + Math.random() * 1.5,
            color: 'rgba(255, 255, 255, 0.6)'
        });
    }
    // Nebulosas/Gases de fundo (Efeito de Mancha)
    this.ctx.fillStyle = 'rgba(0, 229, 255, 0.05)';
  }

  private initControls() {
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));

    // Touch Controls
    this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: false });
  }

  private handleTouch(e: TouchEvent) {
    if (this.state !== 'PLAYING' && this.state !== 'QUESTION_ACTIVE') return;
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = this.canvas.width / rect.width;
    
    // Posicionar nave no X do toque (centralizado)
    let targetX = (touch.clientX - rect.left) * scaleX - this.player.width / 2;
    
    // Limitar bordas
    if (targetX < 0) targetX = 0;
    if (targetX > this.canvas.width - this.player.width) targetX = this.canvas.width - this.player.width;
    
    this.player.x = targetX;
  }

  public reset() {
    this.player.x = this.canvas.width / 2 - PLAYER_WIDTH / 2;
    this.player.lives = 3;
    this.aliens = [];
    this.bullets = [];
    this.answers = [];
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.state = 'PLAYING';
    this.currentQuestion = null;
    this.alienSpawnTimer = 0;
    this.questionTimer = 0;
    this.aliensDestroyed = 0;
    this.correctAnswers = 0;
    this.wrongAnswersHit = 0;
    this.wrongAnswersDestroyed = 0;
    this.startTime = Date.now();
    this.difficulty = 1.0;
    this.powerups = [];
    this.shieldActive = false;
    this.shieldTimer = 0;
  }

  public update(_deltaTime: number) {
    if (this.state === 'PAUSED' || this.state === 'GAMEOVER' || this.state === 'START') return;

    this.frame++;
    if (this.screenShake > 0) this.screenShake *= 0.9;
    if (this.flashAlpha > 0) this.flashAlpha -= 0.05;

    this.updateStars();
    this.updatePlayer();
    this.updateBullets();
    this.updateAliens(_deltaTime);
    this.updateAnswers();
    this.updateDifficulty();
    this.updatePowerups();
    this.updateParticles();
    this.checkCollisions();
    
    // Spawners
    this.alienSpawnTimer += _deltaTime;
    if (this.alienSpawnTimer > 2000) {
      this.spawnAlienWave();
      this.alienSpawnTimer = 0;
      
      // Checar Boss/Alerta
      if (Math.floor(this.score / 5000) > Math.floor((this.score - 100) / 5000)) {
          this.alertText = 'BOSS INCOMING!';
          this.alertTimer = 120;
          this.flashAlpha = 0.3;
      }
    }

    // Pergunta Manager (A cada 20s se não houver pergunta ativa)
    if (this.state !== 'QUESTION_ACTIVE' ) {
      this.questionTimer += _deltaTime;
      if (this.questionTimer > 15000) {
        this.triggerQuestionEvent();
        this.questionTimer = 0;
      }
    }
  }

  private updateStars() {
    for (const s of this.stars) {
      s.y += s.speed;
      if (s.y > this.canvas.height) {
        s.y = -s.size;
        s.x = Math.random() * this.canvas.width;
      }
    }
  }

  private updatePlayer() {
    if (this.keys.has('ArrowLeft') && this.player.x > 0) {
      this.player.x -= this.player.speed;
    }
    if (this.keys.has('ArrowRight') && this.player.x < this.canvas.width - this.player.width) {
      this.player.x += this.player.speed;
    }
    if (this.keys.has('Space')) {
      const now = Date.now();
      if (now - this.lastShotTime > 250) {
        this.shoot();
        this.lastShotTime = now;
      }
    }

    // Auto-fire em mobile (ou se estiver jogando)
    const now = Date.now();
    if (now - this.lastShotTime > 350) {
      this.shoot();
      this.lastShotTime = now;
    }
  }

  private shoot() {
    const isSuper = this.combo >= 10;
    this.bullets.push({
      x: this.player.x + this.player.width / 2 - BULLET_WIDTH / 2,
      y: this.player.y,
      width: BULLET_WIDTH,
      height: BULLET_HEIGHT,
      owner: 'PLAYER',
      speedY: isSuper ? -15 : -10
    });
  }

  private updateBullets() {
    this.bullets = this.bullets.filter(b => {
      b.y += b.speedY;
      return b.y > -20 && b.y < this.canvas.height + 20;
    });
  }

  private updateDifficulty() {
    this.difficulty = Math.min(this.maxDifficulty, 1 + (this.score / 12000));
  }

  private updatePowerups() {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
        const p = this.powerups[i];
        p.y += 2;
        if (p.y > this.canvas.height) {
            this.powerups.splice(i, 1);
            continue;
        }
        
        // Colisão com jogador
        if (this.rectIntersects(p, this.player)) {
            if (p.type === 'shield') {
                this.shieldActive = true;
                this.shieldTimer = 360; // aprox 6 segundos
            }
            this.powerups.splice(i, 1);
            continue;
        }
    }
    
    if (this.shieldTimer > 0) {
        this.shieldTimer--;
        if (this.shieldTimer <= 0) this.shieldActive = false;
    }
  }

  private updateAliens(_dt: number) {
    this.aliens = this.aliens.filter(a => {
      a.y += a.speedY * this.difficulty;
      
      // Atirar ocasionalmente (Dificuldade afeta frequência)
      if (Math.random() < 0.005 * this.difficulty) {
        this.alienFire(a);
      }

      // Chegar no fundo = penalidade de pontos e reset de combo
      if (a.y > this.canvas.height) {
        this.score = Math.max(0, this.score - 50);
        this.combo = 0;
        this.screenShake = 5;
        return false;
      }
      return true;
    });
  }

  private updateAnswers() {
    this.answers = this.answers.filter(a => {
      a.y += a.speedY;
      if (a.y > this.canvas.height) {
        if (a.isCorrect) {
          this.onQuestionEnd(false);
          this.state = 'PLAYING';
          this.currentQuestion = null;
        }
        return false;
      }
      return true;
    });
  }

  private updateParticles() {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });
  }

  private checkCollisions() {
    // Balas vs Aliens
    for (const b of this.bullets) {
      if (b.owner === 'PLAYER') {
        for (const a of this.aliens) {
          if (this.rectIntersects(b, a)) {
            a.health--;
            b.y = -100; // Remover bala
            if (a.health <= 0) {
              this.destroyAlien(a);
            }
          }
        }
        // Balas vs Respostas Erradas
        for (const ans of this.answers) {
          if (!ans.isCorrect && this.rectIntersects(b, ans)) {
            this.destroyAnswer(ans, true);
            b.y = -100;
          }
        }
      } else if (b.owner === 'ENEMY') {
        // Balas Inimigas vs Player
        if (this.rectIntersects(b, this.player)) {
          this.handlePlayerHit();
          b.y = this.canvas.height + 100; // Remover bala
        }
      }
    }

    // Player vs Aliens
    for (const a of this.aliens) {
      if (this.rectIntersects(this.player, a)) {
        this.handlePlayerHit();
        this.aliens = this.aliens.filter(alien => alien.id !== a.id);
        this.createExplosion(a.x, a.y, '#ff3d71');
      }
    }

    // Player vs Respostas
    for (const ans of this.answers) {
      if (this.rectIntersects(this.player, ans)) {
        if (ans.isCorrect) {
          this.collectCorrectAnswer();
        } else {
          this.hitWrongAnswer();
        }
        this.answers = this.answers.filter(item => item.id !== ans.id);
      }
    }
  }

  private rectIntersects(r1: GameObject, r2: GameObject) {
    return r1.x < r2.x + r2.width &&
           r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height &&
           r1.y + r1.height > r2.y;
  }

  private alienFire(a: Alien) {
    this.bullets.push({
      x: a.x + a.width / 2 - BULLET_WIDTH / 2,
      y: a.y + a.height,
      width: BULLET_WIDTH,
      height: BULLET_HEIGHT,
      owner: 'ENEMY',
      speedY: 4 * this.difficulty
    });
  }

  private spawnAlienWave() {
    const count = 3 + Math.floor(this.score / 500);
    for (let i = 0; i < count; i++) {
        const x = Math.random() * (this.canvas.width - ALIEN_WIDTH);
        this.aliens.push({
            id: Math.random().toString(36),
            x,
            y: -50,
            width: ALIEN_WIDTH,
            height: ALIEN_HEIGHT,
            type: Math.random() > 0.8 ? 'FAST' : 'NORMAL',
            points: 10,
            speedY: 1.5 + Math.random() * 1,
            health: 1
        });
    }
  }

  private triggerQuestionEvent() {
    // Import dinâmico ou injetado das perguntas
    // Por agora, chamando o callback do React para pegar uma pergunta do banco
    this.state = 'QUESTION_ACTIVE';
  }

  public startQuestionEvent(q: Question) {
    this.currentQuestion = q;
    const items: AnswerItem[] = [];
    
    // Resposta Correta
    items.push({
      id: 'correct',
      text: q.correct,
      isCorrect: true,
      x: Math.random() * (this.canvas.width - ANSWER_WIDTH),
      y: -100,
      width: ANSWER_WIDTH,
      height: ANSWER_HEIGHT,
      speedY: 1.2
    });

    // Erradas
    q.alternatives.forEach((alt, i) => {
      items.push({
        id: `wrong-${i}`,
        text: alt,
        isCorrect: false,
        x: Math.random() * (this.canvas.width - ANSWER_WIDTH),
        y: -200 - (i * 100),
        width: ANSWER_WIDTH,
        height: ANSWER_HEIGHT,
        speedY: 1.2 + (Math.random() * 0.5)
      });
    });

    this.answers = items;
    this.onQuestionStart(q);
  }

  private destroyAlien(a: Alien) {
    this.aliens = this.aliens.filter(alien => alien.id !== a.id);
    this.score += a.points + (this.combo * 2);
    this.aliensDestroyed++;
    this.combo++;
    this.screenShake = 5;
    
    // Chance de dropar powerup
    if (Math.random() < 0.1) {
        this.powerups.push({
            x: a.x,
            y: a.y,
            width: 30,
            height: 30,
            type: 'shield'
        });
    }

    if (this.combo % 10 === 0) this.flashAlpha = 0.2;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.createExplosion(a.x + a.width/2, a.y + a.height/2, '#00e5ff');
  }

  private collectCorrectAnswer() {
    this.score += 150 + (this.combo * 10);
    this.correctAnswers++;
    this.createExplosion(this.player.x + this.player.width/2, this.player.y, '#00ffa3', 20);
    this.onQuestionEnd(true);
    this.state = 'PLAYING';
    this.currentQuestion = null;
    this.answers = [];
  }

  private handlePlayerHit() {
    if (this.shieldActive) {
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.screenShake = 12;
        this.flashAlpha = 0.15;
        this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#00e5ff', 25);
        return;
    }

    this.player.lives--;
    this.combo = 0;
    this.wrongAnswersHit++;
    this.screenShake = 25;
    this.flashAlpha = 0.5;
    // Vibrar no mobile
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    
    this.createExplosion(this.player.x + this.player.width/2, this.player.y, '#ff3d71', 30);
    if (this.player.lives <= 0) this.setGameOver();
  }

  private hitWrongAnswer() {
    this.handlePlayerHit();
  }

  private destroyAnswer(ans: AnswerItem, shot: boolean) {
    this.answers = this.answers.filter(a => a.id !== ans.id);
    if (shot) {
      this.score += 5;
      this.wrongAnswersDestroyed++;
      this.createExplosion(ans.x + ans.width/2, ans.y + ans.height/2, '#ffffff');
    }
  }

  private createExplosion(x: number, y: number, color: string, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color
      });
    }
  }

  private setGameOver() {
    this.state = 'GAMEOVER';
    this.onGameOver(this.score);
    
    // Calcular resultado final
    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    const xp_earned = Math.floor(this.score / 10); // Lógica de XP
    
    this.onResult({
      game_slug: 'invasores-conhecimento',
      score: this.score,
      xp_earned,
      aliens_destroyed: this.aliensDestroyed,
      correct_answers: this.correctAnswers,
      wrong_answers_hit: this.wrongAnswersHit,
      wrong_answers_destroyed: this.wrongAnswersDestroyed,
      max_combo: this.maxCombo,
      duration,
      lives_remaining: Math.max(0, this.player.lives)
    });
  }

  // RENDERIZAÇÃO
  public draw() {
    this.ctx.save();
    if (this.screenShake > 0.1) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(sx, sy);
    }

    // Background
    this.ctx.fillStyle = '#05070a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Efeito de Vinheta / Gradiente Radial
    const grad = this.ctx.createRadialGradient(
        this.canvas.width/2, this.canvas.height/2, 0,
        this.canvas.width/2, this.canvas.height/2, this.canvas.width
    );
    grad.addColorStop(0, 'rgba(13, 13, 30, 0.5)');
    grad.addColorStop(1, 'rgba(5, 7, 10, 1)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Estrelas
    for (const s of this.stars) {
      this.ctx.fillStyle = s.color;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Partículas
    for (const p of this.particles) {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 5;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;

    // Player
    this.drawNave();

    // Powerups
    this.powerups.forEach(p => this.drawPowerup(p));

    // Aliens
    for (const a of this.aliens) {
      this.drawAlien(a);
    }

    // Balas
    for (const b of this.bullets) {
      if (b.owner === 'PLAYER') {
          // Efeito de fogo rápido / combo
          const isSuper = this.combo >= 10;
          this.ctx.fillStyle = isSuper ? '#00ffa3' : '#00e5ff';
          this.ctx.shadowBlur = isSuper ? 20 : 10;
          this.ctx.shadowColor = this.ctx.fillStyle;
          
          if (isSuper) {
              this.ctx.globalAlpha = 0.6;
              this.roundRect(b.x - 2, b.y, b.width + 4, b.height, 2);
              this.ctx.fill();
              this.ctx.globalAlpha = 1;
          }
      } else {
          this.ctx.fillStyle = '#ff3d71';
      }
      
      this.roundRect(b.x, b.y, b.width, b.height, 2);
      this.ctx.fill();
    }
    this.ctx.shadowBlur = 0;

    // Respostas
    for (const ans of this.answers) {
      this.drawAnswer(ans);
    }

    // Flash Screen
    if (this.flashAlpha > 0.01) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Scanlines (Retro Arcade Effect)
    this.drawScanlines();

    // Alertas (Boss/Level Up/Avisos)
    if (this.alertTimer > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = Math.min(1, this.alertTimer / 30);
        this.ctx.fillStyle = '#ff3d71';
        this.ctx.font = '900 42px "Orbitron"';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ff3d71';
        this.ctx.fillText(this.alertText, this.canvas.width/2, this.canvas.height/2);
        this.ctx.restore();
        this.alertTimer--;
    }

    this.ctx.restore();
  }

  private drawScanlines() {
    this.ctx.save();
    this.ctx.globalAlpha = 0.1;
    this.ctx.fillStyle = '#000';
    for (let i = 0; i < this.canvas.height; i += 4) {
        this.ctx.fillRect(0, i, this.canvas.width, 1);
    }
    this.ctx.restore();
  }

  private drawNave() {
    const { x, y, width, height } = this.player;
    
    // Motor Flame
    if (this.state === 'PLAYING' || this.state === 'QUESTION_ACTIVE' || this.state === 'START') {
        const flSize = 5 + Math.sin(this.frame * 0.5) * 8;
        
        // Brilho externo da chama
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ff3d00';
        
        this.ctx.fillStyle = '#ff9100';
        this.ctx.beginPath();
        this.ctx.moveTo(x + width*0.3, y + height);
        this.ctx.lineTo(x + width*0.5, y + height + 15 + flSize);
        this.ctx.lineTo(x + width*0.7, y + height);
        this.ctx.fill();

        // Núcleo da chama
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.moveTo(x + width*0.4, y + height);
        this.ctx.lineTo(x + width*0.5, y + height + 8 + flSize*0.5);
        this.ctx.lineTo(x + width*0.6, y + height);
        this.ctx.fill();
    }

    // Escudo Ativo
    if (this.shieldActive) {
        this.ctx.beginPath();
        this.ctx.arc(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 50, 0, Math.PI * 2);
        this.ctx.lineWidth = 4;
        const gradient = this.ctx.createRadialGradient(
            this.player.x + this.player.width/2, this.player.y + this.player.height/2, 35,
            this.player.x + this.player.width/2, this.player.y + this.player.height/2, 55
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, '#00e5ff');
        this.ctx.strokeStyle = gradient;
        this.ctx.globalAlpha = 0.4 + Math.sin(this.frame / 5) * 0.2;
        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
    }

    // Corpo da Nave
    this.ctx.fillStyle = '#00e5ff';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#00e5ff';
    
    this.ctx.beginPath();
    this.ctx.moveTo(x + width / 2, y); // Topo
    this.ctx.lineTo(x + width, y + height*0.8);
    this.ctx.lineTo(x + width*0.8, y + height);
    this.ctx.lineTo(x + width*0.2, y + height);
    this.ctx.lineTo(x, y + height*0.8);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Asas laterais
    this.ctx.fillStyle = '#00838f';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height*0.6);
    this.ctx.lineTo(x - 10, y + height);
    this.ctx.lineTo(x + width*0.3, y + height);
    this.ctx.fill();
    
    this.ctx.moveTo(x + width, y + height*0.6);
    this.ctx.lineTo(x + width + 10, y + height);
    this.ctx.lineTo(x + width*0.7, y + height);
    this.ctx.fill();

    // Detalhe Cockpit
    const cockpitGrad = this.ctx.createLinearGradient(x, y, x, y + height);
    cockpitGrad.addColorStop(0, '#ffffff');
    cockpitGrad.addColorStop(1, '#00e5ff');
    this.ctx.fillStyle = cockpitGrad;
    this.ctx.beginPath();
    this.ctx.ellipse(x + width/2, y + height*0.45, width*0.2, height*0.25, 0, 0, Math.PI*2);
    this.ctx.fill();
    
    // Brilho no cockpit
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.beginPath();
    this.ctx.ellipse(x + width/2 - 5, y + height*0.4, 5, 8, -0.5, 0, Math.PI*2);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;
  }

  private drawAlien(a: Alien) {
    const time = this.frame * 0.05;
    const hover = Math.sin(time + parseInt(a.id, 36)) * 5;
    const color = a.type === 'FAST' ? '#ff3d71' : '#00ffa3';
    
    this.ctx.save();
    this.ctx.translate(a.x + a.width/2, a.y + a.height/2 + hover);
    
    // Corpo (Forma baseada no tipo)
    this.ctx.fillStyle = color;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = color;
    
    // Desenho baseado no tipo
    if (a.type === 'FAST') {
        // --- INTERCEPTADOR (Design em Triângulo/V) ---
        this.ctx.beginPath();
        this.ctx.moveTo(0, -a.height/2); 
        this.ctx.lineTo(a.width/2, a.height/2);
        this.ctx.lineTo(0, a.height/3);
        this.ctx.lineTo(-a.width/2, a.height/2);
        this.ctx.closePath();
        this.ctx.fill();

        // Antenas Superiores
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(-a.width/4, -a.height/4);
        this.ctx.lineTo(-a.width/2, -a.height/2);
        this.ctx.moveTo(a.width/4, -a.height/4);
        this.ctx.lineTo(a.width/2, -a.height/2);
        this.ctx.stroke();
    } else {
        // --- SONDA (Design mais Robótico/Alien clássico) ---
        // Cabeça
        this.ctx.beginPath();
        this.ctx.ellipse(0, -5, a.width/2, a.height/2.5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Mandíbulas/Garras inferiores
        this.ctx.beginPath();
        this.ctx.moveTo(-a.width/2.5, 0);
        this.ctx.lineTo(-a.width/3, a.height/2);
        this.ctx.lineTo(-a.width/6, a.height/4);
        this.ctx.lineTo(a.width/6, a.height/4);
        this.ctx.lineTo(a.width/3, a.height/2);
        this.ctx.lineTo(a.width/2.5, 0);
        this.ctx.stroke();

        // Núcleo de Energia (O olho central)
        this.ctx.fillStyle = '#fff';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.ellipse(0, -5, 12, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#f00';
        this.ctx.beginPath();
        this.ctx.arc(0, -5, 3 + Math.sin(time*4)*1.5, 0, Math.PI*2);
        this.ctx.fill();
    }
    
    // Detalhes de brilho comuns
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(-5, -10, 4, 0, Math.PI*2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;
    
    this.ctx.restore();
    this.ctx.shadowBlur = 0;
  }

  private drawAnswer(ans: AnswerItem) {
    this.ctx.save();
    const pulse = Math.sin(this.frame * 0.1) * 2;
    
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = ans.isCorrect ? '#00ffa3' : '#ff3d71';
    
    this.ctx.fillStyle = ans.isCorrect ? 'rgba(0, 255, 163, 0.25)' : 'rgba(255, 61, 113, 0.15)';
    this.ctx.strokeStyle = ans.isCorrect ? '#00ffa3' : '#ff3d71';
    this.ctx.lineWidth = 2;
    
    // Bubble animada
    this.roundRect(ans.x - pulse, ans.y - pulse, ans.width + pulse*2, ans.height + pulse*2, 12);
    this.ctx.stroke();
    this.ctx.fill();

    // Reflexo Glass
    this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    this.ctx.beginPath();
    this.ctx.moveTo(ans.x + 10, ans.y + 10);
    this.ctx.lineTo(ans.x + ans.width - 20, ans.y + 10);
    this.ctx.stroke();

    // Texto
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '800 13px "Outfit"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(ans.text.toUpperCase(), ans.x + ans.width / 2, ans.y + ans.height/2 + 5);
    
    this.ctx.restore();
    this.ctx.shadowBlur = 0;
  }

  private drawPowerup(p: any) {
    this.ctx.save();
    this.ctx.translate(p.x + p.width/2, p.y + p.height/2);
    this.ctx.rotate(this.frame / 15);
    
    // Brilho
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#00e5ff';
    this.ctx.strokeStyle = '#00e5ff';
    this.ctx.lineWidth = 3;
    
    // Hexágono
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const lx = Math.cos(angle) * 15;
        const ly = Math.sin(angle) * 15;
        if (i === 0) this.ctx.moveTo(lx, ly);
        else this.ctx.lineTo(lx, ly);
    }
    this.ctx.closePath();
    this.ctx.stroke();
    
    // Gradiente interno
    const g = this.ctx.createRadialGradient(0,0,0,0,0,15);
    g.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
    g.addColorStop(1, 'transparent');
    this.ctx.fillStyle = g;
    this.ctx.fill();

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 16px "Outfit"';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('S', 0, 0);
    this.ctx.restore();
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }
}
