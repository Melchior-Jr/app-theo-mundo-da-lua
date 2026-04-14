import { Player, Alien, Bullet, AnswerItem, Question, GameState, GameObject, Chapter, AlienType, QuestionLevel, GameResult } from './types';

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
  public currentChapter: Chapter | null = null;
  
  // CONTROLES
  private keys: Set<string> = new Set();
  
  // TIMERS
  private lastShotTime: number = 0;
  private alienSpawnTimer: number = 0;
  
  
  // EFEITOS
  private stars: any[] = [];
  private frame: number = 0;
  private screenShake: number = 0;
  private flashAlpha: number = 0;
  private alertText: string = '';
  private alertTimer: number = 0;
  private slowdownFactor: number = 1.0;
  private challengeGlow: number = 0;
  private isTouching: boolean = false;
  private isMobileDevice: boolean = false;
  
  // CALLBACKS
  public onGameOver: (score: number) => void = () => {};
  public onResult: (result: GameResult) => void = () => {};
  public onQuestionStart: (q: Question) => void = () => {};
  public onQuestionEnd: (correct: boolean, details?: { 
    question_id: string, 
    choice: string, 
    responseTime: number,
    difficulty: QuestionLevel 
  }) => void = () => {};
  
  // STATS
  public aliensDestroyed: number = 0;
  public correctAnswers: number = 0;
  public wrongAnswersHit: number = 0;
  public wrongAnswersDestroyed: number = 0;
  private startTime: number = 0;
  private questionStartTime: number = 0;
  
  // DIFICULDADE E POWERUPS
  private difficulty: number = 1.0;
  private maxDifficulty: number = 2.5;
  private powerups: any[] = [];
  public shieldActive: boolean = false;
  private shieldTimer: number = 0;
  public shieldHealth: number = 0;
  
  // ACHIEVEMENT TRACKING
  public isPerfectRun: boolean = true;
  public correctAnswersByCategory: Record<string, number> = {};
  public currentStreak: number = 0;
  public maxStreak: number = 0;
  private comboPerks = {
    doubleShot: false,
    magnet: false,
    extraSlowdown: false,
    laser: false,
    autoShield: false
  };

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

    this.isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    this.initControls();
    this.initStars();
  }

  public setChapter(chapter: Chapter) {
    this.currentChapter = chapter;
    this.initStars();
  }

  public resize() {
    // O canvas já foi redimensionado externamente pelo index.tsx
    // Aqui apenas ajustamos os limites do player
    if (this.player.x > this.canvas.width - this.player.width) {
      this.player.x = this.canvas.width - this.player.width;
    }
    this.player.y = this.canvas.height - 120;
    
    // Reinicializa estrelas para ocupar o novo espaço
    this.initStars();
  }

  private initStars() {
    this.stars = [];
    const starColor = this.currentChapter?.palette.accent || 'rgba(255, 255, 255';
    
    // Camada Longe (Lenta)
    for (let i = 0; i < 60; i++) {
        this.stars.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: 0.5 + Math.random(),
            speed: 0.2 + Math.random() * 0.3,
            color: `${starColor}, 0.3)`
        });
    }
    // Camada Média
    for (let i = 0; i < 40; i++) {
        this.stars.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: 1 + Math.random(),
            speed: 0.8 + Math.random() * 1.5,
            color: `${starColor}, 0.6)`
        });
    }
  }

  private initControls() {
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));

    // Touch Controls
    this.canvas.addEventListener('touchstart', (e) => {
      this.isTouching = true;
      this.handleTouch(e);
      // Atirar imediatamente no toque inicial se estiver no modo desafio
      if (this.state === 'MODO_DESAFIO') {
        const now = Date.now();
        if (now - this.lastShotTime > 250) {
          this.shoot();
          this.lastShotTime = now;
        }
      }
    }, { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: false });
    this.canvas.addEventListener('touchend', () => {
      this.isTouching = false;
    }, { passive: false });
    this.canvas.addEventListener('touchcancel', () => {
      this.isTouching = false;
    }, { passive: false });
  }

  private handleTouch(e: TouchEvent) {
    if (this.state !== 'MODO_COMBATE' && this.state !== 'MODO_DESAFIO') return;
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
    this.state = 'MODO_COMBATE';
    this.currentQuestion = null;
    this.slowdownFactor = 1.0;
    this.challengeGlow = 0;
    this.alienSpawnTimer = 0;
    this.aliensDestroyed = 0;
    this.correctAnswers = 0;
    this.wrongAnswersHit = 0;
    this.wrongAnswersDestroyed = 0;
    this.startTime = Date.now();
    this.difficulty = 1.0;
    this.powerups = [];
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.shieldHealth = 0;
    this.comboPerks = {
      doubleShot: false,
      magnet: false,
      extraSlowdown: false,
      laser: false,
      autoShield: false
    };
    
    // Achievement Reset
    this.isPerfectRun = true;
    this.correctAnswersByCategory = {};
    this.currentStreak = 0;
    this.maxStreak = 0;
  }

  public update(_deltaTime: number) {
    if (this.state === 'START') {
        this.updateStars();
        return;
    }
    if (this.state === 'PAUSED' || this.state === 'GAMEOVER') return;

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
    
    // Spawners - Limitador de dt para evitar saltos gigantes no primeiro frame
    const dtAdjusted = Math.min(_deltaTime, 100); 
    this.alienSpawnTimer += dtAdjusted;
    if (this.alienSpawnTimer > 2000) {
      this.spawnAlienWave();
      this.alienSpawnTimer = 0;
      
      // Checar Boss/Alerta - Apenas se não houver Boss ativo
      const hasBoss = this.aliens.some(a => a.type === 'CHEFÃO_CÓSMICO');
      const currentMilestone = Math.floor(this.score / 5000);
      const lastMilestone = Math.floor((this.score - 100) / 5000); // 100 pontos de margem
      
      if (!hasBoss && this.score >= 5000 && currentMilestone > lastMilestone) {
          this.spawnBoss();
      }
    }

    // Gerenciar Slowdown e Transição
    const minSlow = this.comboPerks.extraSlowdown ? 0.4 : 0.6;
    if (this.state === 'MODO_DESAFIO') {
        this.slowdownFactor = Math.max(minSlow, this.slowdownFactor - 0.05);
        this.challengeGlow = Math.min(1, this.challengeGlow + 0.05);
    } else {
        this.slowdownFactor = Math.min(1.0, this.slowdownFactor + 0.05);
        this.challengeGlow = Math.max(0, this.challengeGlow - 0.05);
    }
  }

  private updateStars() {
    for (const s of this.stars) {
      s.y += s.speed * this.slowdownFactor;
      if (s.y > this.canvas.height) {
        s.y = -s.size;
        s.x = Math.random() * this.canvas.width;
      }
    }
  }

  private updatePlayer() {
    const now = Date.now();

    if (this.keys.has('ArrowLeft') && this.player.x > 0) {
      this.player.x -= this.player.speed;
    }
    if (this.keys.has('ArrowRight') && this.player.x < this.canvas.width - this.player.width) {
      this.player.x += this.player.speed;
    }
    
    // Tiro Manual (Espaço)
    if (this.keys.has('Space')) {
      if (now - this.lastShotTime > 250) {
        this.shoot();
        this.lastShotTime = now;
      }
    }

    // Auto-fire (Sempre ativo no combate, desativado no desafio para precisão no Desktop)
    // No Mobile, mantemos o auto-fire ou permitimos tiro via segurar toque
    const fireInterval = this.comboPerks.laser ? 150 : 400;
    const isChallenge = this.state === 'MODO_DESAFIO';
    
    // Condição para atirar no Mobile: se estiver tocando
    const shouldFireMobile = this.isMobileDevice && this.isTouching;
    
    if ((!isChallenge || shouldFireMobile) && now - this.lastShotTime > fireInterval) {
      this.shoot();
      this.lastShotTime = now;
    }
  }

  private shoot() {
    this.updateComboPerks();
    const bY = this.player.y;
    const bW = BULLET_WIDTH;
    const bH = BULLET_HEIGHT;

    if (this.comboPerks.laser) {
        // Laser Contínuo (mais rápido e potente)
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - bW / 2,
            y: bY, width: bW, height: bH * 2,
            owner: 'PLAYER', speedY: -15
        });
    } else if (this.comboPerks.doubleShot) {
        // Disparo Duplo
        this.bullets.push({
            x: this.player.x + 5, y: bY, width: bW, height: bH,
            owner: 'PLAYER', speedY: -10
        });
        this.bullets.push({
            x: this.player.x + this.player.width - 10, y: bY, width: bW, height: bH,
            owner: 'PLAYER', speedY: -10
        });
    } else {
        // Tiro Normal
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - bW / 2,
            y: bY, width: bW, height: bH,
            owner: 'PLAYER', speedY: -10
        });
    }
  }

  private updateComboPerks() {
    this.comboPerks = {
        doubleShot: this.combo >= 3,
        magnet: this.combo >= 5,
        extraSlowdown: this.combo >= 7,
        laser: this.combo >= 10,
        autoShield: this.combo >= 15
    };

    // Escudo Automático (Ativável uma vez quando chegar no 15)
    if (this.comboPerks.autoShield && !this.shieldActive && this.combo === 15) {
        this.shieldActive = true;
        this.shieldHealth = 10;
        this.shieldTimer = 600; // Dura mais tempo
        this.alertText = 'ESCUDO AUTOMÁTICO!';
        this.alertTimer = 60;
    }
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
                this.shieldHealth = 10;
                this.shieldTimer = 600; // aprox 10 segundos
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
    const challengeActive = this.state === 'MODO_DESAFIO';
    const correctAns = challengeActive ? this.answers.find(a => a.type === 'CORRETA') : null;

    this.aliens = this.aliens.filter(a => {
      // Movimento Vertical
      a.y += a.speedY * this.difficulty * this.slowdownFactor;
      
      // Movimento Lateral / Comportamento Específico
      switch(a.type) {
        case 'EXPLORADOR':
            a.x += (Math.sin(this.frame * 0.1) * 3) * this.slowdownFactor;
            break;
        case 'SHOOTER':
        case 'CONFUSOR':
            if (a.speedX === undefined) a.speedX = 2;
            a.x += a.speedX * this.slowdownFactor;
            if (a.x <= 0 || a.x >= this.canvas.width - a.width) a.speedX *= -1;
            if (a.type === 'CONFUSOR' && !challengeActive && Math.random() < 0.012 * this.slowdownFactor) {
                this.dropGarbage(a);
            }
            break;
        case 'GUARDIAN':
            if (correctAns) {
                const targetX = correctAns.x + correctAns.width/2 - a.width/2;
                a.x += (targetX - a.x) * 0.15 * this.slowdownFactor;
                a.y = correctAns.y - 50; 
            } else {
                a.y += 2.5 * this.slowdownFactor;
            }
            break;
        case 'MESTRE':
            if (a.speedX === undefined) a.speedX = 4;
            a.x += a.speedX * this.slowdownFactor;
            if (a.x <= 20 || a.x >= this.canvas.width - a.width - 20) a.speedX *= -1;
            a.y += (0.8 + Math.sin(this.frame * 0.05)) * this.slowdownFactor;
            break;
        case 'CHEFÃO_CÓSMICO':
            if (a.speedX === undefined) a.speedX = 0.8;
            a.x += a.speedX * this.slowdownFactor;
            if (a.x <= 20 || a.x >= this.canvas.width - a.width - 20) a.speedX *= -1;
            a.y = Math.min(100, a.y + 0.5); 
            if (Math.random() < 0.03 * this.difficulty && this.state !== 'MODO_DESAFIO') this.alienFire(a);
            break;
      }
      
      // Atirar ocasionalmente (SHOOTER atira mais)
      // Durante o desafio (perguntas), os aliens param de atirar para não carregar a tela
      if (this.state !== 'MODO_DESAFIO') {
          const fireChance = a.type === 'SHOOTER' ? 0.03 : 0.005;
          if (Math.random() < fireChance * this.difficulty * this.slowdownFactor) {
            this.alienFire(a);
          }
      }

      // Chegar no fundo = apenas remove o alien sem penalidade (solicitação do usuário)
      if (a.y > this.canvas.height) {
        return false;
      }
      return true;
    });
  }

  private updateAnswers() {
    this.updateComboPerks(); // Garantir que os buffs estão sincronizados
    
    this.answers = this.answers.filter(a => {
      // Ajustar velocidade baseado no buff de slowdown extra (Combo 7)
      const currentSpeedY = this.comboPerks.extraSlowdown && this.state === 'MODO_DESAFIO' 
          ? a.speedY * 0.5 
          : a.speedY;

      a.y += currentSpeedY * this.slowdownFactor;
      
      // Ímã de Powerups (Combo 5)
      if (this.comboPerks.magnet) {
          this.powerups.forEach(p => {
              const dx = (this.player.x + this.player.width/2) - (p.x + p.width/2);
              if (Math.abs(dx) < 250) { // Raio de atração maior para powerups
                  p.x += dx * 0.08;
              }
          });
      }

      // Oscilação Lateral
      a.x += Math.sin((Date.now() - a.creationTime) * a.speedX) * a.amplitude;
      
      // Limitar bordas laterais
      if (a.x < 10) a.x = 10;
      if (a.x > this.canvas.width - a.width - 10) a.x = this.canvas.width - a.width - 10;

      if (a.y > this.canvas.height) {
        if (a.type === 'CORRETA') {
          // VITÓRIA! A certa passou com sucesso
          this.collectCorrectAnswer();
        } else if (a.type.startsWith('ERRADA')) {
          // ERRO! Deixou passar uma resposta errada
          this.onQuestionEnd(false, {
            question_id: this.currentQuestion?.id || '',
            choice: 'DEIXOU_PASSAR_ERRO',
            responseTime: Date.now() - this.questionStartTime,
            difficulty: this.currentQuestion?.level || 'Fácil'
          });
          this.state = 'MODO_COMBATE';
          this.currentQuestion = null;
          this.flashAlpha = 0.3;
          this.combo = 0;
          this.updateComboPerks();
        }
        return false;
      }
      return true;
    });
  }

  private updateParticles() {
    this.particles = this.particles.filter(p => {
      p.x += p.vx * this.slowdownFactor;
      p.y += p.vy * this.slowdownFactor;
      p.life -= 0.02 * (this.state === 'MODO_DESAFIO' ? 0.5 : 1);
      return p.life > 0;
    });

    if (this.particles.length > 300) {
      this.particles = this.particles.slice(-300);
    }
  }

  private checkCollisions() {
    // Balas vs Aliens
    for (const b of this.bullets) {
      if (b.owner === 'PLAYER') {
        for (const a of this.aliens) {
          if (this.rectIntersects(b, a)) {
            b.y = -100; // Remover bala independently
            
            a.health--;
            if (a.health <= 0) {
              this.destroyAlien(a);
            }
            
            if (a.type === 'BOSS_EDUCATIVO') {
                this.screenShake = 3;
            }
          }
        }
        for (const ans of this.answers) {
          if (ans.y > 0 && this.rectIntersects(b, ans)) {
            ans.health--;
            this.createExplosion(b.x, b.y, '#ffffff', 5); // Efeito de impacto
            
            if (ans.health <= 0) {
                if (ans.type === 'CORRETA') {
                    // ERRO! Atirou na resposta certa repetidamente até quebrar
                    this.createExplosion(ans.x + ans.width/2, ans.y + ans.height/2, '#ff3d71', 15);
                    this.onQuestionEnd(false, {
                        question_id: this.currentQuestion?.id || '',
                        choice: 'ATIROU_NA_CORRETA',
                        responseTime: Date.now() - this.questionStartTime,
                        difficulty: this.currentQuestion?.level || 'Fácil'
                    });
                    this.state = 'MODO_COMBATE';
                    this.currentQuestion = null;
                    this.flashAlpha = 0.4;
                    this.combo = 0;
                    this.answers = []; 
                } else {
                    this.destroyAnswer(ans, true);
                }
            }
            b.y = -100;
          }
        }
      } else if (b.owner === 'ENEMY') {
        // Balas Inimigas vs Player
        if (this.rectIntersects(b, this.player)) {
          this.handlePlayerHit(1); // Tiros tiram 1 de escudo
          b.y = this.canvas.height + 100; // Remover bala
        }
      }
    }
    // Player vs Aliens
    for (const a of this.aliens) {
      if (this.rectIntersects(this.player, a)) {
        this.handlePlayerHit(10); // Colisões matam o escudo (aguenta apenas 1 impacto)
        this.aliens = this.aliens.filter(alien => alien.id !== a.id);
        this.createExplosion(a.x, a.y, '#ff3d71');
      }
    }

    // Player vs Respostas
    for (const ans of this.answers) {
      if (ans.y > 0 && this.rectIntersects(this.player, ans)) {
        // Colidir com QUALQUER resposta agora é ruim, exceto bônus
        if (ans.type === 'BONUS') {
          this.score += 500;
          this.createExplosion(this.player.x + this.player.width/2, this.player.y, '#ffd600', 30);
        } else {
          // Colidiu com a certa ou errada = falha (o objetivo é DESTRUIR erradas e DEIXAR passar a certa)
          this.handlePlayerHit(1); // Dano leve por colisão
          this.onQuestionEnd(false, {
            question_id: this.currentQuestion?.id || '',
            choice: 'COLIDIU_COM_RESPOSTA',
            responseTime: Date.now() - this.questionStartTime,
            difficulty: this.currentQuestion?.level || 'Fácil'
          });
          this.state = 'MODO_COMBATE';
          this.currentQuestion = null;
          this.flashAlpha = 0.4;
          this.combo = 0;
          this.answers = [];
        }
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
    const isBossActive = this.aliens.some(a => a.type === 'BOSS_EDUCATIVO');
    const isChallengeActive = this.state === 'MODO_DESAFIO';
    if (isBossActive || isChallengeActive) return; // Não spawna aliens durante Boss ou Perguntas

    let count = 3 + Math.floor(this.score / 1500);
    count = Math.min(count, 15); // Limite de segurança por onda
    
    for (let i = 0; i < count; i++) {

        const x = Math.random() * (this.canvas.width - ALIEN_WIDTH);
        const rand = Math.random();
        let type: AlienType = 'NORMAL';
        let health = 1;
        
        if (rand > 0.95) type = 'MESTRE';
        else if (rand > 0.85) type = 'SHOOTER';
        else if (rand > 0.75) type = 'EXPLORADOR';
        else if (rand > 0.65 && this.score > 2000) type = 'CONFUSOR';

        this.aliens.push({
            id: Math.random().toString(36),
            x, y: -50,
            width: ALIEN_WIDTH,
            height: ALIEN_HEIGHT,
            type,
            points: type === 'NORMAL' ? 10 : (type === 'MESTRE' ? 150 : 35),
            speedY: type === 'EXPLORADOR' ? 3.0 : 1.5,
            health,
            maxHealth: health
        });
    }
  }

  private spawnBoss() {
      if (this.aliens.some(a => a.type === 'CHEFÃO_CÓSMICO')) return;

      this.alertText = 'CHEFÃO CÓSMICO!';
      this.alertTimer = 120;
      this.aliens.push({
          id: 'boss-1',
          x: this.canvas.width / 2 - 100,
          y: -150,
          width: 200,
          height: 120,
          type: 'CHEFÃO_CÓSMICO',
          points: 5000,
          speedY: 0,
          health: 100, 
          maxHealth: 100
      });
  }

  private dropGarbage(a: Alien) {
      this.answers.push({
          id: `garbage-${Math.random()}`,
          text: 'ERRO...',
          type: Math.random() > 0.5 ? 'TRAP' : 'ERRADA_COMUM',
          x: a.x, y: a.y,
          width: ANSWER_WIDTH, height: ANSWER_HEIGHT,
          speedY: 2, speedX: 0.05, amplitude: 5,
          creationTime: Date.now(),
          health: 2, maxHealth: 2
      });
  }

  public startQuestionEvent(q: Question) {
    this.alertText = 'DESAFIO!';
    this.alertTimer = 60;
    this.flashAlpha = 0.2;
    this.state = 'MODO_DESAFIO';

    // Spawn de Guardião se a pontuação for alta
    if (this.difficulty > 1.3) {
        this.aliens.push({
            id: `guardian-${Date.now()}`,
            x: this.canvas.width / 2, y: -50,
            width: ALIEN_WIDTH * 1.2, height: ALIEN_HEIGHT,
            type: 'GUARDIAN', points: 50, speedY: 1, health: 2, maxHealth: 2
        });
    }

    this.currentQuestion = q;
    const items: AnswerItem[] = [];
    const now = Date.now();
    
    // 1. Resposta CORRETA
    items.push({
      id: 'correct',
      text: q.correct,
      type: 'CORRETA',
      x: Math.random() * (this.canvas.width - ANSWER_WIDTH),
      y: -150,
      width: ANSWER_WIDTH,
      height: ANSWER_HEIGHT,
      speedY: 0.8 + (Math.random() * 0.3),
      speedX: 0.02,
      amplitude: 1.5,
      creationTime: now,
      health: 10,
      maxHealth: 10
    });

    // 2. Respostas ERRADAS (Comuns e Perigosas)
    q.alternatives.forEach((alt, i) => {
      const isDangerous = Math.random() > 0.7; // 30% de chance de ser perigosa
      items.push({
        id: `wrong-${i}`,
        text: alt,
        type: isDangerous ? 'ERRADA_PERIGOSA' : 'ERRADA_COMUM',
        x: Math.random() * (this.canvas.width - ANSWER_WIDTH),
        y: -300 - (i * 150),
        width: ANSWER_WIDTH,
        height: ANSWER_HEIGHT,
        speedY: 1.5 + (Math.random() * 0.8), // Aumentado
        speedX: 0.03,
        amplitude: 2.5,
        creationTime: now + (i * 200),
        health: 2,
        maxHealth: 2
      });
    });

    // 3. Adicionar TRAP ou BONUS ocasionalmente
    if (this.difficulty > 1.5 && Math.random() > 0.5) {
        items.push({
            id: 'trap-item',
            text: q.alternatives[0], // Pega uma errada mas usa visual similar
            type: 'TRAP',
            x: Math.random() * (this.canvas.width - ANSWER_WIDTH),
            y: -500,
            width: ANSWER_WIDTH,
            height: ANSWER_HEIGHT,
            speedY: 1.2,
            speedX: 0.05,
            amplitude: 3,
            creationTime: now,
            health: 2,
            maxHealth: 2
        });
    }

    if (Math.random() > 0.8) {
        items.push({
            id: 'bonus-item',
            text: 'XP BÔNUS',
            type: 'BONUS',
            x: Math.random() * (this.canvas.width - ANSWER_WIDTH),
            y: -60,
            width: ANSWER_WIDTH,
            height: ANSWER_HEIGHT,
            speedY: 3.5,
            speedX: 0.08,
            amplitude: 4,
            creationTime: now,
            health: 1,
            maxHealth: 1
        });
    }

    this.answers = items;
    this.questionStartTime = Date.now();
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
    // Dano no Boss se ele estiver ativo
    const boss = this.aliens.find(a => a.type === 'CHEFÃO_CÓSMICO');
    if (boss) {
        boss.health -= 20; // Dano massivo por saber!
        this.createExplosion(boss.x + boss.width/2, boss.y + boss.height/2, '#ff3d71', 60);
        if (boss.health <= 0) {
            this.destroyAlien(boss); 
            this.alertText = 'CHEFÃO DERROTADO!';
            this.alertTimer = 120;
        }
    }
    this.score += 150 + (this.combo * 10);
    this.correctAnswers++;

    // Spawn de MESTRE após sequência
    if (this.correctAnswers % 3 === 0) {
        this.aliens.push({
            id: `mestre-${Date.now()}`,
            x: Math.random() * this.canvas.width, y: -50,
            width: ALIEN_WIDTH * 1.5, height: ALIEN_HEIGHT * 1.5,
            type: 'MESTRE', points: 300, speedY: 1.5, health: 5, maxHealth: 5
        });
        this.alertText = 'MESTRE CÓSMICO!';
        this.alertTimer = 60;
    }
    
    // SMART BOMB: Destruir todos os aliens comuns na tela!
    this.aliens.forEach(a => {
        if (a.type !== 'CHEFÃO_CÓSMICO' && a.type !== 'MESTRE') {
            this.createExplosion(a.x + a.width/2, a.y + a.height/2, '#00ffa3', 20);
            this.aliensDestroyed++;
            this.score += a.points;
        }
    });
    // Remove todos exceto Chefão e Mestre (que são persistentes)
    this.aliens = this.aliens.filter(a => a.type === 'CHEFÃO_CÓSMICO' || a.type === 'MESTRE');

    this.createExplosion(this.player.x + this.player.width/2, this.player.y, '#00ffa3', 40);
    this.flashAlpha = 0.5;
    this.alertText = 'ACERTOU! 🚀';
    this.alertTimer = 60;
    
    // Streak tracking
    this.currentStreak++;
    if (this.currentStreak > this.maxStreak) this.maxStreak = this.currentStreak;
    
    // Category tracking
    if (this.currentQuestion) {
      const cat = this.currentQuestion.category;
      this.correctAnswersByCategory[cat] = (this.correctAnswersByCategory[cat] || 0) + 1;
    }

    const responseTime = Date.now() - this.questionStartTime;
    this.onQuestionEnd(true, {
      question_id: this.currentQuestion?.id || '',
      choice: this.currentQuestion?.correct || '',
      responseTime,
      difficulty: this.currentQuestion?.level || 'Fácil'
    });
    
    this.state = 'MODO_COMBATE';
    this.currentQuestion = null;
    this.answers = [];
  }

  private handlePlayerHit(damage: number = 10) {
    // Reset de Combo no Dano
    if (this.combo > 5) {
        this.alertText = 'COMBO QUEBRADO!';
        this.alertTimer = 40;
    }
    this.combo = 0;
    this.updateComboPerks();

    if (this.shieldActive) {
        this.shieldHealth -= damage;
        this.screenShake = 8;
        this.flashAlpha = 0.1;
        this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#00e5ff', 5);
        
        if (this.shieldHealth <= 0) {
            this.shieldActive = false;
            this.shieldTimer = 0;
            this.screenShake = 20;
            this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#00e5ff', 30);
            this.alertText = 'ESCUDO DESTRUÍDO!';
            this.alertTimer = 40;
        }
        return;
    }

    this.player.lives--;
    this.combo = 0;
    this.currentStreak = 0; // Perde streak no dano
    this.isPerfectRun = false; // Perde perfect run no dano
    this.wrongAnswersHit++;
    this.screenShake = 25;
    this.flashAlpha = 0.5;
    // Vibrar no mobile
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    
    this.createExplosion(this.player.x + this.player.width/2, this.player.y, '#ff3d71', 30);
    if (this.player.lives <= 0) this.setGameOver();
  }

  private destroyAnswer(ans: AnswerItem, shot: boolean) {
    this.answers = this.answers.filter(a => a.id !== ans.id);
    if (shot) {
      this.score += 5;
      this.wrongAnswersDestroyed++;
      this.createExplosion(ans.x + ans.width/2, ans.y + ans.height/2, '#ffffff');

      // VITÓRIA IMEDIATA: Se não restarem mais respostas ERRADAS, o jogador venceu o desafio!
      if (this.state === 'MODO_DESAFIO') {
          const hasWrongs = this.answers.some(a => 
              a.type === 'ERRADA_COMUM' || 
              a.type === 'ERRADA_PERIGOSA' || 
              a.type === 'TRAP'
          );

          if (!hasWrongs) {
              this.collectCorrectAnswer();
          }
      }
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
      lives_remaining: Math.max(0, this.player.lives),
      is_perfect_run: this.isPerfectRun,
      correct_answers_by_category: this.correctAnswersByCategory,
      max_streak: this.maxStreak
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
    const bgColor = this.currentChapter?.palette.background || '#05070a';
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Efeito de Vinheta / Gradiente Radial
    const grad = this.ctx.createRadialGradient(
        this.canvas.width/2, this.canvas.height/2, 0,
        this.canvas.width/2, this.canvas.height/2, this.canvas.width
    );
    const secondaryColor = this.currentChapter?.palette.secondary || 'rgba(13, 13, 30, 0.5)';
    grad.addColorStop(0, secondaryColor);
    grad.addColorStop(1, bgColor);
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Glow do Modo Desafio
    if (this.challengeGlow > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = this.challengeGlow * 0.2;
        this.ctx.fillStyle = this.currentChapter?.palette.primary || '#00e5ff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    // Estrelas
    for (const s of this.stars) {
      this.ctx.fillStyle = s.color;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    if (this.state === 'START') return;

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

    // Challenge Mode Text
    if (this.state === 'MODO_DESAFIO' && this.challengeGlow > 0.5) {
        this.ctx.save();
        this.ctx.fillStyle = '#00ffa3';
        this.ctx.font = 'bold 24px "Orbitron"';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00ffa3';
        this.ctx.globalAlpha = 0.5 + Math.sin(this.frame * 0.1) * 0.3;
        this.ctx.fillText("PEGUE A RESPOSTA CORRETA", this.canvas.width/2, this.canvas.height/2 + 100);
        this.ctx.restore();
    }

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
    if (this.state === 'MODO_COMBATE' || this.state === 'MODO_DESAFIO' || this.state === 'START') {
        const flSize = 5 + Math.sin(this.frame * 0.5) * 8;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ff3d00';
        this.ctx.fillStyle = '#ff9100';
        this.ctx.beginPath();
        this.ctx.moveTo(x + width*0.3, y + height);
        this.ctx.lineTo(x + width*0.5, y + height + 15 + flSize);
        this.ctx.lineTo(x + width*0.7, y + height);
        this.ctx.fill();

        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.moveTo(x + width*0.4, y + height);
        this.ctx.lineTo(x + width*0.5, y + height + 8 + flSize*0.5);
        this.ctx.lineTo(x + width*0.6, y + height);
        this.ctx.fill();
    }

    // Aura de Combo
    if (this.combo >= 3) {
        this.ctx.save();
        const comboColor = this.combo >= 15 ? '#ffd600' : (this.combo >= 10 ? '#00ffa3' : '#00e5ff');
        this.ctx.shadowBlur = 10 + Math.sin(this.frame * 0.2) * 10;
        this.ctx.shadowColor = comboColor;
        this.ctx.strokeStyle = comboColor;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.6;
        
        // Asas de Energia
        this.ctx.beginPath();
        this.ctx.moveTo(x - 5, y + height);
        this.ctx.lineTo(x - 25, y + height + 10);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(x + width + 5, y + height);
        this.ctx.lineTo(x + width + 25, y + height + 10);
        this.ctx.stroke();
        
        if (this.combo >= 10) {
            this.ctx.beginPath();
            this.ctx.arc(x + width/2, y + height/2, width * 0.9, 0, Math.PI * 2);
            this.ctx.setLineDash([5, 10]);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    // Escudo Ativo
    if (this.shieldActive) {
        this.ctx.beginPath();
        this.ctx.arc(x + width/2, y + height/2, 50, 0, Math.PI * 2);
        this.ctx.lineWidth = 4;
        const shieldColor = this.currentChapter?.palette.primary || '#00e5ff';
        const gradient = this.ctx.createRadialGradient(
            x + width/2, y + height/2, 35,
            x + width/2, y + height/2, 55
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, shieldColor);
        this.ctx.strokeStyle = gradient;
        this.ctx.globalAlpha = 0.4 + Math.sin(this.frame / 5) * 0.2;
        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
    }

    // Corpo da Nave
    const primaryColor = this.currentChapter?.palette.primary || '#00e5ff';
    this.ctx.fillStyle = primaryColor;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = primaryColor;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x + width / 2, y); // Topo
    this.ctx.lineTo(x + width, y + height*0.8);
    this.ctx.lineTo(x + width*0.8, y + height);
    this.ctx.lineTo(x + width*0.2, y + height);
    this.ctx.lineTo(x, y + height*0.8);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.fillStyle = '#00838f';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height*0.6);
    this.ctx.lineTo(x - 10, y + height);
    this.ctx.lineTo(x + width*0.3, y + height);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(x + width, y + height*0.6);
    this.ctx.lineTo(x + width + 10, y + height);
    this.ctx.lineTo(x + width*0.7, y + height);
    this.ctx.fill();

    const cockpitGrad = this.ctx.createLinearGradient(x, y, x, y + height);
    cockpitGrad.addColorStop(0, '#ffffff');
    cockpitGrad.addColorStop(1, '#00e5ff');
    this.ctx.fillStyle = cockpitGrad;
    this.ctx.beginPath();
    this.ctx.ellipse(x + width/2, y + height*0.45, width*0.2, height*0.25, 0, 0, Math.PI*2);
    this.ctx.fill();
    
    // Antenas da Nave
    this.ctx.strokeStyle = '#00e5ff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x + width*0.2, y + height*0.2);
    this.ctx.lineTo(x + width*0.1, y - 5);
    this.ctx.moveTo(x + width*0.8, y + height*0.2);
    this.ctx.lineTo(x + width*0.9, y - 5);
    this.ctx.stroke();

  }


  private drawAlien(a: Alien) {
    const time = this.frame * 0.05;
    const hover = Math.sin(time + parseInt(a.id, 36)) * 5;
    
    this.ctx.save();
    this.ctx.translate(a.x + a.width / 2, a.y + a.height / 2 + hover);
    
    // Configurações Comuns de Estilo
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Efeito de Aura Alienígena
    this.ctx.shadowBlur = 10 + Math.sin(time * 2) * 5;
    
    if (a.type === 'CHEFÃO_CÓSMICO') {
        const glow = Math.sin(this.frame * 0.05) * 15 + 25;
        this.ctx.shadowBlur = glow;
        this.ctx.shadowColor = '#ff3d71';
        
        // Nave Mãe Orgânica
        const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
        grad.addColorStop(0, '#4a148c');
        grad.addColorStop(0.7, '#1a237e');
        grad.addColorStop(1, '#000000');
        this.ctx.fillStyle = grad;
        
        // Corpo principal (Forma de Água-Viva Espacial)
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 110, 50, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#ff3d71';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        
        // Tentáculos Orgânicos Pulsantes
        for(let i=0; i<8; i++) {
            const angle = (i * Math.PI / 4) + (time * 0.2);
            const tx = Math.cos(angle) * 85;
            const ty = Math.sin(angle) * 35 + 35;
            this.ctx.beginPath();
            this.ctx.moveTo(tx*0.6, ty*0.6);
            const wave = Math.sin(time*2 + i)*20;
            this.ctx.bezierCurveTo(tx*1.2, ty + wave, tx*0.5, ty + wave + 40, tx*1.1, ty + 60);
            this.ctx.strokeStyle = `rgba(255, 61, 113, ${0.3 + Math.sin(time+i)*0.4})`;
            this.ctx.lineWidth = 6 - (i % 3);
            this.ctx.stroke();
        }

        // Domo de Energia com Reflexos
        this.ctx.beginPath();
        this.ctx.arc(0, -20, 45, Math.PI, 0);
        const domeGrad = this.ctx.createLinearGradient(0, -65, 0, -20);
        domeGrad.addColorStop(0, 'rgba(255, 61, 113, 0.6)');
        domeGrad.addColorStop(1, 'rgba(255, 105, 180, 0.1)');
        this.ctx.fillStyle = domeGrad;
        this.ctx.fill();
        this.ctx.stroke();

        // Olho Central (Estilo Sauron Futurista)
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.ellipse(0, -22, 20, 10, 0, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.fillStyle = '#ff3d71';
        this.ctx.beginPath();
        this.ctx.arc(Math.sin(time*0.5)*8, -22, 5, 0, Math.PI*2);
        this.ctx.fill();
        
    } else if (a.type === 'MESTRE') {
        // Alien Cristalino / Geométrico
        const pulse = Math.sin(time * 2) * 8;
        this.ctx.shadowColor = '#aa00ff';
        this.ctx.shadowBlur = 25 + pulse;
        
        // Forma de Diamante Estilizada
        this.ctx.fillStyle = '#4a148c';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -35 - pulse);
        this.ctx.lineTo(25, 0);
        this.ctx.lineTo(0, 35 + pulse);
        this.ctx.lineTo(-25, 0);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#e040fb';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Fragmentos orbitando
        for(let i=0; i<3; i++) {
            const rot = time + (i * Math.PI*2/3);
            const ox = Math.cos(rot) * 40;
            const oy = Math.sin(rot) * 15;
            this.ctx.fillStyle = '#aa00ff';
            this.ctx.fillRect(ox-3, oy-3, 6, 6);
        }

    } else if (a.type === 'GUARDIAN') {
        // Escudo Bio-Mecânico
        this.ctx.shadowColor = '#00f2fe';
        this.ctx.shadowBlur = 20;
        
        // Carapaça Hexagonal
        this.ctx.fillStyle = '#01579b';
        this.ctx.beginPath();
        for(let i=0; i<6; i++) {
            const ang = i * Math.PI/3;
            const px = Math.cos(ang) * 25;
            const py = Math.sin(ang) * 25;
            if(i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#00f2fe';
        this.ctx.stroke();
        
        // Núcleo de Energia
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 10 + Math.sin(time*4)*2, 0, Math.PI*2);
        this.ctx.fill();

    } else if (a.type === 'CONFUSOR') {
        // Cérebro Alienígena
        this.ctx.shadowColor = '#ffd600';
        this.ctx.fillStyle = '#5d4037';
        
        // Lóbulos pulsantes
        const lPulse = Math.sin(time*2)*3;
        this.ctx.beginPath();
        this.ctx.arc(-12 - lPulse, -5, 18, 0, Math.PI*2);
        this.ctx.arc(12 + lPulse, -5, 18, 0, Math.PI*2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#ffd600';
        this.ctx.stroke();
        
        // Olhos múltiplos que piscam
        for(let i=0; i<4; i++) {
            const ex = -15 + i*10;
            const ey = 5 + Math.sin(time + i)*5;
            const blink = Math.sin(time*5 + i) > 0.8;
            this.ctx.fillStyle = blink ? '#000' : '#ffd600';
            this.ctx.beginPath();
            this.ctx.arc(ex, ey, 3, 0, Math.PI*2);
            this.ctx.fill();
        }

    } else if (a.type === 'EXPLORADOR') {
        // Insectoide Espacial
        this.ctx.shadowColor = '#00ffa3';
        this.ctx.fillStyle = '#1b5e20';
        
        // Cabeça e Pinças
        this.ctx.beginPath();
        this.ctx.moveTo(0, 25);
        this.ctx.lineTo(15, -15);
        this.ctx.quadraticCurveTo(0, -35, -15, -15);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Asas Neon em movimento rápido
        const wingY = Math.sin(time * 20) * 15;
        this.ctx.fillStyle = 'rgba(0, 255, 163, 0.5)';
        this.ctx.beginPath();
        this.ctx.ellipse(-18, -5, 25, 10 + wingY, Math.PI/6, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(18, -5, 25, 10 + wingY, -Math.PI/6, 0, Math.PI*2);
        this.ctx.fill();

    } else if (a.type === 'SHOOTER') {
        // Medusa Cibernética
        this.ctx.shadowColor = '#aa00ff';
        this.ctx.fillStyle = '#311b92';
        
        // Domo superior
        this.ctx.beginPath();
        this.ctx.arc(0, -15, 22, Math.PI, 0);
        this.ctx.fill();
        
        // Tentáculos mecânicos disparadores
        this.ctx.strokeStyle = '#aa00ff';
        this.ctx.lineWidth = 3;
        for(let i=0; i<4; i++) {
            const tx = -20 + i*13;
            const ty = 10 + Math.sin(time*3 + i)*12;
            this.ctx.beginPath();
            this.ctx.moveTo(tx, -10);
            this.ctx.lineTo(tx + Math.cos(time+i)*5, ty);
            this.ctx.stroke();
            
            // Pontas brilhantes
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(tx + Math.cos(time+i)*5, ty, 3, 0, Math.PI*2);
            this.ctx.fill();
        }
    } else {
        // Alien Básico / Genérico
        this.ctx.fillStyle = '#ff5722';
        this.ctx.shadowColor = '#ff5722';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, 0, Math.PI*2);
        this.ctx.fill();
        
        // Antenas básicas
        this.ctx.strokeStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.moveTo(-10, -15);
        this.ctx.lineTo(-15, -25 + Math.sin(time)*5);
        this.ctx.moveTo(10, -15);
        this.ctx.lineTo(15, -25 + Math.cos(time)*5);
        this.ctx.stroke();
    }
    
    this.ctx.restore();
  }


  private drawAnswer(ans: AnswerItem) {
    this.ctx.save();

    // Estilo baseado no tipo
    let glowColor = 'rgba(74, 144, 226, 0.5)';
    let label = '';

    switch(ans.type) {
        case 'CORRETA':
            glowColor = 'rgba(0, 242, 254, 0.6)';
            break;
        case 'ERRADA_PERIGOSA':
            glowColor = 'rgba(255, 61, 113, 0.8)';
            label = '⚠️';
            break;
        case 'TRAP':
            glowColor = 'rgba(0, 242, 254, 0.4)';
            break;
        case 'BONUS':
            glowColor = 'rgba(255, 214, 0, 0.8)';
            label = '⭐';
            break;
        case 'ERRADA_COMUM':
            glowColor = 'rgba(255, 255, 255, 0.2)';
            break;
    }

    // Glow Effect
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = glowColor;

    // Fundo da Resposta (Glassmorphism sutil)
    const isCorrect = ans.type === 'CORRETA';
    const pulse = isCorrect ? Math.sin(Date.now() / 200) * 10 + 10 : 0;
    
    if (isCorrect) {
        this.ctx.shadowBlur = 20 + pulse;
        this.ctx.strokeStyle = `rgba(0, 242, 254, ${0.5 + pulse/40})`;
        this.ctx.lineWidth = 2;
    }

    this.ctx.fillStyle = isCorrect ? 'rgba(0, 40, 60, 0.9)' : 'rgba(10, 15, 30, 0.8)';
    this.roundRect(ans.x, ans.y, ans.width, ans.height, 8);
    this.ctx.fill();
    if (isCorrect) this.ctx.stroke();
    
    // Arredondar bordas
    const radius = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(ans.x + radius, ans.y);
    this.ctx.lineTo(ans.x + ans.width - radius, ans.y);
    this.ctx.quadraticCurveTo(ans.x + ans.width, ans.y, ans.x + ans.width, ans.y + radius);
    this.ctx.lineTo(ans.x + ans.width, ans.y + ans.height - radius);
    this.ctx.quadraticCurveTo(ans.x + ans.width, ans.y + ans.height, ans.x + ans.width - radius, ans.y + ans.height);
    this.ctx.lineTo(ans.x + radius, ans.y + ans.height);
    this.ctx.quadraticCurveTo(ans.x, ans.y + ans.height, ans.x, ans.y + ans.height - radius);
    this.ctx.lineTo(ans.x, ans.y + radius);
    this.ctx.quadraticCurveTo(ans.x, ans.y, ans.x + radius, ans.y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Highlight sutil para a correta
    if (ans.type === 'CORRETA') {
        const pulse = Math.sin(this.frame * 0.1) * 3;
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + pulse * 0.1})`;
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    // Dano Visual (Rachaduras)
    if (ans.health < ans.maxHealth) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 1;
        const damagePct = (ans.maxHealth - ans.health) / ans.maxHealth;
        
        // Desenha "rachaduras" baseadas no id para serem consistentes
        const seed = ans.id.length; 
        for(let i=0; i < damagePct * 8; i++) {
            const rx = ((seed * (i+1)) % 100) / 100 * ans.width;
            const ry = ((seed * (i+5)) % 100) / 100 * ans.height;
            this.ctx.beginPath();
            this.ctx.moveTo(ans.x + rx, ans.y + ry);
            this.ctx.lineTo(ans.x + rx + 15, ans.y + ry + 15);
            this.ctx.stroke();
        }

        // Alerta de quase quebrando
        if (ans.health <= 2 && this.frame % 10 < 5) {
            this.ctx.fillStyle = 'rgba(255, 61, 113, 0.2)';
            this.roundRect(ans.x, ans.y, ans.width, ans.height, 8);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    // Texto da Resposta
    this.ctx.font = 'bold 20px Outfit, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Borda do texto para contraste máximo
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(ans.text, ans.x + ans.width / 2, ans.y + ans.height / 2);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(ans.text, ans.x + ans.width / 2, ans.y + ans.height / 2);
    
    // Truncar texto se for muito longo
    let displayText = ans.text;
    if (displayText.length > 25) displayText = displayText.substring(0, 22) + '...';
    
    this.ctx.fillText(displayText, ans.x + ans.width / 2, ans.y + ans.height / 2);

    // Renderizar Label (Ícone)
    if (label) {
        this.ctx.font = '14px serif';
        this.ctx.fillText(label, ans.x + ans.width - 15, ans.y + 15);
    }

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
