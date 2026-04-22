// Base de dados de pedágios do Brasil (Fontes: ANTT, dados públicos)
// Valores em R$ por tipo de eixo: 2 eixos, 4 eixos, 6 eixos
// Geolocalização baseada no Portal de Dados Abertos da ANTT

export interface Pedagio {
  id: number
  nome: string
  rodovia: string
  estado: string
  lat: number
  lng: number
  valores: {
    2: number
    4: number
    6: number
  }
}

export const pedagios: Pedagio[] = [
  // ===================== SP - ANHANGUERA / BANDEIRANTES =====================
  { id: 1,  nome: 'Pedágio Sumaré',              rodovia: 'SP-330',  estado: 'SP', lat: -22.8203, lng: -47.2661, valores: { 2: 7.80,  4: 15.60, 6: 23.40 } },
  { id: 2,  nome: 'Pedágio Cordeirópolis',        rodovia: 'SP-330',  estado: 'SP', lat: -22.4818, lng: -47.4611, valores: { 2: 8.20,  4: 16.40, 6: 24.60 } },
  { id: 3,  nome: 'Pedágio Limeira',              rodovia: 'SP-330',  estado: 'SP', lat: -22.5606, lng: -47.4018, valores: { 2: 7.50,  4: 15.00, 6: 22.50 } },
  { id: 4,  nome: 'Pedágio Leme',                 rodovia: 'SP-330',  estado: 'SP', lat: -22.1876, lng: -47.3887, valores: { 2: 8.30,  4: 16.60, 6: 24.90 } },
  { id: 5,  nome: 'Pedágio Araras',               rodovia: 'SP-330',  estado: 'SP', lat: -22.3571, lng: -47.3836, valores: { 2: 7.90,  4: 15.80, 6: 23.70 } },
  { id: 6,  nome: 'Pedágio Itu',                  rodovia: 'SP-330',  estado: 'SP', lat: -23.2608, lng: -47.2988, valores: { 2: 7.60,  4: 15.20, 6: 22.80 } },
  { id: 7,  nome: 'Pedágio Porto Feliz',           rodovia: 'SP-280',  estado: 'SP', lat: -23.2116, lng: -47.5232, valores: { 2: 9.50,  4: 19.00, 6: 28.50 } },
  { id: 8,  nome: 'Pedágio Atibaia',              rodovia: 'SP-360',  estado: 'SP', lat: -23.1170, lng: -46.5563, valores: { 2: 8.70,  4: 17.40, 6: 26.10 } },

  // ===================== SP - CASTELINHO / VIA DUTRA =====================
  { id: 9,  nome: 'Pedágio Guaratinguetá',        rodovia: 'BR-116',  estado: 'SP', lat: -22.8157, lng: -45.1921, valores: { 2: 11.30, 4: 22.60, 6: 33.90 } },
  { id: 10, nome: 'Pedágio Lorena',               rodovia: 'BR-116',  estado: 'SP', lat: -22.7263, lng: -45.1215, valores: { 2: 11.90, 4: 23.80, 6: 35.70 } },
  { id: 11, nome: 'Pedágio Pindamonhangaba',      rodovia: 'BR-116',  estado: 'SP', lat: -22.9248, lng: -45.4614, valores: { 2: 11.10, 4: 22.20, 6: 33.30 } },
  { id: 12, nome: 'Pedágio São José dos Campos',  rodovia: 'BR-116',  estado: 'SP', lat: -23.2060, lng: -45.8803, valores: { 2: 10.80, 4: 21.60, 6: 32.40 } },
  { id: 13, nome: 'Pedágio Jacareí',              rodovia: 'BR-116',  estado: 'SP', lat: -23.3058, lng: -45.9656, valores: { 2: 10.60, 4: 21.20, 6: 31.80 } },
  { id: 14, nome: 'Pedágio Caçapava',             rodovia: 'BR-116',  estado: 'SP', lat: -23.1062, lng: -45.7053, valores: { 2: 10.40, 4: 20.80, 6: 31.20 } },
  { id: 15, nome: 'Pedágio Retiro dos Padres',    rodovia: 'BR-116',  estado: 'SP', lat: -22.5612, lng: -44.9831, valores: { 2: 12.20, 4: 24.40, 6: 36.60 } },

  // ===================== SP - IMIGRANTES / ANCHIETA =====================
  { id: 16, nome: 'Pedágio Montserrat',           rodovia: 'SP-150',  estado: 'SP', lat: -23.7018, lng: -46.4890, valores: { 2: 15.50, 4: 31.00, 6: 46.50 } },
  { id: 17, nome: 'Pedágio Imigrantes',           rodovia: 'SP-160',  estado: 'SP', lat: -23.7831, lng: -46.3729, valores: { 2: 18.20, 4: 36.40, 6: 54.60 } },

  // ===================== MG/GO - BR-050 (Uberlândia ↔ Brasília) =====================
  { id: 101, nome: 'P04 - Araguari 2',       rodovia: 'BR-050', estado: 'MG', lat: -18.6420, lng: -48.1880, valores: { 2: 11.00, 4: 22.00, 6: 33.00 } },
  { id: 103, nome: 'P03 - Araguari 1',       rodovia: 'BR-050', estado: 'MG', lat: -18.4230, lng: -48.0660, valores: { 2: 14.60, 4: 29.20, 6: 43.80 } },
  { id: 105, nome: 'P02 - Campo Alegre',     rodovia: 'BR-050', estado: 'GO', lat: -17.9500, lng: -47.9300, valores: { 2: 19.20, 4: 38.40, 6: 57.60 } },
  { id: 32,  nome: 'P01 - Ipameri',          rodovia: 'BR-050', estado: 'GO', lat: -17.5200, lng: -47.8100, valores: { 2: 17.80, 4: 35.60, 6: 53.40 } },
  { id: 18,  nome: 'Pedágio Uberaba',        rodovia: 'BR-050', estado: 'MG', lat: -19.7473, lng: -47.9322, valores: { 2: 10.50, 4: 21.00, 6: 31.50 } },
  { id: 107, nome: 'Pedágio Cristalina',     rodovia: 'BR-050', estado: 'GO', lat: -16.7671, lng: -47.6123, valores: { 2: 9.20,  4: 18.40, 6: 27.60 } },
  { id: 108, nome: 'Pedágio Luziânia',       rodovia: 'BR-040', estado: 'GO', lat: -16.2582, lng: -47.9503, valores: { 2: 8.90,  4: 17.80, 6: 26.70 } },
  { id: 109, nome: 'Pedágio Valparaíso',     rodovia: 'BR-040', estado: 'GO', lat: -16.0609, lng: -47.9972, valores: { 2: 8.50,  4: 17.00, 6: 25.50 } },

  // ===================== GO - BR-060 (Goiânia → Brasília) =====================
  { id: 29, nome: 'Pedágio Goiânia Norte',        rodovia: 'BR-153',  estado: 'GO', lat: -16.6869, lng: -49.2648, valores: { 2: 9.30,  4: 18.60, 6: 27.90 } },
  { id: 30, nome: 'Pedágio Anápolis',             rodovia: 'BR-153',  estado: 'GO', lat: -16.3281, lng: -48.9531, valores: { 2: 8.80,  4: 17.60, 6: 26.40 } },
  { id: 31, nome: 'Pedágio Alexânia',             rodovia: 'BR-060',  estado: 'GO', lat: -15.9310, lng: -48.5031, valores: { 2: 8.20,  4: 16.40, 6: 24.60 } },
  { id: 33, nome: 'Pedágio Caldas Novas',         rodovia: 'BR-153',  estado: 'GO', lat: -17.7438, lng: -48.6253, valores: { 2: 9.50,  4: 19.00, 6: 28.50 } },
  { id: 110, nome: 'Pedágio Hidrolândia (GO-060)',rodovia: 'GO-060',  estado: 'GO', lat: -16.9769, lng: -49.2190, valores: { 2: 7.80,  4: 15.60, 6: 23.40 } },
  { id: 111, nome: 'Pedágio Campo Limpo de Goiás',rodovia: 'BR-060',  estado: 'GO', lat: -16.5220, lng: -49.0050, valores: { 2: 8.60,  4: 17.20, 6: 25.80 } },
  { id: 112, nome: 'Pedágio Santo Antônio Descoberto', rodovia: 'BR-060', estado: 'GO', lat: -15.9441, lng: -48.2645, valores: { 2: 7.90, 4: 15.80, 6: 23.70 } },

  // ===================== MG - BR-262 =====================
  { id: 21, nome: 'Pedágio Araxá',                rodovia: 'BR-262',  estado: 'MG', lat: -19.5890, lng: -46.9421, valores: { 2: 8.60,  4: 17.20, 6: 25.80 } },
  { id: 22, nome: 'Pedágio Sacramento',           rodovia: 'BR-262',  estado: 'MG', lat: -19.8570, lng: -47.4360, valores: { 2: 8.90,  4: 17.80, 6: 26.70 } },
  { id: 113, nome: 'Pedágio Ibiraci (BR-262)',    rodovia: 'BR-262',  estado: 'MG', lat: -20.4627, lng: -47.1175, valores: { 2: 8.20,  4: 16.40, 6: 24.60 } },
  { id: 114, nome: 'Pedágio São Sebastião Paraíso', rodovia: 'BR-262', estado: 'MG', lat: -20.9165, lng: -47.0992, valores: { 2: 8.50, 4: 17.00, 6: 25.50 } },

  // ===================== MG - BR-365 =====================
  { id: 23, nome: 'Pedágio Abadia dos Dourados (BR-365)', rodovia: 'BR-365', estado: 'MG', lat: -18.4892, lng: -47.3951, valores: { 2: 7.20, 4: 14.40, 6: 21.60 } },
  { id: 24, nome: 'Pedágio Patrocínio',           rodovia: 'BR-365',  estado: 'MG', lat: -18.9360, lng: -46.9870, valores: { 2: 7.40,  4: 14.80, 6: 22.20 } },
  { id: 25, nome: 'Pedágio Perdizes',             rodovia: 'BR-365',  estado: 'MG', lat: -19.3440, lng: -47.2970, valores: { 2: 8.10,  4: 16.20, 6: 24.30 } },
  { id: 115, nome: 'Pedágio Coromandel',          rodovia: 'BR-365',  estado: 'MG', lat: -18.4724, lng: -47.2004, valores: { 2: 7.60,  4: 15.20, 6: 22.80 } },

  // ===================== MG - BR-040 e Anel de BH =====================
  { id: 26, nome: 'Pedágio Belo Horizonte (Anel)', rodovia: 'BR-040', estado: 'MG', lat: -19.9218, lng: -43.9461, valores: { 2: 9.20,  4: 18.40, 6: 27.60 } },
  { id: 27, nome: 'Pedágio Betim',                rodovia: 'BR-381',  estado: 'MG', lat: -19.9680, lng: -44.1980, valores: { 2: 9.70,  4: 19.40, 6: 29.10 } },
  { id: 28, nome: 'Pedágio Sete Lagoas',          rodovia: 'BR-040',  estado: 'MG', lat: -19.4602, lng: -44.2478, valores: { 2: 8.40,  4: 16.80, 6: 25.20 } },
  { id: 116, nome: 'Pedágio Paraopeba',           rodovia: 'BR-040',  estado: 'MG', lat: -19.2744, lng: -44.4054, valores: { 2: 7.90,  4: 15.80, 6: 23.70 } },
  { id: 117, nome: 'Pedágio Curvelo',             rodovia: 'BR-040',  estado: 'MG', lat: -18.7554, lng: -44.4326, valores: { 2: 8.20,  4: 16.40, 6: 24.60 } },
  { id: 118, nome: 'Pedágio Três Marias',         rodovia: 'BR-040',  estado: 'MG', lat: -18.2166, lng: -45.2485, valores: { 2: 8.50,  4: 17.00, 6: 25.50 } },
  { id: 119, nome: 'Pedágio Buritis (BR-040)',    rodovia: 'BR-040',  estado: 'MG', lat: -15.6179, lng: -46.4220, valores: { 2: 9.10,  4: 18.20, 6: 27.30 } },
  { id: 120, nome: 'Pedágio Unaí',               rodovia: 'BR-040',  estado: 'MG', lat: -16.3598, lng: -46.9122, valores: { 2: 8.80,  4: 17.60, 6: 26.40 } },
  { id: 121, nome: 'Pedágio Formosa (GO-BR040)',  rodovia: 'BR-040',  estado: 'GO', lat: -15.5325, lng: -47.3388, valores: { 2: 8.60,  4: 17.20, 6: 25.80 } },

  // ===================== PR - BR-277 / BR-376 =====================
  { id: 34, nome: 'Pedágio Curitiba (BR-277)',    rodovia: 'BR-277',  estado: 'PR', lat: -25.4284, lng: -49.2733, valores: { 2: 11.50, 4: 23.00, 6: 34.50 } },
  { id: 35, nome: 'Pedágio São Luiz do Purunã',   rodovia: 'BR-277',  estado: 'PR', lat: -25.4600, lng: -49.8720, valores: { 2: 14.30, 4: 28.60, 6: 42.90 } },
  { id: 36, nome: 'Pedágio Ponta Grossa',         rodovia: 'BR-376',  estado: 'PR', lat: -25.0944, lng: -50.1619, valores: { 2: 10.40, 4: 20.80, 6: 31.20 } },
  { id: 37, nome: 'Pedágio Londrina',             rodovia: 'BR-369',  estado: 'PR', lat: -23.3105, lng: -51.1634, valores: { 2: 9.80,  4: 19.60, 6: 29.40 } },
  { id: 38, nome: 'Pedágio Maringá',              rodovia: 'BR-376',  estado: 'PR', lat: -23.4200, lng: -51.9330, valores: { 2: 9.50,  4: 19.00, 6: 28.50 } },
  { id: 39, nome: 'Pedágio Guarapuava',           rodovia: 'BR-277',  estado: 'PR', lat: -25.3930, lng: -51.4530, valores: { 2: 10.60, 4: 21.20, 6: 31.80 } },
  { id: 40, nome: 'Pedágio Cascavel',             rodovia: 'BR-277',  estado: 'PR', lat: -24.9557, lng: -53.4552, valores: { 2: 11.80, 4: 23.60, 6: 35.40 } },
  { id: 122, nome: 'Pedágio Santa Terezinha Itaipu', rodovia: 'BR-277', estado: 'PR', lat: -25.4338, lng: -54.3888, valores: { 2: 11.80, 4: 23.60, 6: 35.40 } },
  { id: 123, nome: 'Pedágio Mauá da Serra',       rodovia: 'BR-376',  estado: 'PR', lat: -23.9334, lng: -51.1940, valores: { 2: 10.10, 4: 20.20, 6: 30.30 } },
  { id: 124, nome: 'Pedágio Apucarana',           rodovia: 'BR-376',  estado: 'PR', lat: -23.5522, lng: -51.4608, valores: { 2: 9.70,  4: 19.40, 6: 29.10 } },
  { id: 125, nome: 'Pedágio Campo Mourão (PR-323)', rodovia: 'PR-323', estado: 'PR', lat: -24.0482, lng: -52.3797, valores: { 2: 6.90, 4: 13.80, 6: 20.70 } },

  // ===================== RS - BR-116 / BR-290 / BR-386 =====================
  { id: 41, nome: 'Pedágio Porto Alegre (Freeway)', rodovia: 'BR-290', estado: 'RS', lat: -29.9828, lng: -51.1800, valores: { 2: 10.20, 4: 20.40, 6: 30.60 } },
  { id: 42, nome: 'Pedágio Osório',               rodovia: 'BR-101',  estado: 'RS', lat: -29.8891, lng: -50.2719, valores: { 2: 10.80, 4: 21.60, 6: 32.40 } },
  { id: 43, nome: 'Pedágio Caxias do Sul',        rodovia: 'BR-116',  estado: 'RS', lat: -29.1682, lng: -51.1790, valores: { 2: 11.20, 4: 22.40, 6: 33.60 } },
  { id: 44, nome: 'Pedágio Bento Gonçalves',      rodovia: 'RS-470',  estado: 'RS', lat: -29.1753, lng: -51.5181, valores: { 2: 7.50,  4: 15.00, 6: 22.50 } },
  { id: 45, nome: 'Pedágio Pelotas',              rodovia: 'BR-392',  estado: 'RS', lat: -31.7738, lng: -52.3425, valores: { 2: 9.80,  4: 19.60, 6: 29.40 } },
  { id: 126, nome: 'Pedágio Canoas (BR-386)',     rodovia: 'BR-386',  estado: 'RS', lat: -29.9119, lng: -51.1754, valores: { 2: 9.60,  4: 19.20, 6: 28.80 } },
  { id: 127, nome: 'Pedágio Montenegro',          rodovia: 'BR-386',  estado: 'RS', lat: -29.6889, lng: -51.4642, valores: { 2: 8.40,  4: 16.80, 6: 25.20 } },
  { id: 128, nome: 'Pedágio Lajeado',             rodovia: 'BR-386',  estado: 'RS', lat: -29.4650, lng: -51.9634, valores: { 2: 8.90,  4: 17.80, 6: 26.70 } },
  { id: 129, nome: 'Pedágio Passo Fundo',         rodovia: 'BR-386',  estado: 'RS', lat: -28.2576, lng: -52.4065, valores: { 2: 9.10,  4: 18.20, 6: 27.30 } },

  // ===================== SC - BR-101 / BR-470 / BR-116 =====================
  { id: 46, nome: 'Pedágio Florianópolis',        rodovia: 'BR-101',  estado: 'SC', lat: -27.5954, lng: -48.5480, valores: { 2: 9.60,  4: 19.20, 6: 28.80 } },
  { id: 47, nome: 'Pedágio Blumenau',             rodovia: 'BR-470',  estado: 'SC', lat: -26.9194, lng: -49.0661, valores: { 2: 8.80,  4: 17.60, 6: 26.40 } },
  { id: 48, nome: 'Pedágio Lages',                rodovia: 'BR-116',  estado: 'SC', lat: -27.8158, lng: -50.3258, valores: { 2: 9.10,  4: 18.20, 6: 27.30 } },
  { id: 49, nome: 'Pedágio Joinville',            rodovia: 'BR-101',  estado: 'SC', lat: -26.3044, lng: -48.8487, valores: { 2: 10.20, 4: 20.40, 6: 30.60 } },
  { id: 130, nome: 'Pedágio Palhoça',             rodovia: 'BR-101',  estado: 'SC', lat: -27.6448, lng: -48.6700, valores: { 2: 8.90,  4: 17.80, 6: 26.70 } },
  { id: 131, nome: 'Pedágio Biguaçu',             rodovia: 'BR-101',  estado: 'SC', lat: -27.4931, lng: -48.6551, valores: { 2: 8.70,  4: 17.40, 6: 26.10 } },
  { id: 132, nome: 'Pedágio São Francisco do Sul',rodovia: 'BR-101',  estado: 'SC', lat: -26.1002, lng: -48.7027, valores: { 2: 9.40,  4: 18.80, 6: 28.20 } },
  { id: 133, nome: 'Pedágio Guaramirim',          rodovia: 'BR-101',  estado: 'SC', lat: -26.4737, lng: -48.9956, valores: { 2: 9.20,  4: 18.40, 6: 27.60 } },
  { id: 134, nome: 'Pedágio Criciúma',            rodovia: 'BR-101',  estado: 'SC', lat: -28.6796, lng: -49.3692, valores: { 2: 9.30,  4: 18.60, 6: 27.90 } },

  // ===================== BA - BR-116 / BR-101 / BR-324 =====================
  { id: 50, nome: 'Pedágio Salvador Norte',       rodovia: 'BR-324',  estado: 'BA', lat: -12.5230, lng: -38.9112, valores: { 2: 8.90,  4: 17.80, 6: 26.70 } },
  { id: 51, nome: 'Pedágio Feira de Santana',     rodovia: 'BR-116',  estado: 'BA', lat: -12.2664, lng: -38.9663, valores: { 2: 9.40,  4: 18.80, 6: 28.20 } },
  { id: 52, nome: 'Pedágio Vitória da Conquista', rodovia: 'BR-116',  estado: 'BA', lat: -14.8704, lng: -40.8009, valores: { 2: 8.70,  4: 17.40, 6: 26.10 } },
  { id: 135, nome: 'Pedágio Jequié',              rodovia: 'BR-116',  estado: 'BA', lat: -13.8585, lng: -40.0820, valores: { 2: 8.50,  4: 17.00, 6: 25.50 } },

  // ===================== RJ - BR-101 / BR-040 / BR-116 =====================
  { id: 53, nome: 'Pedágio Petrópolis',           rodovia: 'BR-040',  estado: 'RJ', lat: -22.5096, lng: -43.1811, valores: { 2: 12.40, 4: 24.80, 6: 37.20 } },
  { id: 54, nome: 'Pedágio Arco Metropolitano',   rodovia: 'BR-493',  estado: 'RJ', lat: -22.8108, lng: -43.3539, valores: { 2: 7.80,  4: 15.60, 6: 23.40 } },
  { id: 55, nome: 'Pedágio Volta Redonda',        rodovia: 'BR-393',  estado: 'RJ', lat: -22.5231, lng: -44.0864, valores: { 2: 10.20, 4: 20.40, 6: 30.60 } },
  { id: 56, nome: 'Pedágio Resende',              rodovia: 'BR-116',  estado: 'RJ', lat: -22.4688, lng: -44.4505, valores: { 2: 9.80,  4: 19.60, 6: 29.40 } },
  { id: 57, nome: 'Pedágio Niterói (Ponte)',       rodovia: 'BR-101',  estado: 'RJ', lat: -22.8829, lng: -43.1089, valores: { 2: 11.50, 4: 23.00, 6: 34.50 } },
  { id: 136, nome: 'Pedágio Teresópolis',         rodovia: 'BR-040',  estado: 'RJ', lat: -22.4124, lng: -42.9723, valores: { 2: 11.80, 4: 23.60, 6: 35.40 } },

  // ===================== ES - BR-101 / BR-262 =====================
  { id: 58, nome: 'Pedágio Vitória',              rodovia: 'BR-101',  estado: 'ES', lat: -20.3155, lng: -40.3128, valores: { 2: 8.30,  4: 16.60, 6: 24.90 } },
  { id: 59, nome: 'Pedágio Cachoeiro Itapemirim', rodovia: 'BR-101',  estado: 'ES', lat: -20.8490, lng: -41.1120, valores: { 2: 8.60,  4: 17.20, 6: 25.80 } },

  // ===================== MT / MS - BR-163 / BR-364 =====================
  { id: 60, nome: 'Pedágio Rondonópolis',         rodovia: 'BR-364',  estado: 'MT', lat: -16.4760, lng: -54.6361, valores: { 2: 11.60, 4: 23.20, 6: 34.80 } },
  { id: 61, nome: 'Pedágio Cuiabá',               rodovia: 'BR-364',  estado: 'MT', lat: -15.6014, lng: -56.0979, valores: { 2: 10.90, 4: 21.80, 6: 32.70 } },
  { id: 62, nome: 'Pedágio Campo Grande',         rodovia: 'BR-163',  estado: 'MS', lat: -20.4697, lng: -54.6201, valores: { 2: 9.80,  4: 19.60, 6: 29.40 } },
  { id: 63, nome: 'Pedágio Dourados',             rodovia: 'BR-163',  estado: 'MS', lat: -22.2211, lng: -54.8057, valores: { 2: 10.20, 4: 20.40, 6: 30.60 } },
  { id: 64, nome: 'Pedágio Coxim',                rodovia: 'BR-163',  estado: 'MS', lat: -18.5068, lng: -54.7605, valores: { 2: 10.80, 4: 21.60, 6: 32.40 } },
  { id: 137, nome: 'Pedágio Sorriso',             rodovia: 'BR-163',  estado: 'MT', lat: -12.5474, lng: -55.7193, valores: { 2: 11.20, 4: 22.40, 6: 33.60 } },
  { id: 138, nome: 'Pedágio Sinop',               rodovia: 'BR-163',  estado: 'MT', lat: -11.8625, lng: -55.5097, valores: { 2: 10.80, 4: 21.60, 6: 32.40 } },
  { id: 139, nome: 'Pedágio Alta Floresta',       rodovia: 'BR-163',  estado: 'MT', lat: -9.8764,  lng: -56.0859, valores: { 2: 10.40, 4: 20.80, 6: 31.20 } },
  { id: 140, nome: 'Pedágio Três Lagoas',         rodovia: 'BR-262',  estado: 'MS', lat: -20.7883, lng: -51.7081, valores: { 2: 9.40,  4: 18.80, 6: 28.20 } },
  { id: 141, nome: 'Pedágio Ribas do Rio Pardo',  rodovia: 'BR-262',  estado: 'MS', lat: -20.4434, lng: -53.7587, valores: { 2: 9.10,  4: 18.20, 6: 27.30 } },

  // ===================== PA / TO / MA - BR-153 / BR-316 =====================
  { id: 65, nome: 'Pedágio Belém',                rodovia: 'BR-316',  estado: 'PA', lat: -1.3551,  lng: -48.4028, valores: { 2: 7.10,  4: 14.20, 6: 21.30 } },
  { id: 66, nome: 'Pedágio Palmas',               rodovia: 'BR-153',  estado: 'TO', lat: -10.2491, lng: -48.3243, valores: { 2: 8.70,  4: 17.40, 6: 26.10 } },
  { id: 67, nome: 'Pedágio Gurupi',               rodovia: 'BR-153',  estado: 'TO', lat: -11.7300, lng: -49.0671, valores: { 2: 9.20,  4: 18.40, 6: 27.60 } },
  { id: 142, nome: 'Pedágio Paraíso do Tocantins',rodovia: 'BR-153',  estado: 'TO', lat: -10.1743, lng: -48.8832, valores: { 2: 8.90,  4: 17.80, 6: 26.70 } },
  { id: 143, nome: 'Pedágio Imperatriz',          rodovia: 'BR-010',  estado: 'MA', lat: -5.5247,  lng: -47.4924, valores: { 2: 7.80,  4: 15.60, 6: 23.40 } },

  // ===================== DF =====================
  { id: 68, nome: 'Pedágio Brasília (EPTG)',      rodovia: 'DF-085',  estado: 'DF', lat: -15.8267, lng: -48.0803, valores: { 2: 5.50,  4: 11.00, 6: 16.50 } },
  { id: 144, nome: 'Pedágio Samambaia (DF-001)',  rodovia: 'DF-001',  estado: 'DF', lat: -15.9008, lng: -48.0890, valores: { 2: 4.80,  4:  9.60, 6: 14.40 } },

  // ===================== SP - INTERIOR =====================
  { id: 69, nome: 'Pedágio Presidente Prudente',  rodovia: 'SP-270',  estado: 'SP', lat: -22.1193, lng: -51.3855, valores: { 2: 9.10,  4: 18.20, 6: 27.30 } },
  { id: 70, nome: 'Pedágio Marília',              rodovia: 'SP-294',  estado: 'SP', lat: -22.2136, lng: -49.9458, valores: { 2: 8.70,  4: 17.40, 6: 26.10 } },
  { id: 71, nome: 'Pedágio Bauru',                rodovia: 'SP-300',  estado: 'SP', lat: -22.3140, lng: -49.0608, valores: { 2: 8.40,  4: 16.80, 6: 25.20 } },
  { id: 72, nome: 'Pedágio São Carlos',           rodovia: 'SP-310',  estado: 'SP', lat: -21.9794, lng: -47.8972, valores: { 2: 8.00,  4: 16.00, 6: 24.00 } },
  { id: 73, nome: 'Pedágio Ribeirão Preto',       rodovia: 'SP-333',  estado: 'SP', lat: -21.1697, lng: -47.8100, valores: { 2: 9.30,  4: 18.60, 6: 27.90 } },
  { id: 74, nome: 'Pedágio Araraquara',           rodovia: 'SP-310',  estado: 'SP', lat: -21.7942, lng: -48.1756, valores: { 2: 8.20,  4: 16.40, 6: 24.60 } },
  { id: 75, nome: 'Pedágio Franca',               rodovia: 'SP-334',  estado: 'SP', lat: -20.5386, lng: -47.4008, valores: { 2: 9.70,  4: 19.40, 6: 29.10 } },
  { id: 76, nome: 'Pedágio Fernandópolis',        rodovia: 'SP-320',  estado: 'SP', lat: -20.2830, lng: -50.2421, valores: { 2: 9.50,  4: 19.00, 6: 28.50 } },
  { id: 77, nome: 'Pedágio São José Rio Preto',   rodovia: 'BR-153',  estado: 'SP', lat: -20.8197, lng: -49.3794, valores: { 2: 9.80,  4: 19.60, 6: 29.40 } },
  { id: 78, nome: 'Pedágio Campinas Norte',       rodovia: 'SP-065',  estado: 'SP', lat: -22.8992, lng: -46.9756, valores: { 2: 7.80,  4: 15.60, 6: 23.40 } },
  { id: 79, nome: 'Pedágio Santos (Ecovias)',     rodovia: 'SP-055',  estado: 'SP', lat: -23.9608, lng: -46.3340, valores: { 2: 16.80, 4: 33.60, 6: 50.40 } },
  { id: 80, nome: 'Pedágio Sorocaba',             rodovia: 'SP-280',  estado: 'SP', lat: -23.4978, lng: -47.4581, valores: { 2: 8.50,  4: 17.00, 6: 25.50 } },
  { id: 145, nome: 'Pedágio Ourinhos (SP-333)',   rodovia: 'SP-333',  estado: 'SP', lat: -22.9769, lng: -49.8718, valores: { 2: 8.30,  4: 16.60, 6: 24.90 } },
  { id: 146, nome: 'Pedágio Assis (SP-333)',      rodovia: 'SP-333',  estado: 'SP', lat: -22.6610, lng: -50.4124, valores: { 2: 8.70,  4: 17.40, 6: 26.10 } },
  { id: 147, nome: 'Pedágio Jaú (SP-304)',        rodovia: 'SP-304',  estado: 'SP', lat: -22.2968, lng: -48.5581, valores: { 2: 7.90,  4: 15.80, 6: 23.70 } },
  { id: 148, nome: 'Pedágio Piracicaba (SP-127)', rodovia: 'SP-127',  estado: 'SP', lat: -22.7252, lng: -47.6476, valores: { 2: 7.50,  4: 15.00, 6: 22.50 } },

  // ===================== CE / RN / PB / PE =====================
  { id: 149, nome: 'Pedágio Fortaleza (CE-085)',  rodovia: 'CE-085',  estado: 'CE', lat: -3.7980,  lng: -38.5222, valores: { 2: 6.50,  4: 13.00, 6: 19.50 } },
  { id: 150, nome: 'Pedágio Natal (BR-101)',      rodovia: 'BR-101',  estado: 'RN', lat: -5.7945,  lng: -35.2110, valores: { 2: 7.20,  4: 14.40, 6: 21.60 } },
  { id: 151, nome: 'Pedágio Recife (BR-101)',     rodovia: 'BR-101',  estado: 'PE', lat: -8.0548,  lng: -34.9286, valores: { 2: 7.80,  4: 15.60, 6: 23.40 } },
  { id: 152, nome: 'Pedágio Caruaru',             rodovia: 'BR-232',  estado: 'PE', lat: -8.2740,  lng: -35.9760, valores: { 2: 8.30,  4: 16.60, 6: 24.90 } },
]
