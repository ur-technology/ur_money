# connecting to UR RPC api

## First, make sure a local version of gur is running
```script
git clone git@github.com:ur-technology/go-ur.git
cd go-ur
apt-get install -y build-essential libgmp3-dev golang zip unzip
make gur
nohup ./build/bin/gur </dev/null >>/tmp/gur.log 2>&1 &
./build/bin/gur --exec "admin.startRPC('0.0.0.0',9595,'*')" attach
```

## check whether api is running
```script
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x8805317929d0a8cd1e7a19a4a2523b821ed05e42", "latest"],"id":1}' localhost:9595
```

## next install web3
```script
npm install web3
```

## in your typescript code, call any web3 api method
```script
let Web3 = require('web3');
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:9595'));
let newBalanceAmount = web3.eth.getBalance(user.wallet.address).toString();
```
