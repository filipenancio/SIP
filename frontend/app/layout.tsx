import './globals.css';

export const metadata = {
  title: 'SIP - Simulador Iterativo de Potência',
  description: 'Simulador de sistemas de potência da UNIVALI',
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