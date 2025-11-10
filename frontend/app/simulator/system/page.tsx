"use client";
import { useState } from "react";
import styles from "../styles.module.css";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "../components/Footer";
import HeaderChild from "../components/HeaderChild";
import { ThreeBusSystemDiagram } from "../components/PowerSystemElements";

export default function SystemModel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const systemName = searchParams.get('system');
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'simulating' | 'result'>('idle');

  const getSystemTitle = () => {
    switch (systemName) {
      case 'case3p.m':
        return 'Sistema de 3 Barras';
      case 'case4p.m':
        return 'Sistema de 4 Barras';
      case 'case5p':
        return 'Sistema de 5 Barras';
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
              <ThreeBusSystemDiagram
                externalControls={true}
                onSimulationStatusChange={setSimulationStatus}
              />
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
          onClick={() => {
            if (simulationStatus === 'result') {
              // Se estiver visualizando resultado, volta para modo de edição
              const event = new CustomEvent('backToEdit');
              window.dispatchEvent(event);
              setSimulationStatus('idle');
            } else {
              // Se estiver em modo de edição, volta para o menu
              router.push('/simulator');
            }
          }}
        >
          VOLTAR
        </button>
        {simulationStatus === 'result' ? (
          <button
            className={styles.exportButton}
            onClick={() => {
              // TODO: Implementar exportação
              console.log('Exportar resultados');
            }}
          >
            EXPORTAR
          </button>
        ) : (
          <button
            className={styles.simulateButton}
            onClick={() => {
              console.log('Botão SIMULAR clicado, disparando evento');
              const event = new CustomEvent('triggerSimulation');
              window.dispatchEvent(event);
              console.log('Evento triggerSimulation disparado');
            }}
            disabled={simulationStatus === 'simulating'}
          >
            {simulationStatus === 'simulating' ? 'SIMULANDO...' : 'SIMULAR'}
          </button>
        )}
      </div>

      <Footer />
    </div>
  );
}