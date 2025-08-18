import { Header } from '@/components/layout/Header'; // 1. Importa o novo Header
import { TitleBanner } from '@/components/ui/TitleBanner';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="page-container">
      <Header /> {/* 2. Usa o componente Header que contém a TopBar e a Navbar */}
      <TitleBanner title="Doação" /> {/* O título na faixa azul */}
      <main className="main-content">
        <LoginForm />
      </main>
    </div>
  );
}
