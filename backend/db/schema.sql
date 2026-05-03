-- =====================================================================
--  LION MODAS — Schema do banco de dados (MySQL 8.x)
--  Charset: utf8mb4 (suporta emoji e caracteres internacionais)
--  Collation: utf8mb4_unicode_ci (comparação case/accent insensitive)
-- =====================================================================

DROP DATABASE IF EXISTS lion_modas;
CREATE DATABASE lion_modas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lion_modas;

-- ---------------------------------------------------------------------
-- 1. brands  — marcas que vendemos
-- ---------------------------------------------------------------------
CREATE TABLE brands (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(80)  NOT NULL,
  name        VARCHAR(120) NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_brands_slug (slug)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. categories  — tipos de produto (camisetas, moletons, etc)
-- ---------------------------------------------------------------------
CREATE TABLE categories (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(80)  NOT NULL,
  name        VARCHAR(120) NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categories_slug (slug)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. colors  — paleta de cores normalizada (com hex pra renderizar swatch)
-- ---------------------------------------------------------------------
CREATE TABLE colors (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(40) NOT NULL,
  name        VARCHAR(60) NOT NULL,
  hex         CHAR(7)     NOT NULL,                  -- ex: #0a0a0a
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_colors_slug (slug)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. sizes  — catálogo de tamanhos (PP..XGG, 38..44, ÚNICO)
--    kind separa "letra" (roupa) de "número" (calçado) e "único" (acessório)
-- ---------------------------------------------------------------------
CREATE TABLE sizes (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  label       VARCHAR(10) NOT NULL,                  -- ex: P, M, 42, ÚNICO
  kind        ENUM('clothing','shoe','unique') NOT NULL DEFAULT 'clothing',
  sort_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0,  -- pra ordenar PP<P<M<G<GG
  PRIMARY KEY (id),
  UNIQUE KEY uk_sizes_label_kind (label, kind)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. products  — produto (cabeçalho, info comercial)
--    O estoque NÃO fica aqui — fica em product_variants.
-- ---------------------------------------------------------------------
CREATE TABLE products (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug               VARCHAR(160) NOT NULL,
  name               VARCHAR(200) NOT NULL,
  description        TEXT NULL,
  brand_id           BIGINT UNSIGNED NOT NULL,
  category_id        BIGINT UNSIGNED NOT NULL,
  gender             ENUM('masculino','feminino','unissex') NOT NULL DEFAULT 'unissex',

  -- Preço base. Pode ser sobrescrito por variante (ex: tamanho XGG mais caro)
  price              DECIMAL(10,2) NOT NULL,
  old_price          DECIMAL(10,2) NULL,             -- pra mostrar "de R$ X por R$ Y"
  installments       TINYINT UNSIGNED NOT NULL DEFAULT 1,

  -- Mídia principal (pra cards)
  primary_image_url  VARCHAR(500) NULL,
  hover_image_url    VARCHAR(500) NULL,

  -- Métricas do produto (cache; reviews podem virar tabela depois)
  rating             DECIMAL(3,2) NULL,              -- 0.00 a 5.00
  reviews_count      INT UNSIGNED NOT NULL DEFAULT 0,

  -- Flags de catálogo
  is_new             BOOLEAN NOT NULL DEFAULT FALSE,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,  -- desativar = some da loja

  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_products_slug (slug),
  KEY idx_products_brand     (brand_id),
  KEY idx_products_category  (category_id),
  KEY idx_products_active    (is_active),
  CONSTRAINT fk_products_brand    FOREIGN KEY (brand_id)    REFERENCES brands(id)     ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. product_images  — galeria adicional (opcional)
-- ---------------------------------------------------------------------
CREATE TABLE product_images (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id  BIGINT UNSIGNED NOT NULL,
  url         VARCHAR(500) NOT NULL,
  position    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_pimages_product (product_id),
  CONSTRAINT fk_pimages_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. product_variants  — combinações cor + tamanho com ESTOQUE.
--    Cada linha vira um SKU vendável. Se um produto tem 3 cores e 5
--    tamanhos = até 15 variantes (algumas podem não existir).
-- ---------------------------------------------------------------------
CREATE TABLE product_variants (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id      BIGINT UNSIGNED NOT NULL,
  color_id        BIGINT UNSIGNED NULL,              -- pode ser NULL (produto sem cor — ex. cinto)
  size_id         BIGINT UNSIGNED NULL,              -- pode ser NULL (produto sem tamanho)
  sku             VARCHAR(60) NOT NULL,
  stock           INT NOT NULL DEFAULT 0,            -- pode ser negativo? não. pode bloquear via app.
  price_override  DECIMAL(10,2) NULL,                -- preço específico desta variante (NULL = usa products.price)
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_variants_sku (sku),
  UNIQUE KEY uk_variants_combo (product_id, color_id, size_id),  -- não repetir mesma combinação
  KEY idx_variants_product (product_id),
  KEY idx_variants_color   (color_id),
  KEY idx_variants_size    (size_id),
  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_variants_color   FOREIGN KEY (color_id)   REFERENCES colors(id)   ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_variants_size    FOREIGN KEY (size_id)    REFERENCES sizes(id)    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. customers  — clientes (criado quando faz primeiro pedido)
-- ---------------------------------------------------------------------
CREATE TABLE customers (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(160) NOT NULL,
  email       VARCHAR(160) NULL,
  phone       VARCHAR(20)  NOT NULL,                 -- WhatsApp é obrigatório
  cpf         VARCHAR(14)  NULL,                     -- guardamos formatado: 000.000.000-00
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_customers_email (email),
  KEY idx_customers_phone (phone)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. addresses  — endereços de entrega (cliente pode ter vários)
-- ---------------------------------------------------------------------
CREATE TABLE addresses (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id   BIGINT UNSIGNED NOT NULL,
  cep           VARCHAR(9)   NOT NULL,                -- 00000-000
  street        VARCHAR(200) NOT NULL,
  number        VARCHAR(20)  NOT NULL,
  complement    VARCHAR(120) NULL,
  neighborhood  VARCHAR(120) NOT NULL,
  city          VARCHAR(120) NOT NULL,
  uf            CHAR(2)      NOT NULL,
  is_default    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_addresses_customer (customer_id),
  CONSTRAINT fk_addresses_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. orders  — pedido (cabeçalho)
--     code = identificador humano (LION-2026-0001) gerado pela aplicação.
-- ---------------------------------------------------------------------
CREATE TABLE orders (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code                VARCHAR(20) NOT NULL,
  customer_id         BIGINT UNSIGNED NOT NULL,
  address_id          BIGINT UNSIGNED NULL,                  -- snapshot guardado em order_address* abaixo
  status              ENUM('pending','paid','shipping','delivered','canceled') NOT NULL DEFAULT 'pending',
  payment_method      ENUM('pix','credit','boleto') NOT NULL,

  subtotal            DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping            DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount            DECIMAL(10,2) NOT NULL DEFAULT 0,
  total               DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- snapshot do endereço no momento do pedido (caso o cliente apague depois)
  ship_cep            VARCHAR(9)   NULL,
  ship_street         VARCHAR(200) NULL,
  ship_number         VARCHAR(20)  NULL,
  ship_complement     VARCHAR(120) NULL,
  ship_neighborhood   VARCHAR(120) NULL,
  ship_city           VARCHAR(120) NULL,
  ship_uf             CHAR(2)      NULL,

  notes               VARCHAR(500) NULL,
  whatsapp_sent_at    TIMESTAMP    NULL,                     -- quando enviou pro WhatsApp
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_orders_code (code),
  KEY idx_orders_customer (customer_id),
  KEY idx_orders_status   (status),
  KEY idx_orders_created  (created_at),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_orders_address  FOREIGN KEY (address_id)  REFERENCES addresses(id) ON DELETE SET NULL  ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. order_items  — linhas do pedido (snapshot fiel no momento da venda)
-- ---------------------------------------------------------------------
CREATE TABLE order_items (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id            BIGINT UNSIGNED NOT NULL,
  product_variant_id  BIGINT UNSIGNED NULL,                  -- pode virar NULL se variante for apagada
  product_name        VARCHAR(200)  NOT NULL,                -- snapshot
  color_name          VARCHAR(60)   NULL,
  size_label          VARCHAR(10)   NULL,
  unit_price          DECIMAL(10,2) NOT NULL,                -- snapshot
  quantity            INT UNSIGNED  NOT NULL DEFAULT 1,
  line_total          DECIMAL(10,2) NOT NULL,                -- unit_price * quantity
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_oitems_order   (order_id),
  KEY idx_oitems_variant (product_variant_id),
  CONSTRAINT fk_oitems_order   FOREIGN KEY (order_id)           REFERENCES orders(id)            ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT fk_oitems_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)  ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. admin_users  — usuários do painel (futuro)
-- ---------------------------------------------------------------------
CREATE TABLE admin_users (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(160) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,                       -- bcrypt
  role           ENUM('super','manager') NOT NULL DEFAULT 'manager',
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  last_login_at  TIMESTAMP    NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_admin_users_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 13. coupons  — cupons de desconto (opcional, deixei pronto pra usar depois)
-- ---------------------------------------------------------------------
CREATE TABLE coupons (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code          VARCHAR(40)  NOT NULL,
  kind          ENUM('percent','fixed') NOT NULL,             -- 10% ou R$ 30 fixo
  amount        DECIMAL(10,2) NOT NULL,
  min_subtotal  DECIMAL(10,2) NOT NULL DEFAULT 0,             -- só vale se subtotal >= X
  max_uses      INT UNSIGNED  NULL,                           -- NULL = ilimitado
  used_count    INT UNSIGNED  NOT NULL DEFAULT 0,
  valid_until   DATE NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_coupons_code (code)
) ENGINE=InnoDB;
