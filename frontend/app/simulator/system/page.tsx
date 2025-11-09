"use client";
import { useState } from "react";
import styles from "../styles.module.css";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "../components/Footer";
import HeaderChild from "../components/HeaderChild";
import { ThreeBusSystemDiagram } from "../components/PowerSystemElements";

export default function SystemModel() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const systemName = searchParams.get('system');

  const getSystemTitle = () => {
    switch (systemName) {
      case 'case3p.m':
        return 'Sistema de 3 Barras';
      case 'case4gs.m':
        return 'Sistema de 4 Barras';
      case 'case5':
        return 'Sistema de 5 Barras';
      case 'case6ww.m':
        return 'Sistema de 6 Barras';
      case 'case9.m':
        return 'Sistema de 9 Barras';
      case 'case14.m':
        return 'Sistema de 14 Barras';
      default:
        return 'Sistema';
    }
  };

  return (
    <div className={`${styles.container} ${styles.systemPage}`}>
      <Image
        src="/transmission-lines.jpg"
        alt="Transmission Lines Background"
        fill
        priority
        className={styles.backgroundImage}
      />
      <div className={styles.overlay} />

      <HeaderChild title="Modelo Interativo - SISEP" logoSize={80} />

      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          <h2 className={styles.systemTitle}>{getSystemTitle()}</h2>
          <div className={styles.systemDiagram}>
            {systemName === 'case3p.m' ? (
              <ThreeBusSystemDiagram />
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: '#666',
                fontSize: '18px'
              }}>
                Diagrama do sistema será exibido aqui
              </div>
            )}
          </div>
        </div>
      </main>

      <div className={styles.actions}>
        <button
          className={styles.backButton}
          onClick={() => router.push('/simulator')}
        >
          VOLTAR
        </button>
        <button
          className={styles.simulateButton}
          onClick={() => {
            // TODO: Implementar simulação
            // setIsLoading(true);
            // ... chamada da API ...
            // setIsLoading(false);
          }}
          disabled={isLoading}
        >
          {isLoading ? "SIMULANDO..." : "SIMULAR"}
        </button>
      </div>

      <Footer />
    </div>
  );
}