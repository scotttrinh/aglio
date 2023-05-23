{
  description = "A Nix-flake-based Node.js development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/master";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
      edgedb-dev = pkgs.edgedb.overrideAttrs (oldAttrs: rec {
        src = pkgs.fetchFromGitHub {
          owner = "edgedb";
          repo = "edgedb-cli";
          rev = "f4fc73eac35426bc119afa0a1b42c31235c08f53";
          sha256 = "sha256-YInv9Yh9SYHJ5jvb90lcB58xIymAcUAhddnmkXLA7P0=";
          fetchSubmodules = true;
        };
        cargoDeps = pkgs.rustPlatform.importCargoLock {
          lockFile = src + "/Cargo.lock";
          outputHashes = {
            "edgedb-derive-0.5.0" = "sha256-4sk8nAPgiHaC7dXgng4QPMx0oc0voqMj4a1xNiBrppw=";
            "edgeql-parser-0.1.0" = "sha256-Y3gXxPuR7qnTL4fu2nZIa3e20YV1fLvm2jHAng+Ke2Q=";
            "rexpect-0.5.0" = "sha256-vstAL/fJWWx7WbmRxNItKpzvgGF3SvJDs5isq9ym/OA=";
            "rustyline-8.0.0" = "sha256-CrICwQbHPzS4QdVIEHxt2euX+g+0pFYe84NfMp1daEc=";
            "serde_str-1.0.0" = "sha256-CMBh5lxdQb2085y0jc/DrV6B8iiXvVO2aoZH/lFFjak=";
            "indexmap-2.0.0-pre" = "sha256-QMOmoUHE1F/sp+NeDpgRGqqacWLHWG02YgZc5vAdXZY=";
          };
        };
        # Patch the Cargo.toml to set the build flag to false
        preBuild = ''
          sed -i '/^\[package\]/a build = false' Cargo.toml
        '';
      });
      buildInputs = with pkgs; [
        (nodejs_20.override {enableNpm = false;})
        nodePackages.npm
      ];
      devInputs = with pkgs; [
        edgedb-dev
        nodePackages.vercel
        packer
        terraform
      ];
    in {
      devShell = pkgs.mkShell {
        packages = buildInputs ++ devInputs;

        shellHook = ''
          echo "`${edgedb-dev}/bin/edgedb --version`"
          echo "npm `${pkgs.nodePackages.npm}/bin/npm --version`"
          echo "node `${pkgs.nodejs_20}/bin/node --version`"
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

        aglio-container = with pkgs.dockerTools;
          buildImage {
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
              pathsToLink = ["/bin"];
            };

            config = {
              Cmd = ["sh" "-c" "node /app/.next/server/server.js"];
              ExposedPorts = {
                "3000/tcp" = {};
              };
            };
          };
      };
    });
}
