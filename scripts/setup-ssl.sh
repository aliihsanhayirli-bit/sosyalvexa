#!/bin/bash
# Vexabiz Digital — sos.vexabiz.com SSL kurulumu
# İlk seferde çalıştırılmıştır, bu dosya referans olarak tutulur.

set -e
certbot --nginx -d sos.vexabiz.com --non-interactive --agree-tos --register-unsafely-without-email
nginx -t && systemctl reload nginx
curl -s -o /dev/null -w "HTTPS HTTP %{http_code}\n" https://sos.vexabiz.com/
