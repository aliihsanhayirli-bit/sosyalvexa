# Vexabiz Digital — Dokümantasyon

> **Vexabiz Dijital Danışmanlık ve Yazılım Ltd. Şti.** — Türkiye genelinde KOBİ ve işletmelere **Meta Business Manager kurulumu**, **kurumsal web sitesi**, **CRM** ve **yapay zeka çalışanı** geliştirme hizmetleri.

| Doküman | İçerik |
|---|---|
| [SETUP.md](SETUP.md) | Geliştirici onboarding — kurulum, env, ilk çalıştırma |
| [DEPLOY.md](DEPLOY.md) | Production'a çıkma — VPS, systemd, nginx, SSL |
| [META-SETUP.md](META-SETUP.md) | WhatsApp / Messenger / Instagram bağlama |
| [RAG.md](RAG.md) | RAG pipeline, embedding, retrieval |
| [CRM.md](CRM.md) | Mini CRM kullanım kılavuzu (kanban, kişi kartı, lead) |
| [STAGING.md](STAGING.md) | Staging build & test ortamı |
| [HEMEN-TEST.md](HEMEN-TEST.md) | 1 saatlik canlı demo (tarihsel, güncel değil) |

## Hızlı bağlantılar

| Servis | URL |
|---|---|
| Site (prod) | https://sos.vexabiz.com |
| Admin Panel | https://sos.vexabiz.com/admin |
| PocketBase Admin | http://127.0.0.1:8090/_/ (VPS'te internal) |
| PocketBase REST | http://127.0.0.1:8090/api/ |
| API (chat, RAG, webhook) | http://127.0.0.1:8091 (VPS'te internal) |

## Şirket (tek kaynak)

Tüm UI ve dökümanlarda geçen şirket bilgisi `src/lib/constants.ts → COMPANY` üzerinden gelir. Hard-code etmeyin.

| Alan | Değer |
|---|---|
| Ünvan | Vexabiz Dijital Danışmanlık ve Yazılım Ltd. Şti. |
| Kısa | Vexabiz Digital |
| Slogan | Hemen olsun istemez misiniz? Doğru olsun istemez misiniz? 1 kerede tam olsun ister misiniz? |
| Telefon / WhatsApp | +90 545 278 80 73 |
| E-posta | info@vexabiz.com |
| Domain | sos.vexabiz.com (parent: vexabiz.com) |
| Kapsam | Türkiye geneli · KOBİ ve işletmeler · dijital dönüşüm |
| Meta App | `vexabiz` |
