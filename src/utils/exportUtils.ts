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

const buildPDFDoc = (order: any, settings: any) => {
  const companyName = settings.companyName || "LIDER REFRIGERAÇÃO"
  const logo = settings.logo || ""
  const cnpj = settings.cnpj || "00.000.000/0001-00"
  const email = settings.email || "contato@liderefrigeracao.com.br"
  const phone = settings.whatsapp || "(11) 99999-9999"
  const address = settings.address || "Av. Industrial, 1000 - Setor de Transportes"

  const formatDateTime = (isoString: string) => {
    if (!isoString) return 'N/A'
    try {
      if (isoString.includes('/')) return isoString // Already formatted
      return format(parseISO(isoString), 'dd/MM/yyyy')
    } catch (e) {
      return isoString
    }
  }

  const doc = new jsPDF()
  
  // Header Azul
  doc.setFillColor(26, 54, 93)
  doc.rect(0, 0, 210, 45, "F")
  
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', 15, 8, 30, 30)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text(companyName.toUpperCase(), 50, 22)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text("MANUTENÇÃO PREVENTIVA E CORRETIVA EM BAÚS FRIGORÍFICOS", 50, 30)
    } catch (e) {
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont("helvetica", "bold")
      doc.text(companyName.toUpperCase(), 15, 22)
    }
  } else {
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.text(companyName.toUpperCase(), 15, 22)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text("MANUTENÇÃO PREVENTIVA E CORRETIVA EM BAÚS FRIGORÍFICOS", 15, 30)
  }
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text(`CNPJ: ${cnpj}`, 195, 20, { align: 'right' })
  doc.text(email, 195, 25, { align: 'right' })
  doc.text(phone, 195, 30, { align: 'right' })

  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(`ORÇAMENTO #${String(order.id).toUpperCase()}`, 195, 40, { align: 'right' })

  // Dados Client
  doc.setTextColor(26, 54, 93)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("DADOS DO CLIENTE", 15, 55)
  doc.setDrawColor(220, 220, 220)
  doc.line(15, 57, 195, 57)
  
  doc.setTextColor(0, 0, 0)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`Cliente: ${order.clientName}`, 15, 65)
  doc.text(`CPF/CNPJ: ${order.document || 'N/A'}`, 15, 70)
  doc.text(`Telefone: ${order.phone || 'N/A'}`, 110, 65)
  doc.text(`Email: ${order.email || 'N/A'}`, 110, 70)

  // Veículo
  doc.setTextColor(26, 54, 93)
  doc.setFont("helvetica", "bold")
  doc.text("VEÍCULO E EQUIPAMENTO", 15, 85)
  doc.line(15, 87, 195, 87)
  
  doc.setTextColor(0, 0, 0)
  doc.setFont("helvetica", "normal")
  doc.text(`Placa: ${order.plate}`, 15, 95)
  doc.text(`Modelo Veículo: ${order.vehicleModel}`, 15, 100)
  doc.text(`Marca Equip.: ${order.equipBrand || 'N/A'}`, 110, 95)
  doc.text(`Modelo Equip.: ${order.equipModel || 'N/A'}`, 110, 100)

  // Tabela de itens
  const services = order.services || []
  const parts = order.parts || []
  const tableData = [
    ...services.map((s: any) => [s.description, "Serviço", "1", `R$ ${s.value.toFixed(2)}`, `R$ ${s.value.toFixed(2)}`]),
    ...parts.map((p: any) => [p.name || p.description, "Peça", p.quantity || p.qty, `R$ ${p.value.toFixed(2)}`, `R$ ${((p.quantity || p.qty) * p.value).toFixed(2)}`]),
  ]

  autoTable(doc, {
    startY: 110,
    head: [["Descrição", "Tipo", "Qtd", "Unitário", "Subtotal"]],
    body: tableData,
    headStyles: { fillColor: [26, 54, 93], fontSize: 10, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    theme: "striped",
  })

  const finalY = (doc as any).lastAutoTable.finalY + 10

  // Totais
  doc.setFillColor(245, 245, 245)
  doc.rect(120, finalY, 75, 45, "F")
  doc.setTextColor(26, 54, 93)
  
  const discountValue = order.discountValue || 0
  const subtotal = order.total + discountValue

  doc.text(`Subtotal:`, 125, finalY + 10)
  doc.text(`R$ ${subtotal.toFixed(2)}`, 190, finalY + 10, { align: 'right' })
  
  if (discountValue > 0) {
    doc.setTextColor(200, 0, 0)
    doc.text(`Desconto:`, 125, finalY + 20)
    doc.text(`- R$ ${discountValue.toFixed(2)}`, 190, finalY + 20, { align: 'right' })
  }

  doc.setTextColor(26, 54, 93)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text(`TOTAL GERAL:`, 125, finalY + 35)
  doc.text(`R$ ${order.total.toFixed(2)}`, 190, finalY + 35, { align: 'right' })

  return doc
}

export const generateServiceOrderPDF = (order: any, settings?: any) => {
  if (!order) return
  const companyInfo = settings || JSON.parse(localStorage.getItem('lider_site_settings') || '{}')
  const doc = buildPDFDoc(order, companyInfo)
  doc.save(`Orcamento_${order.id}.pdf`)
}

export const sendToWhatsApp = (order: any, settings?: any) => {
  if (!order) return
  const phone = settings?.whatsapp?.replace(/\D/g, '') || '5511999999999'
  const text = `*ORÇAMENTO LIDER REFRIGERAÇÃO - #${order.id}*\n\nOlá ${order.clientName},\nSegue o orçamento referente ao veículo *${order.plate}*.\n\n*Total:* R$ ${order.total.toFixed(2)}\n*Status:* ${order.status}\n\nO PDF detalhado foi gerado. Caso não tenha recebido, por favor nos avise.`
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
}
