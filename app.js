window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        const connectButton = document.getElementById('connectButton');
        const payButton = document.getElementById('payButton');
        const balanceElement = document.getElementById('balance');
        let userAccount;

        // Connect to MetaMask
        connectButton.addEventListener('click', async () => {
            try {
                await ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await ethereum.request({ method: 'eth_accounts' });
                userAccount = accounts[0];
                connectButton.disabled = true;
                payButton.disabled = false;
                fetchBalance(userAccount);
            } catch (error) {
                console.error('User rejected the connection request');
            }
        });

        // Fetch and display the balance
        async function fetchBalance(account) {
            try {
                const web3 = new Web3(window.ethereum);
                const balanceWei = await web3.eth.getBalance(account);
                const balanceEther = web3.utils.fromWei(balanceWei, 'ether');
                // Format balance to 4 decimal places
                const formattedBalance = parseFloat(balanceEther).toFixed(4);
                // Display balance in reversed order
                balanceElement.innerText = `Balance: ${formattedBalance.split('').join('')} ETH`;
            } catch (error) {
                console.error('Error fetching balance', error);
                balanceElement.innerText = 'Error fetching balance';
            }
        }

        // Generate and download the receipt
        function generateReceipt(name, email, ethereumAddress, amount) {
            const receiptContent = `
                Payment Receipt
                ----------------
                Name: ${name}
                Email: ${email}
                Amount Paid: ${amount} ETH
                Date: ${new Date().toLocaleString()}
            `;
            const blob = new Blob([receiptContent], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'payment_receipt.txt';
            link.click();
            console.log('Receipt generated and download triggered');
        }

        // Handle payment
        payButton.addEventListener('click', async () => {
            const web3 = new Web3(window.ethereum);
            const amountInWei = web3.utils.toWei('0.000001', 'ether'); // example amount
            try {
                const transactionParameters = {
                    to: '0xf7B2c7a1C4De427BAa1726Df9f620BEDce1Efa9b', // Replace with your recipient address
                    from: userAccount,
                    value: amountInWei,
                };
                await ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [transactionParameters],
                });
                alert('Payment successful!');
            // Show the download receipt button
            downloadReceiptButton.style.display = 'block';

            // Add click event to the download receipt button
            downloadReceiptButton.onclick = () => {
                generateReceipt(name, email, web3.utils.fromWei(amountInWei, 'ether'));
            };
        } catch (error) {
            console.error('Payment failed', error);
        }
    });
    } else {
        alert('MetaMask is not installed. Please install it to use this payment method.');
    }
});
