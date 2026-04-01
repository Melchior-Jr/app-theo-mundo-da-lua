import React from 'react';
import InvasoresGame from '@/components/InvasoresGame';
import styles from './InvasoresPage.module.css';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const InvasoresPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
         <Link to="/jogos" className={styles.backBtn}>
            <FaArrowLeft /> VOLTAR PARA CENTRAL
         </Link>
         <div className={styles.titleInfo}>
            <h1>INVASORES DO CONHECIMENTO</h1>
            <span>MISSÃO ARKADE ESPACIAL</span>
         </div>
      </header>
      
      <main className={styles.main}>
        <InvasoresGame />
      </main>
      
      <footer className={styles.footer}>
         <p>Utilize as setas ⬅️ ➡️ para mover e [ESPAÇO] para atirar.</p>
         <p>Colete as respostas certas para ganhar bônus monumentais!</p>
      </footer>
    </div>
  );
};

export default InvasoresPage;
