class zagAT009 < Formula
  desc "This library just want to call a library made with Zig lang “Zag.”"
  homepage "https://github.com/Himenon/zag"
  license "MIT"
  version "0.0.9"

  livecheck do
    url "https://github.com/Himenon/zag/releases/latest"
    regex(%r{href=.*?/tag/zag-v?(\d+(?:\.\d+)+)["' >]}i)
  end

  if OS.mac?
    if Hardware::CPU.arm? || Hardware::CPU.in_rosetta2?
      url "https://github.com/Himenon/zag/releases/download/v#{version}/zag-darwin-aarch64.zip"
      sha256 "f2c6d931f9fffd0692812ac23b7c00149247385def70c5061858467c464897e5" # zag-darwin-aarch64.zip
    end
  elsif OS.linux?
    if Hardware::CPU.arm?
      url "https://github.com/Himenon/zag/releases/download/v#{version}/zag-linux-x86_64.zip"
      sha256 "ef2a1dcb5659d4ec6d603d396962092208a6cb6031ae1018cc4612537abc2f6d" # zag-linux-x86_64.zip
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
