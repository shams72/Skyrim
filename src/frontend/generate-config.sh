#!/bin/sh
# exit on error
set -e

# default to localhost if API_URL is not set
API_URL=${API_URL:-"http://localhost:5000"}

# generate runtime-config.js
cat << EOF > /usr/share/nginx/html/runtime-config.js
window.runtimeConfig = {
    REACT_APP_API_URL: "${API_URL}"
};
EOF 