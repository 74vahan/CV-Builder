#!/usr/bin/env bash
# ============================================================
# startup.sh — выполняется один раз при первой загрузке VM.
# Рендерится Terraform через templatefile(): подставляются
# переменные ssh_user и web_root. Внимание: templatefile парсит весь
# файл, поэтому фигурная интерполяция зарезервирована за Terraform
# (в bash её тут не используем; nginx-переменная $uri без фигурных скобок).
# ============================================================
set -euxo pipefail

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx rsync

# --- Web-root под статику ---
mkdir -p ${web_root}

# Пользователь деплоя (GCP обычно уже создал его из ssh-keys метаданных)
id -u ${ssh_user} >/dev/null 2>&1 || useradd -m -s /bin/bash ${ssh_user}
chown -R ${ssh_user}:${ssh_user} ${web_root}

# Заглушка до первого деплоя
cat > ${web_root}/index.html <<'HTML'
<!doctype html><meta charset="utf-8"><title>CV Builder</title>
<p style="font-family:sans-serif">CV Builder server is up. Waiting for first deploy…</p>
HTML
chown ${ssh_user}:${ssh_user} ${web_root}/index.html

# --- Конфиг сайта nginx ---
cat > /etc/nginx/sites-available/cv-builder <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root WEB_ROOT_PLACEHOLDER;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Долгий кэш для ассетов, html не кэшируем
    location ~* \.(?:css|js|png|jpg|jpeg|gif|svg|ico|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
NGINX
sed -i "s#WEB_ROOT_PLACEHOLDER#${web_root}#" /etc/nginx/sites-available/cv-builder

ln -sf /etc/nginx/sites-available/cv-builder /etc/nginx/sites-enabled/cv-builder
rm -f /etc/nginx/sites-enabled/default

# --- Разрешаем deploy-пользователю перезагружать nginx без пароля (для CI/CD) ---
echo "${ssh_user} ALL=(root) NOPASSWD: /bin/systemctl reload nginx, /bin/systemctl restart nginx" \
  > /etc/sudoers.d/cv-builder-nginx
chmod 440 /etc/sudoers.d/cv-builder-nginx

nginx -t
systemctl enable nginx
systemctl restart nginx
