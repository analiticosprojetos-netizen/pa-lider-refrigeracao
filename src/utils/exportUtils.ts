import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { format, parseISO } from 'date-fns'

export const exportToExcel = (data: any[], fileName: string) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orçamentos")
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  } catch (error) {
    console.error("Erro ao exportar Excel:", error)
  }
}

const buildPDFDoc = (order: any, settings: any, protocol?: string) => {
  const companyName = settings.companyName || "LIDER REFRIGERAÇÃO"
  const logo = settings.logo || ""
  const cnpj = settings.cnpj || "00.000.000/0001-00"
  const email = settings.email || "contato@liderefrigeracao.com.br"
  const phone = settings.whatsapp || "(11) 99999-9999"
  const address = settings.address || "Av. Industrial, 1000 - Setor de Transportes"
  
  const safeText = (val: any) => String(val ?? '')
  
  const formatBRL = (val: any) => {
    const n = Number(val || 0);
    return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return 'Agendar'
    try {
      const s = String(dateStr)
      // Se for YYYY-MM-DD
      const parts = s.split('T')[0].split('-')
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`
      }
      // Fallback para outros formatos
      return format(parseISO(s), 'dd/MM/yyyy')
    } catch (e) {
      return String(dateStr)
    }
  }


  const doc = new jsPDF()
  
  // --- HEADER BACKGROUND GRADIENT (VERSÃO COMPATÍVEL) ---
  for (let i = 0; i < 42; i++) {
    const factor = i / 42;
    // Gradiente suave de azul claro (R:230, G:240, B:255) para branco
    const r = Math.floor(230 + (255 - 230) * factor);
    const g = Math.floor(240 + (255 - 240) * factor);
    const b = Math.floor(255 + (255 - 255) * factor);
    doc.setFillColor(r, g, b);
    doc.rect(0, i, 210, 1, 'F');
  }
  
  // --- HEADER (CLEAN STYLE) ---
  if (logo) {
    try {
      const imgProps = doc.getImageProperties(logo)
      const ratio = imgProps.width / imgProps.height
      const targetH = 18
      const targetW = targetH * ratio
      doc.addImage(logo, 'PNG', 15, 10, targetW, targetH)
    } catch (e) {}
  }

  doc.setTextColor(26, 54, 93) // Azul Escuro
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("Orçamento", 15, 32)
  
  const formatDate = (dateStr: any) => {
    if (!dateStr) return format(new Date(), 'dd/MM/yyyy')
    try {
      const [year, month, day] = dateStr.split('T')[0].split('-')
      if (year && month && day) return `${day}/${month}/${year}`
      return format(parseISO(dateStr), 'dd/MM/yyyy')
    } catch (e) {
      return dateStr
    }
  }

  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(150, 150, 150)
  const orderDate = formatDate(order.date)
  doc.text(`Gerado em: ${orderDate}`, 15, 36)
  if (protocol) {
    doc.setFont("helvetica", "bold")
    doc.text(`Protocolo: ${protocol}`, 15, 40)
    doc.setFont("helvetica", "normal")
  }

  // Info Empresa (Canto Direito)
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.text(companyName.toUpperCase(), 195, 12, { align: 'right' })
  doc.text(`CNPJ: ${cnpj}`, 195, 16, { align: 'right' })
  doc.text(phone, 195, 20, { align: 'right' })
  doc.text(email, 195, 24, { align: 'right' })

  doc.setDrawColor(240, 240, 240)
  doc.line(15, 42, 195, 42)

  // --- CARDS ROW 1 (CLIENTE E VEÍCULO) ---
  // Card Cliente
  doc.setFillColor(252, 252, 252)
  doc.roundedRect(15, 48, 85, 35, 3, 3, "F")
  doc.setDrawColor(230, 230, 230)
  doc.roundedRect(15, 48, 85, 35, 3, 3, "D")
  
  doc.setTextColor(26, 54, 93)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("DADOS DO CLIENTE", 20, 53)
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.text(safeText(order.clientName), 20, 61)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)
  doc.text(`Doc: ${order.document || 'N/A'}`, 20, 67)
  doc.text(`Tel: ${order.phone || 'N/A'}`, 20, 72)
  doc.text(`Email: ${order.email || 'N/A'}`, 20, 77)

  // Card Veículo
  doc.setFillColor(252, 252, 252)
  doc.roundedRect(110, 48, 85, 35, 3, 3, "F")
  doc.setDrawColor(230, 230, 230)
  doc.roundedRect(110, 48, 85, 35, 3, 3, "D")

  doc.setTextColor(26, 54, 93)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("VEÍCULO E EQUIPAMENTO", 115, 53)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.text(safeText(order.plate), 115, 61)
  doc.setFontSize(10)
  doc.setTextColor(59, 130, 246) // Azul claro
  doc.text(safeText(order.vehicleModel), 115, 67)
  
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.setFont("helvetica", "bold")
  doc.text("EQUIPAMENTO", 115, 73)
  doc.setFont("helvetica", "normal")
  doc.text(safeText(`${order.equipBrand || ''} ${order.equipModel || ''}`), 115, 78)

  // --- CARDS ROW 2 (DIAGNÓSTICO E CRONOGRAMA) ---
  // Card Diagnóstico
  doc.setFillColor(252, 252, 252)
  doc.roundedRect(15, 88, 85, 45, 3, 3, "F")
  doc.setDrawColor(230, 230, 230)
  doc.roundedRect(15, 88, 85, 45, 3, 3, "D")

  doc.setTextColor(26, 54, 93)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("DIAGNÓSTICO TÉCNICO", 20, 93)

  doc.setFontSize(8)
  doc.setTextColor(59, 130, 246)
  doc.text("PROBLEMA RELATADO", 20, 99)
  doc.setTextColor(80, 80, 80)
  doc.setFont("helvetica", "normal")
  const problemText = doc.splitTextToSize(order.problem || "N/A", 75)
  doc.text(problemText, 20, 103)

  doc.setFontSize(8)
  doc.setTextColor(59, 130, 246)
  doc.setFont("helvetica", "bold")
  doc.text("DIAGNÓSTICO", 20, 115)
  doc.setTextColor(80, 80, 80)
  doc.setFont("helvetica", "normal")
  const diagnosisText = doc.splitTextToSize(order.diagnosis || "N/A", 75)
  doc.text(diagnosisText, 20, 119)

  // Card Cronograma
  doc.setFillColor(252, 252, 252)
  doc.roundedRect(110, 88, 85, 45, 3, 3, "F")
  doc.setDrawColor(230, 230, 230)
  doc.roundedRect(110, 88, 85, 45, 3, 3, "D")

  doc.setTextColor(26, 54, 93)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("CRONOGRAMA PREVISTO", 115, 93)

  doc.setFillColor(255, 255, 255)
  doc.roundedRect(115, 98, 75, 12, 2, 2, "F")
  doc.setDrawColor(245, 245, 245)
  doc.roundedRect(115, 98, 75, 12, 2, 2, "D")
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text("INÍCIO ESTIMADO", 118, 105)
  doc.setTextColor(26, 54, 93)
  doc.setFont("helvetica", "bold")
  doc.text(formatDateTime(order.startTime), 185, 105, { align: 'right' })

  doc.setFillColor(255, 255, 255)
  doc.roundedRect(115, 115, 75, 12, 2, 2, "F")
  doc.setDrawColor(245, 245, 245)
  doc.roundedRect(115, 115, 75, 12, 2, 2, "D")
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.setFont("helvetica", "normal")
  doc.text("FIM ESTIMADO", 118, 122)
  doc.setTextColor(26, 54, 93)
  doc.setFont("helvetica", "bold")
  doc.text(formatDateTime(order.endTime), 185, 122, { align: 'right' })
  
  // Duração Total
  if (order.startTime && order.endTime) {
    try {
      const start = new Date(order.startTime)
      const end = new Date(order.endTime)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
      
      doc.setFillColor(59, 130, 246)
      doc.roundedRect(165, 128, 30, 5, 1, 1, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(7)
      doc.text(`${diffDays} DIAS TOTAL`, 180, 131.5, { align: 'right' })
    } catch (e) {}
  }


  // --- TABELA DE ITENS ---
  doc.setTextColor(26, 54, 93)
  doc.setFontSize(10)
  doc.text("ITENS DO ORÇAMENTO", 15, 142)

  const services = order.services || []
  const parts = order.parts || []
  const tableData = [
    ...services.map((s: any) => [safeText(s.description), "Mão de Obra", safeText(s.qty || 1), formatBRL(s.value), formatBRL((s.qty || 1) * s.value)]),
    ...parts.map((p: any) => [safeText(p.name || p.description), "Peça / Insumo", safeText(p.quantity || p.qty), formatBRL(p.value), formatBRL((p.quantity || p.qty) * p.value)]),
  ]

  try {
    autoTable(doc, {
      startY: 145,
      head: [["DESCRIÇÃO", "TIPO", "QTD", "UNITÁRIO", "SUBTOTAL"]],
      body: tableData,
      headStyles: { 
        fillColor: [245, 245, 245], // Cinza mais clarinho
        textColor: [0, 0, 0], // Preto para contraste no cinza
        fontSize: 8, 
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: { fontSize: 9, textColor: [0, 0, 0] },
      columnStyles: {
        0: { fontStyle: 'bold' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' },
      },
      theme: "plain", // Remove o zebrado (listras)
      margin: { left: 15, right: 15 },
      didDrawCell: (data) => {
         if (data.section === 'body' && data.column.index === 4) {
            doc.setTextColor(0, 0, 0)
         }
      }
    })
  } catch (e) {
    console.error("Erro ao gerar tabela no PDF:", e)
    doc.text("Erro ao carregar itens do orçamento.", 15, 150)
  }

  let finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 150
  
  if (finalY > 230) {
    doc.addPage()
    finalY = 20
  }

  // --- SUMMARY BOX (BLUE) ---
  const boxW = 85
  const boxH = 55
  const boxX = 110
  const boxY = finalY

  doc.setFillColor(26, 54, 93)
  doc.roundedRect(boxX, boxY, boxW, boxH, 5, 5, "F")
  
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  
  doc.text("Mão de Obra Total:", boxX + 5, boxY + 12)
  doc.text(formatBRL(order.servicesValue), boxX + boxW - 5, boxY + 12, { align: 'right' })
  
  doc.text("Peças Total:", boxX + 5, boxY + 20)
  doc.text(formatBRL(order.partsValue), boxX + boxW - 5, boxY + 20, { align: 'right' })
  
  doc.text("Deslocamento:", boxX + 5, boxY + 28)
  doc.text(formatBRL(order.travelValue), boxX + boxW - 5, boxY + 28, { align: 'right' })
  
  doc.setDrawColor(255, 255, 255, 0.2)
  doc.line(boxX + 5, boxY + 34, boxX + boxW - 5, boxY + 34)
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("Subtotal:", boxX + 5, boxY + 42)
  const subTotal = (order.servicesValue || 0) + (order.partsValue || 0) + (order.travelValue || 0)
  doc.text(formatBRL(subTotal), boxX + boxW - 5, boxY + 42, { align: 'right' })

  doc.setTextColor(255, 215, 0) // Gold/Yellow
  doc.setFontSize(16)
  doc.text("TOTAL:", boxX + 5, boxY + 50)
  doc.text(formatBRL(order.total), boxX + boxW - 5, boxY + 50, { align: 'right' })

  // Info Final (Bottom Left)
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(safeText(`Garantia: ${order.warranty || '90 dias'}`), 15, boxY + 12)
  doc.text(safeText(`Técnico Responsável: ${order.technician || 'Admin'}`), 15, boxY + 20)

  return doc
}

export const generateServiceOrderPDF = (order: any, settings?: any, protocol?: string) => {
  if (!order) return
  const companyInfo = settings || {}
  const doc = buildPDFDoc(order, companyInfo, protocol)
  
  const firstName = order.clientName ? order.clientName.split(' ')[0].toUpperCase() : 'CLIENTE'
  doc.save(`Orcamento_${firstName}_${protocol || order.id}.pdf`)
}


export const sendToWhatsApp = (order: any, settings?: any) => {
  if (!order || !order.phone) {
    alert('Telefone do cliente não informado.')
    return
  }
  
  // Limpa o número e garante o prefixo 55 se for brasileiro (10 ou 11 dígitos)
  let cleanPhone = order.phone.replace(/\D/g, '')
  if (cleanPhone.length === 10 || cleanPhone.length === 11) {
    cleanPhone = '55' + cleanPhone
  }

  const tech = order.technician ? `\n*Técnico:* ${order.technician}` : ''
  const text = `*ORÇAMENTO LIDER REFRIGERAÇÃO - #${order.id}*\n\nOlá ${order.clientName},\nSegue o orçamento referente ao veículo *${order.plate}*.\n\n*Total:* R$ ${order.total.toFixed(2)}\n*Status:* ${order.status}${tech}\n\nO PDF detalhado foi gerado. Caso não tenha recebido, por favor nos avise.`
  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank')
}

// ---- EXPORTAÇÃO DE VIAGENS (GEVI) ----

export const exportViagemToExcel = (viagem: any) => {
  try {
    const dados = [
      {
        "Placa": viagem.placa,
        "Origem": viagem.origem,
        "Destino": viagem.destino,
        "KM Total": viagem.kmTotal,
        "Litros": viagem.totalLitros,
        "Custo Combustível": viagem.custoCombustivel,
        "Outras Despesas": viagem.custoDespesas,
        "Custo Total": viagem.custoTotalViagem,
        "Custo/KM": viagem.custoPorKm,
        "Data": new Date(viagem.dataFim).toLocaleDateString('pt-BR')
      }
    ]
    const worksheet = XLSX.utils.json_to_sheet(dados)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Viagem")
    XLSX.writeFile(workbook, `Relatorio_Viagem_${viagem.placa}.xlsx`)
  } catch (error) {
    console.error("Erro ao exportar Viagem para Excel:", error)
  }
}

export const generateViagemPDF = (viagem: any, settings?: any) => {
  if (!viagem) return
  const companyName = settings?.companyName || "LIDER REFRIGERAÇÃO"
  const doc = new jsPDF()

  // Header Colors
  doc.setFillColor(29, 78, 216)
  doc.rect(0, 0, 210, 40, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(companyName.toUpperCase(), 15, 20)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("RELATÓRIO DE VIAGEM (GEVI)", 15, 30)

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text(`PLACA: ${viagem.placa}`, 195, 25, { align: 'right' })

  // Body
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("DADOS DA ROTA", 15, 55)
  doc.setDrawColor(220, 220, 220)
  doc.line(15, 58, 195, 58)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Origem: ${viagem.origem}`, 15, 65)
  doc.text(`Destino: ${viagem.destino}`, 15, 72)
  doc.text(`KM Inicial: ${viagem.kmInicial}`, 110, 65)
  doc.text(`KM Final: ${viagem.kmFinal}`, 110, 72)
  doc.text(`Distância Total: ${viagem.kmTotal} km`, 15, 79)
  doc.text(`Data Encerramento: ${new Date(viagem.dataFim).toLocaleString('pt-BR')}`, 110, 79)

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("PERFORMANCE E CUSTOS", 15, 95)
  doc.line(15, 98, 195, 98)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Total Abastecido: ${viagem.totalLitros.toFixed(1)} L`, 15, 105)
  doc.text(`Custo Combustível: R$ ${viagem.custoCombustivel.toFixed(2)}`, 110, 105)
  doc.text(`Média de Consumo: ${viagem.mediaKmPorLitro.toFixed(2)} km/L`, 15, 112)
  doc.text(`Outras Despesas: R$ ${viagem.custoDespesas.toFixed(2)}`, 110, 112)
  
  doc.setFont("helvetica", "bold")
  doc.text(`CUSTO TOTAL DA VIAGEM: R$ ${viagem.custoTotalViagem.toFixed(2)}`, 15, 125)
  doc.text(`CUSTO POR KM: R$ ${viagem.custoPorKm.toFixed(2)}/km`, 110, 125)

  // Categorias se existirem
  if (viagem.despesasPorCategoria && Object.keys(viagem.despesasPorCategoria).length > 0) {
    doc.setFontSize(12)
    doc.text("RESUMO DE DESPESAS POR CATEGORIA", 15, 140)
    doc.line(15, 143, 195, 143)

    const catData = Object.entries(viagem.despesasPorCategoria).map(([cat, valor]) => [cat, `R$ ${(valor as number).toFixed(2)}`])
    
    autoTable(doc, {
      startY: 148,
      head: [["Categoria", "Valor Gasto"]],
      body: catData,
      headStyles: { fillColor: [26, 54, 93], fontSize: 10 },
      theme: "striped",
    })
  }

  doc.save(`Relatorio_Viagem_${viagem.placa}.pdf`)
}

// ---- EXPORTAÇÃO DE TABELAS GENÉRICAS ----

export const exportTableToCSV = (data: any[], fileName: string) => {
  if (!data || !data.length) return
  
  const headers = Object.keys(data[0])
  const csvRows = []
  
  csvRows.push(headers.join(','))
  
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + (row[header] ?? '')).replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }
  
  const csvString = csvRows.join('\n')
  const blob = new Blob(["\ufeff" + csvString], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${fileName}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportTableToExcel = (data: any[], fileName: string) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados")
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  } catch (error) {
    console.error("Erro ao exportar tabela para Excel:", error)
  }
}

export const exportTableToPDF = (data: any[], fileName: string, title: string = "Relatório", settings?: any) => {
  if (!data || !data.length) return
  
  const companyName = settings?.companyName || "LIDER REFRIGERAÇÃO"
  const doc = new jsPDF()

  // Header Colors
  doc.setFillColor(29, 78, 216)
  doc.rect(0, 0, 210, 30, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(companyName.toUpperCase(), 15, 15)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(title, 15, 23)
  
  doc.setFontSize(9)
  doc.text(`Data da Exportação: ${new Date().toLocaleString('pt-BR')}`, 195, 20, { align: 'right' })

  const headers = Object.keys(data[0])
  const bodyData = data.map(row => headers.map(h => row[h]))

  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: bodyData,
    headStyles: { fillColor: [26, 54, 93], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    theme: "striped",
  })

  doc.save(`${fileName}.pdf`)
}
