# ============================================================
# main.tf — инфраструктура CV Builder в Google Cloud.
# Одна VM (Ubuntu 22.04) с nginx, отдающая статический сайт.
# Terraform читает этот файл и создаёт ресурсы сам.
# ============================================================

terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

# --- Провайдер Google ---
# Если credentials_file пустой, авторизация берётся из gcloud CLI
# (gcloud auth application-default login).
provider "google" {
  project     = var.project_id
  region      = var.region
  zone        = var.zone
  credentials = var.credentials_file != "" ? file(var.credentials_file) : null
}

# --- Статический внешний IP ---
# Чтобы адрес не менялся при перезапуске VM (иначе сломается SSH и CI/CD).
resource "google_compute_address" "static_ip" {
  name   = "${var.instance_name}-ip"
  region = var.region
}

# --- Firewall: SSH (22) ---
resource "google_compute_firewall" "allow_ssh" {
  name    = "${var.instance_name}-allow-ssh"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"] # можно сузить до своего IP
  target_tags   = [var.network_tag]
}

# --- Firewall: HTTP (80) и HTTPS (443) ---
resource "google_compute_firewall" "allow_web" {
  name    = "${var.instance_name}-allow-web"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = [var.network_tag]
}

# --- Виртуальная машина ---
resource "google_compute_instance" "server" {
  name         = var.instance_name
  machine_type = var.machine_type
  zone         = var.zone

  tags = [var.network_tag]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 10 # ГБ; для nginx + статики с запасом
      type  = "pd-standard"
    }
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = google_compute_address.static_ip.address
    }
  }

  # Публичный SSH-ключ пробрасывается в метаданные — GCP создаёт
  # пользователя var.ssh_user с этим ключом. Приватный ключ не загружается.
  metadata = {
    ssh-keys = "${var.ssh_user}:${file(var.ssh_public_key_path)}"
  }

  # Скрипт первой загрузки: ставит nginx и готовит web-root под деплой.
  metadata_startup_script = templatefile("${path.module}/startup.sh", {
    ssh_user = var.ssh_user
    web_root = var.web_root
  })

  allow_stopping_for_update = true
}
