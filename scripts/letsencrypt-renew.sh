hash certbot 2>/dev/null || {
    echo >&2 "I require certbot but it's not installed.";
    exit 1;
}

certbot certonly --webroot -w ./dist -d leonardschuetz.ch
