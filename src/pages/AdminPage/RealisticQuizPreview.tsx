import React from 'react';
import { 
  Rocket, Globe, Brain, Map as MapIcon, Sparkles, Gamepad2, Zap, Star, 
  BookOpen, GraduationCap, School, Pencil, Languages, Binary, TestTube2, Microscope,
  Palette, Calculator, Thermometer, Telescope, Coins, Leaf, Sun, Moon, Cloud,
  Wind, Mountain, Waves, TreeDeciduous, Ghost, Skull, Crown, Heart, Smile,
  Trophy, Flag, Anchor, Hammer, Wrench, Lightbulb, Camera, Coffee
} from 'lucide-react';
import { FaChevronDown } from 'react-icons/fa';

import { IoSettings, IoHeart, IoStar } from 'react-icons/io5';
import StarField from '@/components/StarField';
import quizStyles from '@/components/QuizSystem/QuizSystem.module.css';

const ICON_MAP: Record<string, any> = {
  Rocket, Globe, Brain, Map: MapIcon, Sparkles, Gamepad2, Zap, Star,
  BookOpen, GraduationCap, School, Pencil, Languages, Binary, TestTube2, Microscope,
  Palette, Calculator, Thermometer, Telescope, Coins, Leaf, Sun, Moon, Cloud,
  Wind, Mountain, Waves, TreeDeciduous, Ghost, Skull, Crown, Heart, Smile,
  Trophy, Flag, Anchor, Hammer, Wrench, Lightbulb, Camera, Coffee
};

const RenderIcon = ({ name, size = 24, color, className }: { name: string, size?: number | string, color?: string, className?: string }) => {
  if (name && name.length <= 4 && /\p{Emoji}/u.test(name)) {
    return <span className={className} style={{ fontSize: typeof size === 'number' ? `${size}px` : size, lineHeight: 1, display: 'inline-block' }}>{name}</span>;
  }
  const IconComp = ICON_MAP[name];
  if (IconComp) return <IconComp size={size} color={color} className={className} />;
  return <Rocket size={size} color={color} className={className} />;
};

interface RealisticQuizPreviewProps {
  depth: 'quiz' | 'mission' | 'questions';
  quizMetadata: any;
  currentMission?: any;
  currentQuestion?: any;
}



export const RealisticQuizPreview: React.FC<RealisticQuizPreviewProps> = ({ 
  depth, 
  quizMetadata, 
  currentMission,
  currentQuestion
}) => {
  const themeColor = quizMetadata?.theme_color || '#4facfe';

  const renderStartScreen = () => {
    const missions = quizMetadata?.missions || [];
    
    return (
      <div className={quizStyles.startScreen} style={{ position: 'relative', height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
        <StarField />
        <div className={quizStyles.nebulaBackground} />
        
        <div className={quizStyles.quizNavbar}>
          <div className={quizStyles.navLeft}>
            <button className={quizStyles.navBackBtn} style={{ background: 'none', border: 'none' }}>×</button>
          </div>
          <div className={quizStyles.navRight}>
            <div className={quizStyles.userNavStats}>
               <button className={quizStyles.navIconBtn}>🔔</button>
               <div className={quizStyles.statDivider} />
               <div className={quizStyles.statBox}>
                 <span className={quizStyles.statLabel}>XP</span>
                 <span className={quizStyles.statValue}>1.250</span>
               </div>
               <div className={quizStyles.statDivider} />
               <button className={quizStyles.navMuteBtn} style={{ background: 'none', border: 'none' }}>
                 <IoSettings />
               </button>
            </div>
          </div>
        </div>

        <div className={quizStyles.startHeader}>
          <h2 className={quizStyles.heroTitle}>Quiz Intergaláctico</h2>
          <div className={quizStyles.subjectDropdownWrapper}>
            <button className={`${quizStyles.dropdownTrigger} ${quizStyles['theme-' + (quizMetadata?.id || 'astronomy')]}`} style={{ borderColor: themeColor }}>
              <span className={quizStyles.triggerIcon}>
                 <RenderIcon name={quizMetadata?.icon || 'Rocket'} size="1.5rem" />
              </span>
              <span className={quizStyles.triggerLabel} style={{ color: themeColor }}>
                {quizMetadata?.label || 'Carregando...'}
              </span>
              <FaChevronDown className={quizStyles.chevronIcon} />
            </button>
          </div>
        </div>

        <div className={quizStyles.journeyPathway} style={{ margin: '50px auto', maxWidth: '350px' }}>
          <svg 
            className={quizStyles.pathLine} 
            viewBox={`0 0 400 ${Math.max(1, missions.length) * 250}`}
            preserveAspectRatio="xMidYMin meet"
            style={{ width: '100%', height: 'auto', top: '120px' }}
          >
            <path 
              d={`M200,0 ${missions.map((_: any, i: number) => {
                const y = (i + 1) * 250;
                const cp1y = y - 125;
                const cp2y = y - 125;
                const x = 200;
                const direction = i % 2 === 0 ? 350 : 50;
                return `C${direction},${cp1y} ${400 - direction},${cp2y} ${x},${y}`;
              }).join(' ')}`}
              fill="none" 
              stroke="rgba(255,255,255,0.08)" 
              strokeWidth="12" 
              strokeLinecap="round" 
              strokeDasharray="20,25" 
            />
          </svg>

          {missions.map((mission: any, idx: number) => {
            const isEven = idx % 2 === 0;
            const isSelected = currentMission?.id === mission.id;
            const missionColor = mission.color || themeColor;
            
            return (
              <div 
                key={mission.id} 
                className={`${quizStyles.pathNode} ${isEven ? quizStyles.nodeLeft : quizStyles.nodeRight} ${isSelected ? quizStyles.nodeSelected : ''}`}
                style={{ 
                  zIndex: isSelected ? 100 : missions.length - idx,
                  marginBottom: '150px'
                }}
              >
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: missionColor,
                  boxShadow: `0 0 30px ${missionColor}66`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isSelected ? '4px solid #fff' : 'none',
                  margin: '0 auto'
                }}>
                   <RenderIcon name={mission.icon || 'Rocket'} size={40} color="#000" />
                </div>

                {isSelected && (
                  <div className={`${quizStyles.nodeTooltip} ${isEven ? quizStyles.tooltipLeft : quizStyles.tooltipRight} ${idx === 0 ? quizStyles.tooltipBelow : ''}`}>
                    <div className={quizStyles.tooltipArrow} />
                    <div className={quizStyles.tooltipHeader}>
                      <span className={quizStyles.tooltipIcon}>
                         <RenderIcon name={mission.icon || 'Rocket'} size={24} />
                      </span>
                      <h4>{mission.title || mission.name}</h4>
                    </div>
                    <p className={quizStyles.tooltipDesc}>{mission.desc || 'Desbrave novos mistérios!'}</p>
                    <div className={quizStyles.tooltipActions}>
                      <div className={quizStyles.challengeGrid}>
                        {[1, 2, 3].map(ch => (
                          <button key={ch} className={quizStyles.challengeBtn} style={{ borderColor: `${missionColor}44` }}>
                            <span className={quizStyles.chNumber}>{ch}</span>
                            <span className={quizStyles.chLabel}>DESAFIO</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderQuestionScreen = () => {
    if (!currentQuestion) return null;
    
    return (
      <div className={quizStyles.quizContainer} style={{ background: '#0a0a14', height: '100%' }}>
        <StarField />
        
        <header className={quizStyles.header}>
          <div className={quizStyles.headerLeft}>
            <button className={quizStyles.navBackBtn}>×</button>
          </div>

          <div className={quizStyles.progBarContainer}>
            <div className={quizStyles.progBarFill} style={{ width: '45%' }}>
              <div className={quizStyles.progBarGlass} />
            </div>
          </div>

          <div className={quizStyles.stats}>
            <div className={`${quizStyles.statItem} ${quizStyles.lives}`}>
              <IoHeart /> <span>3</span>
            </div>
            <div className={`${quizStyles.statItem} ${quizStyles.xp}`}>
              <IoStar /> <span>120</span>
            </div>
            <button className={quizStyles.muteBtn}>
              <IoSettings />
            </button>
          </div>
        </header>

        <main className={quizStyles.quizMain}>
          <div className={quizStyles.questionWrapper}>
             <div className={quizStyles.rendererContainer}>
                {currentQuestion.modelUrl ? (
                  <div className={quizStyles.questionModel} style={{ height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RenderIcon name={quizMetadata?.icon || 'Rocket'} size={60} />
                  </div>
                ) : null}
                <h2 className={quizStyles.questionText}>{currentQuestion.question}</h2>
                
                <div className={quizStyles.optionsGrid}>
                   {(currentQuestion.options || []).map((opt: string, i: number) => (
                     <button key={i} className={quizStyles.optionBtn}>
                       {opt}
                     </button>
                   ))}
                   {currentQuestion.type === 'true-false' && (
                     <>
                       <button className={quizStyles.optionBtn}>Verdadeiro</button>
                       <button className={quizStyles.optionBtn}>Falso</button>
                     </>
                   )}
                </div>
             </div>
          </div>
        </main>
      </div>
    );
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      background: '#0a0a0f', 
      borderRadius: '24px', 
      overflow: 'hidden',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      '--quiz-bg': '#0a0a14',
      '--quiz-accent': themeColor,
      '--quiz-radius': '24px',
      '--quiz-glass': 'rgba(255, 255, 255, 0.05)',
      '--quiz-border': 'rgba(255, 255, 255, 0.1)',
      '--quiz-correct': '#00ffa3',
      '--quiz-wrong': '#ff3d71',
    } as any}>
      {depth === 'questions' ? renderQuestionScreen() : renderStartScreen()}
    </div>
  );
};
