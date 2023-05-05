const { AccountCreateTransaction, Hbar, Client, PrivateKey, KeyList, TransferTransaction } = require("@hashgraph/sdk")

// Account 1
const account1 = PrivateKey.fromString("302e020100300506032b657004220420dba18dbca438373688db1db6a63728f8a98122f7fe94240cb46611f6f2b467f6")
const account1Id = "0.0.4567993"

// Account 2
const account2 = PrivateKey.fromString("302e020100300506032b65700422042033113f88ffc4506d659d4a162b3c23292904dd7d7a0a79a60c7c7a7b8d158510")
const account2Id = "0.0.4567994"

// Account 3
const account3 = PrivateKey.fromString("302e020100300506032b6570042204205a9652bb9deff4f456bdb0e9fd9e5eca05a136ee76c254103730ed3bfa0d8418")
const account3Id = "0.0.4567995"

// Account 4
const account4 = PrivateKey.fromString("302e020100300506032b657004220420a5b34caa4ab8bf7ecdd1db72fef2ba05fead0cae12b71a4484d6993b395c6a93")
const account4Id = "0.0.4567999"

const client = Client.forTestnet();
client.setOperator(account1Id, account1);

const publicKeys = [
    account1.publicKey,
    account2.publicKey,
    account3.publicKey
]

const newKey = new KeyList(publicKeys, 2)

async function createWallet(){
    let tx = await new AccountCreateTransaction()
        .setKey(newKey)
        .setInitialBalance(new Hbar(20))
        .execute(client);

    return (await tx.getReceipt(client)).accountId

}

async function spendFail(accId){
    const tx = await new TransferTransaction()
        .addHbarTransfer(accId, new Hbar(-10))
        .addHbarTransfer(account4Id, new Hbar(10))
        .freezeWith(client)
        .sign(account1);

    const executed =await (await tx.execute(client)).getReceipt(client);
    return executed
}

async function spend(accId){
    const tx = await (await new TransferTransaction()
        .addHbarTransfer(accId, new Hbar(-10))
        .addHbarTransfer(account4Id, new Hbar(10))
        .freezeWith(client)
        .sign(account1)).sign(account2);

    const executed =await (await tx.execute(client)).getReceipt(client);
    return executed
}

async function main(){
    const accountId = await createWallet();
    console.log(accountId)
    await spendFail(accountId).catch((err) => console.error(`Error: ${err}`))
    const tx = await spend(accountId);
    console.log(tx)
    process.exit()
}


main()