window.addEventListener('load', function() {
    initialize();
});


const networks = [
    { networkId: 0x1, name: 'Ethereum Main Network (Mainnet)' },
    { networkId: 0x3, name: 'Ropsten Test Network' },
    { networkId: 0x4, name: 'Rinkeby Test Network' },
    { networkId: 0x5, name: 'Goerli Test Network' },
    { networkId: 0x2a, name: 'Kovan Test Network' },
];

function getNetworkName(networkId){
    let retVal = '';
    for(let i in networks){
        if(networks[i].networkId==networkId){
            retVal = networks[i].name;
            break;
        }
    }
    return retVal;
}

var statusObj = {
    isMetaMask: false,
    isConnected: false,
    account: '',
    networkId: '',
    networkName: '',
    quantity: '',
    recipientAccount: '',
}

async function initialize() {
    //console.log('initialize()');
    // Check if Web3 has been injected by the browser:
    if (typeof web3 !== 'undefined') { 
        //console.log('checkStatus -- web3 is injected!');
        if(ethereum.isMetaMask){
            //console.log('isMetaMask');
            statusProxy.isMetaMask = true;
            if(ethereum.isConnected){
                //console.log('isConnected');
                statusProxy.isConnected = true;
                getChain();
                //getAccounts();
            }else{
                //console.log('! isConnected');
                document.getElementById('noplugin-mm').style.display = 'block';
            }
        }else{
            //console.log('! isMetaMask');
            document.getElementById('noplugin-mm').style.display = 'block';
        }
    } else {
        //console.log('no web3');
        document.getElementById('noplugin-mm').style.display = 'block';
    }
}

//watch the main state object for data changes
var statusProxy = new Proxy(statusObj, {
    set: function (target, key, value) {
        //console.log(`${key} set to ${value}`);
        target[key] = value;
        checkStatus(key);
        return true;
    }
});
  

//main logic to step user through purchase
function checkStatus(debug){
    //console.log('checkStatus', debug);
    if(statusObj){
        //console.log('status object = ', statusObj);
        let divToShow = '';
        let debug = 'Debug:<br><div style="margin:15px;">';       
        for (let [k, v] of Object.entries(statusObj)) {
            debug += k+': '+v+'<br>';
        }
        debug +='</div>';
        document.getElementById('mm-debug').innerHTML = debug;
        if(statusObj.isMetaMask && statusObj.isConnected){
            if(statusObj.quantity){
                const ethQty = Web3.utils.fromWei(statusObj.quantity, 'ether');
                const hexQty = Web3.utils.numberToHex(statusObj.quantity);
                document.getElementById('hint-qty-eth').innerHTML = ethQty+' ETH ('+hexQty+')';
                document.getElementById('hint-qty-eth').style.display = 'block';
            }else{
                document.getElementById('hint-qty-eth').innerHTML = '';
                document.getElementById('hint-qty-eth').style.display = 'none';
            }
            if(statusObj.account){
                document.getElementById('stacked-from-account').value = statusObj.account;
                document.getElementById('stacked-network').value = statusObj.networkName;
                if(statusObj.quantity){
                    document.getElementById('btn-purchase-metamask').style.display = 'block';
                }else{
                    document.getElementById('btn-purchase-metamask').style.display = 'none';
                }
                divToShow = 'submit-mm';
            }else{
                divToShow = 'enable-mm';
            }
        }else{
            divToShow = 'noplugin-mm';
        }
        let arrDivs = ['submit-mm','enable-mm','noplugin-mm'];
        for(let d in arrDivs){
            let divId = arrDivs[d];
            if(divId==divToShow){
                document.getElementById(divId).style.display = 'block';
            }else{
                document.getElementById(divId).style.display = 'none';
            }
        }
    }
}


async function getChain(){
    let response = await ethereum.request({
        method: 'eth_chainId'
    });
    //console.log('chainId', response);
    if(response){
        //statusObj.account = response;
        statusProxy.networkId = response;
        statusProxy.networkName = getNetworkName(response);
    }
    return response;
}

async function getAccounts(){
    let response = await ethereum.request({
        method: 'eth_requestAccounts'
    });
    //console.log('eth getaccounts', response);
    if(response && Array.isArray(response) && response.length){
        statusProxy.account = response[0];

        //set callbacks when chain data changes
        ethereum.on('chainChanged', (chainId) => {
            alert('ethereum network change detected.  New network: '+chainId);
            window.location.reload();
        });

        ethereum.on('disconnect', function() {
            alert('ethereum disconnected.');
            window.location.reload();
        });

        ethereum.on('accountsChanged', function() {
            alert('ethereum Accounts Changed.');
            window.location.reload();
        });
    }
    return response;
}

async function doTransaction(){
    const hexQty = Web3.utils.numberToHex(document.getElementById('stacked-quantity').value);
    if(confirm('Transaction will be submitted.  You must authorize transaction in Metamask.')){
        try {
            let response = await ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: document.getElementById('stacked-from-account').value,
                        to: document.getElementById('stacked-to-account').value,
                        value: hexQty,
                    },
                ],
            });
            //console.log('eth_sendTransaction', response);
            alert('Transaction Successful!\n\nTransaction Hash:\n'+response);
            return response;
        } catch (error) {
            console.log('Error submitting Eth transaction', error);
            alert('Transaction Rejected.');
        }
    }else{
        console.log('transaction canceled');
    }
}
