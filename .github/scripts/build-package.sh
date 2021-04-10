#!/bin/sh

ATOM_CHANNEL="${ATOM_CHANNEL:=stable}"

echo "Downloading latest Atom release on the ${ATOM_CHANNEL} channel..."

if [ "${RUNNER_OS}" = "Linux" ]; then
  ATOM_DOWNLOAD_FILENAME="atom-amd64.deb"
  ATOM_DIRECTORY="${HOME}/atom"

  curl -s -L "https://atom.io/download/deb?channel=${ATOM_CHANNEL}" -H 'Accept: application/octet-stream' -o "${ATOM_DOWNLOAD_FILENAME}"

  /sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1280x1024x16
  export DISPLAY=":99"

  dpkg-deb -x "${ATOM_DOWNLOAD_FILENAME}" "${ATOM_DIRECTORY}"

  if [ "${ATOM_CHANNEL}" = "stable" ]; then
    ATOM_SCRIPT_NAME="atom"
  else
    ATOM_SCRIPT_NAME="atom-${ATOM_CHANNEL}"
  fi

  ATOM_SCRIPT_PATH="${ATOM_DIRECTORY}/usr/bin/${ATOM_SCRIPT_NAME}"
  export PATH="${ATOM_DIRECTORY}/usr/share/${ATOM_SCRIPT_NAME}/resources/app/apm/bin:${PATH}"
elif [ "${RUNNER_OS}" = "macOS" ]; then
  ATOM_DOWNLOAD_FILENAME="atom.zip"
  ATOM_DIRECTORY="${GITHUB_WORKSPACE}/atom"

  curl -s -L "https://atom.io/download/mac?channel=${ATOM_CHANNEL}" -H 'Accept: application/octet-stream' -o "${ATOM_DOWNLOAD_FILENAME}"
  mkdir "${ATOM_DIRECTORY}"
  unzip -q "${ATOM_DOWNLOAD_FILENAME}" -d "${ATOM_DIRECTORY}"

  if [ "${ATOM_CHANNEL}" = "stable" ]; then
    ATOM_APP_NAME="Atom.app"
  else
    ATOM_APP_NAME="Atom ${ATOM_CHANNEL}.app"
  fi

  ATOM_APP_RESOURCES_DIRECTORY="${ATOM_DIRECTORY}/${ATOM_APP_NAME}/Contents/Resources/app"
  ATOM_SCRIPT_PATH="${ATOM_APP_RESOURCES_DIRECTORY}/atom.sh"
  export PATH="${ATOM_APP_RESOURCES_DIRECTORY}/apm/bin:${PATH}"
else
  echo "Unknown CI environment, exiting!"
  exit 1
fi

echo "Using Atom version:"
"${ATOM_SCRIPT_PATH}" -v
echo "Using apm version:"
apm -v

echo "Downloading package dependencies..."

if [ -f "package-lock.json" ]; then
  apm ci
else
  echo "Warning: 'package-lock.json' not found; running 'apm install' instead of 'apm ci'."
  apm install
  apm clean
fi

has_linter() {
  npm ls --parseable --dev --depth=0 "$1" 2> /dev/null | grep -q "$1$"
}

if has_linter "eslint"; then
  if [ -d ./lib ]; then
    echo "Linting package using ESLint..."
    ./node_modules/.bin/eslint lib
    rc=$?; if [ $rc -ne 0 ]; then exit $rc; fi
  fi

  if [ -d ./spec ]; then
    echo "Linting package specs using ESLint..."
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
fi