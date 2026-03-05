import './globals.css';

export const metadata = {
  title: 'Job Application Tracker',
  description: 'Track your job applications',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
