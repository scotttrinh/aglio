{
  description = "A Nix-flake-based Node.js development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { self
    , nixpkgs
    , flake-utils
    }:

    flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs { inherit system; };
      edgedb-dev = pkgs.edgedb.overrideAttrs (oldAttrs: rec {
        src = pkgs.fetchFromGitHub {
          owner = "edgedb";
          repo = "edgedb-cli";
          rev = "1f8e56795992a7539c9345e0b3cbce45e375d5a8";
          sha256 = "sha256-DKMsjnp6Xc44s2ImLll66ziD5V6fxScV+ZmuLJr91ME=";
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
    in
    {
      devShell = pkgs.mkShell {
        packages = with pkgs; [
          nodejs-18_x
          edgedb-dev
          nodePackages.vercel
        ];

        shellHook = ''
          echo "node `${pkgs.nodejs-18_x}/bin/node --version`"
        '';
      };
    });
}
