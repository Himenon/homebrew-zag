class Zag < Formula
  desc "This library just want to call a library made with Zig lang “Zag.”"
  homepage "https://github.com/Himenon/zag"
  license "MIT"
  version "0.1.0"

  livecheck do
    url "https://github.com/Himenon/zag/releases/latest"
    regex(%r{href=.*?/tag/zag-v?(\d+(?:\.\d+)+)["' >]}i)
  end

  if OS.mac?
    if Hardware::CPU.arm? || Hardware::CPU.in_rosetta2?
      url "https://github.com/Himenon/zag/releases/download/zag-v#{version}/zag-darwin-aarch64.zip"
      sha256 "c4d58e06c5c33885b526f4d91a38ca9ebdb9fc3fb4cd547f7d3302055c98e41c" # zag-darwin-aarch64.zip
    elsif Hardware::CPU.avx2?
      url "https://github.com/Himenon/zag/releases/download/zag-v#{version}/zag-darwin-x64.zip"
      sha256 "2f7d5a9cd90bc4f28449dc7b76a5e9eefade03e119f1cd4e3f941b92b26c6595" # zag-darwin-x64.zip
    else
      url "https://github.com/Himenon/zag/releases/download/zag-v#{version}/zag-darwin-x64-baseline.zip"
      sha256 "0f3b6e87d862d4016f8d95da177bc9136ca2e950f3d6d3d226a35d7061fff0f1" # zag-darwin-x64-baseline.zip
    end
  elsif OS.linux?
    if Hardware::CPU.arm?
      url "https://github.com/Himenon/zag/releases/download/zag-v#{version}/zag-linux-aarch64.zip"
      sha256 "d1dbaa3e9af24549fad92bdbe4fb21fa53302cd048a8f004e85a240984c93d4d" # zag-linux-aarch64.zip
    elsif Hardware::CPU.avx2?
      url "https://github.com/Himenon/zag/releases/download/zag-v#{version}/zag-linux-x64.zip"
      sha256 "3f4efb8afd1f84ac2a98c04661c898561d1d35527d030cb4571e99b7c85f5079" # zag-linux-x64.zip
    else
      url "https://github.com/Himenon/zag/releases/download/zag-v#{version}/zag-linux-x64-baseline.zip"
      sha256 "cad7756a6ee16f3432a328f8023fc5cd431106822eacfa6d6d3afbad6fdc24db" # zag-linux-x64-baseline.zip
    end
  else
    odie "Unsupported platform. Please submit a bug report here: https://zag.sh/issues\n#{OS.report}"
  end

  def install
    bin.install "zag"
    ENV["zag_INSTALL"] = "#{bin}"
  end

  def test
    assert_match "#{version}", shell_output("#{bin}/zag -v")
  end
end
