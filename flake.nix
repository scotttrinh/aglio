{
  description = "A Nix-flake-based Node.js development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    npmlock2nix = {
      url = "github:nix-community/npmlock2nix";
      flake = false;
    };
  };

  outputs =
    { self
    , nixpkgs
    , flake-utils
    , npmlock2nix
    }:

    flake-utils.lib.eachDefaultSystem (system:
    let
      overlays = [
        (final: prev: {
          npmlock2nix = import npmlock2nix { pkgs = prev; };
        })
      ];
      pkgs = import nixpkgs { inherit overlays system; };
      edgedb-dev = pkgs.edgedb.overrideAttrs (oldAttrs: rec {
        src = pkgs.fetchFromGitHub {
          owner = "edgedb";
          repo = "edgedb-cli";
          rev = "01bb835e92fcdfce73df18d2daf3940249e51cde";
          sha256 = "sha256-V+tzx9k9uL/E2MzEGLqQa4R7uC7SU7S+2P2zT58AxLQ=";
          fetchSubmodules = true;
        };
        cargoDeps = pkgs.rustPlatform.importCargoLock {
          lockFile = src + "/Cargo.lock";
          outputHashes = {
            "edgedb-derive-0.4.0" = "sha256-soUc9LkDIKEcMzqpFyWJlwcNr4VxF3C1CP6zkibxNU0=";
            "edgeql-parser-0.1.0" = "sha256-OH078Cp+snMmA30vwsRnEaqx8OzMrQVZllSTZ2GPC8g=";
            "rexpect-0.5.0" = "sha256-vstAL/fJWWx7WbmRxNItKpzvgGF3SvJDs5isq9ym/OA=";
            "rustyline-8.0.0" = "sha256-CrICwQbHPzS4QdVIEHxt2euX+g+0pFYe84NfMp1daEc=";
            "serde_str-1.0.0" = "sha256-CMBh5lxdQb2085y0jc/DrV6B8iiXvVO2aoZH/lFFjak=";
          };
        };
        # Patch the Cargo.toml to set the build flag to false
        preBuild = ''
          sed -i '/^\[package\]/a build = false' Cargo.toml
        '';
      });
      buildInputs = with pkgs; [
        (nodejs-18_x.override { enableNpm = false; })
        nodePackages.npm
      ];
      devInputs = with pkgs; [
        edgedb-dev
        nodePackages.vercel
        packer
        terraform
      ];
    in
    {
      devShell = pkgs.mkShell {
        packages = buildInputs ++ devInputs;

        shellHook = ''
          echo "node `${pkgs.nodejs-18_x}/bin/node --version`"
          echo "`${edgedb-dev}/bin/edgedb --version`"
          echo "`${edgedb-dev}/bin/edgedb instance list`"
        '';
      };

      packages = {
        aglio = pkgs.stdenv.mkDerivation {
          inherit buildInputs;

          name = "aglio";
          src = ./.;

          buildPhase = ''
            export HOME=$(mktemp -d)
            npm install
            npm run build
          '';

          installPhase = ''
            mv -r .next $out
          '';
        };

        aglio-container = with pkgs.dockerTools; buildImage {
          name = "aglio";
          tag = "latest";
          created = "now";

          copyToRoot = pkgs.buildEnv {
            name = "image-root";
            paths = [
              aglio
              binSh
              pkgs.nodejs-18_x
            ];
            pathsToLink = [ "/bin" ];
          };

          config = {
            Cmd = [ "sh" "-c" "node /app/.next/server/server.js" ];
            ExposedPorts = {
              "3000/tcp" = {};
            };
          };
        };
      };
    });
}
