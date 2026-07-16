# GYD Grup — Dokümantasyon

> **GYD GRUP GAYRİMENKUL PROJE VE DANIŞMANLIK LTD. ŞTİ.** — Ankara genelinde **imarlı arsa** alım-satımı, proje geliştirme ve yatırım danışmanlığı.

| Doküman | İçerik |
|---|---|
| [SETUP.md](SETUP.md) | Geliştirici onboarding — kurulum, env, ilk çalıştırma |
| [DEPLOY.md](DEPLOY.md) | Production'a çıkma — VPS, systemd, nginx, SSL |
| [META-SETUP.md](META-SETUP.md) | WhatsApp / Messenger / Instagram bağlama |
| [RAG.md](RAG.md) | RAG pipeline, embedding, retrieval |
| [CRM.md](CRM.md) | Mini CRM kullanım kılavuzu (kanban, kişi kartı, lead) |
| [STAGING.md](STAGING.md) | Staging build & `/gyd-staging/` test ortamı |
| [HEMEN-TEST.md](HEMEN-TEST.md) | 1 saatlik canlı demo (tarihsel, güncel değil) |

## Hızlı bağlantılar

| Servis | URL |
|---|---|
| Site (prod) | https://www.gydgrup.com.tr |
| Admin Panel | https://www.gydgrup.com.tr/admin |
| PocketBase Admin | http://127.0.0.1:8090/_/ (VPS'te internal) |
| PocketBase REST | http://127.0.0.1:8090/api/ |
| API (chat, RAG, webhook) | http://127.0.0.1:8091 (VPS'te internal) |

## Şirket (tek kaynak)

Tüm UI ve dökümanlarda geçen şirket bilgisi `src/lib/constants.ts → COMPANY` üzerinden gelir. Hard-code etmeyin.

| Alan | Değer |
|---|---|
| Ünvan | GYD GRUP GAYRİMENKUL PROJE VE DANIŞMANLIK LTD. ŞTİ. |
| Kısa | GYD Grup |
| Telefon / WhatsApp | +90 532 489 25 67 |
| E-posta | info@gydgrup.com.tr |
| Domain | gydgrup.com.tr (canonical: **www**) |
| Kapsam | Ankara geneli · sadece imarlı arsa |
| Meta App | `gydgrup` (App ID `1721626692079061`) |
