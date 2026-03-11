#!/bin/bash
# Deploy EPIC AI v2 (Wasp) to 66.118.37.63
# Usage: bash deploy.sh
set -e

BFF_HOST="epicadmin@66.118.37.63"
BFF_PASS="1g4zrCGRZOLgpqpCsP6i"
WASP_VER="0.21.1"
APP_DIR="/opt/epic-ai-v2"
REPO="https://github.com/epicdm/epic-ai-v2.git"

echo "=== EPIC AI v2 Deploy ==="

sshpass -p "$BFF_PASS" ssh -o StrictHostKeyChecking=no $BFF_HOST bash -s << 'REMOTE'
set -e

# 1. Install Wasp CLI if needed
if ! command -v wasp &>/dev/null; then
  echo "Installing Wasp CLI..."
  curl -sSL https://get.wasp-lang.dev/installer.sh | sh
  export PATH="$HOME/.wasp/bin:$PATH"
fi
export PATH="$HOME/.wasp/bin:$PATH"
echo "Wasp: $(wasp version)"

# 2. Install Node 22 if needed
if ! node --version 2>/dev/null | grep -q "v22\|v20\|v18"; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo "Node: $(node --version)"

# 3. Clone / update repo
if [ -d /opt/epic-ai-v2 ]; then
  cd /opt/epic-ai-v2
  git pull origin main
else
  sudo git clone https://github.com/epicdm/epic-ai-v2.git /opt/epic-ai-v2
  sudo chown -R epicadmin:epicadmin /opt/epic-ai-v2
  cd /opt/epic-ai-v2
fi

# 4. Copy .env.server
cat > /opt/epic-ai-v2/template/app/.env.server << 'EOF'
DATABASE_URL=postgresql://ocmt:ocmt_secure_2026@localhost:5432/bff_v2

JWT_SECRET=epicai_jwt_super_secret_2026_prod_change_this_to_64_random_chars

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

SMTP_HOST=localhost
SMTP_PORT=25
SMTP_USER=
SMTP_PASSWORD=

WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=1003873729481088
WHATSAPP_VERIFY_TOKEN=epic-wa-2026

DEEPSEEK_API_KEY=sk-443f0af69dc14ee095fce92d16928850

LIVEKIT_URL=wss://ai-agent-dl6ldsi8.livekit.cloud
LIVEKIT_API_KEY=APIfFhqC7dRApB2
LIVEKIT_API_SECRET=U5ln2qZ6BDX1SwYBnla31AgcyhInbSuepNDYPIfhs9V
LK_SIP_TRUNK_ID=ST_WEc3Hz4Xerb9
AGENT_NAME=epic-voice-agent

VAPID_PUBLIC_KEY=BOSf8Cn2ZngIQwcp0db77m2chfZ6q7yqSusL2Li83B2tStuU8bGmur-v0Aa4Cvc6BxB08ukDdnArUAO6o4nfe_I
VAPID_PRIVATE_KEY=WwUGmEHqe0-yaMQmJ82mNwUfbVyC7adqOG864_B1vDE
VAPID_CONTACT_EMAIL=admin@epic.dm

FISERV_API_KEY=
FISERV_API_URL=https://api01.epic.dm
EOF

# 5. Create new DB for v2
sudo -u postgres createdb bff_v2 2>/dev/null || echo "bff_v2 DB already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bff_v2 TO ocmt;" 2>/dev/null || true

# 6. Build with Wasp
cd /opt/epic-ai-v2/template/app
wasp build

# 7. Setup server
cd .wasp/build/server
npm install

# 8. Run Prisma migrations
DATABASE_URL="postgresql://ocmt:ocmt_secure_2026@localhost:5432/bff_v2" \
  npx prisma migrate deploy

# 9. Start/restart PM2
pm2 delete epic-ai-v2 2>/dev/null || true
DATABASE_URL="postgresql://ocmt:ocmt_secure_2026@localhost:5432/bff_v2" \
  JWT_SECRET="epicai_jwt_super_secret_2026_prod_change_this_to_64_random_chars" \
  PORT=3010 \
  pm2 start npm --name epic-ai-v2 --cwd /opt/epic-ai-v2/template/app/.wasp/build/server -- start
pm2 save

echo "=== Server running on port 3010 ==="

# 10. Setup client (built static files)
sudo mkdir -p /var/www/epic-ai-v2
sudo cp -r /opt/epic-ai-v2/template/app/.wasp/build/web-app/dist/* /var/www/epic-ai-v2/

echo "=== Static files at /var/www/epic-ai-v2 ==="
echo "=== DONE ==="
REMOTE

echo ""
echo "✅ Deploy complete!"
echo "   Server: http://66.118.37.63:3010 (API)"
echo "   Client: /var/www/epic-ai-v2 (serve via nginx)"
echo ""
echo "Add nginx config at https://bff.epic.dm/v2/ or set DNS for new domain"
