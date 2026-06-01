#!/bin/bash
# Usage: ./scripts/notify.sh "message"
TOKEN="8997717013:AAGvrm0K5FtCQNi-G1pqi7GUH4d0xtOjqXU"
CHAT_ID="8699204695"
MSG="${1:-✅ Xong rồi anh!}"
curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -d "chat_id=${CHAT_ID}&text=${MSG}&parse_mode=HTML" > /dev/null
