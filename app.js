window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        const connectButton = document.getElementById('connectButton');
        const payButton = document.getElementById('payButton');
        const downloadReceiptButton = document.getElementById('downloadReceiptButton');
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
                balanceElement.innerText = `Balance: ${formattedBalance.split('').join('')} ETH`;
            } catch (error) {
                console.error('Error fetching balance', error);
                balanceElement.innerText = 'Error fetching balance';
            }
        }

        // Generate and download the receipt
        async function generateReceipt() {
            const patientName = document.getElementById('patientName').value;
            const patientAge = document.getElementById('patientAge').value;
            const patientContact = document.getElementById('patientContact').value;
            const billingName = document.getElementById('billingName').value;
            const billingEmail = document.getElementById('billingEmail').value;
            const billingAddress = document.getElementById('billingAddress').value;
            const billingCity = document.getElementById('billingCity').value;
            const billingState = document.getElementById('billingState').value;
            const billingZip = document.getElementById('billingZip').value;
            const amount = document.getElementById('receipt-amount').innerText;

            document.getElementById('receipt-patient-name').innerText = patientName;
            document.getElementById('receipt-patient-age').innerText = patientAge;
            document.getElementById('receipt-patient-contact').innerText = patientContact;
            document.getElementById('receipt-billing-name').innerText = billingName;
            document.getElementById('receipt-billing-email').innerText = billingEmail;
            document.getElementById('receipt-billing-address').innerText = billingAddress;
            document.getElementById('receipt-billing-city').innerText = billingCity;
            document.getElementById('receipt-billing-state').innerText = billingState;
            document.getElementById('receipt-billing-zip').innerText = billingZip;
            document.getElementById('receipt-amount').innerText = amount;
            document.getElementById('receipt-date').innerText = new Date().toLocaleString();

            const receiptTemplate = document.querySelector('.receipt-template');
            receiptTemplate.style.display = 'block';

            const receiptElement = document.querySelector('.receipt');
            const canvas = await html2canvas(receiptElement);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'PNG', 0, 0);
            pdf.save('Medical_Receipt.pdf');

            receiptTemplate.style.display = 'none';
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
                document.getElementById('receipt-amount').innerText = web3.utils.fromWei(amountInWei, 'ether');
                downloadReceiptButton.style.display = 'block';

                // Add click event to the download receipt button
                downloadReceiptButton.onclick = generateReceipt;
            } catch (error) {
                console.error('Payment failed', error);
            }
        });
    } else {
        alert('MetaMask is not installed. Please install it to use this payment method.');
    }
});
