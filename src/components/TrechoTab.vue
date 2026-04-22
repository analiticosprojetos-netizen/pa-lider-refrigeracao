<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import {
  MapPin, Navigation, Truck, Fuel, Calculator, Route, DollarSign,
  Clock, AlertTriangle, CheckCircle2, Loader2, Search, X, ChevronDown, LocateFixed,
  TrendingUp, TrendingDown, Minus, Banknote, BarChart2, UserCheck, Play, History, Save, Edit2, Trash2, FileText, Download, Table, Filter
} from 'lucide-vue-next'
import { buscarCidades, calcularRota, formatarDuracao, type NominatimResult } from '../services/routeService'
import { detectarPedagios, calcularCombustivel, type PedagioEncontrado } from '../services/pedagioService'
import type { ResultadoPedagios } from '../services/pedagioService'
import { useAuthStore } from '../stores/auth'
import { exportViagemToExcel, generateViagemPDF, exportTableToCSV, exportTableToExcel, exportTableToPDF } from '../utils/exportUtils'

// ---- Estado ---------------------------------------------------------------
const authStore = useAuthStore()
const currentSubTab = ref<'motorista' | 'agenciamento' | 'relatorios'>(authStore.user?.role === 'MOTORISTA' ? 'motorista' : 'agenciamento')
const origemInput = ref('')
const destinoInput = ref('')
const origemCoords = ref<{ lat: number; lng: number } | null>(null)
const destinoCoords = ref<{ lat: number; lng: number } | null>(null)
const sugestoesOrigem = ref<NominatimResult[]>([])
const sugestoesDestino = ref<NominatimResult[]>([])
const mostrarOrigem = ref(false)
const mostrarDestino = ref(false)

const eixos = ref<2 | 4 | 6>(2)
const consumo = ref(3.5)
const precoDiesel = ref(6.40)
const precoDieselDisplay = ref('6,40')
const valorFrete = ref<number | null>(null) // Opcional
const valorFreteDisplay = ref('')
const placaVeiculo = ref('')
const kmInicial = ref<number | null>(null)
const distanciaManual = ref<number | null>(null)

// Estados do Relatório de Viagem
const mostrarModalEncerramento = ref(false)
const kmFinal = ref<number | null>(null)
const mostrarRelatorio = ref(false)
const relatorioDados = ref<any>(null)

const viagemAtiva = ref(localStorage.getItem('viagem_ativa') === 'true')
const viagemDados = ref(
  localStorage.getItem('viagem_dados') 
    ? JSON.parse(localStorage.getItem('viagem_dados') as string)
    : {
        origem: '',
        destino: '',
        placa: '',
        kmInicial: 0,
        distancia: 0,
        eventos: [] as any[]
      }
)

// Estados Aba Relatórios
const tipoRelatorio = ref<'viagens' | 'simulacoes'>('simulacoes')
const historicoViagens = ref<any[]>(JSON.parse(localStorage.getItem('historico_viagens') || '[]'))
const historicoSimulacoes = ref<any[]>(JSON.parse(localStorage.getItem('historico_simulacoes') || '[]'))
const searchQuery = ref('')

const relatorioViagemSelecionado = ref<any>(null)
const relatorioSimulacaoSelecionado = ref<any>(null)

// Frota
const frota = ref<any[]>([])

const carregarFrota = () => {
  const savedFrota = localStorage.getItem('lider_frota')
  if (savedFrota) {
    frota.value = JSON.parse(savedFrota)
  } else {
    frota.value = []
  }
}

// Recarregar frota ao trocar de aba interna
watch(currentSubTab, () => {
  carregarFrota()
})

watch(placaVeiculo, (novaPlaca) => {
  const v = frota.value.find(v => v.placa === novaPlaca)
  if (v && v.consumo) {
    consumo.value = v.consumo
  }
})

const abastecimentoForm = ref({ litros: null as number | null, valor: null as number | null, valorDisplay: '' })
const despesaForm = ref({ descricao: '', valor: null as number | null, valorDisplay: '' })

const despesasSugestoes = ['Jantar', 'Banho', 'Lavagem', 'Pneu', 'Pernoite', 'Almoço', 'Lanche', 'Manutenção']

function salvarAbastecimento() {
  if (!abastecimentoForm.value.litros || !abastecimentoForm.value.valor) {
    alert('Preencha litros e valor.')
    return
  }
  const evento = {
    tipo: 'abastecimento',
    data: new Date().toISOString(),
    desc: `Abastecimento: ${abastecimentoForm.value.litros}L — R$ ${abastecimentoForm.value.valorDisplay}`,
    valor: abastecimentoForm.value.valor
  }
  viagemDados.value.eventos.unshift(evento)
  persistirViagem()
  abastecimentoForm.value = { litros: null, valor: null, valorDisplay: '' }
}

function registrarDespesa() {
  if (!despesaForm.value.descricao || !despesaForm.value.valor) {
    alert('Preencha a descrição e o valor.')
    return
  }
  const evento = {
    tipo: 'despesa',
    data: new Date().toISOString(),
    desc: `${despesaForm.value.descricao} — R$ ${despesaForm.value.valorDisplay}`,
    valor: despesaForm.value.valor
  }
  viagemDados.value.eventos.unshift(evento)
  persistirViagem()
  despesaForm.value = { descricao: '', valor: null, valorDisplay: '' }
}

function persistirViagem() {
  localStorage.setItem('viagem_ativa', viagemAtiva.value.toString())
  localStorage.setItem('viagem_dados', JSON.stringify(viagemDados.value))
}

function encerrarViagem() {
  mostrarModalEncerramento.value = true
  kmFinal.value = kmInicial.value || 0
}

function confirmarEncerramento() {
  if (kmFinal.value === null || kmFinal.value < (kmInicial.value || 0)) {
    alert('O KM Final deve ser maior ou igual ao KM Inicial.')
    return
  }

  const kmTotal = kmFinal.value - (viagemDados.value.kmInicial || 0)
  
  let totalLitros = 0
  let custoCombustivel = 0
  let custoDespesas = 0
  const despesasPorCategoria: Record<string, number> = {}

  viagemDados.value.eventos.forEach((ev: any) => {
    if (ev.tipo === 'abastecimento') {
      const matchLitros = ev.desc.match(/([0-9.]+)L/)
      if (matchLitros) totalLitros += parseFloat(matchLitros[1])
      custoCombustivel += ev.valor || 0
    } else if (ev.tipo === 'despesa') {
      custoDespesas += ev.valor || 0
      const catName = ev.desc.split(' — ')[0] || 'Outros'
      despesasPorCategoria[catName] = (despesasPorCategoria[catName] || 0) + (ev.valor || 0)
    }
  })

  const custoTotalViagem = custoCombustivel + custoDespesas
  const custoPorKm = kmTotal > 0 ? custoTotalViagem / kmTotal : 0
  const mediaKmPorLitro = totalLitros > 0 ? kmTotal / totalLitros : 0

  relatorioDados.value = {
    origem: viagemDados.value.origem || origemInput.value,
    destino: viagemDados.value.destino || destinoInput.value,
    placa: viagemDados.value.placa || placaVeiculo.value,
    kmTotal,
    totalLitros,
    custoCombustivel,
    custoDespesas,
    despesasPorCategoria,
    custoTotalViagem,
    custoPorKm,
    mediaKmPorLitro,
    kmInicial: viagemDados.value.kmInicial,
    kmFinal: kmFinal.value,
    dataFim: new Date().toISOString()
  }

  viagemAtiva.value = false
  viagemDados.value.eventos.unshift({
    tipo: 'fim',
    data: relatorioDados.value.dataFim,
    desc: `Viagem Encerrada. KM Final: ${kmFinal.value}`
  })
  
  mostrarModalEncerramento.value = false
  mostrarRelatorio.value = true
  persistirViagem()
}

function fecharRelatorio() {
  if (relatorioDados.value) {
    const historico = JSON.parse(localStorage.getItem('historico_viagens') || '[]')
    historico.unshift(relatorioDados.value)
    localStorage.setItem('historico_viagens', JSON.stringify(historico))
  }

  mostrarRelatorio.value = false
  viagemDados.value = { origem: '', destino: '', placa: '', kmInicial: 0, distancia: 0, eventos: [] }
  kmInicial.value = null
  kmFinal.value = null
  origemInput.value = ''
  destinoInput.value = ''
  placaVeiculo.value = ''
  persistirViagem()
}

function exportarPDF() {
  if (relatorioDados.value) generateViagemPDF(relatorioDados.value)
}

function exportarExcel() {
  if (relatorioDados.value) exportViagemToExcel(relatorioDados.value)
}

function editarEvento(index: number) {
  const evento = viagemDados.value.eventos[index];
  const novoTexto = prompt('Edite a descrição do evento:', evento.desc);
  if (novoTexto !== null && novoTexto.trim() !== '') {
    evento.desc = novoTexto.trim();
    persistirViagem();
  }
}

function excluirEvento(index: number) {
  if (authStore.user?.role !== 'ADMIN') {
    alert('Apenas Administradores podem excluir eventos da viagem.');
    return;
  }
  if (confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
    viagemDados.value.eventos.splice(index, 1);
    persistirViagem();
  }
}

async function iniciarViagem() {
  erroMsg.value = ''
  if (!origemCoords.value || !destinoCoords.value) {
    erroMsg.value = 'Selecione a origem e o destino nas sugestões.'
    return
  }
  
  const placaRegex = /^[A-Z]{3}-[A-Z0-9]{4}$/
  if (!placaVeiculo.value || !placaRegex.test(placaVeiculo.value)) {
    erroMsg.value = 'Placa inválida. A placa deve ter 3 letras e 4 caracteres numéricos/letras.'
    return
  }
  if (kmInicial.value === null) {
    erroMsg.value = 'Informe o KM inicial.'
    return
  }

  calculando.value = true
  
  // FAIL-SAFE: Se demorar mais de 10s, destrava o botão de qualquer jeito
  const safetyTimeout = setTimeout(() => {
    if (calculando.value) {
      console.warn('Início de viagem interrompido por timeout de segurança (10s).')
      calculando.value = false
      if (!calculado.value) erroMsg.value = 'A conexão demorou muito. Tente novamente.'
    }
  }, 10000)

  try {
    await calcular()
    
    if (calculado.value) {
      clearTimeout(safetyTimeout) // Limpa o timeout se deu certo
      viagemAtiva.value = true
      viagemDados.value = {
        origem: origemInput.value,
        destino: destinoInput.value,
        placa: placaVeiculo.value,
        kmInicial: kmInicial.value,
        distancia: distanciaKm.value,
        eventos: [
          { tipo: 'inicio', data: new Date().toISOString(), desc: `Viagem iniciada de ${origemInput.value} para ${destinoInput.value}` }
        ]
      }
      persistirViagem()
    }
  } catch (e) {
    console.error('Erro ao iniciar viagem:', e)
    erroMsg.value = 'Erro de conexão com o servidor de rotas. Use o KM Manual abaixo.'
  } finally {
    calculando.value = false
    clearTimeout(safetyTimeout)
  }
}

function iniciarViagemManual() {
  const placaRegex = /^[A-Z]{3}-[A-Z0-9]{4}$/
  if (!placaVeiculo.value || !placaRegex.test(placaVeiculo.value)) {
    erroMsg.value = 'Placa inválida. A placa deve ter 3 letras e 4 caracteres numéricos/letras.'
    return
  }
  if (kmInicial.value === null) {
    erroMsg.value = 'Informe o KM inicial antes de iniciar.'
    return
  }
  if (!distanciaManual.value || distanciaManual.value <= 0) {
    erroMsg.value = 'Informe a distância total estimada da viagem.'
    return
  }

  erroMsg.value = ''
  viagemAtiva.value = true
  viagemDados.value = {
    origem: origemInput.value || 'Origem Manual',
    destino: destinoInput.value || 'Destino Manual',
    placa: placaVeiculo.value,
    kmInicial: kmInicial.value,
    distancia: distanciaManual.value,
    eventos: [
      { tipo: 'inicio', data: new Date().toISOString(), desc: `Viagem iniciada manualmente (Estimativa: ${distanciaManual.value} km)` }
    ]
  }
  persistirViagem()
}

// Função genérica para formatar moeda
function formatarCampoMoeda(value: string) {
  const numericString = value.replace(/\D/g, '')
  if (!numericString) return { numeric: 0, display: '' }
  
  const numeric = parseInt(numericString) / 100
  const display = numeric.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return { numeric, display }
}

function formatarPlaca(e: Event) {
  let val = (e.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (val.length > 7) val = val.slice(0, 7);
  if (val.length > 3) {
    val = val.substring(0, 3) + '-' + val.substring(3);
  }
  placaVeiculo.value = val;
}

function onFreteInput(e: Event) {
  const input = e.target as HTMLInputElement
  const result = formatarCampoMoeda(input.value)
  valorFrete.value = result.numeric || null
  valorFreteDisplay.value = result.display
}

function onDieselInput(e: Event) {
  const input = e.target as HTMLInputElement
  const result = formatarCampoMoeda(input.value)
  precoDiesel.value = result.numeric
  precoDieselDisplay.value = result.display
}

const calculando = ref(false)
const erroMsg = ref('')
const calculado = ref(false)
const buscandoGPS = ref(false)

const distanciaKm = ref(0)
const duracaoMin = ref(0)
const custoCombustivel = ref(0)
const totalPedagios = ref(0)
const custoTotal = ref(0)
const pedagiosEncontrados = ref<PedagioEncontrado[]>([])

// ---- Análise de Rentabilidade -------------------------------------------
const analise = computed(() => {
  if (!calculado.value || !valorFrete.value || valorFrete.value <= 0) return null

  const frete = valorFrete.value
  const custo = custoTotal.value
  const lucro = frete - custo
  const margem = (lucro / frete) * 100
  const custoPorKm = distanciaKm.value > 0 ? custo / distanciaKm.value : 0
  const fretePorKm = distanciaKm.value > 0 ? frete / distanciaKm.value : 0

  let veredicto: 'otimo' | 'ok' | 'atencao' | 'prejuizo'
  if (margem >= 30) veredicto = 'otimo'
  else if (margem >= 15) veredicto = 'ok'
  else if (margem >= 0) veredicto = 'atencao'
  else veredicto = 'prejuizo'

  return { frete, custo, lucro, margem, custoPorKm, fretePorKm, veredicto }
})

// Recalcular quando parâmetros mudam
watch([eixos, consumo, precoDiesel], () => {
  if (origemCoords.value && destinoCoords.value) {
    calcular()
  }
})

// ---- Mapa -----------------------------------------------------------------
let L: any = null
let map: any = null
let rotaLayer: any = null
let marcadoresLayer: any = null

const mapEl = ref<HTMLElement | null>(null)

async function inicializarMapa() {
  if (map || !mapEl.value) return
  const leaflet = await import('leaflet')
  await import('leaflet/dist/leaflet.css')
  L = leaflet.default || leaflet

  map = L.map(mapEl.value).setView([-15.78, -47.93], 5)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(map)
}

function limparMapa() {
  if (rotaLayer) { map.removeLayer(rotaLayer); rotaLayer = null }
  if (marcadoresLayer) { map.removeLayer(marcadoresLayer); marcadoresLayer = null }
}

function criarIconePedagio() {
  return L.divIcon({
    html: `<div style="background:#f59e0b;border:2px solid #fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);">$</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  })
}

function criarIconePonto(cor: string, letra: string) {
  return L.divIcon({
    html: `<div style="background:${cor};border:3px solid #fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;box-shadow:0 3px 10px rgba(0,0,0,0.4);">${letra}</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  })
}

function desenharRota(coords: [number, number][], pedagios: PedagioEncontrado[]) {
  limparMapa()
  const layerGroup = L.layerGroup()

  // Polyline da rota
  rotaLayer = L.polyline(coords, {
    color: '#2563eb',
    weight: 5.5,
    opacity: 0.85,
    lineJoin: 'round'
  }).addTo(map)

  // Marcador Origem
  L.marker(coords[0], { icon: criarIconePonto('#16a34a', 'A') })
    .bindPopup(`<b>Origem</b><br>${origemInput.value}`)
    .addTo(layerGroup)

  // Marcador Destino
  L.marker(coords[coords.length - 1], { icon: criarIconePonto('#dc2626', 'B') })
    .bindPopup(`<b>Destino</b><br>${destinoInput.value}`)
    .addTo(layerGroup)

  // Marcadores dos Pedágios
  for (const p of pedagios) {
    L.marker([p.lat, p.lng], { icon: criarIconePedagio() })
      .bindPopup(`<b>${p.nome}</b><br>${p.rodovia} — ${p.estado}<br>R$ ${p.custo.toFixed(2)} (${eixos.value} eixos)`)
      .addTo(layerGroup)
  }

  marcadoresLayer = layerGroup.addTo(map)
  map.fitBounds(rotaLayer.getBounds(), { padding: [40, 40] })
}

// Watchers para atualizar o mapa ao selecionar pontos
function atualizarMapaComPontos() {
  if (!map) return
  limparMapa()
  const layerGroup = L.layerGroup()
  const bounds: any[] = []

  if (origemCoords.value) {
    const p = [origemCoords.value.lat, origemCoords.value.lng]
    L.marker(p, { icon: criarIconePonto('#16a34a', 'A') }).addTo(layerGroup)
    bounds.push(p)
  }

  if (destinoCoords.value) {
    const p = [destinoCoords.value.lat, destinoCoords.value.lng]
    L.marker(p, { icon: criarIconePonto('#dc2626', 'B') }).addTo(layerGroup)
    bounds.push(p)
  }

  marcadoresLayer = layerGroup.addTo(map)
  
  if (bounds.length === 1) {
    map.setView(bounds[0], 12)
  } else if (bounds.length === 2) {
    map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] })
  }
}

// ---- Autocomplete ---------------------------------------------------------
let timerOrigem: ReturnType<typeof setTimeout>
let timerDestino: ReturnType<typeof setTimeout>

function onOrigemInput() {
  origemCoords.value = null
  clearTimeout(timerOrigem)
  timerOrigem = setTimeout(async () => {
    sugestoesOrigem.value = await buscarCidades(origemInput.value)
    mostrarOrigem.value = sugestoesOrigem.value.length > 0
  }, 400)
}

// ---- Geolocalização GPS ---------------------------------------------------
async function usarMinhaLocalizacao() {
  if (!navigator.geolocation) {
    erroMsg.value = 'Geolocalização não suportada neste navegador.'
    return
  }
  buscandoGPS.value = true
  erroMsg.value = ''
  origemInput.value = ''
  origemCoords.value = null

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      origemCoords.value = { lat, lng }

      try {
        // Reverse geocoding com Nominatim para exibir o endereço
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=pt-BR`,
          { headers: { 'User-Agent': 'LiderRefrigeracao/1.0' } }
        )
        const data = await res.json()
        if (data && data.display_name) {
          const parts = data.display_name.split(',')
          // Pega cidade + estado para exibição limpa
          origemInput.value = `${data.address?.city || data.address?.town || data.address?.suburb || parts[0]}, ${data.address?.state || parts[1] || ''}`
        } else {
          origemInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        }
      } catch {
        origemInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      } finally {
        buscandoGPS.value = false
      }

      // Centra o mapa na localização atual e tenta calcular
      atualizarMapaComPontos()
      if (origemCoords.value && destinoCoords.value) calcular()
    },
    (err) => {
      buscandoGPS.value = false
      if (err.code === 1) erroMsg.value = 'Permissão de localização negada. Permita o acesso no navegador.'
      else if (err.code === 2) erroMsg.value = 'Localização indisponível. Tente novamente.'
      else erroMsg.value = 'Tempo esgotado ao buscar localização.'
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

function onDestinoInput() {
  destinoCoords.value = null
  clearTimeout(timerDestino)
  timerDestino = setTimeout(async () => {
    sugestoesDestino.value = await buscarCidades(destinoInput.value)
    mostrarDestino.value = sugestoesDestino.value.length > 0
  }, 400)
}

function selecionarOrigem(s: NominatimResult) {
  origemInput.value = s.display_name.split(',').slice(0, 2).join(',')
  origemCoords.value = { lat: parseFloat(s.lat), lng: parseFloat(s.lon) }
  mostrarOrigem.value = false
  atualizarMapaComPontos()
  if (origemCoords.value && destinoCoords.value) calcular()
}

function selecionarDestino(s: NominatimResult) {
  destinoInput.value = s.display_name.split(',').slice(0, 2).join(',')
  destinoCoords.value = { lat: parseFloat(s.lat), lng: parseFloat(s.lon) }
  mostrarDestino.value = false
  atualizarMapaComPontos()
  if (origemCoords.value && destinoCoords.value) calcular()
}

// ---- Calcular -------------------------------------------------------------
async function calcular() {
  erroMsg.value = ''
  calculado.value = false

  if (!origemCoords.value || !destinoCoords.value) {
    erroMsg.value = 'Selecione a origem e o destino nas sugestões.'
    return
  }
  if (consumo.value <= 0 || precoDiesel.value <= 0) {
    erroMsg.value = 'Informe consumo e preço do diesel válidos.'
    return
  }

  calculando.value = true
  try {
    const rota = await calcularRota(
      origemCoords.value.lat, origemCoords.value.lng,
      destinoCoords.value.lat, destinoCoords.value.lng
    )

    distanciaKm.value = rota.distanciaKm
    duracaoMin.value = rota.duracaoMin

    const resultPedagios = detectarPedagios(rota.coordenadas, eixos.value)
    pedagiosEncontrados.value = resultPedagios.pedagiosEncontrados
    totalPedagios.value = resultPedagios.totalPedagios

    custoCombustivel.value = calcularCombustivel(rota.distanciaKm, consumo.value, precoDiesel.value)
    custoTotal.value = custoCombustivel.value + totalPedagios.value
    
    // Atualiza o mapa somente se o elemento estiver no DOM (v-if)
    await nextTick()
    if (mapEl.value) {
      if (!map) await inicializarMapa()
      desenharRota(rota.coordenadas, resultPedagios.pedagiosEncontrados)
    }

    calculado.value = true
  } catch (e: any) {
    erroMsg.value = 'Servidor de mapas temporariamente indisponível. Use o KM Manual abaixo para continuar.'
    console.error(e)
  } finally {
    calculando.value = false
  }
}

function salvarSimulacao() {
  if (!calculado.value) return
  
  const sim = {
    id: Date.now().toString(),
    data: new Date().toISOString(),
    origem: origemInput.value,
    destino: destinoInput.value,
    distanciaKm: distanciaKm.value,
    duracaoMin: duracaoMin.value,
    consumo: consumo.value,
    precoDiesel: precoDiesel.value,
    custoCombustivel: custoCombustivel.value,
    totalPedagios: totalPedagios.value,
    valorFrete: valorFrete.value,
    custoTotal: custoTotal.value,
    lucro: analise.value.lucro,
    margem: analise.value.margem,
    custoPorKm: analise.value.custoPorKm
  }
  
  historicoSimulacoes.value.unshift(sim)
  localStorage.setItem('historico_simulacoes', JSON.stringify(historicoSimulacoes.value))
  alert('Simulação salva com sucesso!')
}

// ---- Relatórios (Filtros e Exportação) ----

const filteredViagens = computed(() => {
  if (!searchQuery.value) return historicoViagens.value
  const q = searchQuery.value.toLowerCase()
  return historicoViagens.value.filter(v => 
    (v.placa && v.placa.toLowerCase().includes(q)) ||
    (v.origem && v.origem.toLowerCase().includes(q)) ||
    (v.destino && v.destino.toLowerCase().includes(q))
  )
})

const filteredSimulacoes = computed(() => {
  if (!searchQuery.value) return historicoSimulacoes.value
  const q = searchQuery.value.toLowerCase()
  return historicoSimulacoes.value.filter(s => 
    (s.origem && s.origem.toLowerCase().includes(q)) ||
    (s.destino && s.destino.toLowerCase().includes(q))
  )
})

function gerarExportacaoGenerica(formato: 'pdf' | 'excel' | 'csv') {
  if (tipoRelatorio.value === 'viagens') {
    const data = filteredViagens.value.map(v => ({
      Data: new Date(v.dataFim).toLocaleDateString('pt-BR'),
      Placa: v.placa,
      Origem: v.origem,
      Destino: v.destino,
      "KM Total": v.kmTotal,
      "Litros": v.totalLitros.toFixed(1),
      "Custo Comb": `R$ ${v.custoCombustivel.toFixed(2)}`,
      "Custo Despesas": `R$ ${v.custoDespesas.toFixed(2)}`,
      "Total": `R$ ${v.custoTotalViagem.toFixed(2)}`,
      "Custo/KM": `R$ ${v.custoPorKm.toFixed(2)}`
    }))
    if (formato === 'csv') exportTableToCSV(data, 'Relatorio_Viagens')
    else if (formato === 'excel') exportTableToExcel(data, 'Relatorio_Viagens')
    else if (formato === 'pdf') exportTableToPDF(data, 'Relatorio_Viagens', 'Relatório de Viagens Realizadas')
  } else {
    const data = filteredSimulacoes.value.map(s => ({
      Data: new Date(s.data).toLocaleDateString('pt-BR'),
      Origem: s.origem,
      Destino: s.destino,
      "Dist. (km)": s.distanciaKm.toFixed(1),
      "Custo Comb.": `R$ ${s.custoCombustivel.toFixed(2)}`,
      "Custo Ped.": `R$ ${s.totalPedagios.toFixed(2)}`,
      "Custo Total": `R$ ${s.custoTotal.toFixed(2)}`,
      "Valor Frete": s.valorFrete ? `R$ ${s.valorFrete.toFixed(2)}` : '-',
      "Lucro": s.valorFrete ? `R$ ${s.lucro.toFixed(2)}` : '-',
      "Margem": s.valorFrete ? `${s.margem.toFixed(1)}%` : '-'
    }))
    if (formato === 'csv') exportTableToCSV(data, 'Relatorio_Simulacoes')
    else if (formato === 'excel') exportTableToExcel(data, 'Relatorio_Simulacoes')
    else if (formato === 'pdf') exportTableToPDF(data, 'Relatorio_Simulacoes', 'Relatório de Simulações de Frete')
  }
}

function limpar() {
  origemInput.value = ''
  destinoInput.value = ''
  origemCoords.value = null
  destinoCoords.value = null
  calculado.value = false
  erroMsg.value = ''
  limparMapa()
}

onMounted(async () => {
  carregarFrota()
  window.addEventListener('storage', carregarFrota)

  await nextTick()
  await inicializarMapa()
})

onUnmounted(() => {
  if (map) { map.remove(); map = null }
})

// ---- Helpers ---------------------------------------------------------------
const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtKm = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
</script>

<template>
  <div class="animate-in fade-in duration-500 flex flex-col gap-6 pb-12">
    <!-- Sub-Abas Navigation -->
    <div class="flex flex-wrap items-center justify-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-[20px] shadow-sm border border-gray-100 dark:border-slate-800 w-full lg:w-fit">
      <button @click="currentSubTab = 'agenciamento'" :class="['flex-1 sm:flex-none justify-center px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2', currentSubTab === 'agenciamento' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800']">
        <Calculator :size="14" /> Agenciamento
      </button>
      <button @click="currentSubTab = 'motorista'" :class="['flex-1 sm:flex-none justify-center px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2', currentSubTab === 'motorista' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800']">
        <UserCheck :size="14" /> Motorista
      </button>
      <button v-if="authStore.user?.role === 'ADMIN'" @click="currentSubTab = 'relatorios'" :class="['flex-1 sm:flex-none justify-center px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2', currentSubTab === 'relatorios' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800']">
        <Table :size="14" /> Relatórios
      </button>
    </div>

    <!-- Título compacto -->
    <div class="flex items-center gap-3 shrink-0">
      <div class="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
        <Route class="text-white" :size="20" />
      </div>
      <div>
        <h2 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tight">Simulador de Trecho</h2>
        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Calcule rota, pedágios e custo de frete</p>
      </div>
    </div>

    <!-- View: Agenciamento (Simulador Atual) -->
    <div v-if="currentSubTab === 'agenciamento'" class="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 flex-1 min-h-0 animate-in fade-in duration-500">

      <!-- PAINEL ESQUERDO: Inputs -->
      <div class="bg-white dark:bg-slate-900 rounded-[32px] border border-blue-100 dark:border-slate-800 shadow-2xl p-6 space-y-6 h-fit sticky top-4">
        <h3 class="text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <Navigation :size="13" /> Rota e Parâmetros
        </h3>

        <!-- Origem -->
        <div class="space-y-1.5 relative">
          <div class="flex items-center justify-between">
            <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Origem</label>
            <button @click="usarMinhaLocalizacao" :disabled="buscandoGPS"
              class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-700 disabled:opacity-50 transition-all">
              <Loader2 v-if="buscandoGPS" :size="11" class="animate-spin" />
              <LocateFixed v-else :size="11" />
              {{ buscandoGPS ? 'Buscando...' : 'Minha Localização' }}
            </button>
          </div>
          <div class="relative">
            <MapPin class="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500" :size="14" />
            <input v-model="origemInput" @input="onOrigemInput" @focus="mostrarOrigem = sugestoesOrigem.length > 0"
              type="text" placeholder="Cidade de origem ou use GPS..."
              class="w-full pl-9 pr-8 py-3 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
            <button v-if="origemInput" @click="() => { origemInput=''; origemCoords=null; sugestoesOrigem=[] }"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X :size="13" />
            </button>
          </div>
          <div v-if="origemCoords && !sugestoesOrigem.length" class="flex items-center gap-1.5 text-[10px] font-bold text-green-600 dark:text-green-400 pl-1">
            <LocateFixed :size="10" /><span>Coordenadas capturadas via GPS</span>
          </div>
          <div v-if="mostrarOrigem && sugestoesOrigem.length"
            class="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <button v-for="s in sugestoesOrigem" :key="s.lat + s.lon" @click="selecionarOrigem(s)"
              class="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-50 dark:border-slate-800 last:border-0 flex items-center gap-2">
              <MapPin class="text-green-500 shrink-0" :size="11" />
              <span class="truncate">{{ s.display_name }}</span>
            </button>
          </div>
        </div>

        <!-- Destino -->
        <div class="space-y-1.5 relative">
          <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Destino</label>
          <div class="relative">
            <MapPin class="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-500" :size="14" />
            <input v-model="destinoInput" @input="onDestinoInput" @focus="mostrarDestino = sugestoesDestino.length > 0"
              type="text" placeholder="Cidade de destino..."
              class="w-full pl-9 pr-8 py-3 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
            <button v-if="destinoInput" @click="() => { destinoInput=''; destinoCoords=null; sugestoesDestino=[] }"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X :size="13" />
            </button>
          </div>
          <div v-if="mostrarDestino && sugestoesDestino.length"
            class="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <button v-for="s in sugestoesDestino" :key="s.lat + s.lon" @click="selecionarDestino(s)"
              class="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-50 dark:border-slate-800 last:border-0 flex items-center gap-2">
              <MapPin class="text-red-500 shrink-0" :size="11" />
              <span class="truncate">{{ s.display_name }}</span>
            </button>
          </div>
        </div>

        <!-- Frota -->
        <div v-if="frota.length > 0" class="space-y-1.5">
          <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5"><Truck :size="11" /> Veículo da Frota</label>
          <select v-model="placaVeiculo" class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition-all uppercase">
            <option value="">Nenhum (Digitar Manualmente)</option>
            <option v-for="v in frota" :key="v.id" :value="v.placa">{{ v.placa }} - {{ v.modelo }} ({{ v.consumo }} km/l)</option>
          </select>
        </div>

        <!-- Eixos -->
        <div class="space-y-1.5">
          <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5"><Truck :size="11" /> Tipo de Veículo</label>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="e in [2, 4, 6]" :key="e" @click="eixos = e as 2|4|6"
              :class="['py-2.5 rounded-2xl text-xs font-black uppercase transition-all border-2', eixos === e ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-slate-800 text-gray-500 dark:text-gray-400 hover:border-blue-300']">
              {{ e }} Eixos
            </button>
          </div>
        </div>

        <!-- Consumo e Diesel -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><Fuel :size="10" /> km/L</label>
            <input v-model.number="consumo" type="number" step="0.1" min="0.1"
              class="w-full px-3 py-2.5 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-sm font-black dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><DollarSign :size="10" /> Diesel R$/L</label>
            <input :value="precoDieselDisplay" @input="onDieselInput"
              type="text" placeholder="0,00"
              class="w-full px-3 py-2.5 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-sm font-black dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
          </div>
        </div>

        <!-- Valor do Frete -->
        <div class="space-y-1.5">
          <label class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span class="flex items-center gap-1.5"><Banknote :size="10" /> Valor do Frete</span>
            <span class="normal-case font-bold text-gray-300 tracking-normal text-[10px]">Opcional</span>
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs">R$</span>
            <input :value="valorFreteDisplay" @input="onFreteInput"
              type="text" placeholder="0,00"
              class="w-full pl-10 pr-3 py-3 rounded-2xl bg-blue-50/40 dark:bg-blue-900/10 border-2 border-dashed border-blue-200 dark:border-blue-800 text-sm font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-400/20 focus:border-blue-400 focus:bg-white dark:focus:bg-slate-950 transition-all shadow-inner" />
          </div>
        </div>

        <!-- Erro -->
        <div v-if="erroMsg" class="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl px-3 py-2.5">
          <AlertTriangle class="text-red-500 shrink-0" :size="14" />
          <p class="text-xs font-bold text-red-600 dark:text-red-400">{{ erroMsg }}</p>
        </div>

        <!-- Botões -->
        <div class="flex gap-2">
          <button @click="calcular" :disabled="calculando"
            class="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
            <Loader2 v-if="calculando" class="animate-spin" :size="14" />
            <Calculator v-else :size="14" />
            {{ calculando ? 'Calculando...' : 'Calcular Rota' }}
          </button>
          <button v-if="calculado" @click="limpar"
            class="px-4 rounded-2xl border border-gray-200 dark:border-slate-700 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all">
            <X :size="15" />
          </button>
        </div>
      </div>

      <!-- COLUNA DIREITA: Mapa + Resultados -->
      <div class="flex flex-col gap-3 min-h-0">

        <!-- MAPA -->
        <div class="bg-white dark:bg-slate-900 rounded-[32px] border border-blue-100 dark:border-slate-800 shadow-2xl overflow-hidden relative shrink-0" style="height: 500px;">
          <div v-if="!calculado" class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-200 dark:text-slate-700 z-10 pointer-events-none">
            <Route :size="40" class="opacity-30" />
            <p class="text-[10px] font-black uppercase tracking-widest opacity-50">Configure e clique em Calcular Rota</p>
          </div>
          <div ref="mapEl" class="w-full h-full" style="z-index:0;" />
        </div>

        <!-- RESULTADOS abaixo do mapa -->
        <div v-if="calculado" class="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">

          <!-- 4 cards de métricas -->
          <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <div class="bg-blue-600 rounded-[20px] p-4 text-white shadow-xl shadow-blue-500/30">
              <Route class="mb-1.5 opacity-80" :size="16" />
              <p class="text-[9px] font-black uppercase tracking-widest opacity-70">Distância</p>
              <p class="text-lg font-black">{{ fmtKm(distanciaKm) }} km</p>
            </div>
            <div class="bg-slate-800 dark:bg-slate-700 rounded-[20px] p-4 text-white shadow-xl">
              <Clock class="mb-1.5 opacity-80" :size="16" />
              <p class="text-[9px] font-black uppercase tracking-widest opacity-70">Tempo Est.</p>
              <p class="text-lg font-black">{{ formatarDuracao(duracaoMin) }}</p>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-[20px] p-4 border border-blue-50 dark:border-slate-800 shadow-xl">
              <Fuel class="mb-1.5 text-blue-500" :size="16" />
              <p class="text-[9px] font-black uppercase tracking-widest text-gray-400">Combustível</p>
              <p class="text-base font-black text-gray-900 dark:text-white">R$ {{ fmt(custoCombustivel) }}</p>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-[20px] p-4 border border-amber-50 dark:border-slate-800 shadow-xl">
              <DollarSign class="mb-1.5 text-amber-500" :size="16" />
              <p class="text-[9px] font-black uppercase tracking-widest text-gray-400">Pedágios ({{ pedagiosEncontrados.length }})</p>
              <p class="text-base font-black text-gray-900 dark:text-white">R$ {{ fmt(totalPedagios) }}</p>
            </div>
          </div>

          <!-- 2ª linha: Análise + Pedágios -->
          <div class="grid gap-3" :class="analise ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'">

            <!-- Análise de rentabilidade -->
            <div v-if="analise" :class="[
              'rounded-[20px] p-4 text-white shadow-xl',
              analise.veredicto === 'otimo'   ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/25' :
              analise.veredicto === 'ok'      ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/25' :
              analise.veredicto === 'atencao' ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25' :
                                                'bg-gradient-to-br from-red-500 to-rose-700 shadow-red-500/25'
            ]">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <TrendingUp v-if="analise.veredicto === 'otimo' || analise.veredicto === 'ok'" :size="16" />
                  <TrendingDown v-else-if="analise.veredicto === 'prejuizo'" :size="16" />
                  <Minus v-else :size="16" />
                  <span class="text-[10px] font-black uppercase tracking-widest opacity-80">Análise do Frete</span>
                </div>
                <span class="text-[10px] font-black bg-white/20 px-3 py-1 rounded-xl">
                  {{ analise.veredicto === 'otimo' ? '✅ Ótimo!' : analise.veredicto === 'ok' ? '👍 Vale a pena' : analise.veredicto === 'atencao' ? '⚠️ Atenção' : '❌ Prejuízo' }}
                </span>
              </div>
              <div class="grid grid-cols-4 gap-2 mb-2.5">
                <div><p class="text-[8px] font-black uppercase opacity-60 mb-0.5">Frete</p><p class="text-sm font-black">R$ {{ fmt(analise.frete) }}</p></div>
                <div><p class="text-[8px] font-black uppercase opacity-60 mb-0.5">Custos</p><p class="text-sm font-black">- R$ {{ fmt(analise.custo) }}</p></div>
                <div><p class="text-[8px] font-black uppercase opacity-60 mb-0.5">Lucro</p><p class="text-sm font-black">R$ {{ fmt(analise.lucro) }}</p></div>
                <div><p class="text-[8px] font-black uppercase opacity-60 mb-0.5">Margem</p><p class="text-sm font-black">{{ analise.margem.toFixed(1) }}%</p></div>
              </div>
              <div class="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mb-2.5">
                <div class="h-full bg-white/80 rounded-full transition-all duration-700" :style="{ width: `${Math.min(Math.max(analise.margem, 0), 100)}%` }" />
              </div>
              <div class="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/20">
                <div class="text-center"><p class="text-[8px] opacity-60 font-black uppercase mb-0.5">Custo/km</p><p class="text-sm font-black">R$ {{ fmt(analise.custoPorKm) }}</p></div>
                <div class="text-center"><p class="text-[8px] opacity-60 font-black uppercase mb-0.5">Frete/km</p><p class="text-sm font-black">R$ {{ fmt(analise.fretePorKm) }}</p></div>
              </div>
            </div>

            <!-- Lista de Pedágios -->
            <div class="bg-white dark:bg-slate-900 rounded-[20px] border border-blue-50 dark:border-slate-800 shadow-xl overflow-hidden">
              <div class="px-4 py-3 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
                <h3 class="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <DollarSign :size="12" /> Pedágios ({{ pedagiosEncontrados.length }}) — R$ {{ fmt(totalPedagios) }}
                </h3>
                <span v-if="totalPedagios > custoCombustivel * 0.8"
                  class="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-xl flex items-center gap-1">
                  <AlertTriangle :size="10" /> Alto
                </span>
              </div>
              <div v-if="pedagiosEncontrados.length > 0" class="divide-y divide-gray-50 dark:divide-slate-800">
                <div v-for="p in pedagiosEncontrados" :key="p.id" class="px-4 py-2 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-[11px] font-black text-gray-800 dark:text-white truncate">{{ p.nome }}</p>
                    <p class="text-[9px] text-gray-400 font-bold">{{ p.rodovia }} — {{ p.estado }}</p>
                  </div>
                  <span class="shrink-0 text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-xl border border-amber-100 dark:border-amber-800">
                    R$ {{ fmt(p.custo) }}
                  </span>
                </div>
              </div>
              <div v-else class="px-4 py-4 flex items-center gap-2">
                <CheckCircle2 class="text-green-500 shrink-0" :size="14" />
                <p class="text-xs font-bold text-green-700 dark:text-green-400">Nenhum pedágio nesta rota!</p>
              </div>
              <div class="px-4 py-2.5 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-950/50">
                <span class="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">Custo Total da Rota</span>
                <span class="text-base font-black text-blue-600">R$ {{ fmt(custoTotal) }}</span>
              </div>
            </div>
            
            <button @click="salvarSimulacao" class="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors shadow-lg shadow-amber-500/20">
              <Save :size="14" class="inline mr-1" /> Salvar Simulação
            </button>
          </div>
        </div>

        <!-- Placeholder quando não calculado -->
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center space-y-2">
            <BarChart2 :size="36" class="mx-auto text-gray-200 dark:text-slate-700 opacity-50" />
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-200 dark:text-slate-700 opacity-50">Resultados aparecerão aqui</p>
          </div>
        </div>
      </div>
    </div>

    <!-- View: Motorista (Gestão de Viagem) -->
    <div v-if="currentSubTab === 'motorista'" class="animate-in slide-in-from-right duration-500">
      <div class="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl border border-blue-50 dark:border-slate-800">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-black text-blue-900 dark:text-white uppercase tracking-tight">Gestão de Viagem</h2>
            <p class="text-xs text-gray-400 font-bold mt-1">Acompanhe seu progresso, abastecimentos e lucros em tempo real.</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 text-[10px] font-black rounded-xl border border-green-100 dark:border-green-800 uppercase tracking-widest">
              Conectado como Motorista
            </span>
          </div>
        </div>

        <!-- RELATÓRIO FINAL -->
        <div v-if="mostrarRelatorio && relatorioDados" class="animate-in fade-in zoom-in duration-500">
          <div class="bg-blue-600 text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden mb-8">
            <div class="absolute top-0 right-0 p-8 opacity-10">
              <CheckCircle2 :size="120" />
            </div>
            <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 class="text-3xl font-black uppercase tracking-tight mb-2">Viagem Concluída!</h2>
                <p class="text-blue-200 font-bold max-w-md">O resumo da sua rota foi gerado com sucesso. Confira abaixo as estatísticas operacionais e exporte os dados.</p>
              </div>
              <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button @click="exportarPDF" class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-black uppercase text-xs transition-colors backdrop-blur-sm">
                  <FileText :size="16" /> Exportar PDF
                </button>
                <button @click="exportarExcel" class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-900 hover:bg-gray-100 rounded-xl font-black uppercase text-xs transition-colors shadow-lg">
                  <Download :size="16" /> Exportar Excel
                </button>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gray-50 dark:bg-slate-950 p-6 rounded-3xl border border-gray-100 dark:border-slate-800">
              <Route class="mb-3 text-blue-500" :size="24" />
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distância Total</p>
              <p class="text-2xl font-black text-gray-900 dark:text-white">{{ fmtKm(relatorioDados.kmTotal) }} km</p>
              <p class="text-[10px] text-gray-400 mt-1">KM {{ relatorioDados.kmInicial }} ao {{ relatorioDados.kmFinal }}</p>
            </div>
            
            <div class="bg-gray-50 dark:bg-slate-950 p-6 rounded-3xl border border-gray-100 dark:border-slate-800">
              <Fuel class="mb-3 text-amber-500" :size="24" />
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Média (KM/L)</p>
              <p class="text-2xl font-black text-gray-900 dark:text-white">{{ relatorioDados.mediaKmPorLitro.toFixed(2) }}</p>
              <p class="text-[10px] text-gray-400 mt-1">{{ relatorioDados.totalLitros.toFixed(1) }}L Abastecidos</p>
            </div>
            
            <div class="bg-gray-50 dark:bg-slate-950 p-6 rounded-3xl border border-gray-100 dark:border-slate-800">
              <DollarSign class="mb-3 text-red-500" :size="24" />
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Despesas Totais</p>
              <p class="text-2xl font-black text-gray-900 dark:text-white">R$ {{ fmt(relatorioDados.custoTotalViagem) }}</p>
              <p class="text-[10px] text-gray-400 mt-1">Combustível + Extras</p>
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800">
              <Calculator class="mb-3 text-blue-600 dark:text-blue-400" :size="24" />
              <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest">Custo por KM</p>
              <p class="text-2xl font-black text-blue-700 dark:text-blue-300">R$ {{ fmt(relatorioDados.custoPorKm) }}</p>
              <p class="text-[10px] text-blue-400 mt-1">R$/KM</p>
            </div>
          </div>
          
          <div v-if="Object.keys(relatorioDados.despesasPorCategoria).length > 0" class="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[24px] p-6 mb-8 shadow-sm">
            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Banknote :size="12" /> Resumo de Despesas por Categoria
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div v-for="(valor, cat) in relatorioDados.despesasPorCategoria" :key="cat" class="bg-gray-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center">
                <span class="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">{{ cat }}</span>
                <span class="text-lg font-black text-gray-900 dark:text-white">R$ {{ fmt(valor) }}</span>
              </div>
            </div>
          </div>
          
          <button @click="fecharRelatorio" class="w-full py-5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white rounded-2xl font-black uppercase tracking-widest transition-all">
            Iniciar Nova Viagem
          </button>
        </div>

        <!-- PAINEL DA VIAGEM ATIVA / INÍCIO -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          <!-- MODAL DE ENCERRAMENTO -->
          <div v-if="mostrarModalEncerramento" class="absolute inset-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-[32px] flex items-center justify-center animate-in fade-in">
            <div class="bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-2xl border border-gray-100 dark:border-slate-700 w-full max-w-sm">
              <h3 class="text-lg font-black text-gray-900 dark:text-white uppercase mb-2">Encerrar Viagem</h3>
              <p class="text-xs text-gray-500 mb-6 font-bold">Por favor, informe o Odômetro Final para gerar o relatório da viagem.</p>
              
              <div class="space-y-1.5 mb-6">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">KM Final (Odômetro)</label>
                <input type="number" v-model="kmFinal" class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-lg font-black dark:text-white outline-none focus:ring-2 focus:ring-blue-400 text-center" />
              </div>
              
              <div class="flex gap-3">
                <button @click="mostrarModalEncerramento = false" class="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-black uppercase text-[10px] hover:bg-gray-200 transition-colors">Cancelar</button>
                <button @click="confirmarEncerramento" class="flex-1 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30">Confirmar</button>
              </div>
            </div>
          </div>
          <!-- Coluna 1: Status e Início -->
          <div class="space-y-6">
            <div class="bg-blue-50/50 dark:bg-slate-950 p-6 rounded-[24px] border border-blue-100 dark:border-slate-800">
              <h3 class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Play :size="12" /> Iniciar Nova Viagem</h3>
              <div class="space-y-4">
                <div class="space-y-1.5 text-left relative">
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><MapPin :size="10" /> Origem Atual</label>
                  <div class="relative">
                    <input type="text" v-model="origemInput" @input="onOrigemInput" @focus="mostrarOrigem = sugestoesOrigem.length > 0" placeholder="Sua localização..." class="w-full pl-4 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
                    <button @click="usarMinhaLocalizacao" class="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:scale-110 transition-transform">
                      <LocateFixed :size="18" />
                    </button>
                  </div>
                  <div v-if="mostrarOrigem && sugestoesOrigem.length"
                    class="absolute z-[100] top-full mt-1 w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                    <button v-for="s in sugestoesOrigem" :key="s.lat + s.lon" @click="selecionarOrigem(s)"
                      class="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-50 dark:border-slate-800 last:border-0 flex items-center gap-2">
                      <MapPin class="text-green-500 shrink-0" :size="11" />
                      <span class="truncate">{{ s.display_name }}</span>
                    </button>
                  </div>
                </div>
                <div class="space-y-1.5 text-left relative">
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><Navigation :size="10" /> Destino da Viagem</label>
                  <input type="text" v-model="destinoInput" @input="onDestinoInput" @focus="mostrarDestino = sugestoesDestino.length > 0" placeholder="Cidade de destino..." class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
                  <div v-if="mostrarDestino && sugestoesDestino.length"
                    class="absolute z-[100] top-full mt-1 w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                    <button v-for="s in sugestoesDestino" :key="s.lat + s.lon" @click="selecionarDestino(s)"
                      class="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-50 dark:border-slate-800 last:border-0 flex items-center gap-2">
                      <MapPin class="text-red-500 shrink-0" :size="11" />
                      <span class="truncate">{{ s.display_name }}</span>
                    </button>
                  </div>
                </div>
                <div class="space-y-1.5 text-left">
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><Truck :size="10" /> Placa do Veículo</label>
                  <select v-if="frota.length > 0" v-model="placaVeiculo" class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition-all uppercase">
                    <option value="">Selecione um veículo</option>
                    <option v-for="v in frota" :key="v.id" :value="v.placa">{{ v.placa }} - {{ v.modelo }}</option>
                  </select>
                  <input v-else type="text" :value="placaVeiculo" @input="formatarPlaca" placeholder="Ex: ABC-1234" class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition-all uppercase" maxlength="8" />
                </div>
                <div class="space-y-1.5 text-left">
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><History :size="10" /> KM Inicial (Odômetro)</label>
                  <input type="number" v-model="kmInicial" placeholder="0" class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
                </div>
                <button @click="iniciarViagem" :disabled="calculando" class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                  <Play v-if="!calculando" :size="16" />
                  <Loader2 v-else :size="16" class="animate-spin" />
                  {{ calculando ? 'Iniciando...' : 'Iniciar Viagem' }}
                </button>

                <!-- UI DE EMERGÊNCIA (CORS / TIMEOUT) -->
                <div v-if="erroMsg && !viagemAtiva" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl space-y-3 mt-4 animate-in fade-in slide-in-from-top-2">
                  <p class="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest text-center">{{ erroMsg }}</p>
                  
                  <div class="space-y-1.5 text-left">
                    <label class="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1">Distância Total Estimada (KM)</label>
                    <input type="number" v-model="distanciaManual" placeholder="Ex: 750" class="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-sm font-bold text-red-900 dark:text-red-100 outline-none focus:ring-2 focus:ring-red-400" />
                  </div>
                  
                  <button @click="iniciarViagemManual" class="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-red-500/20 active:scale-95">
                    Iniciar com KM Manual
                  </button>
                </div>
              </div>
            </div>

            <!-- Resumo Rápido -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Distância Total</p>
                <p class="text-lg font-black text-blue-900 dark:text-white">{{ viagemAtiva ? fmtKm(viagemDados.distancia) + ' km' : '0 km' }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Viagem Ativa</p>
                <p :class="['text-lg font-black', viagemAtiva ? 'text-green-600' : 'text-gray-400']">{{ viagemAtiva ? 'Sim' : 'Não' }}</p>
              </div>
            </div>
          </div>

          <!-- Coluna 2: Abastecimentos e Despesas -->
          <div class="lg:col-span-2 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm">
                <h3 class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Fuel :size="12" /> Registrar Abastecimento</h3>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="text-[10px] font-black text-gray-400 uppercase">Litros</label>
                      <input v-model.number="abastecimentoForm.litros" type="number" step="0.01" placeholder="0.00" class="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-[10px] font-black text-gray-400 uppercase">Valor Total</label>
                      <input :value="abastecimentoForm.valorDisplay" @input="(e) => { const r = formatarCampoMoeda((e.target as HTMLInputElement).value); abastecimentoForm.valor = r.numeric; abastecimentoForm.valorDisplay = r.display }" type="text" placeholder="R$ 0,00" class="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none" />
                    </div>
                  </div>
                  <button @click="salvarAbastecimento" class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-95">Salvar Abastecimento</button>
                </div>
              </div>

              <div class="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm">
                <h3 class="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2"><DollarSign :size="12" /> Outras Despesas</h3>
                <div class="space-y-4">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-gray-400 uppercase">Descrição</label>
                    <div class="flex flex-wrap gap-2 mb-2">
                      <button v-for="tag in despesasSugestoes" :key="tag" @click="despesaForm.descricao = tag" :class="['px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all', despesaForm.descricao === tag ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-red-50']">{{ tag }}</button>
                    </div>
                    <input v-model="despesaForm.descricao" type="text" placeholder="O que foi gasto?" class="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-gray-400 uppercase">Valor</label>
                    <input :value="despesaForm.valorDisplay" @input="(e) => { const r = formatarCampoMoeda((e.target as HTMLInputElement).value); despesaForm.valor = r.numeric; despesaForm.valorDisplay = r.display }" type="text" placeholder="R$ 0,00" class="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none" />
                  </div>
                  <button @click="registrarDespesa" class="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-red-500/20 active:scale-95">Registrar Despesa</button>
                </div>
              </div>
            </div>

            <!-- Timeline/Histórico da Viagem -->
            <div class="bg-gray-50 dark:bg-slate-950 rounded-[24px] p-6 border border-gray-100 dark:border-slate-800">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><History :size="12" /> Linha do Tempo da Viagem</h3>
                <button v-if="viagemAtiva" @click="encerrarViagem" class="text-[10px] font-black text-red-600 uppercase border border-red-100 dark:border-red-900/30 px-3 py-1 rounded-lg hover:bg-red-50 transition-all">Encerrar Viagem</button>
              </div>
              <div v-if="!viagemAtiva" class="text-center py-12">
                <div class="bg-white dark:bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-slate-800">
                  <Route :size="24" class="text-gray-300" />
                </div>
                <p class="text-sm font-bold text-gray-400">Nenhum evento registrado nesta viagem.</p>
                <p class="text-[10px] text-gray-300 mt-1">Inicie a viagem para começar o monitoramento.</p>
              </div>
              <div v-else class="space-y-4">
                <div v-for="(evento, index) in viagemDados.eventos" :key="evento.data" class="flex gap-3 group relative">
                  <div class="relative flex flex-col items-center">
                    <div class="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-1"></div>
                    <div class="w-0.5 flex-1 bg-blue-100 dark:bg-slate-800 my-1"></div>
                  </div>
                  <div class="flex-1 pb-4 border-b border-gray-50 dark:border-slate-800/50 last:border-0 last:pb-0 relative">
                    <div class="flex justify-between items-start gap-4">
                      <div>
                        <p class="text-[10px] font-black text-gray-400 uppercase">{{ new Date(evento.data).toLocaleTimeString() }}</p>
                        <p class="text-xs font-bold text-blue-900 dark:text-white mt-0.5 leading-snug">{{ evento.desc }}</p>
                      </div>
                      <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="editarEvento(index)" title="Editar" class="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Edit2 :size="14" />
                        </button>
                        <button v-if="authStore.user?.role === 'ADMIN'" @click="excluirEvento(index)" title="Excluir" class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Trash2 :size="14" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- View: Relatórios -->
    <div v-if="currentSubTab === 'relatorios'" class="animate-in slide-in-from-right duration-500">
      <div class="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl border border-gray-100 dark:border-slate-800">
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Central de Relatórios</h2>
            <p class="text-xs text-gray-400 font-bold mt-1">Extraia e filtre os dados de viagens e cotações da frota.</p>
          </div>
          
          <div class="flex flex-row flex-wrap gap-3 w-full md:w-auto">
            <button @click="gerarExportacaoGenerica('csv')" class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-xl font-black uppercase text-[10px] transition-colors">
              CSV
            </button>
            <button @click="gerarExportacaoGenerica('excel')" class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-xl font-black uppercase text-[10px] transition-colors">
              Excel
            </button>
            <button @click="gerarExportacaoGenerica('pdf')" class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl font-black uppercase text-[10px] transition-colors">
              PDF
            </button>
          </div>
        </div>

        <div class="flex flex-col xl:flex-row gap-4 mb-6">
          <div class="flex flex-col sm:flex-row bg-gray-50 dark:bg-slate-950 p-1 rounded-[16px] border border-gray-100 dark:border-slate-800 w-full xl:w-auto">
            <button @click="tipoRelatorio = 'simulacoes'" :class="['flex-1 justify-center px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all', tipoRelatorio === 'simulacoes' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-blue-600']">Simulações de Frete</button>
            <button @click="tipoRelatorio = 'viagens'" :class="['flex-1 justify-center px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all', tipoRelatorio === 'viagens' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-blue-600']">Viagens Realizadas</button>
          </div>
          <div class="flex-1 relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="16" />
            <input type="text" v-model="searchQuery" placeholder="Buscar por cidade, placa..." class="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        <div class="overflow-x-auto rounded-[20px] border border-gray-100 dark:border-slate-800">
          <table v-if="tipoRelatorio === 'viagens'" class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <th class="p-4 whitespace-nowrap">Data</th>
                <th class="p-4 whitespace-nowrap">Placa</th>
                <th class="p-4">Trajeto</th>
                <th class="p-4 whitespace-nowrap text-right">KM/L</th>
                <th class="p-4 whitespace-nowrap text-right">Custo Total</th>
                <th class="p-4 whitespace-nowrap text-right">Custo/KM</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-slate-800/50">
              <tr v-for="(v, idx) in filteredViagens" :key="idx" @click="relatorioViagemSelecionado = v" class="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                <td class="p-4 text-xs font-bold text-gray-600 dark:text-gray-300">{{ new Date(v.dataFim).toLocaleDateString('pt-BR') }}</td>
                <td class="p-4"><span class="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-[10px] font-black">{{ v.placa }}</span></td>
                <td class="p-4 text-xs font-bold text-gray-900 dark:text-white">{{ v.origem }} <span class="text-gray-400 mx-1">→</span> {{ v.destino }}</td>
                <td class="p-4 text-xs font-black text-amber-600 text-right">{{ v.mediaKmPorLitro.toFixed(2) }}</td>
                <td class="p-4 text-xs font-black text-red-600 text-right">R$ {{ fmt(v.custoTotalViagem) }}</td>
                <td class="p-4 text-xs font-black text-blue-600 text-right">R$ {{ fmt(v.custoPorKm) }}</td>
              </tr>
              <tr v-if="filteredViagens.length === 0">
                <td colspan="6" class="p-8 text-center text-sm font-bold text-gray-400">Nenhuma viagem encontrada.</td>
              </tr>
            </tbody>
          </table>

          <table v-if="tipoRelatorio === 'simulacoes'" class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <th class="p-4 whitespace-nowrap">Data</th>
                <th class="p-4">Trajeto</th>
                <th class="p-4 whitespace-nowrap text-right">Custo Estimado</th>
                <th class="p-4 whitespace-nowrap text-right">Frete</th>
                <th class="p-4 whitespace-nowrap text-right">Lucro</th>
                <th class="p-4 whitespace-nowrap text-right">Margem</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-slate-800/50">
              <tr v-for="(s, idx) in filteredSimulacoes" :key="idx" @click="relatorioSimulacaoSelecionado = s" class="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                <td class="p-4 text-xs font-bold text-gray-600 dark:text-gray-300">{{ new Date(s.data).toLocaleDateString('pt-BR') }}</td>
                <td class="p-4 text-xs font-bold text-gray-900 dark:text-white">{{ s.origem }} <span class="text-gray-400 mx-1">→</span> {{ s.destino }}</td>
                <td class="p-4 text-xs font-black text-red-600 text-right">R$ {{ fmt(s.custoTotal) }}</td>
                <td class="p-4 text-xs font-black text-gray-900 dark:text-white text-right">{{ s.valorFrete ? `R$ ${fmt(s.valorFrete)}` : '-' }}</td>
                <td class="p-4 text-xs font-black text-green-600 text-right">{{ s.lucro ? `R$ ${fmt(s.lucro)}` : '-' }}</td>
                <td class="p-4"><span v-if="s.margem" :class="['px-2.5 py-1 rounded-lg text-[10px] font-black float-right', s.margem > 30 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">{{ s.margem.toFixed(1) }}%</span></td>
              </tr>
              <tr v-if="filteredSimulacoes.length === 0">
                <td colspan="6" class="p-8 text-center text-sm font-bold text-gray-400">Nenhuma simulação encontrada.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL DETALHE VIAGEM -->
    <div v-if="relatorioViagemSelecionado" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="relatorioViagemSelecionado = null"></div>
      <div class="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div class="p-8 bg-blue-600 text-white relative">
          <button @click="relatorioViagemSelecionado = null" class="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm">
            <X :size="20" />
          </button>
          <h2 class="text-3xl font-black uppercase tracking-tight mb-2">Detalhes da Viagem</h2>
          <p class="text-blue-200 font-bold max-w-md">Placa: {{ relatorioViagemSelecionado.placa }} | Data: {{ new Date(relatorioViagemSelecionado.dataFim).toLocaleDateString('pt-BR') }}</p>
        </div>
        
        <div class="p-8 overflow-y-auto">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gray-50 dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800">
              <Route class="mb-3 text-blue-500" :size="24" />
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distância Total</p>
              <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{ relatorioViagemSelecionado.kmTotal }} km</p>
              <p class="text-[10px] text-gray-400 mt-1">KM {{ relatorioViagemSelecionado.kmInicial }} ao {{ relatorioViagemSelecionado.kmFinal }}</p>
            </div>
            
            <div class="bg-gray-50 dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800">
              <Fuel class="mb-3 text-amber-500" :size="24" />
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Média (KM/L)</p>
              <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{ relatorioViagemSelecionado.mediaKmPorLitro.toFixed(2) }}</p>
              <p class="text-[10px] text-gray-400 mt-1">{{ relatorioViagemSelecionado.totalLitros.toFixed(1) }}L Abastecidos</p>
            </div>
            
            <div class="bg-gray-50 dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800">
              <DollarSign class="mb-3 text-red-500" :size="24" />
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Despesas Totais</p>
              <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">R$ {{ fmt(relatorioViagemSelecionado.custoTotalViagem) }}</p>
              <p class="text-[10px] text-gray-400 mt-1">Combustível + Extras</p>
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/30">
              <Calculator class="mb-3 text-blue-600 dark:text-blue-400" :size="24" />
              <p class="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest">Custo por KM</p>
              <p class="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">R$ {{ fmt(relatorioViagemSelecionado.custoPorKm) }}</p>
              <p class="text-[10px] text-blue-400 mt-1">R$/KM</p>
            </div>
          </div>
          
          <div v-if="relatorioViagemSelecionado.despesasPorCategoria && Object.keys(relatorioViagemSelecionado.despesasPorCategoria).length > 0" class="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[24px] p-6 shadow-sm">
            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Banknote :size="12" /> Resumo de Despesas por Categoria
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div v-for="(valor, cat) in relatorioViagemSelecionado.despesasPorCategoria" :key="cat" class="bg-gray-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center">
                <span class="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">{{ cat }}</span>
                <span class="text-lg font-black text-gray-900 dark:text-white">R$ {{ fmt(valor) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DETALHE SIMULAÇÃO -->
    <div v-if="relatorioSimulacaoSelecionado" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="relatorioSimulacaoSelecionado = null"></div>
      <div class="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div class="p-8 bg-blue-600 text-white relative">
          <button @click="relatorioSimulacaoSelecionado = null" class="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm">
            <X :size="20" />
          </button>
          <h2 class="text-3xl font-black uppercase tracking-tight mb-2">Simulação de Frete</h2>
          <p class="text-blue-200 font-bold max-w-md">{{ relatorioSimulacaoSelecionado.origem }} → {{ relatorioSimulacaoSelecionado.destino }}</p>
        </div>
        
        <div class="p-8 overflow-y-auto">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gray-50 dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800">
              <Route class="mb-3 text-blue-500" :size="24" />
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distância Total</p>
              <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{ relatorioSimulacaoSelecionado.distanciaKm.toFixed(0) }} km</p>
            </div>
            
            <div class="bg-gray-50 dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800">
              <Fuel class="mb-3 text-amber-500" :size="24" />
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Combustível Estimado</p>
              <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">R$ {{ fmt(relatorioSimulacaoSelecionado.custoCombustivel) }}</p>
            </div>
            
            <div class="bg-gray-50 dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800">
              <Banknote class="mb-3 text-red-500" :size="24" />
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pedágios / Custos</p>
              <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">R$ {{ fmt(relatorioSimulacaoSelecionado.totalPedagios) }}</p>
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/30">
              <Calculator class="mb-3 text-blue-600 dark:text-blue-400" :size="24" />
              <p class="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest">Custo da Viagem</p>
              <p class="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">R$ {{ fmt(relatorioSimulacaoSelecionado.custoTotal) }}</p>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-center">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor do Frete Negociado</p>
              <p class="text-3xl font-black text-gray-900 dark:text-white">R$ {{ fmt(relatorioSimulacaoSelecionado.valorFrete || 0) }}</p>
            </div>
            <div class="flex gap-4 mt-4 md:mt-0 text-right">
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lucro Bruto</p>
                <p class="text-xl font-black text-green-600">R$ {{ fmt(relatorioSimulacaoSelecionado.lucro || 0) }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Margem</p>
                <p :class="['text-xl font-black', (relatorioSimulacaoSelecionado.margem || 0) > 30 ? 'text-green-600' : 'text-red-600']">{{ (relatorioSimulacaoSelecionado.margem || 0).toFixed(1) }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
:deep(.leaflet-container) {
  background: #f1f5f9;
  font-family: inherit;
}
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}
</style>
