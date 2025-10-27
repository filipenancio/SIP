"use client";
import { useState } from "react";
import styles from "./styles.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "./components/Footer";

export default function Simulator() {
  const [selectedFile, setSelectedFile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSimulation = () => {
    if (!selectedFile) {
      alert("Por favor selecione um modelo para simular");
      return;
    }

    if (selectedFile === "numeric") {
      router.push("/simulator/numeric");
      return;
    }

    router.push(`/simulator/system?system=${selectedFile}`);
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
            width={80}
            height={80}
            className={styles.logo}
          />
          <h1 className={styles.headerTitle}>Simulador Iterativo de Potência - SIP</h1>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.formContainer}>
          <div className={styles.selectContainer}>
            <select
              className={styles.select}
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
            >
              <option value="">Selecione um modelo do sistema</option>
              <option value="case3p.m">Sistema de 3 Barras</option>
              <option value="case4gs.m">Sistema de 4 Barras</option>
              <option value="case5">Sistema de 5 Barras</option>
              <option value="case6ww.m">Sistema de 6 Barras</option>
              <option value="case9.m">Sistema de 9 Barras</option>
              <option value="case14.m">Sistema de 14 Barras</option>
              <option value="numeric">Modelo com entrada/saída numérica</option>
            </select>
          </div>
          <div className={styles.buttonContainer}>
            <button
              className={styles.simulateButton}
              onClick={handleSimulation}
              disabled={!selectedFile || isLoading}
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