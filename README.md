Loading...

.

.

.

...Forever

### Pre-Dev 🙌

#### Generate SSL certificates

```sh
cd nginx

./openssl.sh
```

#### Trust the certificates

```sh
security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain localhost.crt
```

#### Add hosts to `/etc/hosts`

```sh
echo "127.0.0.1 app1.example.local app2.example.local auth.example.local" | sudo tee -a /etc/hosts > /dev/null
```

#### Start nginx container 🚀

```
task up
```

### Dev 👉

`task dev`
