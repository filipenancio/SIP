"use client";
import styles from "../styles.module.css";
import Image from "next/image";
import Footer from "../components/Footer";

interface NumericInputProps {
  onBack: () => void;
}

export default function NumericInput({ onBack }: NumericInputProps) {
  const handleSubmit = async () => {
    // TODO: Implementar submissão do modelo numérico
  };

  return (
    <div className={styles.container}>
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
            width={60}
            height={60}
            className={styles.logo}
          />
          <h1 className={styles.headerTitle}>Simulador - Modelo entrada / saída numérica</h1>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.numericInputContainer}>
          <div className={styles.sectionsContainer}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Entrada</h2>
              <textarea
                className={styles.textArea}
                placeholder="Digite o modelo no formato MATPOWER..."
                spellCheck={false}
              />
            </div>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Saída</h2>
              <div className={styles.outputArea}>
                {/* Área onde será mostrado o resultado */}
              </div>
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.backButton} onClick={onBack}>
              VOLTAR
            </button>
            <button 
              className={styles.simulateButton}
              onClick={handleSubmit}
            >
              SIMULAR
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}