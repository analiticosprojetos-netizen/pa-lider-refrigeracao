import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format, parseISO } from 'date-fns';

export const exportToExcel = (data: any[], fileName: string) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orçamentos");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Erro ao exportar Excel:", error);
  }
};

export const generateServiceOrderPDF = (order: any, settings?: any) => {
  if (!order) return;

  const companyInfo = settings || JSON.parse(localStorage.getItem('lider_site_settings') || '{}');
  const companyName = companyInfo.companyName || "LIDER REFRIGERAÇÃO";
  const logo = companyInfo.logo || "";
  const cnpj = companyInfo.cnpj || "00.000.000/0001-00";
  const email = companyInfo.email || "contato@liderefrigeracao.com.br";
  const phone = companyInfo.whatsapp || "(11) 99999-9999";
  const address = companyInfo.address || "Av. Industrial, 1000 - Setor de Transportes";

  const formatDateTime = (isoString: string) => {
    if (!isoString) return 'N/A';
    try {
      return format(parseISO(isoString), 'dd/MM/yyyy');
    } catch (e) {
      return isoString;
    }
  };

  try {
    const doc = new jsPDF();
    
    doc.setFillColor(26, 54, 93);
    doc.rect(0, 0, 210, 45, "F");
    
    if (logo) {
      try {
        doc.addImage(logo, 'PNG', 15, 8, 30, 30);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(companyName.toUpperCase(), 50, 22);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("MANUTENÇÃO PREVENTIVA E CORRETIVA EM BAÚS FRIGORÍFICOS", 50, 30);
      } catch (e) {
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(companyName.toUpperCase(), 15, 22);
      }
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(companyName.toUpperCase(), 15, 22);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("MANUTENÇÃO PREVENTIVA E CORRETIVA EM BAÚS FRIGORÍFICOS", 15, 30);
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`CNPJ: ${cnpj}`, 195, 20, { align: 'right' });
    doc.text(email, 195, 25, { align: 'right' });
    doc.text(phone, 195, 30, { align: 'right' });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`ORÇAMENTO #${String(order.id).toUpperCase()}`, 195, 40, { align: 'right' });

    doc.setTextColor(26, 54, 93);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO CLIENTE", 15, 55);
    doc.setDrawColor(220, 220, 220);
    doc.line(15, 57, 195, 57);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Cliente: ${order.clientName}`, 15, 65);
    doc.text(`CPF/CNPJ: ${order.document || 'N/A'}`, 15, 70);
    doc.text(`Telefone: ${order.phone || 'N/A'}`, 110, 65);
    doc.text(`Email: ${order.email || 'N/A'}`, 110, 70);

    doc.setTextColor(26, 54, 93);
    doc.setFont("helvetica", "bold");
    doc.text("VEÍCULO E EQUIPAMENTO", 15, 85);
    doc.line(15, 87, 195, 87);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Placa: ${order.plate}`, 15, 95);
    doc.text(`Modelo Veículo: ${order.vehicleModel}`, 15, 100);
    doc.text(`Marca Equip.: ${order.equipBrand}`, 110, 95);
    doc.text(`Modelo Equip.: ${order.equipModel}`, 110, 100);

    doc.setTextColor(26, 54, 93);
    doc.setFont("helvetica", "bold");
    doc.text("CRONOGRAMA E DIAGNÓSTICO", 15, 115);
    doc.line(15, 117, 195, 117);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`Início: ${formatDateTime(order.startTime)}`, 15, 125);
    doc.text(`Fim: ${formatDateTime(order.endTime)}`, 110, 125);

    doc.setFont("helvetica", "normal");
    const prob = doc.splitTextToSize(`Problema: ${order.problem || 'Não informado'}`, 180);
    doc.text(prob, 15, 135);
    
    const diag = doc.splitTextToSize(`Diagnóstico: ${order.diagnosis || 'Não informado'}`, 180);
    doc.text(diag, 15, 145 + (prob.length * 2));

    const services = order.services || [];
    const parts = order.parts || [];
    const tableData = [
      ...services.map((s: any) => [s.description, "Serviço", "1", `R$ ${s.value.toFixed(2)}`, `R$ ${s.value.toFixed(2)}`]),
      ...parts.map((p: any) => [p.description, "Peça", p.qty, `R$ ${p.value.toFixed(2)}`, `R$ ${(p.qty * p.value).toFixed(2)}`]),
    ];

    autoTable(doc, {
      startY: 165,
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
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFillColor(245, 245, 245);
    doc.rect(130, finalY, 65, 35, "F");
    doc.setTextColor(26, 54, 93);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    const subtotal = order.subtotal || order.total + (order.discountValue || 0);
    doc.text(`Subtotal:`, 135, finalY + 10);
    doc.text(`R$ ${subtotal.toFixed(2)}`, 190, finalY + 10, { align: 'right' });
    
    if (order.discountValue > 0) {
      doc.setTextColor(200, 0, 0);
      doc.text(`Desconto (${order.discountPercent.toFixed(1)}%):`, 135, finalY + 18);
      doc.text(`- R$ ${order.discountValue.toFixed(2)}`, 190, finalY + 18, { align: 'right' });
    }

    doc.setTextColor(26, 54, 93);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`TOTAL GERAL:`, 135, finalY + 28);
    doc.text(`R$ ${order.total.toFixed(2)}`, 190, finalY + 28, { align: 'right' });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`Garantia: ${order.warranty}`, 15, finalY + 10);
    doc.text(`Técnico Responsável: ${order.technician}`, 15, finalY + 15);
    
    if (order.observations) {
      const obs = doc.splitTextToSize(`Obs: ${order.observations}`, 110);
      doc.text(obs, 15, finalY + 25);
    }

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(26, 54, 93);
      doc.setLineWidth(0.5);
      doc.line(15, 285, 195, 285);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`${companyName.toUpperCase()} - ${address}`, 105, 290, { align: 'center' });
    }

    doc.save(`Orcamento_${companyName.replace(/\s+/g, '_')}_${order.id}.pdf`);
  } catch (error) {
    console.error("Erro PDF:", error);
    alert("Erro ao gerar PDF profissional.");
  }
};