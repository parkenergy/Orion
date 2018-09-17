# Orion
[ ![Codeship Status for parkenergy/Orion](https://app.codeship.com/projects/20ffebf0-bb31-0134-1980-1216d6335015/status?branch=master)](https://app.codeship.com/projects/195602)


If the server bounces and the iptables get jacked up

```bash
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
```


# Run Tests
yarn test --no-cache
