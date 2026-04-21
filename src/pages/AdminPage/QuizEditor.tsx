import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Save, X, ArrowLeft, Mic, Play,
  Music, Volume2, Search, Filter,
  Rocket, Globe, Brain, Map, Sparkles, Gamepad2, Zap, Star,
  BookOpen, GraduationCap, School, Pencil, Languages, Binary, TestTube2, Microscope,
  Palette, Calculator, Thermometer, Telescope, Coins, Leaf, Sun, Moon, Cloud,
  Wind, Mountain, Waves, TreeDeciduous, Ghost, Skull, Crown, Heart, Smile,
  Trophy, Flag, Anchor, Hammer, Wrench, Lightbulb, Camera, Coffee, Atom, Dna,
  CheckCircle2, AlertCircle, Clock, Copy, Eye, EyeOff, ChevronRight, Lock
} from 'lucide-react';
import { ALL_QUIZ_DATA } from '@/data/quizQuestions';
import { QuizQuestion, QuizQuestionType } from '@/types/quiz';
import styles from './JourneyComposer.module.css';
import { AdminService } from '@/services/adminService';
import { Subject } from '@/services/subjectService';
import AudioEditorModal from '@/components/QuizSystem/AudioEditorModal';
import { useAudioAssets } from '@/context/AudioAssetsContext';


interface QuizEditorProps {
  onBack: () => void;
  defaultSubjectId?: string;
}

const QUESTION_TYPES: { value: QuizQuestionType; label: string }[] = [
  { value: 'multiple-choice', label: 'Múltipla Escolha' },
  { value: 'true-false', label: 'Verdadeiro ou Falso' },
  { value: 'drag-drop-order', label: 'Ordenar (Arrastar)' },
  { value: 'drag-drop-match', label: 'Associar (Arrastar)' },
  { value: 'image-id', label: 'Identificação por Imagem' },
  { value: 'fast-response', label: 'Resposta Rápida (Tempo)' },
  { value: 'fill-blanks', label: 'Preencher Lacunas' },
  { value: 'scene-selection', label: 'Seleção em Cena' },
  { value: 'audio-guess', label: 'Adivinhe o Áudio' },
  { value: 'logical-sequence', label: 'Sequência Lógica' },
];

const L_ICONS: Record<string, any> = {
  Rocket, Globe, Brain, Map, Sparkles, Gamepad2, Zap, Star,
  BookOpen, GraduationCap, School, Pencil, Languages, Binary, TestTube2, Microscope,
  Palette, Calculator, Thermometer, Telescope, Coins, Leaf, Sun, Moon, Cloud,
  Wind, Mountain, Waves, TreeDeciduous, Ghost, Skull, Crown, Heart, Smile,
  Trophy, Flag, Anchor, Hammer, Wrench, Lightbulb, Camera, Coffee, Atom, Dna,
  Music, CheckCircle2, AlertCircle, Clock
};

const SUBJECT_ICONS = [
  { icon: "🚀", tags: "foguete rocket espaco space voo sky" },
  { icon: "🌍", tags: "terra earth mundo world planeta planet geociencias" },
  { icon: "🪐", tags: "saturno saturn planeta planet espaco space" },
  { icon: "☀️", tags: "sol sun estrela star calor clima" },
  { icon: "🌙", tags: "lua moon noite night espaco space" },
  { icon: "✨", tags: "brilho sparkles magia magic novo" },
  { icon: "☄️", tags: "cometa comet espaco space meteoro" },
  { icon: "🛸", tags: "ovni ufo alien espaco space" },
  { icon: "🔭", tags: "telescopio telescope astronomia ver" },
  { icon: "🌌", tags: "galaxia galaxy via lactea espaco space" },
  { icon: "🛰️", tags: "satelite satellite tecnologia espaco" },
  { icon: "⚛️", tags: "atomo atom ciencia science fisica nuclear" },
  { icon: "🧬", tags: "dna biologia ciencia science vida" },
  { icon: "🧪", tags: "tubo ensaio quimica ciencia science" },
  { icon: "🔬", tags: "microscopio ciencia science laboratório" },
  { icon: "🌋", tags: "vulcao volcano geologia terra lava fogo" },
  { icon: "🏔️", tags: "montanha mountain neve gelo frio" },
  { icon: "🏜️", tags: "deserto desert areia calor" },
  { icon: "🌪️", tags: "tornado furacao vento clima" },
  { icon: "🌊", tags: "onda wave mar ocean agua water" },
  { icon: "🌧️", tags: "chuva rain agua water clima" },
  { icon: "🌈", tags: "arco-iris rainbow cores color" },
  { icon: "🌱", tags: "planta plant broto vida natureza" },
  { icon: "🌳", tags: "arvore tree natureza floresta" },
  { icon: "⚡", tags: "raio lightning energia power zap" },
  { icon: "🔥", tags: "fogo fire quente calor" },
  { icon: "🪨", tags: "pedra rock geologia terra" },
  { icon: "🪵", tags: "madeira wood natureza" },
  { icon: "💎", tags: "diamante diamond joia riqueza" },
  { icon: "🍃", tags: "folha leaf vento natureza" },
  { icon: "📚", tags: "livros books estudo escola aprender" },
  { icon: "🎓", tags: "formatura graduação escola universidade" },
  { icon: "✏️", tags: "lapis pencil desenho escrever" },
  { icon: "🖋️", tags: "caneta pen escrever" },
  { icon: "🎨", tags: "arte art pintura cores" },
  { icon: "🧠", tags: "cerebro brain inteligente mente" },
  { icon: "💡", tags: "ideia idea luz lampada" },
  { icon: "🧩", tags: "quebra-cabeça puzzle logica" },
  { icon: "📜", tags: "pergaminho scroll historia antigo" },
  { icon: "📂", tags: "pasta folder arquivos" },
  { icon: "📖", tags: "livro book leitura" },
  { icon: "🏫", tags: "escola school aprender" },
  { icon: "📏", tags: "regua ruler medida matematica" },
  { icon: "🎮", tags: "jogo game controle diversao" },
  { icon: "🕹️", tags: "joystick game arcade" },
  { icon: "🏆", tags: "trofeu trophy premio vitoria" },
  { icon: "🥇", tags: "medalha ouro primeiro vitoria" },
  { icon: "🎯", tags: "alvo target objetivo precisao" },
  { icon: "⭐", tags: "estrela star vitoria favorito" },
  { icon: "🌟", tags: "estrela star brilho" },
  { icon: "👑", tags: "coroa crown rei rainha vitoria" },
  { icon: "🎁", tags: "presente gift surpresa" },
  { icon: "🔔", tags: "sino bell alerta notificacao" },
  { icon: "💰", tags: "dinheiro money riqueza moedas" },
  { icon: "🧭", tags: "bussola compass direcao aventura" },
  { icon: "🛡️", tags: "escudo shield protecao defesa" },
  { icon: "🏹", tags: "arco flecha alvo aventura" },
  { icon: "🔑", tags: "chave key segredo acesso" },
  { icon: "🔍", tags: "lupa search buscar encontrar" },
  { icon: "🕰️", tags: "relogio clock tempo antigo" },
  { icon: "⚓", tags: "ancora anchor mar navio" },
  { icon: "🗺️", tags: "mapa map viagem aventura" },
  { icon: "🦜", tags: "papagaio parrot passaro animal" },
  { icon: "🦖", tags: "dinossauro dino t-rex" },
  { icon: "🦕", tags: "dinossauro dino" },
  { icon: "🐘", tags: "elefante elephant animal" },
  { icon: "🦁", tags: "leao lion animal rei" },
  { icon: "🐳", tags: "baleia whale mar animal" },
  { icon: "🦅", tags: "aguia eagle passaro voador" },
  { icon: "❤️", tags: "coracao heart amor love" },
  { icon: "🍀", tags: "trevo clover sorte lucky" },
  { icon: "👻", tags: "fantasma ghost medo assustador" },
  { icon: "💀", tags: "caveira skull perigo" },
  { icon: "🤖", tags: "robo robot tecnologia" },
  { icon: "📟", tags: "pager tecnologia antigo" },
  { icon: "📸", tags: "camera foto fotografia" },
  { icon: "☕", tags: "cafe coffee bebida" },
  { icon: "🍿", tags: "pipoca popcorn cinema" },
  { icon: "🍔", tags: "hamburguer burger comida" },
  { icon: "🍕", tags: "pizza comida" },
  { icon: "🚲", tags: "bicicleta bike esporte" },
  { icon: "🏠", tags: "casa house lar" },
  { icon: "🏙️", tags: "cidade city predios" },
  { icon: "🌉", tags: "ponte bridge cidade" },
  { icon: "🎈", tags: "balao balloon festa" },
  { icon: "🎭", tags: "teatro theater artes" },
  { icon: "🎪", tags: "circo circus diversao" },
  { icon: "🎸", tags: "guitarra violao musica" },
  { icon: "🎧", tags: "fone musica audio" },
  { icon: "🐯", tags: "tigre tiger animal" },
  { icon: "🐨", tags: "coala animal" },
  { icon: "🐼", tags: "panda animal" },
  { icon: "🐰", tags: "coelho rabbit animal" },
  { icon: "🦊", tags: "raposa fox animal" },
  { icon: "🐢", tags: "tartaruga turtle animal" },
  { icon: "🐙", tags: "polvo octopus mar animal" },
  { icon: "🦈", tags: "tubarao shark mar" },
  { icon: "🦓", tags: "zebra animal" },
  { icon: "🦍", tags: "gorila animal" },
  { icon: "🦘", tags: "canguru animal" },
  { icon: "🦥", tags: "preguica bicho animal" },
  { icon: "🦦", tags: "lontra animal" },
  { icon: "🦔", tags: "ouriço hedgehog animal" },
  { icon: "🦇", tags: "morcego bat animal" },
  { icon: "🐉", tags: "dragao dragon mito" },
  { icon: "🦒", tags: "girafa giraffe animal" },
  { icon: "🐆", tags: "leopardo animal" },
  { icon: "🐊", tags: "jacare animal" },
  { icon: "🦉", tags: "coruja owl passaro" },
  { icon: "🦄", tags: "unicornio mito" },
  { icon: "🦋", tags: "borboleta butterfly" },
  { icon: "🐝", tags: "abelha bee" },
  { icon: "🐛", tags: "lagarta bug" },
  { icon: "🐞", tags: "joaninha ladybug" },
  { icon: "🐟", tags: "peixe fish" },
  { icon: "🍄", tags: "cogumelo mushroom" },
  { icon: "🌻", tags: "girassol flower sol" },
  { icon: "🌵", tags: "cacto desert" },
  { icon: "🌴", tags: "palmeira tropical" },
  { icon: "🍊", tags: "fruta fruit vitamina" },
  { icon: "🍎", tags: "maca apple fruit" },
  { icon: "🍓", tags: "morango fruit" },
  { icon: "🍉", tags: "melancia fruit" },
  { icon: "🍦", tags: "sorvete icecream doce" },
  { icon: "🧁", tags: "cupcake doce" },
  { icon: "🍩", tags: "donut doce" },
  { icon: "🍪", tags: "biscoito cookie" },
  { icon: "⚽", tags: "futebol esporte ball" },
  { icon: "🏀", tags: "basquete esporte ball" },
  { icon: "🎾", tags: "tenis esporte ball" },
  { icon: "🛹", tags: "skate esporte" },
  { icon: "🚠", tags: "teleferico viagem" },
  { icon: "✈️", tags: "aviao plane viagem" },
  { icon: "🚜", tags: "trator fazenda" },
  { icon: "🚁", tags: "helicoptero" },
  { icon: "🛰️", tags: "satelite" },
  { icon: "🚧", tags: "obras construcao" },
  { icon: "🧨", tags: "dinamite explosao" },
  { icon: "🪁", tags: "pipa vento" },
  { icon: "🧸", tags: "ursinho brinquedo" },
  { icon: "🪀", tags: "ioio brinquedo" },
  { icon: "🔮", tags: "cristal futuro" },
  { icon: "🧼", tags: "sabao limpeza" },
  { icon: "🧺", tags: "cesta mercado" },
  { icon: "🚗", tags: "carro viagem estrada" },
  { icon: "🚂", tags: "trem ferrovia viagem" },
  { icon: "🚢", tags: "navio mar viagem" },
  { icon: "🚤", tags: "lancha mar agua" },
  { icon: "🚲", tags: "bike bicicleta esporte" },
  { icon: "🛵", tags: "moto motorizada" },
  { icon: "🛶", tags: "caiaque rio agua" },
  { icon: "🥨", tags: "comida" },
  { icon: "🧇", tags: "waffle doce cafe" },
  { icon: "🥞", tags: "panqueca doce cafe" },
  { icon: "🧈", tags: "manteiga" },
  { icon: "🌭", tags: "hotdog comida" },
  { icon: "🍗", tags: "frango comida" },
  { icon: "🥩", tags: "carne comida" },
  { icon: "🥓", tags: "bacon comida" },
  { icon: "🍣", tags: "sushi japa comida" },
  { icon: "🎂", tags: "bolo cake festa aniversario" },
  { icon: "🥧", tags: "torta doce" },
  { icon: "🍫", tags: "chocolate doce" },
  { icon: "🍬", tags: "bala doce" },
  { icon: "🍭", tags: "pirulito doce" },
  { icon: "🍮", tags: "pudim doce" },
  { icon: "🍯", tags: "mel honey" },
  { icon: "🧶", tags: "la trico" },
  { icon: "🧵", tags: "linha costura" },
  { icon: "🧷", tags: "alfinete" },
  { icon: "🧹", tags: "vassoura limpeza" },
  { icon: "🧻", tags: "papel" },
  { icon: "🪠", tags: "desentupidor" },
  { icon: "🪣", tags: "balde" },
  { icon: "🪥", tags: "escova" },
  { icon: "🪑", tags: "cadeira movel" },
  { icon: "🛋️", tags: "sofa movel" },
  { icon: "🛌", tags: "cama sono" },
  { icon: "🛍️", tags: "compras sacola" },
  { icon: "🛒", tags: "carrinho mercado" },
  { icon: "🎁", tags: "presente surpresa" },
  { icon: "🎊", tags: "festa celebrar" },
  { icon: "🎉", tags: "festa party" },
  { icon: "🎈", tags: "balao balloon" },
  { icon: "🧨", tags: "fogos explosao" },
  { icon: "🧧", tags: "envelope sorte" },
  { icon: "🪀", tags: "ioio" },
  { icon: "🪁", tags: "pipa" },
  { icon: "♟️", tags: "xadrez jogo" },
  { icon: "🧩", tags: "quebra-cabeca" },
  { icon: "🎨", tags: "paleta arte" },
  { icon: "🧵", tags: "costura" },
  { icon: "🧶", tags: "trico" },
  { icon: "🎻", tags: "violin musica" },
  { icon: "🎺", tags: "trompete musica" },
  { icon: "🎸", tags: "guitarra musica" },
  { icon: "🎹", tags: "piano musica" }
];

const RenderIcon = ({ name, size = 20 }: { name: string, size?: number }) => {
  if (!name) return null;
  if (name.length <= 4 && /\p{Emoji}/u.test(name)) {
    return <span style={{ fontSize: `${size}px`, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{name}</span>;
  }
  const IconComp = L_ICONS[name] || L_ICONS.Rocket;
  return <IconComp size={size} />;
};

const QuizEditor: React.FC<QuizEditorProps> = ({ onBack, defaultSubjectId }) => {
  const [editorDepth, setEditorDepth] = useState<'quiz' | 'mission' | 'questions' | 'audios'>('quiz');
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [activeChallenge, setActiveChallenge] = useState<number>(1);
  
  const { refreshAssets: refreshGlobalAudios } = useAudioAssets();
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const [selectedSubject, setSelectedSubject] = useState<'astronomy' | 'geosciences'>('astronomy');
  const [selectedSubjectData, setSelectedSubjectData] = useState<Subject | null>(null);
  
  const [systemAudios, setSystemAudios] = useState<any[]>([]);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [currentEditingAudio, setCurrentEditingAudio] = useState<any>(null);

  
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isMissionIconPickerOpen, setIsMissionIconPickerOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const iconPickerRef = useRef<HTMLDivElement>(null);
  const missionIconPickerRef = useRef<HTMLDivElement>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  
  const [audioToEdit, setAudioToEdit] = useState<{
    blob?: Blob;
    id: string;
    field: 'audio' | 'explanationAudio';
    originalName: string;
    subtitle?: string;
  } | null>(null);
  
  const [quizMetadata, setQuizMetadata] = useState<any>({
    missions: [],
    globalNarration: true,
    blockedPlayers: [],
    isVisible: true,
    icon: '🚀',
    theme_color: '#00e5ff'
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
        setIsIconPickerOpen(false);
      }
      if (missionIconPickerRef.current && !missionIconPickerRef.current.contains(event.target as Node)) {
        setIsMissionIconPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [dbQuestions, subjectsData, playersData, audioAssets] = await Promise.all([
          AdminService.getQuizQuestions(),
          AdminService.getSubjects(),
          AdminService.getPlayersList(),
          AdminService.getQuizAudioAssets()
        ]);
        
        setSubjects(subjectsData);
        setPlayers(playersData);
        setSystemAudios(audioAssets);


        const localData = JSON.parse(JSON.stringify(ALL_QUIZ_DATA));
        let merged = [...localData];
        if (dbQuestions && dbQuestions.length > 0) {
          dbQuestions.forEach(dbQ => {
            const idx = merged.findIndex(q => q.id === dbQ.id);
            if (idx !== -1) merged[idx] = dbQ;
            else merged.push(dbQ);
          });
        }
        setQuestions(merged);
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (defaultSubjectId && subjects.length > 0) {
      const subj = subjects.find(s => s.id === defaultSubjectId);
      if (subj) {
        setSelectedSubjectData(subj);
        setSelectedSubject(subj.slug === 'geociencias' ? 'geosciences' : 'astronomy');
        
        const rawConfig = subj.config;
        const config = typeof rawConfig === 'string' ? (rawConfig ? JSON.parse(rawConfig) : {}) : (rawConfig || {});
        
        if (config && config.missions && config.missions.length > 0) {
          setQuizMetadata({
            missions: config.missions,
            globalNarration: config.globalNarration !== undefined ? config.globalNarration : true,
            blockedPlayers: config.blockedPlayers || [],
            isVisible: config.isVisible !== undefined ? config.isVisible : true,
            icon: subj.icon || '🚀',
            theme_color: subj.theme_color || '#00e5ff'
          });
        } else {
          const relevantQuestions = questions.filter(q => 
            (q.subject || 'astronomy') === (subj.slug === 'geociencias' ? 'geosciences' : 'astronomy')
          );
          const maxLevel = Math.max(...relevantQuestions.map(q => q.level), 0) || 5;
          const initialMissions = Array.from({ length: maxLevel }, (_, i) => ({
            id: `mi-${Date.now()}-${i}`,
            level: i + 1,
            name: `Missão ${i + 1}`,
            desc: 'Desbrave novos mistérios nesta missão galáctica!',
            icon: '🚀',
            color: subj.theme_color || '#00e5ff',
            challengesCount: 4,
            visible: true
          }));
          setQuizMetadata({
            missions: initialMissions,
            globalNarration: true,
            blockedPlayers: [],
            isVisible: true,
            icon: subj.icon || '🚀',
            theme_color: subj.theme_color || '#00e5ff'
          });
        }
      }
    }
  }, [defaultSubjectId, subjects, questions]);

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const handleFileUpload = async (id: string, field: 'audio' | 'explanationAudio', file: File) => {
    if (!file.name.includes('_edited_')) {
      setAudioToEdit({
        blob: file,
        id,
        field,
        originalName: file.name
      });
      return;
    }

    try {
      const fileName = file.name;
      const result = await AdminService.uploadFile('quiz-assets', `narration/${fileName}`, file);
      
      if (typeof result === 'string') {
        updateQuestion(id, { [field]: result });
      } else {
        alert("Erro no upload do áudio.");
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleRequestAudioEdit = async (id: string, field: 'audio' | 'explanationAudio', currentUrl?: string) => {
    const question = questions.find(q => q.id === id);
    const subtitle = field === 'audio' ? question?.question : question?.explanation;

    if (currentUrl) {
      setRecordingId(`${id}_${field}_loading`);
      try {
        const response = await fetch(currentUrl);
        const blob = await response.blob();
        setAudioToEdit({
          blob,
          id,
          field,
          originalName: currentUrl.split('/').pop() || 'audio.wav',
          subtitle
        });
      } catch (error) {
        console.error('Error fetching audio for editing:', error);
        setAudioToEdit({
          id,
          field,
          originalName: 'audio.wav',
          subtitle
        });
      } finally {
        setRecordingId(null);
      }
    } else {
      setAudioToEdit({
        id,
        field,
        originalName: 'new_audio.wav',
        subtitle
      });
    }
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q_new_${Date.now()}`,
      subject: selectedSubject,
      level: activeLevel,
      challenge: activeChallenge,
      type: 'multiple-choice',
      question: 'Nova pergunta...',
      options: ['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4'],
      correctAnswer: 'Opção 1',
      explanation: 'Explicação...',
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (window.confirm("Deseja realmente excluir esta pergunta?")) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const duplicateMission = (level: number) => {
    const mission = quizMetadata.missions.find((m: any) => m.level === level);
    if (!mission) return;

    const newLevel = quizMetadata.missions.length + 1;
    const newMission = {
      ...mission,
      id: `mi-copy-${Date.now()}`,
      level: newLevel,
      name: `${mission.name} (Cópia)`
    };

    setQuizMetadata((prev: any) => ({
      ...prev,
      missions: [...prev.missions, newMission]
    }));
  };

  const deleteMission = (level: number) => {
    if (!confirm('Excluir esta missão?')) return;
    
    setQuizMetadata((prev: any) => {
      const updatedMissions = prev.missions
        .filter((m: any) => m.level !== level)
        .map((m: any, idx: number) => ({ ...m, level: idx + 1 }));
        
      return { ...prev, missions: updatedMissions };
    });
    setEditorDepth('quiz');
  };

  const toggleMissionVisibility = (level: number) => {
    setQuizMetadata((prev: any) => ({
      ...prev,
      missions: prev.missions.map((m: any) => 
        m.level === level ? { ...m, visible: !m.visible } : m
      )
    }));
  };

  const addMission = () => {
    const newLevel = quizMetadata.missions.length + 1;
    const newMission = {
      id: `mi-new-${Date.now()}`,
      level: newLevel,
      name: `MISSÃO ${newLevel}`,
      desc: `Nome da Missão ${newLevel}`,
      icon: '🚀',
      color: quizMetadata.theme_color || '#00e5ff',
      challengesCount: 3,
      visible: true
    };

    setQuizMetadata((prev: any) => ({
      ...prev,
      missions: [...prev.missions, newMission]
    }));
  };

  const handleSaveToCloud = async () => {
    try {
      setIsSaving(true);
      await AdminService.saveQuizQuestions(questions);
      
      if (selectedSubjectData) {
        const { created_at, updated_at, ...cleanSubject } = selectedSubjectData as any;
        const payload = {
          ...cleanSubject,
          icon: quizMetadata.icon,
          theme_color: quizMetadata.theme_color,
          config: {
            missions: quizMetadata.missions,
            globalNarration: quizMetadata.globalNarration,
            blockedPlayers: quizMetadata.blockedPlayers,
            isVisible: quizMetadata.isVisible
          }
        };

        await AdminService.upsertSubject(payload);
      }

      alert("✅ Salvo com sucesso!");
    } catch (e: any) {
      console.error('Erro ao salvar:', e);
      alert(`❌ Erro: ${e.message || "Ocorreu um erro inesperado."}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderQuizDepth = () => (
    <div className={styles.editorContainer}>
      <div className={styles.editorSection}>
        <h3 className={styles.sectionTitle}><Globe size={20} color="#00e5ff" /> Configurações Gerais</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formGroupLabel}>Nome do Quiz</label>
            <input 
              className={styles.input} 
              value={(selectedSubjectData?.name || '').split('|')[0].trim()} 
              onChange={(e) => {
                const newTitle = e.target.value;
                setSelectedSubjectData(prev => {
                  if (!prev) return null;
                  const parts = prev.name.split('|');
                  const newName = parts.length > 1 ? `${newTitle} | ${parts[1].trim()}` : newTitle;
                  return { ...prev, name: newName };
                });
              }}
            />
          </div>

          <div className={styles.formGroup} style={{ position: 'relative' }} ref={iconPickerRef}>
            <label className={styles.formGroupLabel}>Ícone do Quiz</label>
            <button 
              onClick={() => { setIsIconPickerOpen(!isIconPickerOpen); setIconSearch(''); }}
              className={styles.input}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 229, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00e5ff'
              }}>
                <RenderIcon name={quizMetadata.icon || '🚀'} size={22} />
              </div>
              <span style={{ flex: 1, opacity: 0.8 }}>{quizMetadata.icon || '🚀'}</span>
              <ChevronRight size={16} style={{ 
                transform: isIconPickerOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                opacity: 0.5
              }} />
            </button>

            {isIconPickerOpen && (
              <div style={{ 
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                background: '#1a1a2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '16px',
                zIndex: 1000,
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                maxHeight: '350px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                  <input 
                    autoFocus
                    placeholder="Buscar ícone..."
                    value={iconSearch}
                    onChange={e => setIconSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(45px, 1fr))',
                  gap: '8px',
                  overflowY: 'auto',
                  maxHeight: '250px',
                  paddingRight: '4px'
                }}>
                  {SUBJECT_ICONS.filter(item => 
                    !iconSearch || 
                    item.tags.toLowerCase().includes(iconSearch.toLowerCase()) ||
                    item.icon.includes(iconSearch)
                  ).map(({ icon: name }) => (
                    <button 
                      key={name}
                      onClick={() => {
                        setQuizMetadata((prev: any) => ({ ...prev, icon: name }));
                        setIsIconPickerOpen(false);
                        setIconSearch('');
                      }}
                      style={{
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: (quizMetadata.icon || '🚀') === name ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: '1px solid',
                        borderColor: (quizMetadata.icon || '🚀') === name ? '#00e5ff' : 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '1.4rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {name}
                    </button>
                  ))}
                  {SUBJECT_ICONS.filter(item => 
                    !iconSearch || 
                    item.tags.toLowerCase().includes(iconSearch.toLowerCase()) ||
                    item.icon.includes(iconSearch)
                  ).length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', opacity: 0.5, fontSize: '0.8rem' }}>
                      Nenhum ícone encontrado
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formGroupLabel}>Cor do Tema</label>
            <input 
              type="color"
              className={styles.input}
              value={quizMetadata.theme_color || '#00e5ff'}
              onChange={e => setQuizMetadata((prev: any) => ({ ...prev, theme_color: e.target.value }))}
              style={{ height: '45px', padding: '4px' }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formGroupLabel}>Visibilidade Global</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={quizMetadata.isVisible ? styles.primaryBtn : styles.secondaryBtn}
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: quizMetadata.isVisible ? 'rgba(34, 197, 94, 0.15)' : 'rgba(0,0,0,0.2)', color: quizMetadata.isVisible ? '#4ade80' : 'rgba(255,255,255,0.5)', border: quizMetadata.isVisible ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255,255,255,0.06)' }}
                onClick={() => setQuizMetadata((prev: any) => ({ ...prev, isVisible: true }))}
              >
                Visível
              </button>
              <button 
                className={!quizMetadata.isVisible ? styles.primaryBtn : styles.secondaryBtn}
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: !quizMetadata.isVisible ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0,0,0,0.2)', color: !quizMetadata.isVisible ? '#f87171' : 'rgba(255,255,255,0.5)', border: !quizMetadata.isVisible ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.06)' }}
                onClick={() => setQuizMetadata((prev: any) => ({ ...prev, isVisible: false }))}
              >
                Oculto
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
             <label className={styles.formGroupLabel}>Áudios do Théo</label>
             <button 
               className={styles.secondaryBtn}
               style={{ width: '100%', justifyContent: 'start', gap: '10px', padding: '12px', border: '1px solid rgba(0, 229, 255, 0.3)', background: 'rgba(0, 229, 255, 0.05)' }}
               onClick={() => setEditorDepth('audios')}
             >
               <Music size={18} color="#00e5ff" />
               <span style={{ flex: 1, textAlign: 'left' }}>Gerenciar áudios (hit, erro, combos...)</span>
               <ChevronRight size={16} opacity={0.5} />
             </button>
          </div>
        </div>
      </div>


      <div className={styles.editorSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className={styles.sectionTitle} style={{ margin: 0 }}><Map size={20} color="#00e5ff" /> Missões Disponíveis</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>QTD:</span>
            <input 
              type="number" 
              className={styles.noneInput} 
              style={{ width: '30px', fontWeight: 'bold', textAlign: 'center' }}
              value={quizMetadata.missions.length}
              readOnly
            />
            <button className={styles.iconBtn} onClick={addMission} title="Adicionar Missão" style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff', padding: '2px', borderRadius: '4px' }}>
                <Plus size={14} />
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {quizMetadata.missions.map((m: any, idx: number) => {
            const isHidden = m.visible === false;
            return (
              <div 
                key={m.id || m.level} 
                className={`${styles.missionCard} ${isHidden ? styles.cardInactive : ''}`} 
                onClick={() => { setActiveLevel(m.level); setEditorDepth('mission'); }}
              >
                <div className={styles.missionIcon} style={{ opacity: isHidden ? 0.4 : 1, background: m.color || quizMetadata.theme_color || '#00e5ff' }}>
                  <RenderIcon name={m.icon || '🚀'} size={24} />
                </div>
                <div className={styles.missionInfo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className={styles.missionLevel}>{m.name || `MISSÃO ${idx + 1}`}</span>
                  </div>
                  <span className={styles.missionName} style={{ opacity: isHidden ? 0.5 : 1 }}>{m.desc || 'Sem Nome'}</span>
                  <span className={styles.missionMeta}>{m.challengesCount} desafios {isHidden && '• OCULTO'}</span>
                </div>
                
                <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                  <button className={styles.iconBtn} onClick={() => toggleMissionVisibility(m.level)} title={isHidden ? "Mostrar" : "Ocultar"}>
                    {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button className={styles.iconBtn} onClick={() => duplicateMission(m.level)} title="Duplicar">
                    <Copy size={16} />
                  </button>
                  <button className={styles.iconBtn} onClick={() => deleteMission(m.level)} title="Excluir" style={{ color: '#ff4b4b' }}>
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className={styles.missionArrow} />
                </div>
              </div>
            );
          })}
          <button className={styles.addBtn} onClick={addMission} style={{ margin: 0, height: '100%', minHeight: '80px' }}>
              <Plus size={18} /> Adicionar Missão
          </button>
        </div>
      </div>

      <div className={styles.editorSection}>
        <h3 className={styles.sectionTitle}><Lock size={20} color="#ef4444" /> Bloqueio de Acesso</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {quizMetadata.blockedPlayers.map((pid: string) => (
            <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>
              <span>{players.find(p => p.id === pid)?.username || pid}</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setQuizMetadata((prev: any) => ({ ...prev, blockedPlayers: prev.blockedPlayers.filter((id: string) => id !== pid) }))} />
            </div>
          ))}
        </div>
        <select 
          className={styles.input}
          onChange={(e) => {
            const val = e.target.value;
            if (val && !quizMetadata.blockedPlayers.includes(val)) {
              setQuizMetadata((prev: any) => ({ ...prev, blockedPlayers: [...prev.blockedPlayers, val] }));
            }
          }}
        >
          <option value="">Bloquear aluno específicos...</option>
          {players.filter(p => !quizMetadata.blockedPlayers.includes(p.id)).map(p => (
            <option key={p.id} value={p.id}>{p.username}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderMissionDepth = () => {
    const mission = quizMetadata.missions.find((m: any) => m.level === activeLevel);
    if (!mission) return null;

    return (
      <div className={styles.editorContainer}>
        <div className={styles.editorSection}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <button className={styles.secondaryBtn} onClick={() => setEditorDepth('quiz')} style={{ padding: '8px' }}>
              <ArrowLeft size={18} />
            </button>
            <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Editando Missão {activeLevel}</h3>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label className={styles.formGroupLabel}>Etiqueta da Missão (Tag Superior)</label>
              <input 
                className={styles.input} 
                value={mission.name}
                placeholder="Ex: MISSÃO 1"
                onChange={(e) => setQuizMetadata((prev: any) => ({
                  ...prev,
                  missions: prev.missions.map((m: any) => m.level === activeLevel ? { ...m, name: e.target.value } : m)
                }))}
              />
            </div>
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label className={styles.formGroupLabel}>Nome da Missão (Título Lateral)</label>
              <textarea 
                className={styles.input} 
                style={{ minHeight: '60px', paddingTop: '12px', resize: 'vertical' }}
                value={mission.desc || ''}
                placeholder="Ex: Camadas da Terra"
                onChange={(e) => setQuizMetadata((prev: any) => ({
                  ...prev,
                  missions: prev.missions.map((m: any) => m.level === activeLevel ? { ...m, desc: e.target.value } : m)
                }))}
              />
            </div>
            
            <div className={styles.formGroup} style={{ gridColumn: 'span 2', marginTop: '10px' }}>
              <label className={styles.formGroupLabel} style={{ display: 'block', marginBottom: '12px', opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Preview na Página do Quiz
              </label>
              <div style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '24px', 
                borderRadius: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '12px',
                border: '1px dashed rgba(255,255,255,0.1)'
              }}>
                <div style={{ 
                  width: '70px', 
                  height: '70px', 
                  borderRadius: '18px', 
                  background: mission.color || quizMetadata.theme_color || '#00e5ff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {mission.icon || '🚀'}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    background: mission.color || quizMetadata.theme_color || '#00e5ff', 
                    color: '#000', 
                    fontSize: '0.65rem', 
                    fontWeight: 800, 
                    padding: '3px 12px', 
                    borderRadius: '8px', 
                    display: 'inline-block',
                    marginBottom: '6px'
                  }}>
                    {mission.name || `MISSÃO ${mission.level}`}
                  </div>
                  <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>{mission.desc || 'Sem Nome'}</div>
                </div>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formGroupLabel}>Cor Tema da Missão</label>
              <div style={{ display: 'flex', gap: '8px', height: '48px' }}>
                <input 
                  type="color" 
                  style={{ width: '48px', height: '100%', padding: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer' }}
                  value={mission.color || quizMetadata.theme_color || '#00e5ff'}
                  onChange={(e) => setQuizMetadata((prev: any) => ({
                    ...prev,
                    missions: prev.missions.map((m: any) => m.level === activeLevel ? { ...m, color: e.target.value } : m)
                  }))}
                />
                <input 
                  type="text" 
                  className={styles.input} 
                  style={{ flex: 1, fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase' }}
                  value={mission.color || quizMetadata.theme_color || '#00e5ff'}
                  onChange={(e) => setQuizMetadata((prev: any) => ({
                    ...prev,
                    missions: prev.missions.map((m: any) => m.level === activeLevel ? { ...m, color: e.target.value } : m)
                  }))}
                />
              </div>
            </div>

            <div className={styles.formGroup} style={{ position: 'relative' }} ref={missionIconPickerRef}>
              <label className={styles.formGroupLabel}>Ícone da Missão</label>
              <button 
                onClick={() => { setIsMissionIconPickerOpen(!isMissionIconPickerOpen); setIconSearch(''); }}
                className={styles.input}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(0, 229, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00e5ff'
                }}>
                  <RenderIcon name={mission.icon || '🚀'} size={22} />
                </div>
                <span style={{ flex: 1, opacity: 0.8 }}>{mission.icon || '🚀'}</span>
                <ChevronRight size={16} style={{ 
                  transform: isMissionIconPickerOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  opacity: 0.5
                }} />
              </button>

              {isMissionIconPickerOpen && (
                <div style={{ 
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '8px',
                  background: '#1a1a2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  zIndex: 1000,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  maxHeight: '350px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input 
                      autoFocus
                      placeholder="Buscar ícone..."
                      value={iconSearch}
                      onChange={e => setIconSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 32px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
                    gap: '8px',
                    overflowY: 'auto',
                    maxHeight: '250px',
                    paddingRight: '4px'
                  }}>
                    {SUBJECT_ICONS.filter(item => 
                      !iconSearch || 
                      item.tags.toLowerCase().includes(iconSearch.toLowerCase()) ||
                      item.icon.includes(iconSearch)
                    ).map(({ icon: name }) => (
                      <button 
                        key={name}
                        onClick={() => {
                          setQuizMetadata((prev: any) => ({
                            ...prev,
                            missions: prev.missions.map((m: any) => m.level === activeLevel ? { ...m, icon: name } : m)
                          }));
                          setIsMissionIconPickerOpen(false);
                          setIconSearch('');
                        }}
                        style={{
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: (mission.icon || '🚀') === name ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                          border: '1px solid',
                          borderColor: (mission.icon || '🚀') === name ? '#00e5ff' : 'rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {name}
                      </button>
                    ))}
                    {SUBJECT_ICONS.filter(item => 
                      !iconSearch || 
                      item.tags.toLowerCase().includes(iconSearch.toLowerCase()) ||
                      item.icon.includes(iconSearch)
                    ).length === 0 && (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', opacity: 0.5, fontSize: '0.8rem' }}>
                        Nenhum ícone encontrado
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
               <label className={styles.formGroupLabel}>Ações</label>
               <div style={{ display: 'flex', gap: '10px' }}>
                 <button 
                   className={styles.secondaryBtn}
                   style={{ flex: 1 }}
                   onClick={() => toggleMissionVisibility(activeLevel)}
                 >
                   {mission.visible ? <Eye size={16} color="#22c55e" /> : <EyeOff size={16} color="#ef4444" />}
                   <span>{mission.visible ? 'Visível' : 'Oculta'}</span>
                 </button>
                 <button 
                   className={styles.secondaryBtn}
                   style={{ flex: 1, color: '#ff4b4b' }}
                   onClick={() => deleteMission(activeLevel)}
                 >
                   <Trash2 size={16} />
                   <span>Excluir</span>
                 </button>
               </div>
            </div>
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label className={styles.formGroupLabel}>Quantidade de Desafios (Estrelas)</label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '24px', 
                background: 'rgba(0,0,0,0.2)', 
                padding: '20px', 
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <button 
                  onClick={() => {
                    const newVal = Math.max(1, mission.challengesCount - 1);
                    setQuizMetadata((prev: any) => ({
                      ...prev,
                      missions: prev.missions.map((m: any) => m.level === activeLevel ? { ...m, challengesCount: newVal } : m)
                    }))
                  }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <Filter size={18} style={{ transform: 'rotate(180deg)', opacity: 0.5 }} />
                  <span style={{ position: 'absolute' }}>-</span>
                </button>

                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ffd166', lineHeight: 1 }}>
                    {mission.challengesCount}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#ffd166', opacity: 0.6, marginTop: '4px', letterSpacing: '1px' }}>
                     {mission.challengesCount === 1 ? 'ESTRELA' : 'ESTRELAS'}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const newVal = Math.min(10, mission.challengesCount + 1);
                    setQuizMetadata((prev: any) => ({
                      ...prev,
                      missions: prev.missions.map((m: any) => m.level === activeLevel ? { ...m, challengesCount: newVal } : m)
                    }))
                  }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(0, 229, 255, 0.1)',
                    border: '1px solid rgba(0, 229, 255, 0.2)',
                    color: '#00e5ff',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 229, 255, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)'}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.editorSection}>
          <h3 className={styles.sectionTitle}><Gamepad2 size={20} color="#ffd166" /> Desafios Individuais</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {Array.from({ length: mission.challengesCount }).map((_, i) => (
              <div key={i} className={styles.missionCard} onClick={() => { setActiveChallenge(i + 1); setEditorDepth('questions'); }}>
                <div className={`${styles.missionIcon} ${styles.challengeIcon}`}>
                  <Sparkles size={20} />
                </div>
                <div className={styles.missionInfo}>
                  <span className={styles.missionLevel}>DESAFIO {i + 1}</span>
                  <span className={styles.missionMeta}>
                    {questions.filter(q => (q.subject || 'astronomy') === selectedSubject && q.level === activeLevel && q.challenge === i + 1).length} Perguntas
                  </span>
                </div>
                <ChevronRight size={18} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAudiosDepth = () => {
    const categories = [
      { id: 'start', label: 'Início de Questão', icon: <Play size={16} /> },
      { id: 'hit', label: 'Acertos (Narração)', icon: <CheckCircle2 size={16} /> },
      { id: 'miss', label: 'Erros (Narração)', icon: <X size={16} /> },
      { id: 'combo', label: 'Combos / Sequência', icon: <Zap size={16} /> },
      { id: 'win', label: 'Vitória', icon: <Trophy size={16} /> },
      { id: 'death', label: 'Derrota / Fim de Jogo', icon: <Skull size={16} /> },
      { id: 'hard', label: 'Questões Difíceis', icon: <AlertCircle size={16} /> },
      { id: 'intro', label: 'Início do Quiz', icon: <Music size={16} /> },
    ];

    return (
      <div className={styles.editorContainer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button className={styles.secondaryBtn} onClick={() => setEditorDepth('quiz')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Gerenciar Áudios do Sistema</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {categories.map(cat => {
            const filteredAudios = systemAudios.filter(a => a.category === cat.id);
            return (
              <div key={cat.id} className={styles.editorSection} style={{ borderLeft: '3px solid #00e5ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: '#00e5ff' }}>{cat.icon}</div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{cat.label}</h4>
                    <span style={{ fontSize: '0.7rem', opacity: 0.5, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>
                      {filteredAudios.length} arquivos
                    </span>
                  </div>
                  <button 
                    className={styles.secondaryBtn}
                    style={{ padding: '4px 12px', fontSize: '0.75rem', gap: '6px' }}
                    onClick={() => {
                      const newAudio = {
                        category: cat.id,
                        label: `Novo Áudio ${cat.label}`,
                        url: '',
                        is_active: true
                      };
                      setCurrentEditingAudio(newAudio);
                      setIsAudioModalOpen(true);
                    }}
                  >
                    <Plus size={14} /> Novo
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {filteredAudios.map(audio => (
                    <div 
                      key={audio.id} 
                      className={styles.missionCard} 
                      style={{ 
                        padding: '12px', 
                        opacity: audio.is_active ? 1 : 0.6,
                        border: '1px solid rgba(255,255,255,0.05)',
                        background: 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <button 
                        className={styles.iconBtn} 
                        style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff' }}
                        onClick={() => {
                          const a = new Audio(audio.url);
                          a.play();
                        }}
                      >
                        <Volume2 size={16} />
                      </button>
                      <div className={styles.missionInfo} style={{ flex: 1, minWidth: 0 }}>
                        <span className={styles.missionName} style={{ 
                          fontSize: '0.85rem', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          display: 'block'
                        }}>
                          {audio.label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={styles.missionMeta} style={{ fontSize: '0.65rem' }}>{audio.url.split('/').pop()}</span>
                          {audio.subject && (
                            <span style={{ 
                              fontSize: '0.6rem', 
                              padding: '1px 4px', 
                              borderRadius: '4px', 
                              background: 'rgba(0,229,255,0.1)', 
                              color: '#00e5ff',
                              border: '1px solid rgba(0,229,255,0.2)'
                            }}>
                              <>🎯 {subjects.find(s => s.id === audio.subject)?.name || audio.subject}</>
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          className={styles.iconBtn}
                          onClick={async () => {
                            const newStatus = !audio.is_active;
                            await AdminService.toggleAudioAssetStatus(audio.id, newStatus);
                            setSystemAudios(prev => prev.map(a => a.id === audio.id ? { ...a, is_active: newStatus } : a));
                            refreshGlobalAudios();
                          }}
                          title={audio.is_active ? "Desativar" : "Ativar"}
                        >
                          {audio.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button 
                          className={styles.iconBtn}
                          onClick={() => {
                            setCurrentEditingAudio(audio);
                            setIsAudioModalOpen(true);
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          className={styles.iconBtn} 
                          style={{ color: '#ef4444' }}
                          onClick={async () => {
                            if (confirm('Excluir este áudio?')) {
                              await AdminService.deleteQuizAudioAsset(audio.id);
                              setSystemAudios(prev => prev.filter(a => a.id !== audio.id));
                              refreshGlobalAudios();
                            }

                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Simples de Edição de Áudio Asset */}
        {isAudioModalOpen && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.8)', zIndex: 3000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' 
          }}>
            <div style={{ 
              background: '#1a1a2e', padding: '24px', borderRadius: '20px', 
              width: '100%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)' 
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem' }}>Configurar Áudio do Sistema</h3>
              
              <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                <label className={styles.formGroupLabel}>Rótulo / Nome</label>
                <input 
                  className={styles.input} 
                  value={currentEditingAudio?.label || ''} 
                  onChange={e => setCurrentEditingAudio({...currentEditingAudio, label: e.target.value})}
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                <label className={styles.formGroupLabel}>Vínculo com Matéria</label>
                <select 
                  className={styles.input}
                  value={currentEditingAudio?.subject || ''}
                  onChange={e => setCurrentEditingAudio({...currentEditingAudio, subject: e.target.value || null})}
                >
                  <option value="">🌎 Global (Toca em todos os quizzes)</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  Se definido, este áudio só será sorteado em quizzes desta matéria.
                </p>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                <label className={styles.formGroupLabel}>URL do Arquivo</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    className={styles.input} 
                    style={{ fontSize: '0.8rem' }}
                    value={currentEditingAudio?.url || ''} 
                    onChange={e => setCurrentEditingAudio({...currentEditingAudio, url: e.target.value})}
                  />
                  <input 
                    type="file" 
                    id="asset-upload" 
                    hidden 
                    accept="audio/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const res = await AdminService.uploadFile('quiz-assets', `system/${file.name}`, file);
                        if (typeof res === 'string') {
                          setCurrentEditingAudio({...currentEditingAudio, url: res});
                        }
                      }
                    }}
                  />
                  <button className={styles.secondaryBtn} onClick={() => document.getElementById('asset-upload')?.click()}>
                    <Mic size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px' }}>
                <button className={styles.secondaryBtn} onClick={() => setIsAudioModalOpen(false)}>Cancelar</button>
                <button className={styles.primaryBtn} onClick={async () => {
                  const saved = await AdminService.upsertQuizAudioAsset(currentEditingAudio);
                  if (currentEditingAudio.id) {
                    setSystemAudios(prev => prev.map(a => a.id === saved.id ? saved : a));
                  } else {
                    setSystemAudios(prev => [...prev, saved]);
                  }
                  refreshGlobalAudios();
                  setIsAudioModalOpen(false);

                }}>Salvar Áudio</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQuestionsDepth = () => {

    const filtered = questions.filter(q => (q.subject || 'astronomy') === selectedSubject && q.level === activeLevel && q.challenge === activeChallenge);
    
    return (
      <div className={styles.editorContainer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button className={styles.secondaryBtn} onClick={() => setEditorDepth('mission')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Pergunta do Desafio {activeChallenge}</h3>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button className={styles.primaryBtn} onClick={addQuestion} style={{ gap: '8px' }}>
            <Plus size={18} /> Nova Pergunta
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filtered.map((q, idx) => (
            <div key={q.id} className={styles.editorSection} style={{ border: '1px solid rgba(0,229,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ background: '#00e5ff', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{idx + 1}</div>
                  <select 
                    className={styles.input} 
                    style={{ padding: '4px 8px', height: 'auto', fontSize: '0.8rem' }}
                    value={q.type}
                    onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuizQuestionType })}
                  >
                    {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <button onClick={() => removeQuestion(q.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                <label className={styles.formGroupLabel}>Enunciado</label>
                <textarea className={styles.input} value={q.question} onChange={(e) => updateQuestion(q.id, { question: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formGroupLabel}><Mic size={14} /> Áudio Pergunta</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input className={styles.input} style={{ flex: 1, fontSize: '0.8rem' }} value={q.audio || ''} onChange={e => updateQuestion(q.id, { audio: e.target.value })} />
                    <button className={styles.secondaryBtn} onClick={() => handleRequestAudioEdit(q.id, 'audio', q.audio)}>
                      <Mic size={14} color={recordingId === `${q.id}_audio_loading` ? '#00e5ff' : '#fff'} />
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formGroupLabel}><Mic size={14} /> Áudio Explicação</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input className={styles.input} style={{ flex: 1, fontSize: '0.8rem' }} value={q.explanationAudio || ''} onChange={e => updateQuestion(q.id, { explanationAudio: e.target.value })} />
                    <button className={styles.secondaryBtn} onClick={() => handleRequestAudioEdit(q.id, 'explanationAudio', q.explanationAudio)}>
                      <Mic size={14} color={recordingId === `${q.id}_explanationAudio_loading` ? '#00e5ff' : '#fff'} />
                    </button>
                  </div>
                </div>
              </div>

              {(q.type === 'multiple-choice' || q.type === 'fast-response') && (
                <div style={{ marginTop: '16px' }}>
                  <label className={styles.formGroupLabel}>Opções</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {q.options?.map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', gap: '6px' }}>
                        <input type="radio" checked={q.correctAnswer === opt} onChange={() => updateQuestion(q.id, { correctAnswer: opt })} />
                        <input className={styles.input} style={{ flex: 1, padding: '6px' }} value={opt} onChange={e => {
                          const ns = [...(q.options || [])];
                          ns[oIdx] = e.target.value;
                          updateQuestion(q.id, { options: ns });
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label className={styles.formGroupLabel}>Explicação</label>
                <input className={styles.input} value={q.explanation || ''} onChange={e => updateQuestion(q.id, { explanation: e.target.value })} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.overlay} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className={styles.closeBtn} onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className={styles.headerTitle}>{selectedSubjectData?.name || 'Carregando...'}</h2>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
               <span style={{ cursor: 'pointer', color: editorDepth === 'quiz' ? '#00e5ff' : 'inherit' }} onClick={() => setEditorDepth('quiz')}>Quiz</span> / 
               {editorDepth === 'audios' ? (
                 <span style={{ color: '#00e5ff' }}> Áudios do Sistema</span>
               ) : (
                 <>
                   <span style={{ cursor: 'pointer', color: editorDepth === 'mission' ? '#00e5ff' : 'inherit' }} onClick={() => setEditorDepth('mission')}> Missão {activeLevel}</span> / 
                   <span style={{ color: editorDepth === 'questions' ? '#00e5ff' : 'inherit' }}> Desafio {activeChallenge}</span>
                 </>
               )}
            </div>

          </div>
        </div>
      </div>

      <div className={styles.bodyContent}>
        <div className={styles.editorScroll}>
          {editorDepth === 'quiz' && renderQuizDepth()}
          {editorDepth === 'mission' && renderMissionDepth()}
          {editorDepth === 'questions' && renderQuestionsDepth()}
          {editorDepth === 'audios' && renderAudiosDepth()}

        </div>

        {/* Audio Editor Modal */}
        {audioToEdit && (
          <AudioEditorModal 
            blob={audioToEdit.blob}
            title={audioToEdit.field === 'audio' ? 'Editar Pergunta' : 'Editar Explicação'}
            subtitle={audioToEdit.subtitle}
            onCancel={() => setAudioToEdit(null)}
            onSave={async (editedBlob) => {
              const ext = audioToEdit.originalName.split('.').pop() || 'wav';
              const finalName = `${audioToEdit.id}_${audioToEdit.field}_edited_${Date.now()}.${ext}`;
              const finalFile = new File([editedBlob], finalName, { type: editedBlob.type });
              
              // Agora sim, faz o upload real
              const targetId = audioToEdit.id;
              const targetField = audioToEdit.field;
              setAudioToEdit(null);
              await handleFileUpload(targetId, targetField, finalFile);
            }}
          />
        )}
      </div>

      <div className={styles.floatingActions}>
        <button className={styles.primaryBtn} onClick={handleSaveToCloud} disabled={isSaving}>
          <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

export default QuizEditor;
