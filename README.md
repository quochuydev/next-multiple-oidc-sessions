Loading...

.

.

.

...Forever.

---

### Pre-Dev 🙌

#### Install [Task](https://taskfile.dev/#/installation)

```sh
brew install go-task/tap/go-task
```

#### Generate SSL certificates

```sh
cd nginx

./openssl.sh
```

#### Trust the certificates (MacOS)

```sh
security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain localhost.crt
```

#### Add hosts to `/etc/hosts`

```sh
echo "127.0.0.1 app1.example.local app2.example.local auth.example.local" | sudo tee -a /etc/hosts > /dev/null
```

#### Install packages

```sh
yarn install
```

#### Start nginx container 🚀

```
task up
```

### Dev 👉

`task dev`
