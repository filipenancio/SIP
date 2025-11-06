"use client";
import styles from "../styles.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import { useState, useRef } from "react";

export default function NumericModel() {
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const validateMatpowerFormat = (text: string): boolean => {
    if (!text || text.trim() === "") {
      return false;
    }

    // Verifica se contém as três matrizes obrigatórias do MATPOWER
    const hasMpcBase= /mpc\.baseMVA\s*=/.test(text);
    const hasMpcBus = /mpc\.bus\s*=/.test(text);
    const hasMpcGen = /mpc\.gen\s*=/.test(text);
    const hasMpcBranch = /mpc\.branch\s*=/.test(text);

    return hasMpcBase && hasMpcBus && hasMpcGen && hasMpcBranch;
  };

  const handleSubmit = async () => {
    const inputValue = inputRef.current?.value;
    
    if (!inputValue || inputValue.trim() === "") {
      alert("A entrada fornecida não é válida! Verifique os dados inseridos, lembrando de manter a sintaxe do Matpower.");
      return;
    }

    if (!validateMatpowerFormat(inputValue)) {
      alert("A entrada fornecida não é válida! Verifique os dados inseridos, lembrando de manter a sintaxe do Matpower.");
      return;
    }

    setIsLoading(true);
    try {
      // Criar o arquivo .m com o conteúdo
      const formData = new FormData();
      const file = new File([inputValue], "file.m", { type: "text/plain" });
      formData.append("file", file);

      // Enviar para o backend
      const response = await fetch("http://localhost:8000/sip/simulate/matpower/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro na simulação");
      }

      const result = await response.json();
      setOutput(JSON.stringify(result, null, 2));
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
                ref={inputRef}
                className={styles.textArea}
                placeholder={`Digite o modelo no formato MATPOWER...

function mpc = caseXXX
    mpc.version = '2';
    mpc.baseMVA = 100;
    mpc.bus = [ ... ];
    mpc.gen = [ ... ];
    mpc.branch = [ ... ];
end`}
                spellCheck={false}
              />
            </div>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Saída</h2>
              <textarea
                className={styles.outputArea}
                value={output}
                readOnly
                spellCheck={false}
              />
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