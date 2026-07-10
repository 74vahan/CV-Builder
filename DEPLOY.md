# Деплой CV Builder на GCP + CI/CD

Схема как в других проектах: **Terraform** поднимает VM в Google Cloud (Франкфурт,
Ubuntu 22.04, nginx), **GitHub Actions** при пуше в `master` заливает статику по
SCP и перезагружает nginx.

```
push в master ──▶ GitHub Actions ──scp──▶ /var/www/cv-builder на VM ──▶ nginx reload
```

## Что уже в репозитории
- `infra/` — Terraform: static IP, firewall (22/80/443), VM + стартап-скрипт с nginx.
- `.github/workflows/deploy.yml` — автодеплой (SCP + reload).
- `infra/startup.sh` — первичная настройка сервера (ставится автоматически при создании VM).

## Предварительно (один раз, делаете вы)
1. **SSH-ключ** (если ещё нет). Приватный — только у вас, публичный уйдёт в VM:
   ```
   ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519
   ```
2. **Авторизация в GCP** для Terraform:
   ```
   gcloud auth application-default login
   ```
3. **GitHub-репозиторий** для этого проекта (пустой) — например `74vahan/cv-builder`,
   и привязать его как remote (см. предыдущий шаг проекта про push).

## Шаг 1. Поднять VM (Terraform)
```
cd infra
cp terraform.tfvars.example terraform.tfvars   # впишите project_id
terraform init
terraform plan       # посмотреть, что создастся
terraform apply      # создаёт реальные ресурсы в GCP (стоит денег ~ e2-micro)
```
После `apply` запомните вывод `server_public_ip`.

> Первый запуск VM ставит nginx (1–2 минуты). До первого деплоя по IP видна
> заглушка «Waiting for first deploy…».

## Шаг 2. Секреты GitHub Actions
Settings → Secrets and variables → Actions → New repository secret:

| Secret | Значение |
|---|---|
| `SERVER_IP` | `server_public_ip` из terraform output |
| `SSH_USER` | `deploy` (или ваш `ssh_user`) |
| `SSH_PRIVATE_KEY` | содержимое **приватного** ключа `~/.ssh/id_ed25519` целиком |

## Шаг 3. Задеплоить
Просто запушьте в `master` — workflow запустится сам. Либо вручную:
Actions → «Deploy to GCP» → Run workflow. Через ~30 сек сайт будет по
`http://<SERVER_IP>`.

## Обновление / снос
- Изменить тип VM, порты и т.п. — правьте `infra/*.tf`, затем `terraform apply`.
- Полностью удалить всю инфраструктуру (чтобы не платить):
  ```
  cd infra && terraform destroy
  ```

## Безопасность
- `terraform.tfvars`, `*.tfstate`, `*.pem`, ключи — в `.gitignore`, в git не попадают.
- Приватный SSH-ключ хранится только в GitHub Secret и у вас локально.
- Для продакшена стоит сузить `source_ranges` SSH-правила с `0.0.0.0/0` до своего IP
  и добавить HTTPS (например, certbot/Let's Encrypt) — порт 443 уже открыт.

## Проверено локально
- `terraform fmt`, `terraform init`, `terraform validate` — успешно.
- Рендер `startup.sh` через `templatefile` проверен (пути и nginx-конфиг корректны).
- Реальный `apply`/деплой не запускались — это ваши действия (нужны доступ к GCP,
  оплата ресурсов и созданный GitHub-репозиторий с секретами).
