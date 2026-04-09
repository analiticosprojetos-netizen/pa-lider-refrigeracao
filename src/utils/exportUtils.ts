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
    const blueAccent = [59, 130, 246];

    // --- CABEÇALHO PROFISSIONAL ---
    doc.setFillColor(26, 54, 93);
    doc.rect(0, 0, 210, 45, "F");
    
    // Logo/Nome da Empresa
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("LIDER REFRIGERAÇÃO", 15, 22);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("MANUTENÇÃO PREVENTIVA E CORRETIVA EM BAÚS FRIGORÍFICOS", 15, 30);
    doc.text("ESPECIALISTAS EM THERMO KING | CARRIER | THERMO STAR", 15, 35);
    
    // Info da Empresa no Topo Direito
    doc.setFontSize(8);
    doc.text("CNPJ: 00.000.000/0001-00", 145, 20); // Placeholder para o usuário alterar
    doc.text("contato@liderefrigeracao.com.br", 145, 25);
    doc.text("(11) 99999-9999", 145, 30);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`ORÇAMENTO #${String(order.id).toUpperCase()}`, 145, 40);

    // --- DADOS DO CLIENTE ---
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

    // --- DADOS DO VEÍCULO ---
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

    // --- DIAGNÓSTICO ---
    doc.setTextColor(26, 54, 93);
    doc.setFont("helvetica", "bold");
    doc.text("DIAGNÓSTICO TÉCNICO", 15, 115);
    doc.line(15, 117, 195, 117);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    const prob = doc.splitTextToSize(`Problema: ${order.problem || 'Não informado'}`, 180);
    doc.text(prob, 15, 125);
    
    const diag = doc.splitTextToSize(`Diagnóstico: ${order.diagnosis || 'Não informado'}`, 180);
    doc.text(diag, 15, 135 + (prob.length * 2));

    // --- TABELA DE ITENS ---
    const services = order.services || [];
    const parts = order.parts || [];
    const tableData = [
      ...services.map((s: any) => [s.description, "Serviço", "1", `R$ ${s.value.toFixed(2)}`, `R$ ${s.value.toFixed(2)}`]),
      ...parts.map((p: any) => [p.description, "Peça", p.qty, `R$ ${p.value.toFixed(2)}`, `R$ ${(p.qty * p.value).toFixed(2)}`]),
    ];

    autoTable(doc, {
      startY: 155,
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

    // --- TOTAIS ---
    doc.setFillColor(245, 245, 245);
    doc.rect(130, finalY, 65, 25, "F");
    doc.setTextColor(26, 54, 93);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`TOTAL GERAL:`, 135, finalY + 15);
    doc.text(`R$ ${order.total.toFixed(2)}`, 190, finalY + 15, { align: 'right' });

    // --- RODAPÉ / GARANTIA ---
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`Garantia: ${order.warranty}`, 15, finalY + 10);
    doc.text(`Técnico Responsável: ${order.technician}`, 15, finalY + 15);
    
    if (order.observations) {
      const obs = doc.splitTextToSize(`Obs: ${order.observations}`, 110);
      doc.text(obs, 15, finalY + 25);
    }

    // --- RODAPÉ FIXO DA EMPRESA ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(26, 54, 93);
      doc.setLineWidth(0.5);
      doc.line(15, 285, 195, 285);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text("LIDER REFRIGERAÇÃO - Av. Industrial, 1000 - Setor de Transportes - São Paulo/SP", 105, 290, { align: 'center' });
    }

    doc.save(`Orcamento_Lider_${order.id}.pdf`);
  } catch (error) {
    console.error("Erro PDF:", error);
    alert("Erro ao gerar PDF profissional. Verifique os dados.");
  }
};