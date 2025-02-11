class Zag005 < Formula
  desc "This library just want to call a library made with Zig lang “Zag.”"
  homepage "https://github.com/Himenon/zag"
  license "MIT"
  version "0.0.5"

  livecheck do
    url "https://github.com/Himenon/zag/releases/latest"
    regex(%r{href=.*?/tag/zag-v?(\d+(?:\.\d+)+)["' >]}i)
  end

  if OS.mac?
    if Hardware::CPU.arm? || Hardware::CPU.in_rosetta2?
      url "https://github.com/Himenon/zag/releases/download/v#{version}/zag.zip"
      sha256 "fc2513a3049837318222a638331d5de1becb3b0403ac3f07b0ca629da0856409" # zag-darwin-aarch64.zip
    end
  else
    odie "Unsupported platform. Please submit a bug report here: https://zag.sh/issues\n#{OS.report}"
  end

  def install
    bin.install "bin/zag"
    ENV["zag_INSTALL"] = "#{bin}"
  end

  def test
    assert_match "#{version}", shell_output("#{bin}/zag -v")
  end
end
