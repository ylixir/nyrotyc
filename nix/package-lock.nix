# Copyright © 2021 Jon Allen <jon@ylixir.io>
# This work is free. You can redistribute it and/or modify it under the
# terms of the Do What The Fuck You Want To Public License, Version 2,
# as published by Sam Hocevar. See the top level LICENSE file for more details.

import(builtins.fetchTarball {
  url = "https://github.com/NixOS/nixpkgs/archive/22.05.tar.gz";
}) {}
