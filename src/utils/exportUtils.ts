import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

export const generateServiceOrderPDF = (order: any) => {
  if (!order) return;

  try {
    const doc = new jsPDF();
    const bluePrimary = [26, 54, 93];

    // Cabeçalho
    doc.setFillColor(26, 54, 93);
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("LIDER REFRIGERAÇÃO", 15, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Manutenção Preventiva e Corretiva de Baús Frigoríficos", 15, 28);
    
    doc.setFontSize(16);
    doc.text(`ORÇAMENTO #${String(order.id || '---').toUpperCase()}`, 140, 25);

    // Dados do Cliente
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO CLIENTE", 15, 50);
    doc.line(15, 52, 195, 52);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Cliente: ${String(order.clientName || 'N/A')}`, 15, 60);
    doc.text(`CPF/CNPJ: ${String(order.document || 'N/A')}`, 15, 65);
    doc.text(`Telefone: ${String(order.phone || 'N/A')}`, 110, 60);
    doc.text(`Email: ${String(order.email || 'N/A')}`, 110, 65);

    // Dados do Veículo
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO VEÍCULO E EQUIPAMENTO", 15, 80);
    doc.line(15, 82, 195, 82);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Placa: ${String(order.plate || 'N/A')}`, 15, 90);
    doc.text(`Modelo Veículo: ${String(order.vehicleModel || 'N/A')}`, 15, 95);
    doc.text(`Marca Equip.: ${String(order.equipBrand || 'N/A')}`, 110, 90);
    doc.text(`Modelo Equip.: ${String(order.equipModel || 'N/A')}`, 110, 95);

    // Diagnóstico
    doc.setFont("helvetica", "bold");
    doc.text("DIAGNÓSTICO TÉCNICO", 15, 110);
    doc.line(15, 112, 195, 112);
    doc.setFont("helvetica", "normal");
    
    const prob = doc.splitTextToSize(`Problema: ${String(order.problem || 'Não informado')}`, 180);
    doc.text(prob, 15, 120);
    
    const diag = doc.splitTextToSize(`Diagnóstico: ${String(order.diagnosis || 'Não informado')}`, 180);
    doc.text(diag, 15, 130 + (prob.length * 2));

    // Tabela
    const services = order.services || [];
    const parts = order.parts || [];
    const tableData = [
      ...services.map((s: any) => [String(s.description || 'Serviço'), "Serviço", "1", `R$ ${Number(s.value || 0).toFixed(2)}`, `R$ ${Number(s.value || 0).toFixed(2)}`]),
      ...parts.map((p: any) => [String(p.description || 'Peça'), "Peça", String(p.qty || 1), `R$ ${Number(p.value || 0).toFixed(2)}`, `R$ ${Number((p.qty || 1) * (p.value || 0)).toFixed(2)}`]),
    ];

    autoTable(doc, {
      startY: 150,
      head: [["Descrição", "Tipo", "Qtd", "Unitário", "Subtotal"]],
      body: tableData,
      headStyles: { fillColor: [26, 54, 93] },
      theme: "striped",
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Totais
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: R$ ${Number(order.total || 0).toFixed(2)}`, 140, finalY);

    // Rodapé
    doc.setFontSize(8);
    doc.text(`Garantia: ${String(order.warranty || '90 dias')}`, 15, finalY + 20);
    doc.text(`Técnico: ${String(order.technician || 'N/A')}`, 15, finalY + 25);

    doc.save(`Orcamento_${String(order.id || 'lider')}.pdf`);
  } catch (error) {
    console.error("Erro PDF:", error);
    alert("Erro ao gerar PDF. Tente novamente.");
  }
};