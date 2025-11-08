import './globals.css';

export const metadata = {
  title: 'SISEP - Simulador Interativo de Sistemas Elétricos de Potência',
  description: 'Simulador de sistemas elétricos de potência - Autor: Filipe G Venâncio - TCC UNIVALI - Curso de Engenharia Elétrica - 2025',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body>
        {children}
      </body>
    </html>
  );
}