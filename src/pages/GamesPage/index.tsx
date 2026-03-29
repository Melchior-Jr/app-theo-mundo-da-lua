import { Link } from 'react-router-dom'
import StarField from '@/components/StarField'
import styles from './GamesPage.module.css'

export default function GamesPage() {
  const games = [
    { id: 'quiz', title: 'Quiz Espacial', icon: '🧠', desc: 'Teste tudo que aprendeu com o Théo!', path: '/quiz' },
    { id: 'jump', title: 'Pulo da Lua', icon: '🌑', desc: 'Pule o mais longe que conseguir no vácuo!', path: '#' },
    { id: 'hunt', title: 'Caça-Planetas', icon: '🔭', desc: 'Encontre os astros perdidos na galáxia!', path: '#' },
    { id: 'memory', title: 'Memória Galáctica', icon: '🧩', desc: 'Combine pares de planetas e estrelas!', path: '#' },
    { id: 'orbit', title: 'Órbita Desafio', icon: '🪐', desc: 'Mantenha os planetas em suas órbitas certas!', path: '#' },
    { id: 'puzzle', title: 'Quebra-Cabeça', icon: '⭐', desc: 'Monte as constelações mais famosas!', path: '#' },
  ]

  const leaderboard = [
    { rank: 1, name: 'Théo', score: 2500, medals: 12, emoji: '👦' },
    { rank: 2, name: 'Maria', score: 2420, medals: 10, emoji: '👧' },
    { rank: 3, name: 'João', score: 2380, medals: 9, emoji: '👶' },
    { rank: 4, name: 'Luna', score: 2300, medals: 8, emoji: '👩' },
    { rank: 5, name: 'Pedro', score: 2250, medals: 7, emoji: '👨' },
    { rank: 6, name: 'Gabriel', score: 2100, medals: 6, emoji: '👦' },
    { rank: 7, name: 'Sofia', score: 2050, medals: 5, emoji: '👧' },
    { rank: 8, name: 'Lucas', score: 1980, medals: 4, emoji: '👦' },
  ]

  return (
    <div className={styles.page}>
      <StarField />
      
      <div className={styles.container}>
        <header className={styles.header}>
          <Link to="/capitulos" className={styles.backButton}>← Voltar</Link>
          <div className={styles.headerInfo}>
            <span className={styles.label}>Estação de Entretenimento</span>
            <h1 className={styles.title}>Central de Jogos 🎮</h1>
          </div>
        </header>

        <main className={styles.mainGrid}>
          {/* Coluna da Esquerda: Grid de Jogos */}
          <section className={styles.gamesSection}>
            <div className={styles.sectionHeader}>
              <h2>Missões Disponíveis</h2>
              <p>Escolha um desafio e mostre que é um ás do espaço!</p>
            </div>
            
            <div className={styles.gamesGrid}>
              {games.map((game, idx) => (
                <Link 
                  key={game.id} 
                  to={game.path} 
                  className={styles.gameCard}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={styles.gameIcon}>{game.icon}</div>
                  <div className={styles.gameInfo}>
                    <h3>{game.title}</h3>
                    <p>{game.desc}</p>
                  </div>
                  {game.id === 'quiz' ? (
                    <span className={styles.playNow}>Jogar Agora</span>
                  ) : (
                    <span className={styles.comingSoon}>Breve</span>
                  )}
                  <div className={styles.cardGlow} />
                </Link>
              ))}
            </div>
          </section>

          {/* Coluna da Direita: Ranking Detalhado */}
          <aside className={styles.rankingSection}>
            <div className={styles.rankingCard}>
              <div className={styles.rankingHeader}>
                <div className={styles.rankingTitleGroup}>
                  <span className={styles.titleIcon}>✨</span>
                  <h2>Top Astronautas</h2>
                </div>
                <p>Hall da Fama · Turma 5º C</p>
              </div>

              <div className={styles.leaderboardList}>
                {leaderboard.map((user) => (
                  <div key={user.rank} className={styles.leaderboardItem}>
                    <div className={styles.rankBadge}>{user.rank}</div>
                    <div className={styles.userInfo}>
                      <span className={styles.userEmoji}>{user.emoji}</span>
                      <div className={styles.userDetails}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userStats}>🏅 {user.medals} Medalhas</span>
                      </div>
                    </div>
                    <div className={styles.userScore}>{user.score} pts</div>
                    {user.rank <= 3 && (
                      <div className={styles.podiumGlow} style={{'--rank-color': user.rank === 1 ? '#FFD166' : user.rank === 2 ? '#C0C0C0' : '#CD7F32'} as any} />
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.rankingFooter}>
                <p>Próxima atualização em: <strong>02:45:00</strong></p>
              </div>
            </div>
          </aside>
        </main>

        <footer className={styles.footer}>
          <p>© 2026 Théo no Mundo da Lua · Escola Arassuay Gomes de Castro</p>
        </footer>
      </div>
    </div>
  )
}
