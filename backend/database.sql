CREATE DATABASE IF NOT EXISTS lider_refrigeracao;
USE lider_refrigeracao;

-- Usuários
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'USER',
  permissions JSON,
  financeSubPerms JSON,
  trechoSubPerms JSON,
  avatarUrl LONGTEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cargos
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT IGNORE INTO roles (name) VALUES ('ADMIN'), ('CEO'), ('DIRETOR'), ('GERENTE'), ('ANALISTA'), ('MOTORISTA');


-- Inserir usuário admin padrão (senha: 1234 -> hash bcrypt)
-- O hash abaixo é '$2b$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm' que é '1234' no bcrypt
INSERT IGNORE INTO users (id, username, email, password, role, permissions) 
VALUES ('1', 'admin', 'admin@lider.com', '$2b$10$3QXd4FXTSVBhvasWv4RoGeIfLxruoajoxD290pBPSwkVj77zTF/Hi', 'ADMIN', '{"estoque":{"view":true,"edit":true,"delete":true},"orcamentos":{"view":true,"edit":true,"delete":true},"clientes":{"view":true,"edit":true,"delete":true},"historico":{"view":true,"edit":true,"delete":true},"financeiro":{"view":true,"edit":true,"delete":true},"config":{"view":true,"edit":true,"delete":true},"trecho":{"view":true,"edit":true,"delete":true}}');

-- Clientes
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  document VARCHAR(50),
  phone VARCHAR(50),
  email VARCHAR(100),
  plate VARCHAR(50),
  vehicleModel VARCHAR(100),
  equipBrand VARCHAR(100),
  equipModel VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financeiro (Transações)
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('receita', 'despesa') NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  category VARCHAR(100),
  orderId VARCHAR(36)
);

-- Estoque (Peças)
CREATE TABLE IF NOT EXISTS inventory_parts (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 0
);

-- Movimentações de Estoque
CREATE TABLE IF NOT EXISTS inventory_movements (
  id VARCHAR(36) PRIMARY KEY,
  partName VARCHAR(255) NOT NULL,
  type ENUM('entrada', 'saida', 'correcao') NOT NULL,
  quantity INT NOT NULL,
  user VARCHAR(100),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  note TEXT
);

-- Ordens de Serviço
CREATE TABLE IF NOT EXISTS service_orders (
  id VARCHAR(36) PRIMARY KEY,
  date VARCHAR(100),
  clientName VARCHAR(255),
  document VARCHAR(50),
  phone VARCHAR(50),
  email VARCHAR(100),
  plate VARCHAR(50),
  vehicleModel VARCHAR(100),
  equipBrand VARCHAR(100),
  equipModel VARCHAR(100),
  serviceType VARCHAR(100),
  problem TEXT,
  diagnosis TEXT,
  startTime VARCHAR(50),
  endTime VARCHAR(50),
  travelValue DECIMAL(10, 2) DEFAULT 0,
  discountPercent DECIMAL(5, 2) DEFAULT 0,
  discountValue DECIMAL(10, 2) DEFAULT 0,
  warranty VARCHAR(100),
  technician VARCHAR(100),
  observations TEXT,
  status ENUM('Pendente', 'Executado', 'Cancelado') DEFAULT 'Pendente',
  services JSON,
  parts JSON,
  partsValue DECIMAL(10, 2) DEFAULT 0,
  servicesValue DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  executedAt TIMESTAMP NULL,
  cancelledAt TIMESTAMP NULL,
  origin VARCHAR(50),
  report TEXT
);

-- Frota
CREATE TABLE IF NOT EXISTS fleet (
  id VARCHAR(36) PRIMARY KEY,
  placa VARCHAR(20) NOT NULL,
  modelo VARCHAR(100),
  consumo DECIMAL(10, 2) DEFAULT 0
);

-- Auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  module VARCHAR(100) NOT NULL,
  details TEXT
);

-- Viagens (Ativas e Finalizadas)
CREATE TABLE IF NOT EXISTS trips (
  id VARCHAR(36) PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'ativa', -- 'ativa', 'finalizada'
  data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_fim TIMESTAMP NULL,
  origem VARCHAR(255),
  destino VARCHAR(255),
  placa VARCHAR(20),
  km_inicial INT,
  km_final INT,
  distancia DECIMAL(10, 2),
  eventos JSON,
  user_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simulações de Frete
CREATE TABLE IF NOT EXISTS simulations (
  id VARCHAR(36) PRIMARY KEY,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_name VARCHAR(100),
  origem VARCHAR(255),

  destino VARCHAR(255),
  distancia_km DECIMAL(10, 2),
  duracao_min INT,
  consumo DECIMAL(10, 2),
  preco_diesel DECIMAL(10, 2),
  custo_combustivel DECIMAL(10, 2),
  total_pedagios DECIMAL(10, 2),
  valor_frete DECIMAL(10, 2),
  custo_total DECIMAL(10, 2),
  lucro DECIMAL(10, 2),
  margem DECIMAL(10, 5),
  custo_por_km DECIMAL(10, 2)
);

-- Configurações do Site (Expandida)
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  -- Site Content
  banners LONGTEXT,
  specialties LONGTEXT,
  carouselDelay INT DEFAULT 6,
  goalType VARCHAR(50) DEFAULT 'valor',
  goalTarget DECIMAL(15, 2) DEFAULT 5000,
  -- Institutional Info
  companyName VARCHAR(255) DEFAULT 'LIDER REFRIGERAÇÃO',
  whatsapp VARCHAR(50) DEFAULT '(34) 9941 - 0863 ',
  email VARCHAR(100) DEFAULT 'emailpostallucio@gmail.com',
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  address VARCHAR(255),
  googleMapsUrl TEXT,
  latitude VARCHAR(50),
  longitude VARCHAR(50),
  cnpj VARCHAR(50),
  logo LONGTEXT,
  aboutYears VARCHAR(20) DEFAULT '15+',
  aboutTitle VARCHAR(255),
  aboutDescription TEXT,
  aboutImage LONGTEXT,
  loginBackground LONGTEXT
);

-- Inserir configuração padrão se não existir
INSERT IGNORE INTO site_settings (id, banners, specialties) VALUES (1, '[]', '[]');

