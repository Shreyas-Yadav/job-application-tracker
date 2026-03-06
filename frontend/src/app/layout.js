import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Job Application Tracker',
  description: 'Track your job applications',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
