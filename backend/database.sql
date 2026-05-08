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

-- Configurações do Site
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  banners LONGTEXT,
  specialties LONGTEXT,
  carouselDelay INT DEFAULT 6,
  goalType VARCHAR(50) DEFAULT 'valor',
  goalTarget DECIMAL(15, 2) DEFAULT 5000
);

-- Inserir configuração padrão
INSERT IGNORE INTO site_settings (id, banners, specialties) VALUES (1, '[]', '[]');
