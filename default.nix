# Copyright © 2021 Jon Allen <jon@ylixir.io>
# This work is free. You can redistribute it and/or modify it under the
# terms of the Do What The Fuck You Want To Public License, Version 2,
# as published by Sam Hocevar. See the LICENSE file for more details.

let
  pkgs = import ./nix/package-lock.nix;
  lua-wow = import ./nix/lua-wow.nix (pkgs // {
    sourceVersion = {major = "5"; minor = "1"; patch = "1";};
    hash = "661a46c5d513790b9db5f193e48399f54ea534de";
  });
in with pkgs;
[
  # the base environment
  bash
  coreutils
  gnumake
  zip

  # the stuff that is more project specific
  # lua5_4
  lua-wow
  nodejs-18_x
]
