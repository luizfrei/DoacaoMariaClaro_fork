// frontend/src/types/user.ts

// A palavra "export" na frente do "type" transforma este arquivo em um módulo
// e permite que este tipo seja importado em outros lugares.

/**
 * Tipo de dados para o registo de um novo utilizador.
 * Corresponde ao `UserRegisterDto.cs` no backend.
 */
export type UserRegisterDto = {
  nome: string;
  email: string;
  senha: string;
};

/**
 * Tipo de dados para o login de um utilizador.
 * Corresponde ao `UserLoginDto.cs` no backend.
 */
export type UserLoginDto = {
  email: string;
  senha: string;
};

// Você pode adicionar outros tipos relacionados ao usuário aqui no futuro.
// Por exemplo, os dados do usuário que vêm do token decodificado:
export type DecodedToken = {
  nameid: string; // ID do usuário
  name: string;   // Nome do usuário
  role: 'Doador' | 'Admin'; // Papel do usuário
  exp: number;
  iat: number;
};