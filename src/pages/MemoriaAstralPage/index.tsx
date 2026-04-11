import React from 'react';
import MemoriaAstral from '@/components/MemoriaAstral/MemoriaAstral';
import styles from './MemoriaAstralPage.module.css';


const MemoriaAstralPage: React.FC = () => {
  return (
    <div className={styles.page}>

      
      <main className={styles.main}>
        <MemoriaAstral />
      </main>
      
      <footer className={styles.footer}>
         <p>Encontre os pares de astros idênticos no menor tempo possível.</p>
         <p>O foco é a sua arma secreta, explorador!</p>
      </footer>
    </div>
  );
};

export default MemoriaAstralPage;
