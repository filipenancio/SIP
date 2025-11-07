"use client";
import styles from "../styles.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import { useState, useRef } from "react";

export default function NumericModel() {
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [currentView, setCurrentView] = useState<'input' | 'output'>('input');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const formatResults = (result: any): string => {
    if (!result || !result.buses) {
      return "Nenhum resultado disponível";
    }

    let formattedOutput = "";
    
    // Cabeçalho do sistema
    formattedOutput += "=========================================================================================\n";
    formattedOutput += "|                               SIFP - Power Flow Results                               |\n";
    formattedOutput += "=========================================================================================\n\n";

    // Sistema Summary
    const totalBuses = result.buses.length;
    const totalGenerators = result.generators?.length || 0;
    const totalLoads = result.loads?.length || 0;
    const totalLines = result.lines?.length || 0;

    // Cálculos de resumo
    let totalGeneration = 0;
    let totalLoad = 0;
    let totalLosses = 0;

    if (result.generators) {
      totalGeneration = result.generators.reduce((sum: number, gen: any) => sum + gen.p_mw, 0);
    }
    if (result.ext_grid) {
      totalGeneration += result.ext_grid.p_mw;
    }
    
    if (result.loads) {
      totalLoad = result.loads.reduce((sum: number, load: any) => sum + load.p_mw, 0);
    }

    if (result.lines) {
      totalLosses = result.lines.reduce((sum: number, line: any) => sum + (line.pl_mw || 0), 0);
    }

    // Tabela de resumo do sistema
    formattedOutput += "System Summary\n";
    formattedOutput += "-------------------- ------------------- ------------ ----------------\n";
    formattedOutput += `Buses             ${totalBuses.toString().padStart(3)}  Total Capacity      ${totalGeneration.toFixed(1).padStart(8)}\n`;
    formattedOutput += `Generators        ${totalGenerators.toString().padStart(3)}  On-line Capacity    ${totalGeneration.toFixed(1).padStart(8)}\n`;
    formattedOutput += `Committed Gens    ${totalGenerators.toString().padStart(3)}  Generation (actual) ${totalGeneration.toFixed(1).padStart(8)}\n`;
    formattedOutput += `Loads             ${totalLoads.toString().padStart(3)}  Load                ${totalLoad.toFixed(1).padStart(8)}\n`;
    formattedOutput += `  Fixed           ${totalLoads.toString().padStart(3)}    Fixed             ${totalLoad.toFixed(1).padStart(8)}\n`;
    formattedOutput += `Branches          ${totalLines.toString().padStart(3)}  Losses (I^2 * Z)    ${totalLosses.toFixed(2).padStart(8)}\n`;
    formattedOutput += `Transformers      0  Branch Charging     0.0\n`;
    formattedOutput += `Inter-ties        0  Total Inter-tie Flow 0.0\n\n`;

    // Voltage Magnitude e Angle extremos
    let minVm = 999, maxVm = 0, minVa = 999, maxVa = -999;
    let minVmBus = 0, maxVmBus = 0, minVaBus = 0, maxVaBus = 0;

    result.buses.forEach((bus: any, index: number) => {
      if (bus.vm_pu < minVm) { minVm = bus.vm_pu; minVmBus = index + 1; }
      if (bus.vm_pu > maxVm) { maxVm = bus.vm_pu; maxVmBus = index + 1; }
      if (bus.va_degree < minVa) { minVa = bus.va_degree; minVaBus = index + 1; }
      if (bus.va_degree > maxVa) { maxVa = bus.va_degree; maxVaBus = index + 1; }
    });

    formattedOutput += "                        Minimum                      Maximum\n";
    formattedOutput += "                    -------------------- -------------------------\n";
    formattedOutput += `Voltage Magnitude   ${minVm.toFixed(3)} p.u. @ bus ${minVmBus}     ${maxVm.toFixed(3)} p.u. @ bus ${maxVmBus}\n`;
    formattedOutput += `Voltage Angle       ${minVa.toFixed(2)} deg @ bus ${minVaBus}     ${maxVa.toFixed(2)} deg @ bus ${maxVaBus}\n\n`;

    // Dados das barras
    formattedOutput += "=========================================================================================\n";
    formattedOutput += "|                                   Dados das Barras                                    |\n";
    formattedOutput += "=========================================================================================\n";
    formattedOutput += "   Barra             Tensão                  Geração                    Carga           \n";
    formattedOutput += "     #         Vm (pu)    Va (deg)       P (MW)    Q (MVAr)        P (MW)    Q (MVAr)    \n";
    formattedOutput += "    ---       --------    --------      --------   --------       --------   --------    \n";

    result.buses.forEach((bus: any, index: number) => {
      const busNum = (index + 1).toString().padStart(3);
      const vm = bus.vm_pu.toFixed(3).padStart(8);
      const va = bus.va_degree.toFixed(3).padStart(8);
      
      // Buscar geração para esta barra
      let genP = 0, genQ = 0;
      if (result.generators) {
        const gen = result.generators.find((g: any) => g.bus_id === index);
        if (gen) {
          genP = gen.p_mw;
          genQ = gen.q_mvar;
        }
      }
      if (result.ext_grid && result.ext_grid.bus_id === index) {
        genP += result.ext_grid.p_mw;
        genQ += result.ext_grid.q_mvar;
      }

      // Buscar carga para esta barra
      let loadP = 0, loadQ = 0;
      if (result.loads) {
        const load = result.loads.find((l: any) => l.bus_id === index);
        if (load) {
          loadP = load.p_mw;
          loadQ = load.q_mvar;
        }
      }

      const genPStr = genP !== 0 ? genP.toFixed(2).padStart(8) : "       -";
      const genQStr = genQ !== 0 ? genQ.toFixed(2).padStart(8) : "       -";
      const loadPStr = loadP !== 0 ? loadP.toFixed(2).padStart(8) : "       -";
      const loadQStr = loadQ !== 0 ? loadQ.toFixed(2).padStart(8) : "       -";

      formattedOutput += `    ${busNum}       ${vm}    ${va}      ${genPStr}   ${genQStr}       ${loadPStr}   ${loadQStr}\n`;
    });

    formattedOutput += "                                        --------   --------       --------   --------\n";
    formattedOutput += `                            Total:      ${totalGeneration.toFixed(2).padStart(8)}   ${(result.generators?.reduce((sum: number, gen: any) => sum + gen.q_mvar, 0) || 0).toFixed(2).padStart(8)}       ${totalLoad.toFixed(2).padStart(8)}   ${(result.loads?.reduce((sum: number, load: any) => sum + load.q_mvar, 0) || 0).toFixed(2).padStart(8)}\n\n`;

    // Dados das linhas
    formattedOutput += "=========================================================================================\n";
    formattedOutput += "|                                     Dados das Linha                                   |\n";
    formattedOutput += "=========================================================================================\n";
    formattedOutput += "  Linha     Barra       Potência Enviada      Potência Recebida     Potência Perdida\n";
    formattedOutput += "    #      De  Para     P (MW)   Q (MVAr)     P (MW)   Q (MVAr)     P (MW)   Q (MVAr)\n";
    formattedOutput += "   ---    ---   ---    --------  --------    --------  --------    --------  --------\n";

    let totalLineLossP = 0, totalLineLossQ = 0;
    
    result.lines.forEach((line: any, index: number) => {
      const branchNum = (index + 1).toString().padStart(3);
      const fromBus = (line.from_bus + 1).toString().padStart(3);
      const toBus = (line.to_bus + 1).toString().padStart(3);
      
      const pFrom = line.p_from_mw.toFixed(2).padStart(8);
      const qFrom = line.q_from_mvar.toFixed(2).padStart(8);
      const pTo = (-line.p_to_mw).toFixed(2).padStart(8);
      const qTo = (-line.q_to_mvar).toFixed(2).padStart(8);
      const pLoss = line.pl_mw.toFixed(3).padStart(8);
      const qLoss = line.ql_mvar.toFixed(2).padStart(8);

      totalLineLossP += line.pl_mw;
      totalLineLossQ += line.ql_mvar;

      formattedOutput += `   ${branchNum}    ${fromBus}   ${toBus}    ${pFrom}  ${qFrom}    ${pTo}  ${qTo}    ${pLoss}  ${qLoss}\n`;
    });

    formattedOutput += "                                                                   --------  --------\n";
    formattedOutput += `                                               Total de Perdas:      ${totalLineLossP.toFixed(3).padStart(6)}    ${totalLineLossQ.toFixed(2).padStart(6)}\n`;

    return formattedOutput;
  };

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
    const currentInput = inputRef.current?.value;
    
    if (!currentInput || currentInput.trim() === "") {
      alert("A entrada fornecida não é válida! Verifique os dados inseridos, lembrando de manter a sintaxe similar a do Matpower.");
      return;
    }

    if (!validateMatpowerFormat(currentInput)) {
      alert("A entrada fornecida não é válida! Verifique os dados inseridos, lembrando de manter a sintaxe similar a do Matpower.");
      return;
    }

    // Salvar o input antes de iniciar a simulação
    setInputValue(currentInput);
    setIsLoading(true);
    
    try {
      // Criar o arquivo .m com o conteúdo
      const formData = new FormData();
      const file = new File([currentInput], "file.m", { type: "text/plain" });
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
      
      // Formatar os resultados antes de exibir
      const formattedResult = formatResults(result);
      setOutput(formattedResult);
      
      // Mudar para a view de output
      setCurrentView('output');
    } catch (error) {
      console.error("Erro na simulação:", error);
      alert("Erro ao executar a simulação");
      setOutput("Erro ao executar a simulação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToInput = () => {
    setCurrentView('input');
    setOutput("");
  };

  const handleBackToMain = () => {
    router.push("/simulator");
  };

  const generatePDF = async () => {
    try {
      // Importar jsPDF dinamicamente
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const lineHeight = 6;
      let yPosition = margin;

      // Título do relatório
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Simulação - SIFP", pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2;

      // Data e hora
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const currentDate = new Date().toLocaleString('pt-BR');
      doc.text(`Gerado em: ${currentDate}`, margin, yPosition);
      yPosition += lineHeight * 2;

      // Seção de entrada
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Entrada (Código):", margin, yPosition);
      yPosition += lineHeight;

      doc.setFontSize(9);
      doc.setFont("courier", "normal");
      const inputLines = inputValue.split('\n');
      
      for (const line of inputLines) {
        if (yPosition > 270) { // Nova página se necessário
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight * 0.8;
      }

      yPosition += lineHeight;

      // Seção de saída
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resultados da Simulação:", margin, yPosition);
      yPosition += lineHeight;

      doc.setFontSize(8);
      doc.setFont("courier", "normal");
      const outputLines = output.split('\n');
      
      for (const line of outputLines) {
        if (yPosition > 280) { // Nova página se necessário
          doc.addPage();
          yPosition = margin;
        }
        // Truncar linhas muito longas
        const truncatedLine = line.length > 85 ? line.substring(0, 85) + '...' : line;
        doc.text(truncatedLine, margin, yPosition);
        yPosition += lineHeight * 0.7;
      }

      // Salvar o PDF
      doc.save(`relatorio-sifp-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o relatório PDF. Verifique se a biblioteca jsPDF está disponível.");
    }
  };

  // Componente da view de entrada
  const InputView = () => (
    <div className={styles.contentContainer}>
      <div className={styles.singleSection}>
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
            defaultValue={inputValue}
          />
        </div>
        <div className={styles.actions}>
          <button 
            className={styles.backButton} 
            onClick={handleBackToMain}
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
    </div>
  );

  // Componente da view de saída
  const OutputView = () => (
    <div className={styles.contentContainer}>
      <div className={styles.singleSection}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Saída</h2>
          <textarea
            className={styles.outputArea}
            value={output}
            readOnly
            spellCheck={false}
          />
        </div>
        <div className={styles.actions}>
          <button 
            className={styles.backButton} 
            onClick={handleBackToInput}
          >
            VOLTAR
          </button>
          <button
            className={styles.exportButton}
            onClick={generatePDF}
          >
            EXPORTAR
          </button>
        </div>
      </div>
    </div>
  );

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
        {currentView === 'input' ? <InputView /> : <OutputView />}
      </main>

      <Footer />
    </div>
  );
}