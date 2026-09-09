import { Tajawal } from 'next/font/google';
import './globals.css';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
});

export const metadata = {
  title: 'مواعيدنا',
  description: 'تقويم عائلي مشترك، متزامن مباشرة مع Google Calendar لكل طرف.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="font-body text-black antialiased">{children}</body>
    </html>
  );
}
