import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  transparentNav?: boolean;
}

export default function Layout({ children, transparentNav = false }: LayoutProps) {
  return (
    <>
      <Navbar transparent={transparentNav} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
