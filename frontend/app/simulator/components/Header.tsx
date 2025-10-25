import styles from "../styles.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1>Simulador de Sistemas de Potência</h1>
      </div>
    </header>
  );
}
