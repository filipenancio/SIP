import React from 'react';
import Image from 'next/image';
import styles from '../styles.module.css';

interface HeaderChildProps {
  title: string;
  logoSize?: number;
}

export default function HeaderChild({ title, logoSize = 60 }: HeaderChildProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Image
          src="/univali-logo.png"
          alt="UNIVALI Logo"
          width={logoSize}
          height={logoSize}
          className={styles.logo}
        />
        <h1 className={styles.headerTitle}>
          {title}
        </h1>
      </div>
    </header>
  );
}
