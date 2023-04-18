#!/bin/bash
set -euo pipefail

apt-get update
apt-get install curl ca-certificates gnupg

# Install Docker Engine and Docker Compose
echo "Installing Docker Engine and Docker Compose..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER

sudo docker compose --version

# Pull Traefik image from Docker Hub
echo "Pulling Traefik image from Docker Hub..."
sudo docker compose -f /opt/docker-compose.traefik.yml pull

# Install EdgeDB from the official repository
echo "Installing EdgeDB from the official repository..."
sudo mkdir -p /usr/local/share/keyrings
sudo curl --proto "=https" --tlsv1.2 -sSf -o /usr/local/share/keyrings/edgedb-keyring.gpg https://packages.edgedb.com/keys/edgedb-keyring.gpg
echo deb [signed-by=/usr/local/share/keyrings/edgedb-keyring.gpg] \
  https://packages.edgedb.com/apt \
  $(grep "VERSION_CODENAME=" /etc/os-release | cut -d= -f2) main \
  | sudo tee /etc/apt/sources.list.d/edgedb.list
sudo apt-get update
sudo apt-get install -y edgedb-2
sudo systemctl enable edgedb-server-2
