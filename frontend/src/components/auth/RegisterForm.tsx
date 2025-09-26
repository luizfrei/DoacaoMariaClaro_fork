"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation'; // 1. Importar o useRouter para redirecionamento
import { registerRequest } from "@/services/authService"; // 2. Importar a função de registro
import type { UserRegisterDto } from "@/types/user"; // Importar o tipo para garantir a consistência
import "./RegisterForm.css";
import { AxiosError } from "axios";

const RegisterForm: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState<string | null>(null); // Estado para mensagens de erro
  const [isLoading, setIsLoading] = useState(false); // Estado para feedback de carregamento
  const router = useRouter(); // Hook para navegação

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpa erros anteriores

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem!");
      return;
    }

    setIsLoading(true);

    const userData: UserRegisterDto = {
      nome,
      email,
      senha,
    };

    try {
      // 3. Chamar a função do serviço que se conecta ao backend
      const responseMessage = await registerRequest(userData);

      alert(responseMessage || "Usuário cadastrado com sucesso!"); // Usa a mensagem da API ou uma padrão
      router.push('/login'); // 4. Redireciona para o login após sucesso

    } catch (err) {
      // 5. Trata os erros que vêm do backend
      if (err instanceof AxiosError && err.response) {
        // Se for um erro do Axios, a mensagem do backend provavelmente está em err.response.data
        setError(err.response.data || "Ocorreu um erro ao tentar cadastrar.");
      } else {
        setError("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
        console.error(err);
      }
    } finally {
      setIsLoading(false); // Para o indicador de carregamento
    }
  };

  return (
    <div className="cadastro-container">
      <header className="topbar">Doação</header>
      <div className="form-box">
        <h2>Cadastro</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Insira seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="email"
            placeholder="Insira seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Insira sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Confirme sua senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            disabled={isLoading}
          />

          {/* Exibe a mensagem de erro, se houver */}
          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;