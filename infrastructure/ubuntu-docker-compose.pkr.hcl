packer {
  required_plugins {
    hcloud = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/hcloud"
    }
  }
}

locals {
  timestamp              = regex_replace(timestamp(), "[- TZ:]", "")
  docker_compose_version = "2.17.2"
  arch                   = "aarch64"
}

variable "hetzner_api_key" {
  type      = string
  sensitive = true
}

source "hcloud" "app_image" {
  token         = var.hetzner_api_key
  image         = "ubuntu-22.04"
  location      = "fsn1"
  server_type   = "cax11"
  ssh_username  = "root"
  snapshot_name = "app-image-aarch64-${local.timestamp}"
  snapshot_labels = {
    "role" = "app"
  }
}

build {
  sources = ["source.hcloud.app_image"]

  provisioner "file" {
    source      = "./docker-compose.traefik.yml"
    destination = "/opt/docker-compose.traefik.yml"
  }

  provisioner "shell" {
    script = "./ubuntu-docker-compose.sh"
  }
}