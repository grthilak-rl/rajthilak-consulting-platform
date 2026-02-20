import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  transparentNav?: boolean;
}

export default function Layout({ children, transparentNav = false }: LayoutProps) {
  const location = useLocation();

  return (
    <>
      <Navbar transparent={transparentNav} />
      <main>
        <div className="page-transition" key={location.pathname}>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
