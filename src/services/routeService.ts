// routeService.ts
// Utiliza o OSRM público (demo.project-osrm.org) para roteirização gratuita
// e o Nominatim (OpenStreetMap) para geocodificação de cidades

export interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    state?: string
    country?: string
  }
}

export interface RouteResult {
  distanciaKm: number
  duracaoMin: number
  coordenadas: [number, number][] // [lat, lng]
}

// Busca sugestões de cidades para autocomplete
export async function buscarCidades(query: string): Promise<NominatimResult[]> {
  if (!query || query.length < 3) return []
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=BR`
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'LiderRefrigeracao/1.0' }
    })
    if (!res.ok) throw new Error('Erro Nominatim')
    return await res.json()
  } catch (e) {
    console.error('Erro ao buscar cidades:', e)
    return []
  }
}

// Calcula rota entre dois pontos usando OSRM público
export async function calcularRota(
  origemLat: number,
  origemLng: number,
  destinoLat: number,
  destinoLng: number
): Promise<RouteResult> {
  const urls = [
    `https://router.project-osrm.org/route/v1/driving/${origemLng},${origemLat};${destinoLng},${destinoLat}?overview=full&geometries=geojson&alternatives=false`,
    `https://demo.project-osrm.org/route/v1/driving/${origemLng},${origemLat};${destinoLng},${destinoLat}?overview=full&geometries=geojson`
  ]

  let lastError: any = null

  for (const url of urls) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // Timeout de 8s por tentativa

    try {
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      
      if (!res.ok) throw new Error(`Erro OSRM: ${res.status}`)
      const data = await res.json()

      if (!data.routes || data.routes.length === 0) {
        throw new Error('Nenhuma rota encontrada')
      }

      const route = data.routes[0]
      const distanciaKm = route.distance / 1000
      const duracaoMin = route.duration / 60

      const coordenadas: [number, number][] = route.geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]]
      )

      return { distanciaKm, duracaoMin, coordenadas }
    } catch (e: any) {
      clearTimeout(timeoutId)
      console.error(`Falha ao calcular rota na URL: ${url}`, e.name === 'AbortError' ? 'Timeout' : e)
      lastError = e
    }
  }

  throw lastError || new Error('Falha ao calcular rota em todos os servidores')
}

// Formata duração em horas e minutos
export function formatarDuracao(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = Math.round(minutos % 60)
  if (h === 0) return `${m} min`
  return `${h}h ${m}min`
}
