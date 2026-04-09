import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orçamentos");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const generateServiceOrderPDF = (order: any) => {
  const doc = new jsPDF();
  const bluePrimary = [26, 54, 93]; // #1a365d

  // Cabeçalho
  doc.setFillColor(bluePrimary[0], bluePrimary[1], bluePrimary[2]);
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("LIDER REFRIGERAÇÃO", 15, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Manutenção Preventiva e Corretiva de Baús Frigoríficos", 15, 28);
  
  doc.setFontSize(16);
  doc.text(`ORÇAMENTO #${order.id.toUpperCase()}`, 140, 25);

  // Dados do Cliente
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO CLIENTE", 15, 50);
  doc.line(15, 52, 195, 52);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Cliente: ${order.clientName}`, 15, 60);
  doc.text(`CPF/CNPJ: ${order.document}`, 15, 65);
  doc.text(`Telefone: ${order.phone}`, 110, 60);
  doc.text(`Email: ${order.email}`, 110, 65);

  // Dados do Veículo/Equipamento
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO VEÍCULO E EQUIPAMENTO", 15, 80);
  doc.line(15, 82, 195, 82);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Placa: ${order.plate}`, 15, 90);
  doc.text(`Modelo Veículo: ${order.vehicleModel}`, 15, 95);
  doc.text(`Tipo Baú: ${order.boxType}`, 15, 100);
  doc.text(`Marca Equip.: ${order.equipBrand}`, 110, 90);
  doc.text(`Modelo Equip.: ${order.equipModel}`, 110, 95);
  doc.text(`Tipo Serviço: ${order.serviceType}`, 110, 100);

  // Diagnóstico
  doc.setFont("helvetica", "bold");
  doc.text("DIAGNÓSTICO TÉCNICO", 15, 115);
  doc.line(15, 117, 195, 117);
  doc.setFont("helvetica", "normal");
  doc.text(`Problema: ${order.problem}`, 15, 125, { maxWidth: 180 });
  doc.text(`Diagnóstico: ${order.diagnosis}`, 15, 135, { maxWidth: 180 });

  // Tabela de Itens (Serviços e Peças)
  const tableData = [
    ...order.services.map((s: any) => [s.description, "Serviço", 1, `R$ ${s.value.toFixed(2)}`, `R$ ${s.value.toFixed(2)}`]),
    ...order.parts.map((p: any) => [p.description, "Peça", p.qty, `R$ ${p.value.toFixed(2)}`, `R$ ${(p.qty * p.value).toFixed(2)}`]),
  ];

  (doc as any).autoTable({
    startY: 150,
    head: [["Descrição", "Tipo", "Qtd", "Unitário", "Subtotal"]],
    body: tableData,
    headStyles: { fillColor: bluePrimary },
    theme: "striped",
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Totais
  doc.setFont("helvetica", "bold");
  doc.text(`Mão de Obra: R$ ${order.laborValue.toFixed(2)}`, 140, finalY);
  doc.text(`Peças: R$ ${order.partsValue.toFixed(2)}`, 140, finalY + 7);
  doc.text(`Deslocamento: R$ ${order.travelValue.toFixed(2)}`, 140, finalY + 14);
  
  doc.setFillColor(bluePrimary[0], bluePrimary[1], bluePrimary[2]);
  doc.rect(138, finalY + 18, 60, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(`TOTAL: R$ ${order.total.toFixed(2)}`, 142, finalY + 25);

  // Rodapé e Assinatura
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.text(`Garantia: ${order.warranty}`, 15, finalY + 40);
  doc.text(`Técnico Responsável: ${order.technician}`, 15, finalY + 45);
  doc.text(`Observações: ${order.observations}`, 15, finalY + 50, { maxWidth: 180 });

  doc.line(60, finalY + 80, 150, finalY + 80);
  doc.text("Assinatura do Cliente", 90, finalY + 85);

  doc.save(`Orcamento_${order.id}.pdf`);
};