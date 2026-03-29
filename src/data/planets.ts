export interface Planet {
  id: string
  name: string
  description: string
  funFact: string
  order: number
  color: string
  modelPath: string // URL para o arquivo .glb
  poster?: string // Imagem de fallback/carregamento
  narrationText?: string // Texto específico para fala individual do Théo
  // Novos dados técnicos para o Painel Premium
  temperature: string
  gravity: string
  distance: string
}

export const planets: Planet[] = [
  {
    id: 'mercurio',
    name: 'Mercúrio',
    description: 'O menor planeta e o mais próximo do Sol! Lá é tipo um deserto: de noite faz um frio congelante e de dia um calor escaldante!',
    funFact: 'Um dia em Mercúrio dura mais que um ano nele mesmo! Imagina o tamanho desses dias?',
    order: 1,
    color: '#a8a8a8',
    modelPath: '/3D Model/mercury_planet.glb',
    narrationText: 'E aí, astronauta! Conheça Mercúrio. Ele é o menorzinho do grupo e está bem colado no Sol. Por isso, ele corre muito rápido nas órbitas!',
    temperature: '430° a -180°C',
    gravity: '3.7 m/s²',
    distance: '58 Mi km'
  },
  {
    id: 'venus',
    name: 'Vênus',
    description: 'Vênus é o diferentão: gira ao contrário e mesmo não sendo o mais perto do Sol, é o mais quente de todos!',
    funFact: 'Lá chove ácido e faz um calor de fritar ovo na calçada! Sinceramente? Melhor nem ir!',
    order: 2,
    color: '#e0b57e',
    modelPath: '/3D Model/venus.glb',
    narrationText: 'Vênus é o planeta do brilho! Ele é tão quente que nem as naves conseguem ficar muito tempo lá. E olha que loucura: ele gira pro lado contrário da Terra!',
    temperature: '464°C',
    gravity: '8.9 m/s²',
    distance: '108 Mi km'
  },
  {
    id: 'terra',
    name: 'Terra',
    description: 'Nossa casa azul! O único lugar com vida que conhecemos... por enquanto né? 👾',
    funFact: 'Deveria se chamar Planeta Água, já que 70% dele é purinha onda!',
    order: 3,
    color: '#4b7bed',
    modelPath: '/3D Model/earth_new.glb',
    narrationText: 'Nossa casa, a Terra! Olhando daqui de cima, dá pra ver como ela é azul por causa dos oceanos. É o único planeta com vida que a gente conhece!',
    temperature: '15°C',
    gravity: '9.8 m/s²',
    distance: '150 Mi km'
  },
  {
    id: 'marte',
    name: 'Marte',
    description: 'Conhecido como o Planeta Vermelho... mas o solo lá é puro ferro enferrujado! 🔴',
    funFact: 'Lá em Marte tem o maior vulcão de todo o Sistema Solar: o Monte Olimpo! É gigante mesmo! 🌋',
    order: 4,
    color: '#d1492e',
    modelPath: '/3D Model/mars.glb',
    narrationText: 'O planeta vermelho! Marte parece um grande deserto de poeira enferrujada. Sabia que existem robôs lá agora mesmo explorando tudo?',
    temperature: '-65°C',
    gravity: '3.7 m/s²',
    distance: '228 Mi km'
  },
  {
    id: 'jupiter',
    name: 'Júpiter',
    description: 'O Gigantão! Ele é tão grande que todos os outros planetas caberiam dentro dele! 😳',
    funFact: 'Ele é o Robert Wadlow do Sistema Solar! É gigante, mas é todo feito de gás... nem tem chão!',
    order: 5,
    color: '#d4a373',
    modelPath: '/3D Model/jupiter.glb',
    narrationText: 'Júpiter é o grandão do sistema! Ele não tem chão firme, é feito de gás. Aquela mancha vermelha ali é uma tempestade maior que a Terra inteira!',
    temperature: '-110°C',
    gravity: '24.8 m/s²',
    distance: '778 Mi km'
  },
  {
    id: 'saturno',
    name: 'Saturno',
    description: 'O Senhor dos Anéis! É tão leve que se houvesse uma piscina gigante, ele boiaria nela! 💍',
    funFact: 'Saturno tem mais de 140 luas! Imagina ter que lembrar o nome de todas? Haja memória!',
    order: 6,
    color: '#e6c283',
    modelPath: '/3D Model/saturnov2.glb',
    narrationText: 'Olha esses anéis! Saturno é incrível. Esses anéis são feitos de gelo e poeira brilhando no espaço. Se a gente tivesse uma banheira gigante, ele boiaria!',
    temperature: '-140°C',
    gravity: '10.4 m/s²',
    distance: '1.4 Bi km'
  },
  {
    id: 'urano',
    name: 'Urano',
    description: 'Um gigante de gelo azul-clarinho... mas o diferencial é que ele gira "deitado"! 😳',
    funFact: 'Urano parece ter levado uma baita porrada há zilhões de anos, por isso ele rola no espaço!',
    order: 7,
    color: '#95d0e0',
    modelPath: '/3D Model/uranus.glb',
    narrationText: 'Urano é um gigante gelado e azul clarinho. O mais engraçado é que ele gira deitado, como se estivesse tirando uma soneca no espaço!',
    temperature: '-195°C',
    gravity: '8.7 m/s²',
    distance: '2.9 Bi km'
  },
  {
    id: 'netuno',
    name: 'Netuno',
    description: 'O último do rolê! Super azulão e o planeta mais longe de nosso Sol. 💙',
    funFact: 'Netuno tem ventos sinistros de 2.000 km/h! É o lugar mais "ventoso" do Sistema Solar!',
    order: 8,
    color: '#2a4ebf',
    modelPath: '/3D Model/neptune.glb',
    narrationText: 'Lá no finalzinho está Netuno, o azul profundo. Lá venta muito forte, mais que qualquer furacão na Terra. E dizem que chove diamantes lá dentro!',
    temperature: '-201°C',
    gravity: '11.1 m/s²',
    distance: '4.5 Bi km'
  }
]

export const getPlanetById = (id: string) => planets.find(p => p.id === id)

