"use client";
import styles from "../styles.module.css";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "../components/Footer";

export default function SystemModel() {
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

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Image
            src="/univali-logo.png"
            alt="UNIVALI Logo"
            width={80}
            height={80}
            className={styles.logo}
          />
          <h1 className={styles.headerTitle}>Modelo Iterativo</h1>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          <h2 className={styles.systemTitle}>{getSystemTitle()}</h2>
          <div className={styles.systemDiagram}>
            {/* Área reservada para o diagrama do sistema */}
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
          onClick={() => {/* TODO: Implementar simulação */}}
        >
          SIMULAR
        </button>
      </div>

      <Footer />
    </div>
  );
}