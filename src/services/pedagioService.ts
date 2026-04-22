import { pedagios, type Pedagio } from './pedagioData'

// Calcula a distância em km entre dois pontos (Haversine)
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export interface PedagioEncontrado extends Pedagio {
  custo: number
}

export interface ResultadoPedagios {
  pedagiosEncontrados: PedagioEncontrado[]
  totalPedagios: number
}

// Detecta pedágios ao longo de uma rota (lista de [lat, lng])
// Raio de verificação: 2km (default)
export function detectarPedagios(
  rota: [number, number][],
  eixos: 2 | 4 | 6,
  raiokm = 10.0
): ResultadoPedagios {
  const encontrados = new Set<number>()
  const pedagiosEncontrados: PedagioEncontrado[] = []

  // Para cada ponto da rota (amostra a cada N pontos para performance)
  const step = Math.max(1, Math.floor(rota.length / 500))
  for (let i = 0; i < rota.length; i += step) {
    const [lat, lng] = rota[i]

    for (const pedagio of pedagios) {
      if (encontrados.has(pedagio.id)) continue
      const dist = haversineDistance(lat, lng, pedagio.lat, pedagio.lng)
      if (dist <= raiokm) {
        encontrados.add(pedagio.id)
        pedagiosEncontrados.push({
          ...pedagio,
          custo: pedagio.valores[eixos]
        })
      }
    }
  }

  // Ordena por ordem geográfica aproximada (norte → sul, não importa)
  const totalPedagios = pedagiosEncontrados.reduce((acc, p) => acc + p.custo, 0)

  return { pedagiosEncontrados, totalPedagios }
}

// Calcula o custo de combustível
export function calcularCombustivel(
  distanciaKm: number,
  consumoKmL: number,
  precoDiesel: number
): number {
  if (consumoKmL <= 0) return 0
  return (distanciaKm / consumoKmL) * precoDiesel
}
