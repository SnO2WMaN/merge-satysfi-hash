{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    devshell.url = "github:numtide/devshell";
    deno2nix.url = "github:SnO2WMaN/deno2nix";

    flake-compat = {
      url = "github:edolstra/flake-compat";
      flake = false;
    };
  };
  outputs = {
    self,
    nixpkgs,
    flake-utils,
    devshell,
    deno2nix,
    ...
  } @ inputs:
    flake-utils.lib.eachSystem
    [
      "x86_64-linux"
    ]
    (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [
            devshell.overlay
            deno2nix.overlay
          ];
        };
      in rec {
        packages.default = pkgs.deno2nix.mkExecutable {
          name = "merge-satysfi-hash";
          version = "0.1.0";
          src = self;
          lockfile = "./lock.json";
          importMap = "./import_map.json";
          entrypoint = "./mod.ts";
          denoFlags = [
            "--allow-read"
            "--allow-write"
          ];
        };

        defaultPackage = packages.default;

        apps.default = {
          type = "app";
          program = "${defaultPackage}/bin/example";
        };

        devShell = pkgs.devshell.mkShell {
          imports = [
            (pkgs.devshell.importTOML ./devshell.toml)
          ];
        };
      }
    );
}
