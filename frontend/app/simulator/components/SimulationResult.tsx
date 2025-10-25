import styles from "../styles.module.css";
import { SimulationResults } from "../interfaces";

interface SimulationResultProps {
  onBack: () => void;
  result: SimulationResults;
}

export default function SimulationResult({ onBack, result }: SimulationResultProps) {
  if (!result) return null;

  return (
    <div className={styles.resultContainer}>
      <h2 className={styles.subtitle}>Resultado da Simulação</h2>

      {/* Mostrar informações básicas */}
      <div className={styles.infoSection}>
        <h3>Informações do Sistema</h3>
        <p>Número de barras: {result.nBus}</p>
        <p>Potência base (MVA): {result.baseMVA}</p>
      </div>

      {/* Mostrar resultados das barras */}
      <div className={styles.resultSection}>
        <h3>Tensões nas Barras</h3>
        <div className={styles.resultGrid}>
          {result.voltages?.map((voltage: any, index: number) => (
            <div key={index} className={styles.resultCard}>
              <h4>Barra {index + 1}</h4>
              <p>Magnitude: {voltage.magnitude.toFixed(4)} p.u.</p>
              <p>Ângulo: {voltage.angle.toFixed(2)}°</p>
            </div>
          ))}
        </div>
      </div>

      {/* Botões de ação */}
      <div className={styles.actionButtons}>
        <button className={styles.secondaryButton} onClick={onBack}>
          Voltar
        </button>
        <button className={styles.primaryButton}>
          Exportar Resultados
        </button>
      </div>
    </div>
  );
}
  