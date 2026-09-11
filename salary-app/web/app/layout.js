import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-cairo',
});

export const metadata = {
  title: 'توزيع الراتب',
  description: 'وزّع راتبك الشهري على فئات المصروفات وتابع الالتزام بالخطة.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-body text-gray-900 antialiased">{children}</body>
    </html>
  );
}
