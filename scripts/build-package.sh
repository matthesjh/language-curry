#!/bin/sh

ATOM_CHANNEL="${ATOM_CHANNEL:=stable}"

echo "Downloading latest Atom release on the ${ATOM_CHANNEL} channel..."

if [ "${RUNNER_OS}" = "macOS" ]; then
  curl -s -L "https://atom.io/download/mac?channel=${ATOM_CHANNEL}" -H 'Accept: application/octet-stream' -o "atom.zip"
  mkdir atom
  unzip -q atom.zip -d atom

  if [ "${ATOM_CHANNEL}" = "stable" ]; then
    export ATOM_APP_NAME="Atom.app"
    export ATOM_SCRIPT_NAME="atom.sh"
    export ATOM_SCRIPT_PATH="./atom/${ATOM_APP_NAME}/Contents/Resources/app/atom.sh"
  else
    export ATOM_APP_NAME="Atom ${ATOM_CHANNEL}.app"
    export ATOM_SCRIPT_NAME="atom-${ATOM_CHANNEL}"
    export ATOM_SCRIPT_PATH="./atom-${ATOM_CHANNEL}"
    ln -s "./atom/${ATOM_APP_NAME}/Contents/Resources/app/atom.sh" "${ATOM_SCRIPT_PATH}"
  fi

  export ATOM_PATH="./atom"
  export APM_SCRIPT_PATH="./atom/${ATOM_APP_NAME}/Contents/Resources/app/apm/node_modules/.bin/apm"
  export NPM_SCRIPT_PATH="./atom/${ATOM_APP_NAME}/Contents/Resources/app/apm/node_modules/.bin/npm"
  export PATH="${PATH}:${GITHUB_WORKSPACE}/atom/${ATOM_APP_NAME}/Contents/Resources/app/apm/node_modules/.bin"
elif [ "${RUNNER_OS}" = "Linux" ]; then
  curl -s -L "https://atom.io/download/deb?channel=${ATOM_CHANNEL}" -H 'Accept: application/octet-stream' -o "atom-amd64.deb"
  /sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1280x1024x16
  export DISPLAY=":99"
  dpkg-deb -x atom-amd64.deb "${HOME}/atom"

  if [ "${ATOM_CHANNEL}" = "stable" ]; then
    export ATOM_SCRIPT_NAME="atom"
    export APM_SCRIPT_NAME="apm"
  else
    export ATOM_SCRIPT_NAME="atom-${ATOM_CHANNEL}"
    export APM_SCRIPT_NAME="apm-${ATOM_CHANNEL}"
  fi

  export ATOM_SCRIPT_PATH="${HOME}/atom/usr/bin/${ATOM_SCRIPT_NAME}"
  export APM_SCRIPT_PATH="${HOME}/atom/usr/bin/${APM_SCRIPT_NAME}"
  export NPM_SCRIPT_PATH="${HOME}/atom/usr/share/${ATOM_SCRIPT_NAME}/resources/app/apm/node_modules/.bin/npm"
  export PATH="${PATH}:${HOME}/atom/usr/bin"
else
  echo "Unknown CI environment, exiting!"
  exit 1
fi

echo "Using Atom version:"
"${ATOM_SCRIPT_PATH}" -v
echo "Using APM version:"
"${APM_SCRIPT_PATH}" -v

echo "Downloading package dependencies..."

if [ -f "package-lock.json" ]; then
  "${APM_SCRIPT_PATH}" ci
else
  echo "Warning: package-lock.json not found; running apm install instead of apm ci"
  "${APM_SCRIPT_PATH}" install
  "${APM_SCRIPT_PATH}" clean
fi

if [ "${RUNNER_OS}" = "macOS" ]; then
  export PATH="./atom/${ATOM_APP_NAME}/Contents/Resources/app/apm/bin:${PATH}"
else
  export PATH="${HOME}/atom/usr/share/${ATOM_SCRIPT_NAME}/resources/app/apm/bin:${PATH}"
fi

has_linter() {
  ${NPM_SCRIPT_PATH} ls --parseable --dev --depth=0 "$1" 2> /dev/null | grep -q "$1$"
}

if has_linter "eslint"; then
  if [ -d ./lib ]; then
    echo "Linting package using eslint..."
    ./node_modules/.bin/eslint lib
    rc=$?; if [ $rc -ne 0 ]; then exit $rc; fi
  fi
  if [ -d ./spec ]; then
    echo "Linting package specs using eslint..."
    ./node_modules/.bin/eslint spec
    rc=$?; if [ $rc -ne 0 ]; then exit $rc; fi
  fi
fi

if [ -d ./spec ]; then
  echo "Running specs..."
  "${ATOM_SCRIPT_PATH}" --test spec
elif [ -d ./test ]; then
  echo "Running specs..."
  "${ATOM_SCRIPT_PATH}" --test test
else
  echo "Missing spec folder! Please consider adding a test suite in './spec' or in './test'."
  exit 0
fi

exit