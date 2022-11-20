# Copyright © 2021 Jon Allen <jon@ylixir.io>
# This work is free. You can redistribute it and/or modify it under the
# terms of the Do What The Fuck You Want To Public License, Version 2,
# as published by Sam Hocevar. See the LICENSE file for more details.

let
  pkgs = import ./nix/package-lock.nix;
in with pkgs;
stdenv.mkDerivation {
  name = "lithe";
  buildInputs = import ./default.nix;
}
