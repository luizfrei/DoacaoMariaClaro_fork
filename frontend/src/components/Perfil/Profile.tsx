"use client"; 

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// --- 1. IMPORTE A NOVA FUNÇÃO E O TIPO ---
import { getMyProfile, deleteUserRequest, updateUserRequest, getMyDonationsRequest } from '@/services/userService';
import type { UserDto, UserUpdateDto, TipoPessoa, PagamentoDto } from '@/types/user';
import "./Profile.css"; 
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { isValidCPF, isValidCNPJ } from "@/utils/validators";

// Helper para formatar Data (YYYY-MM-DD para input tipo 'date')
const formatDataParaInput = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    const data = new Date(dateString);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toISOString().split('T')[0];
  } catch (e) {
    return "";
  }
};

// Helper para formatar Data (exibição)
const formatDataExibicao = (dateString: string | null | undefined) => {
  if (!dateString) return 'Não informado';
  try {
    const data = new Date(dateString);
    // Ajuste para garantir que a data UTC seja exibida corretamente no fuso local
    const dataUtc = new Date(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate());
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC' // Trata a data como UTC
    }).format(dataUtc);
  } catch (e) {
    return 'Data inválida';
  }
};

// --- 2. ADICIONE ESTES NOVOS HELPERS ---
// Helper para formatar Valor (BRL)
const formatValor = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

// Helper para formatar Status (Tradução)
const formatStatus = (status: string) => {
  if (status.toLowerCase() === 'approved') return 'Aprovado';
  if (status.toLowerCase() === 'pending') return 'Pendente';
  if (status.toLowerCase() === 'rejected') return 'Recusado';
  return status;
};
// --- FIM DOS NOVOS HELPERS ---


const Profile: React.FC = () => {
  const { signOut } = useAuth();
  const router = useRouter(); 

  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 3. ADICIONE ESTADOS PARA AS DOAÇÕES ---
  const [donations, setDonations] = useState<PagamentoDto[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
  // --- FIM DOS ESTADOS DE DOAÇÕES ---

  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null); 
  const [isUpdating, setIsUpdating] = useState(false); 

  // ... (seus estados de edição existentes) ...
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTipoPessoa, setEditTipoPessoa] = useState<TipoPessoa | undefined>(undefined);
  const [editDocumento, setEditDocumento] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editCep, setEditCep] = useState("");
  const [editEndereco, setEditEndereco] = useState("");
  const [editBairro, setEditBairro] = useState("");
  const [editCidade, setEditCidade] = useState("");
  const [editEstado, setEditEstado] = useState("");
  const [editGenero, setEditGenero] = useState("");
  const [editComercioEndereco, setEditComercioEndereco] = useState("");
  const [editDataNascimento, setEditDataNascimento] = useState(""); 

  const preencherFormEdicao = (data: UserDto) => {
    setEditNome(data.nome);
    setEditEmail(data.email);
    setEditTipoPessoa(data.tipoPessoa);
    setEditDocumento(data.documento || "");
    setEditTelefone(data.telefone || "");
    setEditCep(data.cep || "");
    setEditEndereco(data.endereco || "");
    setEditBairro(data.bairro || "");
    setEditCidade(data.cidade || "");
    setEditEstado(data.estado || "");
    setEditGenero(data.genero || "");
    setEditComercioEndereco(data.comercioEndereco || "");
    setEditDataNascimento(formatDataParaInput(data.dataNascimento)); 
  };
  
  // --- 4. ATUALIZE O useEffect PARA BUSCAR AMBOS OS DADOS ---
  // (A sua função fetchProfile foi movida para dentro do useEffect)
  useEffect(() => {
    // Função unificada para buscar perfil e doações
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Busca o perfil (como antes)
        const profileData = await getMyProfile();
        setUser(profileData);
        preencherFormEdicao(profileData);
        
      } catch (err) {
        console.error("Falha ao buscar dados do perfil:", err);
        setError("Não foi possível carregar seu perfil. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }

      // Busca as doações (separadamente)
      try {
        setDonationsLoading(true);
        const donationsData = await getMyDonationsRequest();
        setDonations(donationsData);
      } catch (err) {
        console.error("Falha ao buscar doações:", err);
        // Não define o erro principal, para o perfil ainda carregar
      } finally {
        setDonationsLoading(false);
      }
    };

    fetchAllData();
  }, []); // O array vazio [] garante que isso só roda uma vez


  const limparDocumento = (doc: string): string => {
    return doc.replace(/[^\d]/g, ""); 
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); 
      setEditError(null); 
      setIsUpdating(true); 

      const documentoLimpo = limparDocumento(editDocumento);

      // Validação do Documento (Frontend)
      if (documentoLimpo.length > 0) {
          if (editTipoPessoa === 'Fisica' && !isValidCPF(documentoLimpo)) {
              setEditError("CPF inválido. Verifique os dígitos.");
              setIsUpdating(false);
              return;
          }
          if (editTipoPessoa === 'Juridica' && !isValidCNPJ(documentoLimpo)) {
              setEditError("CNPJ inválido. Verifique os dígitos.");
              setIsUpdating(false);
              return;
          }
           if (!editTipoPessoa) {
             setEditError("Selecione o tipo de pessoa (Física ou Jurídica) para o documento informado.");
             setIsUpdating(false);
             return;
           }
      } else if (editTipoPessoa) {
           setEditError("CPF/CNPJ é obrigatório ao selecionar um Tipo de Pessoa.");
           setIsUpdating(false);
           return;
      }


      if (!user) return; 

      const updateData: UserUpdateDto = {
          nome: editNome,
          email: editEmail,
          tipoPessoa: editTipoPessoa,
          documento: documentoLimpo.length > 0 ? documentoLimpo : undefined,
          telefone: editTelefone || undefined,
          cep: editCep || undefined,
          endereco: editEndereco || undefined,
          bairro: editBairro || undefined,
          cidade: editCidade || undefined,
          estado: editEstado || undefined,
          genero: editGenero || undefined,
          comercioEndereco: editComercioEndereco || undefined,
          dataNascimento: editDataNascimento || undefined
      };

      try {
          await updateUserRequest(user.id, updateData);
          alert("Perfil atualizado com sucesso!");
          setIsEditing(false); 
          
          // Recarrega os dados do perfil após a atualização
          setLoading(true);
          const profileData = await getMyProfile();
          setUser(profileData);
          preencherFormEdicao(profileData);
          setLoading(false);

      } catch (err) {
          if (err instanceof AxiosError && err.response?.data) {
              const apiError = err.response.data;
              let message = "Erro ao atualizar perfil.";
              if (typeof apiError === 'string') {
                  message = apiError;
              } else if (apiError.errors) {
                  const firstErrorKey = Object.keys(apiError.errors)[0];
                  message = apiError.errors[firstErrorKey][0];
              } else if (apiError.message || apiError.title) {
                  message = apiError.message || apiError.title;
              }
              setEditError(message);
          } else {
              setEditError("Não foi possível conectar ao servidor. Tente novamente.");
              console.error(err);
          }
      } finally {
          setIsUpdating(false); 
      }
  };

  // --- Renderização ---
  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Carregando perfil...</p>;
  }

  if (error) {
    return <p style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</p>;
  }
  
  if (!user) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Nenhum dado de usuário encontrado.</p>;
  }

  return (
    <>
      <header className="topbar">Perfil</header>
      <div className="perfil-container">
        <h1 className="perfil-nome">{isEditing ? 'Editar Perfil' : user.nome}</h1>

        {isEditing ? (
          // --- MODO DE EDIÇÃO (Seu código existente) ---
          <form onSubmit={handleUpdate} className='edit-form' style={{width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '25px'}}>
            
            {/* Card 1: Dados Obrigatórios e Documentos */}
            <div className="card">
              <h2 className="card-title">Dados Obrigatórios</h2>
              <div className="form-group">
                <label htmlFor="nome">Nome / Razão Social:</label>
                <input type="text" id="nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} required disabled={isUpdating} />
              </div>
              <div className="form-group">
                 <label htmlFor="email">Email:</label>
                 <input type="email" id="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required disabled={isUpdating} />
              </div>
              <h3 className="card-subtitle">Documentos</h3>
              <div className="form-group tipo-pessoa-edit">
                 <label>Tipo de Pessoa:</label>
                 <div>
                    <label>
                       <input type="radio" name="editTipoPessoa" value="Fisica" checked={editTipoPessoa === 'Fisica'} onChange={() => setEditTipoPessoa('Fisica')} disabled={isUpdating} /> Física
                    </label>
                    <label>
                       <input type="radio" name="editTipoPessoa" value="Juridica" checked={editTipoPessoa === 'Juridica'} onChange={() => setEditTipoPessoa('Juridica')} disabled={isUpdating} /> Jurídica
                    </label>
                 </div>
              </div>
               <div className="form-group">
                  <label htmlFor="documento">CPF / CNPJ (somente números):</label>
                  <input
                     type="text"
                     id="documento"
                     placeholder={editTipoPessoa === 'Fisica' ? "CPF (11 dígitos)" : editTipoPessoa === 'Juridica' ? "CNPJ (14 dígitos)" : "Selecione o tipo acima"}
                     value={editDocumento}
                     onChange={(e) => setEditDocumento(e.target.value)}
                     disabled={isUpdating || !editTipoPessoa}
                     maxLength={editTipoPessoa === 'Fisica' ? 11 : 14}
                  />
               </div>
            </div>

            {/* Card 2: Dados Extras (Seu código existente) */}
            <div className="card">
                <h2 className="card-title">Dados Extras (Não Obrigatório)</h2>
                <div className="form-group">
                   <label htmlFor="genero">Gênero:</label>
                   <input type="text" id="genero" placeholder="Masculino, Feminino, Outro, etc." value={editGenero} onChange={(e) => setEditGenero(e.target.value)} disabled={isUpdating} />
                </div>
                <div className="form-group">
                   <label htmlFor="dataNascimento">Data de Nascimento:</label>
                   <input type="date" id="dataNascimento" value={editDataNascimento} onChange={(e) => setEditDataNascimento(e.target.value)} disabled={isUpdating} />
                </div>
                <div className="form-group">
                   <label htmlFor="telefone">Telefone / Celular:</label>
                   <input type="tel" id="telefone" placeholder="(XX) XXXXX-XXXX" value={editTelefone} onChange={(e) => setEditTelefone(e.target.value)} disabled={isUpdating} />
                </div>
                <div className="form-group">
                   <label htmlFor="cep">CEP:</label>
                   <input type="text" id="cep" placeholder="XXXXX-XXX" value={editCep} onChange={(e) => setEditCep(e.target.value)} disabled={isUpdating} />
                </div>
                <div className="form-group">
                   <label htmlFor="endereco">Endereço (Rua, N°, Compl.):</label>
                   <input type="text" id="endereco" value={editEndereco} onChange={(e) => setEditEndereco(e.target.value)} disabled={isUpdating} />
                </div>
                <div className="form-group">
                   <label htmlFor="bairro">Bairro:</label>
                   <input type="text" id="bairro" value={editBairro} onChange={(e) => setEditBairro(e.target.value)} disabled={isUpdating} />
                </div>
                <div className="form-group">
                   <label htmlFor="cidade">Cidade:</label>
                   <input type="text" id="cidade" value={editCidade} onChange={(e) => setEditCidade(e.target.value)} disabled={isUpdating} />
                </div>
                <div className="form-group">
                   <label htmlFor="estado">Estado (Ex: SP):</label>
                   <input type="text" id="estado" value={editEstado} onChange={(e) => setEditEstado(e.target.value)} disabled={isUpdating} maxLength={2} />
                </div>
                <div className="form-group">
                   <label htmlFor="comercioEndereco">Endereço Comercial:</label>
                   <input type="text" id="comercioEndereco" value={editComercioEndereco} onChange={(e) => setEditComercioEndereco(e.target.value)} disabled={isUpdating} />
                </div>
                 {editError && <p className="error-message" style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{editError}</p>}
                 <div className="edit-actions">
                     <button type="button" onClick={() => { setIsEditing(false); setEditError(null); user && preencherFormEdicao(user); }} disabled={isUpdating} className='cancel-button'>Cancelar</button>
                     <button type="submit" disabled={isUpdating} className='save-button'>
                        {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                     </button>
                 </div>
            </div>
            
          </form>
        ) : (
          // --- MODO DE VISUALIZAÇÃO (Seu código existente) ---
          <>
            {/* Card 1: Dados Principais */}
            <div className="card">
              <h2 className="card-title">Meus Dados</h2>
              <div className="info-grid">
                <div className="info-item"><strong>Nome:</strong> <span>{user.nome}</span></div>
                <div className="info-item"><strong>Email:</strong> <span>{user.email}</span></div>
                <div className="info-item"><strong>Tipo de Conta:</strong> <span>{user.tipoUsuario}</span></div>
                <div className="info-item"><strong>Membro desde:</strong> <span>{formatDataExibicao(user.dataCadastro)}</span></div>
              </div>
              <h3 className="card-subtitle">Documentos</h3>
              <div className="info-grid">
                <div className="info-item"><strong>Tipo de Pessoa:</strong> <span>{user.tipoPessoa || 'Não informado'}</span></div>
                <div className="info-item"><strong>CPF/CNPJ:</strong> <span>{user.documento || 'Não informado'}</span></div>
              </div>
               <div className="actions">
                  <button className="edit-button" onClick={() => setIsEditing(true)}>Editar Perfil</button>
               </div>
            </div>

            {/* Card 2: Dados Extras */}
            <div className="card">
              <h2 className="card-title">Dados Extras (Não Obrigatório)</h2>
              <div className="info-grid">
                <div className="info-item"><strong>Telefone:</strong> <span>{user.telefone || 'Não informado'}</span></div>
                <div className="info-item"><strong>Gênero:</strong> <span>{user.genero || 'Não informado'}</span></div>
                <div className="info-item"><strong>Data Nasc.:</strong> <span>{formatDataExibicao(user.dataNascimento)}</span></div>
                <div className="info-item"><strong>CEP:</strong> <span>{user.cep || 'Não informado'}</span></div>
                <div className="info-item"><strong>Endereço:</strong> <span>{user.endereco || 'Não informado'}</span></div>
                <div className="info-item"><strong>Bairro:</strong> <span>{user.bairro || 'Não informado'}</span></div>
                <div className="info-item"><strong>Cidade:</strong> <span>{user.cidade || 'Não informado'}</span></div>
                <div className="info-item"><strong>Estado:</strong> <span>{user.estado || 'Não informado'}</span></div>
                <div className="info-item"><strong>End. Comercial:</strong> <span>{user.comercioEndereco || 'Não informado'}</span></div>
              </div>
            </div>
          </>
        )}

        {/* === 5. CARD DE DOAÇÕES ATUALIZADO === */}
        <div className="card">
          <h2 className="card-title">Histórico de Doações</h2>
          <table className="tabela-doacoes">
             <thead>
               <tr>
                 <th>Data</th>
                 <th>Valor</th>
                 <th>Status</th>
               </tr>
             </thead>
             <tbody>
              {donationsLoading ? (
                // Estado de Carregamento
                <tr><td colSpan={3} style={{textAlign: 'center', padding: '20px'}}>Carregando histórico...</td></tr>
              ) : donations.length === 0 ? (
                // Estado Vazio
                <tr><td colSpan={3} style={{textAlign: 'center', padding: '20px'}}>Nenhuma doação aprovada encontrada.</td></tr>
              ) : (
                // Mapeia e exibe cada doação
                donations.map((doacao, index) => (
                  <tr key={index}>
                    {/* Usa os helpers para formatar os dados */}
                    <td>{formatDataExibicao(doacao.dataCriacao)}</td>
                    <td>{formatValor(doacao.valor)}</td>
                    <td>{formatStatus(doacao.status)}</td>
                  </tr>
                ))
              )}
             </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Profile;