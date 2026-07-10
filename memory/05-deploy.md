# 05. Деплой и CI/CD

Полный runbook — в `DEPLOY.md` (корень проекта). Здесь — суть для памяти.

## Схема
Terraform поднимает VM в GCP → GitHub Actions при пуше в `master` заливает
статику по SCP в web-root и перезагружает nginx.
```
push master ─▶ Actions ─scp─▶ /var/www/cv-builder ─▶ nginx reload
```

## Инфраструктура (`infra/`, Terraform)
- Сделано по образцу `../001/infra` (VIBEDOOM): провайдер google (~>6.0), auth
  через gcloud CLI (`credentials_file=""`).
- Ресурсы: `google_compute_address` (static IP), два firewall (22; 80/443,
  target_tags = `cv-builder`), `google_compute_instance` (Ubuntu 22.04, e2-micro,
  диск 10 ГБ pd-standard).
- `metadata.ssh-keys` пробрасывает публичный ключ → GCP создаёт пользователя
  `deploy`. Приватный ключ никуда не грузится.
- `metadata_startup_script = templatefile("startup.sh", {ssh_user, web_root})`.
- Дефолты: region europe-west3 (Франкфурт), zone -a, instance `cv-builder-server`,
  web_root `/var/www/cv-builder`.

## startup.sh (первая загрузка VM)
Ставит nginx+rsync, создаёт web-root и отдаёт его пользователю `deploy` (чтобы
SCP писал без sudo), кладёт заглушку, пишет nginx site-config (default_server,
try_files, кэш ассетов), включает свой сайт и удаляет дефолтный, добавляет
sudoers-правило `deploy NOPASSWD: systemctl reload/restart nginx`.
- ВАЖНО: `templatefile` парсит ВЕСЬ файл. Любые `${...}`/`$${...}` вне
  ssh_user/web_root ломают рендер (обжёгся на этом в комментарии). nginx-переменные
  писать без фигурных скобок (`$uri`). Плейсхолдер web-root в heredoc подставляется
  через `sed`, а не интерполяцией, чтобы не разворачивать `$uri` в bash.

## CI/CD (`.github/workflows/deploy.yml`)
- Триггер: push в `master`/`main` + ручной `workflow_dispatch`. `concurrency` не
  даёт гонки деплоев.
- Деплой ПУШЕМ (не сервер тянет git): `appleboy/scp-action` заливает
  `index.html,css,js,i18n` в web-root, затем `appleboy/ssh-action` делает
  `sudo systemctl reload nginx`. Репозиторию не нужно быть публичным, git на
  сервере не требуется.
- Секреты: `SERVER_IP`, `SSH_USER`, `SSH_PRIVATE_KEY`.

## Статус
Конфиги проверены локально (fmt/init/validate + рендер шаблона). Реальный
`terraform apply` и деплой НЕ выполнялись — нужны доступ к GCP, оплата и созданный
GitHub-репозиторий с секретами. См. [[project-cv-builder]].
