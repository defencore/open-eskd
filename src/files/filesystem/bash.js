const bashQuote = (value) => "'" + value.replace(/'/g, "'\\''") + "'";

export function generateBash(project, inventory, fingerprint, placeholders) {
  const preamble = `#!/usr/bin/env bash
# Open ESKD: run from the project directory, or pass its path as the first argument.
# No deletion or replacement of existing files. Requires Bash 3.2 or newer.
(
set -eu
eskd_root="\${1:-.}"
[ -d "$eskd_root" ] || { printf '%s\\n' 'Choose an existing project directory.' >&2; exit 2; }
cd -P -- "$eskd_root"
eskd_safe() {
  local rest="$1" part current='.'
  while [ -n "$rest" ]; do
    part="\${rest%%/*}"
    if [ "$rest" = "$part" ]; then rest=''; else rest="\${rest#*/}"; fi
    current="$current/$part"
    [ ! -L "$current" ] || return 1
  done
}
`;
  const create =
    preamble +
    `set -C
eskd_directory() {
  local rest="$1" part current='.'
  eskd_safe "$1" || { printf 'Unsafe link: %s\\n' "$1" >&2; exit 2; }
  while [ -n "$rest" ]; do
    part="\${rest%%/*}"
    if [ "$rest" = "$part" ]; then rest=''; else rest="\${rest#*/}"; fi
    current="$current/$part"
    if [ -e "$current" ]; then [ -d "$current" ] || { printf 'Directory blocked: %s\\n' "$current" >&2; exit 2; }
    else mkdir -- "$current"; fi
  done
}
` +
    inventory.directories
      .map((path) => 'eskd_directory ' + bashQuote(path))
      .join('\n') +
    '\n' +
    (placeholders
      ? `eskd_placeholder() {
  local file="$1" marker="$1.eskd-placeholder"
  eskd_safe "$file" && eskd_safe "$marker" || { printf 'Unsafe link: %s\\n' "$file" >&2; exit 2; }
  if [ ! -e "./$file" ] && [ ! -e "./$marker" ]; then
    printf '%s\\n' 'Open ESKD absence marker. The required file has not been supplied.' > "./$marker"
  fi
}
` +
        inventory.files
          .map((file) => 'eskd_placeholder ' + bashQuote(file.path))
          .join('\n') +
        '\n'
      : '') +
    "printf '%s\\n' 'Directories created; existing files preserved. Move your real files into these directories.'\n)\n";
  const header = JSON.stringify({
    schema: 'open-eskd-file-check-1',
    projectId: project.id,
    fingerprint,
  }).slice(0, -1);
  const check =
    preamble +
    `eskd_failed=0
eskd_status=''
eskd_check() {
  local file="$1" expected="$2" required="$3" digest=''
  eskd_status=present
  if ! eskd_safe "$file" || ! eskd_safe "$file.eskd-placeholder"; then eskd_status=unsafe
  elif [ ! -e "./$file" ]; then
    if [ -f "./$file.eskd-placeholder" ]; then eskd_status=placeholder; else eskd_status=missing; fi
  elif [ ! -f "./$file" ]; then eskd_status=unsafe
  elif [ ! -r "./$file" ]; then eskd_status=unreadable
  elif [ ! -s "./$file" ]; then eskd_status=empty
  elif [ -n "$expected" ]; then
    if command -v sha256sum >/dev/null 2>&1; then digest=$(sha256sum -- "./$file") || eskd_status=unreadable
    elif command -v shasum >/dev/null 2>&1; then digest=$(shasum -a 256 -- "./$file") || eskd_status=unreadable
    else eskd_status=hash-unavailable; fi
    if [ "$eskd_status" = present ]; then
      if [ "\${digest%% *}" = "$expected" ]; then eskd_status=verified; else eskd_status=mismatch; fi
    fi
  fi
  printf '%s: %s\\n' "$eskd_status" "$file" >&2
  if [ "$required" = yes ] && [ "$eskd_status" != present ] && [ "$eskd_status" != verified ]; then eskd_failed=1; fi
}
printf '%s' ${bashQuote(header)}
printf ',"checkedAt":"%s","files":[' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
` +
    inventory.files
      .map(
        (
          file,
          index,
        ) => `eskd_check ${bashQuote(file.path)} ${bashQuote(file.sha256 || '')} ${bashQuote(file.required ? 'yes' : 'no')}
printf '%s%s%s' ${bashQuote((index ? ',' : '') + '{"path":' + JSON.stringify(file.path) + ',"status":"')} "$eskd_status" '"}'`,
      )
      .join('\n') +
    `
printf '%s\\n' ']}'
exit "$eskd_failed"
)
`;
  return { create, check, fingerprint, inventory };
}
