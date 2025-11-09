"use client";

import React, { useState, useEffect, useCallback } from "react";
// Ícones
import { FaThLarge, FaUsers, FaFileAlt, FaUser, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaEdit } from "react-icons/fa";
// Estilos
import "./Dashboard.css";
// Serviços da API e Tipos
// (Vamos assumir que getUserStatsRequest será criado no futuro, por enquanto o removemos se não existir)
// import { getAllUsersRequest, getUserStatsRequest, UserFilters } from "@/services/userService";
// import type { UserDto, UserStatsDto } from "@/types/user";
import { getAllUsersRequest, UserFilters } from "@/services/userService";
import type { UserDto } from "@/types/user";

// Contexto de Autenticação
import { useAuth } from "@/contexts/AuthContext";
// Modais
import UserDetailsModal from './UserDetailsModal';
import EditRoleModal from './EditRoleModal'; 
// Utilitário Debounce
import debounce from 'lodash/debounce';

// --- CORREÇÃO APLICADA AQUI ---
// Constante para o número de itens por página
const PAGE_SIZE = 5;

const Dashboard: React.FC = () => {
  // Estados para a lista de usuários, carregamento e erro geral
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Obtém o usuário logado e a função signOut do contexto
  const { user: authUser, signOut } = useAuth();

  // Estados para controle da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Estados para o modal de DETALHES
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Estados para o modal de EDIÇÃO DE PAPEL
  const [editingUser, setEditingUser] = useState<UserDto | null>(null); // Guarda o objeto User a editar
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);

  // Estados para os valores dos FILTROS
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedTipoPessoa, setSelectedTipoPessoa] = useState('');

  // (Estados para estatísticas - comentei se você ainda não os implementou)
  // const [stats, setStats] = useState<UserStatsDto | null>(null);
  // const [statsLoading, setStatsLoading] = useState(true);

  // Calcula o número total de páginas baseado no total de usuários e itens por página
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  // --- Função para buscar os usuários da API ---
  const fetchUsers = useCallback(async (page: number, filters: UserFilters = {}) => {
    try {
      setLoading(true); 
      setError(null); 
      // Chama o serviço da API passando página e filtros
      const data = await getAllUsersRequest(page, PAGE_SIZE, filters);
      setUsers(data.items); 
      setTotalUsers(data.totalCount); 
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Não foi possível carregar os usuários. Tente recarregar a página.");
    } finally {
      setLoading(false); 
    }
  }, []); 

  // --- useEffect para buscar as Estatísticas (se existir) ---
  /*
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const statsData = await getUserStatsRequest();
        setStats(statsData);
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []); 
  */

  // --- useEffect principal para buscar dados ---
  useEffect(() => {
    const currentFilters: UserFilters = {
      search: searchTerm || undefined, 
      role: selectedRole || undefined,
      tipoPessoa: selectedTipoPessoa || undefined,
    };
    fetchUsers(currentPage, currentFilters);
  }, [currentPage, searchTerm, selectedRole, selectedTipoPessoa, fetchUsers]); 

  // --- Lógica de Debounce para o campo de busca ---
  const debouncedSearch = useCallback(
    debounce((term: string, currentRole: string, currentTipo: string) => {
      const currentFilters: UserFilters = {
        search: term || undefined,
        role: currentRole || undefined,
        tipoPessoa: currentTipo || undefined,
      };
      fetchUsers(1, currentFilters);
    }, 500), 
    [fetchUsers] 
  );

  // Função chamada quando o valor do input de busca muda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm); 
    setCurrentPage(1); // Volta para a primeira página
    debouncedSearch(newSearchTerm, selectedRole, selectedTipoPessoa);
  };
 
  // Função chamada quando o select de Papel (Role) muda
  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value); 
    setCurrentPage(1); 
  };

  // Função chamada quando o select de Tipo de Pessoa muda
  const handleTipoPessoaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTipoPessoa(event.target.value); 
    setCurrentPage(1); 
  };

  // Funções para controle da paginação
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1)); 
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)); 

  // Funções para abrir/fechar o modal de DETALHES
  const handleRowClick = (userId: number) => { 
    setSelectedUserId(userId);
    setIsDetailsModalOpen(true);
  };
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedUserId(null); 
  };

  // Funções para abrir/fechar o modal de EDIÇÃO DE PAPEL
  const handleEditRoleClick = (event: React.MouseEvent, userToEdit: UserDto) => { 
    event.stopPropagation(); 
    setEditingUser(userToEdit); 
    setIsEditRoleModalOpen(true); 
  };
  const handleCloseEditRoleModal = () => {
    setIsEditRoleModalOpen(false);
    setEditingUser(null); 
  };
  
  const handleRoleUpdated = () => {
      const currentFilters: UserFilters = { search: searchTerm, role: selectedRole, tipoPessoa: selectedTipoPessoa };
      fetchUsers(currentPage, currentFilters);
  };

  // --- Renderização do Componente ---
  return (
    <div className="dashboard-container">
      {/* Sidebar (Menu Lateral Amarelo) */}
      <aside className="sidebar">
         <ul>
           <li><FaThLarge title="Visão Geral (Não implementado)" /></li>
           <li className="active"><FaUsers title="Usuários" /></li>
           <li><FaFileAlt title="Doações (Não implementado)" /></li>
           <li><FaUser title="Meu Perfil" /></li> 
           <li onClick={signOut} title="Sair"><FaSignOutAlt /></li>
         </ul>
      </aside>

      {/* Conteúdo Principal (à direita da sidebar) */}
      <div className="dashboard-content">
        {/* Header (Barra Azul no Topo) */}
        <header className="dashboard-header">Dashboard</header>

        {/* Área Principal abaixo do Header */}
        <main className="dashboard-main">
          {/* Título da Seção */}
          <h2 className="section-title">Gerenciamento de Usuários</h2>

          {/* Área de Filtros */}
          <div className="filter-controls">
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou ID..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange} // Usa a função com debounce
            />
            <select className="filter-select" value={selectedRole} onChange={handleRoleChange}>
              <option value="">Todos os Papéis</option>
              <option value="Doador">Doador</option>
              <option value="Colaborador">Colaborador</option>
              <option value="Administrador">Administrador</option>
            </select>
            <select className="filter-select" value={selectedTipoPessoa} onChange={handleTipoPessoaChange}>
              <option value="">Todos os Tipos</option>
              <option value="Fisica">Pessoa Física</option>
              <option value="Juridica">Pessoa Jurídica</option>
            </select>
          </div>

          {/* Exibição Condicional: Carregando / Erro / Tabela */}
          {loading && <p style={{ textAlign: 'center', padding: '30px' }}>Carregando usuários...</p>}
          {error && <p style={{ color: 'red', textAlign: 'center', padding: '30px' }}>{error}</p>}

          {!loading && !error && ( 
            <>
              <div className="tabela-container">
                <table className="tabela tabela-usuarios">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>Papel</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} onClick={() => handleRowClick(user.id)} title="Clique para ver detalhes">
                        <td>{user.nome}</td>
                        <td>{user.email}</td>
                        <td>{user.tipoUsuario}</td>
                        <td>
                          <button className="details-button" onClick={(e) => { e.stopPropagation(); handleRowClick(user.id); }}>
                            Detalhes
                          </button>
                          {authUser?.role === 'Administrador' && user.id !== parseInt(authUser.id, 10) && (
                             <button
                               className="edit-role-button" 
                               onClick={(e) => handleEditRoleClick(e, user)}
                               title="Editar Papel"
                              >
                               <FaEdit /> 
                             </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                          Nenhum usuário encontrado com os filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Controles de Paginação (só aparecem se houver mais de uma página) */}
              {totalPages > 1 && (
                <div className="pagination-controls"> 
                  <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <FaChevronLeft /> Anterior
                  </button>
                  <span>Página {currentPage} de {totalPages}</span>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Próxima <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Renderização Condicional dos Modais */}
      {isDetailsModalOpen && selectedUserId && (
        <UserDetailsModal userId={selectedUserId} onClose={handleCloseDetailsModal} />
      )}

      {isEditRoleModalOpen && editingUser && (
        <EditRoleModal
          user={editingUser} 
          onClose={handleCloseEditRoleModal} 
          onRoleUpdated={handleRoleUpdated} 
        />
      )}
    </div>
  );
};

export default Dashboard;