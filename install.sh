#!/usr/bin/env sh
set -eu

REPO="${AI_PROJECT_OS_REPO:-Edwin628/ai-project-os}"
REF="${AI_PROJECT_OS_REF:-v0.2.0}"

fail() {
  echo "Error: $1" >&2
  exit 1
}

validate_source() {
  case "$REPO" in
    "" | /* | *..* | *//* | */*/* | *[!A-Za-z0-9._/-]*)
      fail "invalid AI_PROJECT_OS_REPO. Expected owner/repo."
      ;;
  esac

  case "$REPO" in
    */*) ;;
    *) fail "invalid AI_PROJECT_OS_REPO. Expected owner/repo." ;;
  esac

  case "$REF" in
    "" | /* | *..* | *//* | *[!A-Za-z0-9._/-]*)
      fail "invalid AI_PROJECT_OS_REF."
      ;;
  esac
}

run_with_npx() {
  npm_config_ignore_scripts=true npx --yes "github:${REPO}#${REF}" "$@"
}

download() {
  url="$1"
  output="$2"

  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$output"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$output" "$url"
  else
    fail "curl or wget is required."
  fi
}

run_with_tarball() {
  if ! command -v node >/dev/null 2>&1; then
    fail "node is required when npx is unavailable."
  fi

  tmp_dir="$(mktemp -d)"
  trap 'rm -rf "$tmp_dir"' EXIT HUP INT TERM

  archive="${tmp_dir}/ai-project-os.tar.gz"
  download "https://codeload.github.com/${REPO}/tar.gz/${REF}" "$archive"

  top_dir="$(
    tar -tzf "$archive" | awk -F/ '
      BEGIN { top = "" }
      {
        if ($0 == "" || $0 ~ /^\// || $0 ~ /(^|\/)\.\.(\/|$)/) {
          exit 2
        }
        if (top == "") {
          top = $1
        }
        if ($1 != top) {
          exit 3
        }
      }
      END {
        if (top == "") {
          exit 4
        }
        print top
      }
    '
  )" || fail "unsafe or invalid archive."

  tar -tvzf "$archive" | awk '
    substr($0, 1, 1) == "l" || substr($0, 1, 1) == "h" {
      exit 2
    }
  ' || fail "archive contains links."

  tar -xzf "$archive" -C "$tmp_dir"
  extracted_dir="${tmp_dir}/${top_dir}"

  if [ ! -d "$extracted_dir" ]; then
    fail "failed to unpack AI Project OS."
  fi

  node "${extracted_dir}/bin/ai-project-os.js" "$@"
}

validate_source

case "${1:-}" in
  "" | -*)
    set -- init "$@"
    ;;
esac

if command -v npx >/dev/null 2>&1; then
  run_with_npx "$@"
else
  run_with_tarball "$@"
fi
