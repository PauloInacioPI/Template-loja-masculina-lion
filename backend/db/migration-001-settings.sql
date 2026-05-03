-- =====================================================================
--  Migration 001 — site_settings + newsletter_subscribers
--  Idempotente: pode rodar várias vezes sem quebrar.
-- =====================================================================
USE lion_modas;

CREATE TABLE IF NOT EXISTS site_settings (
  `key`       VARCHAR(80) NOT NULL,
  `value`     JSON NOT NULL,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email       VARCHAR(160) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_news_email (email)
) ENGINE=InnoDB;
