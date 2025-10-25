import styles from "../styles.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      © Copyright - univali.br - {new Date().getFullYear()} - Todos os direitos reservados
    </footer>
  );
}
