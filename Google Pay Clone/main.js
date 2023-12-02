const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const userDataFilePath = 'users.json';

let users = {};
if (fs.existsSync(userDataFilePath)) {
    const userData = fs.readFileSync(userDataFilePath, 'utf8');
    users = JSON.parse(userData);
}

function saveUsersToFile() {
    fs.writeFileSync(userDataFilePath, JSON.stringify(users, null, 2), 'utf8');
}

function login() {
    rl.question('Enter your phone number: ', (phoneNum) => {
        if (!users[phoneNum]) {
            console.log('New user detected. Please add an initial amount to your wallet.');
            rl.question('Enter the initial amount: ', (initialAmount) => {
                initialAmount = parseFloat(initialAmount);
                users[phoneNum] = { phoneNum, availableAmount: initialAmount, transactions: [] };
                console.log('User registered successfully.');
                saveUsersToFile();
                showMenu(phoneNum);
            });
        } else {
            showMenu(phoneNum);
        }
    });
}

function showMenu(phoneNum) {
    console.log('\nMenu:');
    console.log('1. Transfer Amount');
    console.log('2. Display Transactions');
    console.log('3. Add Single User');
    console.log('4. Exit');

    rl.question('Enter your choice: ', (choice) => {
        switch (choice) {
            case '1':
                transferAmount(phoneNum);
                break;
            case '2':
                displayTransactions(phoneNum);
                break;
            case '3':
                addSingleUser();
                break;
            case '4':
                console.log('Exiting the application.');
                rl.close();
                break;
            default:
                console.log('Invalid choice. Please try again.');
                showMenu(phoneNum);
        }
    });
}

function handleCashback(amount) {
    if (amount % 500 === 0) {
        console.log('Better luck next time! No cashback this time.');
    } else {
        const cashbackPercentage = amount < 1000 ? 5 : 2;
        const cashbackAmount = (cashbackPercentage / 100) * amount;
        console.log(`Congratulations! You received ${cashbackPercentage}% cashback: ${cashbackAmount}`);
    }
}

function displayTransactions(phoneNum) {
    const user = users[phoneNum];

    console.log('\nTransaction Details:');
    for (let transaction of user.transactions) {
        console.log(`From: ${transaction.from} | To: ${transaction.to} | Amount: ${transaction.amount}`);
    }
    console.log(`Available Amount: ${user.availableAmount}\n`);
    showMenu(phoneNum);
}

rl.on('close', () => {
    console.log('Exiting the application.');
    saveUsersToFile();
    process.exit(0);
});
function transferAmount(senderPhoneNum) {
    rl.question('Enter the recipient\'s phone number: ', (recipientPhoneNum) => {
        rl.question('Enter the amount to transfer: ', (amount) => {
            amount = parseFloat(amount);

            const sender = users[senderPhoneNum];
            const recipient = users[recipientPhoneNum];

            if (!recipient || sender.availableAmount < amount) {
                console.log('Invalid transaction. Please check recipient phone number and available balance.');
                showMenu(senderPhoneNum);
            } else {
                sender.availableAmount -= amount;
                recipient.availableAmount += amount;

                const transaction = { from: sender.phoneNum, to: recipientPhoneNum, amount };
                sender.transactions.push(transaction);
                recipient.transactions.push(transaction);

                handleCashback(amount);

                console.log('Transaction successful.');
                showMenu(senderPhoneNum);
            }
        });
    });
}
login();
