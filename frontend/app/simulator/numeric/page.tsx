"use client";
import styles from "../styles.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import { useState } from "react";

export default function NumericModel() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: Implementar lógica de simulação
    } catch (error) {
      console.error("Erro na simulação:", error);
      alert("Erro ao executar a simulação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${styles.numericPage}`}>
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
          <h1 className={styles.headerTitle}>
            Modelo numérico - SIP
          </h1>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          <div className={styles.sections}>
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
                {/* Área para resultado da simulação */}
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <button 
              className={styles.backButton} 
              onClick={() => router.push("/simulator")}
            >
              VOLTAR
            </button>
            <button
              className={styles.simulateButton}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "SIMULANDO..." : "SIMULAR"}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}