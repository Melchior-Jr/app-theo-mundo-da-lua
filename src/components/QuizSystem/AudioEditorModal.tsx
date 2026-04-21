import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import { Play, Pause, Volume2, Save, X, RotateCcw, Wand2, Mic2, Trash2 } from 'lucide-react';
import { bufferToWav, trimAudioBuffer, applyNormalization, applyFilter } from '@/utils/audioUtils';
import styles from './AudioEditorModal.module.css';

interface AudioEditorModalProps {
  blob?: Blob;
  onSave: (editedBlob: Blob) => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

export default function AudioEditorModal({ blob, onSave, onCancel, title = 'Editar Narração', subtitle }: AudioEditorModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const originalBufferRef = useRef<AudioBuffer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentBlob, setCurrentBlob] = useState<Blob | undefined>(blob);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const feedbackNodeRef = useRef<GainNode | null>(null);
  
  // Filtros
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !currentBlob) return;

    const audio = new Audio();
    const url = URL.createObjectURL(currentBlob);
    audio.src = url;
    
    // Setup Audio Context para Preview de Filtros
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = ctx.createMediaElementSource(audio);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'allpass';
    
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.15;
    const feedback = ctx.createGain();
    feedback.gain.value = 0; // Começa sem feedback (sem eco)

    source.connect(filter);
    filter.connect(ctx.destination);
    
    // Rota separada para o eco espacial
    source.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    feedback.connect(ctx.destination);

    filterNodeRef.current = filter;
    delayNodeRef.current = delay;
    feedbackNodeRef.current = feedback;
    audioContextRef.current = ctx;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      media: audio,
      waveColor: '#4facfe',
      progressColor: '#00e5ff',
      cursorColor: '#fff',
      barWidth: 2,
      barRadius: 3,
      height: 120,
      normalize: true,
    });

    const regions = ws.registerPlugin(RegionsPlugin.create());
    regionsRef.current = regions;
    waveSurferRef.current = ws;

    ws.on('ready', () => {
      console.log('WaveSurfer Ready');
      setDuration(ws.getDuration());
      
      // Criar região inicial de seleção para corte
      regions.addRegion({
        start: 0,
        end: ws.getDuration(),
        color: 'rgba(0, 229, 255, 0.2)',
        drag: true,
        resize: true,
        id: 'trim-region'
      });

      // Carregar buffer original para processamento no AudioContext do Admin
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (currentBlob) {
        currentBlob.arrayBuffer().then(ab => {
          audioContextRef.current?.decodeAudioData(ab, (buffer) => {
            originalBufferRef.current = buffer;
            console.log('Audio Buffer decoded for saving');
          });
        });
      }
    });

    ws.on('timeupdate', () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));

    return () => {
      ws.destroy();
      ctx.close();
      URL.revokeObjectURL(url);
    };
  }, [currentBlob]);

  const startNewRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const newBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setCurrentBlob(newBlob);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Não foi possível acessar o microfone.');
    }
  };

  const stopNewRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handlePlayPause = async () => {
    if (!waveSurferRef.current) return;
    
    // Garantir que o AudioContext está ativo (requerido por navegadores modernos)
    const ws = waveSurferRef.current;
    if ((ws as any).options.audioContext?.state === 'suspended') {
      await (ws as any).options.audioContext.resume();
    }

    // Também resumir o contexto de preview manual
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    try {
      await ws.playPause();
    } catch (e) {
      console.error('Play error:', e);
    }
  };

  // Atualizar parâmetros do filtro em tempo real
  useEffect(() => {
    if (!filterNodeRef.current || !feedbackNodeRef.current) return;
    
    const filter = filterNodeRef.current;
    const feedback = feedbackNodeRef.current;

    // Reset padrão
    filter.type = 'allpass';
    feedback.gain.value = 0;

    if (activeFilter === 'robot') {
      filter.type = 'peaking';
      filter.frequency.value = 1000;
      filter.Q.value = 10;
      filter.gain.value = 15;
    } else if (activeFilter === 'clear') {
      filter.type = 'highshelf';
      filter.frequency.value = 3000;
      filter.gain.value = 10;
    } else if (activeFilter === 'space') {
      feedback.gain.value = 0.4;
    } else if (activeFilter === 'megaphone') {
      filter.type = 'bandpass';
      filter.frequency.value = 1600;
      filter.Q.value = 2;
    } else if (activeFilter === 'telephone') {
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      filter.Q.value = 0.5;
    } else if (activeFilter === 'monster') {
      filter.type = 'lowpass';
      filter.frequency.value = 400;
    }
  }, [activeFilter]);

  const handleReset = () => {
    const ws = waveSurferRef.current;
    if (!ws || !regionsRef.current) return;
    regionsRef.current.clearRegions();
    regionsRef.current.addRegion({
      start: 0,
      end: ws.getDuration(),
      color: 'rgba(0, 229, 255, 0.2)',
      drag: true,
      resize: true,
    });
    setActiveFilter(null);
  };

  const handleSave = async () => {
    if (!waveSurferRef.current || !regionsRef.current || !originalBufferRef.current || !audioContextRef.current) return;
    
    setIsProcessing(true);
    
    try {
      const region = regionsRef.current.getRegions()[0];
      const start = region ? region.start : 0;
      const end = region ? region.end : waveSurferRef.current.getDuration();
      
      // 1. Corte
      let buffer = trimAudioBuffer(originalBufferRef.current, start, end, audioContextRef.current);
      
      // 2. Normalização
      buffer = applyNormalization(buffer, audioContextRef.current);
      
      // 3. Filtros
      if (activeFilter === 'clear' || activeFilter === 'robot') {
        buffer = await applyFilter(buffer, activeFilter as any);
      }
      
      const editedBlob = bufferToWav(buffer);
      onSave(editedBlob);
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      alert('Erro ao salvar o áudio editado.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2><Mic2 size={24} color="#00e5ff" /> {title}</h2>
          <button className={styles.actionBtn} onClick={onCancel} style={{ padding: '8px' }}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {subtitle && (
            <div className={styles.scriptReference}>
              <span className={styles.timeLabel}>TEXTO DE REFERÊNCIA</span>
              <p>{subtitle}</p>
            </div>
          )}

          <div className={styles.timeInfo}>
            <div>
              <span className={styles.timeLabel}>TEMPO ATUAL</span>
              {formatTime(currentTime)}
            </div>
            <div>
              <span className={styles.timeLabel}>DURAÇÃO TOTAL</span>
              {formatTime(duration)}
            </div>
          </div>

          <div className={styles.waveformContainer}>
            <div ref={containerRef} className={styles.waveform} />
            {!currentBlob && !isRecording && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
                Clique em "Gravar Novo" para começar a narração
              </div>
            )}
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '8px', textAlign: 'center' }}>
              Arraste as bordas azuis para cortar o áudio
            </div>
          </div>

          <div className={styles.controls}>
            <button className={styles.actionBtn} onClick={handlePlayPause}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? 'Pausar' : 'Ouvir'}
            </button>

            {!isRecording ? (
              <button className={styles.actionBtn} onClick={startNewRecording} style={{ color: '#ff4fac' }}>
                <Mic2 size={20} />
                Gravar Novo
              </button>
            ) : (
              <button className={`${styles.actionBtn} ${styles.recording}`} onClick={stopNewRecording}>
                <div className={styles.pulse} />
                Parar Gravação
              </button>
            )}

            <button className={styles.actionBtn} onClick={onCancel} style={{ color: '#ff4444' }}>
              <Trash2 size={20} />
              Apagar/Descartar
            </button>

            <button className={styles.actionBtn} onClick={handleReset}>
              <RotateCcw size={20} />
              Resetar
            </button>

            <div className={styles.volumeContainer}>
              <Volume2 size={20} color="rgba(255,255,255,0.5)" />
              <input 
                type="range" 
                min="0" max="1" step="0.1" 
                value={volume} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  waveSurferRef.current?.setVolume(val);
                }}
                className={styles.volumeSlider}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterHeader}>Filtros de Voz (Pré-visualização)</div>
            <div className={styles.filterGrid}>
              <button 
                className={`${styles.filterBtn} ${activeFilter === 'robot' ? styles.active : ''}`}
                onClick={() => setActiveFilter(prev => prev === 'robot' ? null : 'robot')}
              >
                🤖 Robô
              </button>
              <button 
                className={`${styles.filterBtn} ${activeFilter === 'space' ? styles.active : ''}`}
                onClick={() => setActiveFilter(prev => prev === 'space' ? null : 'space')}
              >
                🌌 Espacial
              </button>
              <button 
                className={`${styles.filterBtn} ${activeFilter === 'megaphone' ? styles.active : ''}`}
                onClick={() => setActiveFilter(prev => prev === 'megaphone' ? null : 'megaphone')}
              >
                📢 Megafone
              </button>
              <button 
                className={`${styles.filterBtn} ${activeFilter === 'telephone' ? styles.active : ''}`}
                onClick={() => setActiveFilter(prev => prev === 'telephone' ? null : 'telephone')}
              >
                ☎️ Telefone
              </button>
              <button 
                className={`${styles.filterBtn} ${activeFilter === 'monster' ? styles.active : ''}`}
                onClick={() => setActiveFilter(prev => prev === 'monster' ? null : 'monster')}
              >
                👹 Monstro
              </button>
              <button 
                className={`${styles.filterBtn} ${activeFilter === 'clear' ? styles.active : ''}`}
                onClick={() => setActiveFilter(prev => prev === 'clear' ? null : 'clear')}
              >
                ✨ Nitidez
              </button>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.actionBtn} onClick={onCancel} disabled={isProcessing}>
            Cancelar
          </button>
          <button className={`${styles.actionBtn} ${styles.primaryBtn}`} onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? <Wand2 className={isProcessing ? 'animate-spin' : ''} size={20} /> : <Save size={20} />}
            {isProcessing ? 'Processando...' : 'Aplicar e Salvar no Banco'}
          </button>
        </div>
      </div>
    </div>
  );
}
