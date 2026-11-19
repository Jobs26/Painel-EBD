/**
 * Paleta extraída do Figma "Painel EBD".
 * Use sempre estes tokens em vez de valores hexadecimais soltos nas telas.
 */
export const colors = {
  /** Fundo claro das telas (creme) */
  background: '#F8F6F0',
  /** Azul-marinho principal: botões e cabeçalho da Home */
  primary: '#243E56',
  /** Fundo dos campos de texto (primary com 30% de opacidade) */
  inputBackground: 'rgba(36, 62, 86, 0.3)',

  /** "Letters and Icons" */
  textPrimary: '#093030',
  /** "Dark Mode Green bar" — texto dos placeholders do cadastro */
  textSecondary: '#0E3E3E',
  /** Rótulos dos campos do cadastro */
  label: '#363130',
  /** "Dark Mode Icon Square" — textos de apoio */
  subtext: '#4B4544',
  link: '#3299FF',

  /** Barra de navegação inferior */
  navBackground: '#A1D8FF',
  navActive: '#CCEAFF',

  /** Card de balanço da Home */
  honeydew: '#F1FFF3',
  darkGreen: '#052224',
  expense: '#F27442',
  divider: '#DFF7E2',

  /** Preenchimento da barra de presença da Home ("Rectangle 161") */
  presence: '#7A9678',
  /** Linhas divisórias das listas (tabela de turmas) */
  line: 'rgba(0, 0, 0, 0.12)',
  /** Sombra suave dos cards */
  shadow: 'rgba(36, 62, 86, 0.10)',
  /** Divisória sobre fundo azul-marinho (card de resumo do relatório) */
  lineOnPrimary: 'rgba(204, 234, 255, 0.25)',

  white: '#FFFFFF',
  black: '#000000',
  placeholder: 'rgba(0, 0, 0, 0.45)',
  placeholderSecondary: 'rgba(14, 62, 62, 0.45)',
} as const;

export type ColorToken = keyof typeof colors;
