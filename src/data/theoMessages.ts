export const THEO_MESSAGES = {
  intro: [
    "Fala, astronauta! Pronto para testar o que aprendemos nessa aventura?",
    "E aí, vamos mostrar que você entende tudo do espaço?",
    "Prepara o capacete, que agora o papo é sério!"
  ],
  success: [
    "Isso aí! Você é um verdadeiro gênio da astronomia! 🚀",
    "Acertou em cheio! Mirou na estrela e acertou o planeta! 😂",
    "Incrível! Fiquei até tonto com tanta inteligência!",
    "Boa! Essa foi nível astronauta da NASA!"
  ],
  error: [
    "Eita! Acho que um meteoro atrapalhou sua visão... Quase lá!",
    "Ops! Na próxima você acerta, não desiste!",
    "Quase! O telescópio deve estar meio sujo hoje... 😂",
    "Ih, essa passou raspando! Vamos tentar outra?",
    "Nossa bússola falhou, mas aprendi algo novo! Sabia que...",
    "Essa foi mais difícil que achar um urso no espaço! 🐻🚀",
    "Peraí... meu GPS galáctico confundiu os planetas! Tenta de novo!",
    "Erramos o alvo, mas a viagem continua! Aperte os cintos!"
  ],
  combo: [
    "Oxe! Tá pegando fogo! Já são {n} seguidas! 🔥",
    "Segura o Théo! Você está imparável!",
    "Uau! {n} acertos? Você comeu poeira de estrela no café da manhã? ⭐"
  ],
  gameOver: [
    "Ah não! Nossas vidas espaciais acabaram... mas não desanima!",
    "O motor pifou, mas a gente conserta e tenta de novo!",
    "Ficamos sem combustível, astronauta! Bora recarregar?"
  ],
  finished: [
    "MISSÃO CUMPRIDA! Você explorou tudo e aprendeu pra caramba!",
    "UAU! Estou orgulhoso! Você é o mestre do Sistema Solar!",
    "Parabéns! Já pode pilotar seu próprio foguete agora!"
  ]
}

export function getRandomMessage(type: keyof typeof THEO_MESSAGES, comboCount?: number) {
  const list = THEO_MESSAGES[type]
  let msg = list[Math.floor(Math.random() * list.length)]
  if (comboCount) {
    msg = msg.replace('{n}', comboCount.toString())
  }
  return msg
}
