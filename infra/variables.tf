# ============================================================
# variables.tf — настраиваемые параметры инфраструктуры.
# Реальные значения — в terraform.tfvars (его НЕТ в git,
# см. terraform.tfvars.example).
# ============================================================

variable "project_id" {
  description = "ID проекта Google Cloud (именно ID, напр. my-cv-project-123456)"
  type        = string
}

variable "region" {
  description = "Регион GCP. europe-west3 = Франкфурт"
  type        = string
  default     = "europe-west3"
}

variable "zone" {
  description = "Зона внутри региона"
  type        = string
  default     = "europe-west3-a"
}

variable "machine_type" {
  description = "Тип VM. Для статики nginx хватает e2-micro (самый дешёвый). e2-small — с запасом"
  type        = string
  default     = "e2-micro"
}

variable "instance_name" {
  description = "Имя виртуальной машины"
  type        = string
  default     = "cv-builder-server"
}

variable "network_tag" {
  description = "Сетевой тег, связывающий VM с firewall-правилами"
  type        = string
  default     = "cv-builder"
}

variable "ssh_user" {
  description = "Пользователь для SSH и деплоя"
  type        = string
  default     = "deploy"
}

variable "ssh_public_key_path" {
  description = "Путь к ПУБЛИЧНОМУ ssh-ключу (.pub). Приватный ключ никуда не загружается"
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
}

variable "web_root" {
  description = "Каталог на сервере, куда деплоится статика и откуда её отдаёт nginx"
  type        = string
  default     = "/var/www/cv-builder"
}

variable "credentials_file" {
  description = "Путь к JSON-ключу service account. Пусто (\"\") — если через gcloud CLI"
  type        = string
  default     = ""
}
