# ============================================================
# outputs.tf — что Terraform покажет после apply.
# ============================================================

output "server_public_ip" {
  description = "Публичный IP сервера. Нужен для SSH, браузера и GitHub Secret SERVER_IP"
  value       = google_compute_address.static_ip.address
}

output "ssh_command" {
  description = "Готовая команда подключения к серверу"
  value       = "ssh ${var.ssh_user}@${google_compute_address.static_ip.address}"
}

output "site_url" {
  description = "Адрес сайта после деплоя"
  value       = "http://${google_compute_address.static_ip.address}"
}
