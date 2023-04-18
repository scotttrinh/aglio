terraform {
  cloud {
    organization = "scotttrinh"

    workspaces {
      name = "aglio"
    }
  }

  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
    }
    hcloud = {
      source = "hetznercloud/hcloud"
    }
    cloudinit = {
      source = "hashicorp/cloudinit"
    }
    github = {
      source = "integrations/github"
    }
  }
}

variable "github_app_id" {
  type = string
}

variable "github_installation_id" {
  type = string
}

variable "github_private_key" {
  type      = string
  sensitive = true
}

variable "cloudflare_api_key" {
  type      = string
  sensitive = true
}

variable "cloudflare_zone_id" {
  type = string
}

variable "app_hostname" {
  type = string
}

variable "hetzner_api_key" {
  type      = string
  sensitive = true
}

variable "ssh_public_key_name" {
  type = string
}

variable "ssh_public_key" {
  type      = string
  sensitive = true
}

variable "deploy_ssh_public_key" {
  type      = string
  sensitive = true
}

variable "deploy_ssh_private_key" {
  type      = string
  sensitive = true
}

provider "cloudflare" {
  api_token = var.cloudflare_api_key
}

provider "hcloud" {
  token = var.hetzner_api_key
}

provider "cloudinit" {}

provider "github" {
  app_auth {
    id              = var.github_app_id
    installation_id = var.github_installation_id
    pem_file        = var.github_private_key
  }
  owner = "scotttrinh"
}

resource "cloudflare_record" "aglioaglio" {
  zone_id = var.cloudflare_zone_id
  name    = var.app_hostname
  value   = hcloud_server.aglio.ipv4_address
  type    = "A"
  proxied = true
  depends_on = [
    hcloud_server.aglio
  ]
}

data "hcloud_image" "packer_snapshot" {
  with_selector     = "role=app"
  most_recent       = true
  with_architecture = "arm"
}

resource "hcloud_ssh_key" "dev" {
  name       = var.ssh_public_key_name
  public_key = var.ssh_public_key
}

resource "hcloud_ssh_key" "deploy" {
  name       = "deploy"
  public_key = var.deploy_ssh_public_key
}

data "cloudinit_config" "cloudinit" {
  gzip          = false
  base64_encode = true

  part {
    content_type = "text/cloud-config"
    content      = <<EOF
      #cloud-config
      runcmd:
        - 'sudo systemctl start edgedb-server-2'
        - 'edgedb instance link --host localhost --port 5656 --user edgedb --database edgedb --trust-tls-cert aglio'
        - 'echo "Docker Engine Version: $(docker --version)'
        - 'echo "Docker Composer Version: $(docker compose --version)'
        - 'echo "EdgeDB Version: $(edgedb --version)'
    EOF
  }
}

resource "hcloud_server" "aglio" {
  name        = "aglio"
  server_type = "cax21"
  location    = "fsn1"
  image       = data.hcloud_image.packer_snapshot.id
  ssh_keys    = [hcloud_ssh_key.dev.id, hcloud_ssh_key.deploy.id]
  public_net {
    ipv4_enabled = true
    ipv6_enabled = false
  }
  user_data = data.cloudinit_config.cloudinit.rendered
}

resource "github_actions_secret" "server_ip" {
  repository      = "aglio"
  secret_name     = "SERVER_IP"
  plaintext_value = hcloud_server.aglio.ipv4_address
}

resource "github_actions_secret" "deploy_key" {
  repository      = "aglio"
  secret_name     = "DEPLOY_SSH_PRIVATE_KEY"
  plaintext_value = var.deploy_ssh_private_key
}

resource "github_actions_secret" "deploy_pub_key" {
  repository      = "aglio"
  secret_name     = "DEPLOY_SSH_PUBLIC_KEY"
  plaintext_value = var.deploy_ssh_public_key
}
