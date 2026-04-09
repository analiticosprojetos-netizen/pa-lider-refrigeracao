<ServiceOrderDetails 
        order={selectedOrder} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)}
        onDownload={generateServiceOrderPDF}
        onSendEmail={(order) => showSuccess(`Enviado para ${order.email}`)}
      />
    </div>
  );
};

export default Dashboard;