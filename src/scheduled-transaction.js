const {
    TransferTransaction,
    Client,
    ScheduleCreateTransaction,
    ScheduleDeleteTransaction,
    ScheduleSignTransaction,
    PrivateKey,
    Hbar
} = require("@hashgraph/sdk");

const myAccountId = "0.0.4567995"
const myPrivateKey = PrivateKey.fromString("302e020100300506032b6570042204205a9652bb9deff4f456bdb0e9fd9e5eca05a136ee76c254103730ed3bfa0d8418")

const otherAccountId = "0.0.4567993"
const otherPrivateKey = PrivateKey.fromString("302e020100300506032b657004220420dba18dbca438373688db1db6a63728f8a98122f7fe94240cb46611f6f2b467f6")
const otherAccountId2 = "0.0.4567994"

const client = Client.forTestnet();

client.setOperator(myAccountId, myPrivateKey);

async function main() {

    //Create a transaction to schedule
    const transferTransaction = new TransferTransaction()
        .addHbarTransfer(otherAccountId, Hbar.fromTinybars(-100))
        .addHbarTransfer(otherAccountId2, Hbar.fromTinybars(100));

    //Schedule a transaction
    const scheduleTransaction = await new ScheduleCreateTransaction()
        .setScheduledTransaction(transferTransaction)
        .setScheduleMemo("Scheduled Transaction Test Cert!")
        .setAdminKey(myPrivateKey)
        .execute(client);

    //Get the receipt of the transaction
    const scheduledTxReceipt = await scheduleTransaction.getReceipt(client);

    //Get the schedule ID
    const scheduleId = scheduledTxReceipt.scheduleId;
    console.log("The schedule ID is " + scheduleId);

    //Get the scheduled transaction ID
    const scheduledTxId = scheduledTxReceipt.scheduledTransactionId;
    console.log("The scheduled transaction ID is " + scheduledTxId);

    //Create the transaction and sign with the admin key
    const transaction = await new ScheduleDeleteTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(myPrivateKey);

    //Sign with the operator key and submit to a Hedera network
    const txResponse = await transaction.execute(client);

    //Get the transaction receipt
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction status
    const transactionStatus = receipt.status;
    console.log("The transaction consensus status is " +transactionStatus);

    //Try to execute the deleted scheduled tx
    const scheduledSignTransaction = await new ScheduleSignTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(otherPrivateKey);

    const txResponse1 = await scheduledSignTransaction.execute(client);
    const receipt1 = await txResponse1.getReceipt(client);

    //Get the transaction status - should fail
    const transactionStatus1 = receipt1.status;
    console.log("The transaction consensus status is " + transactionStatus1);


    process.exit();
}

main();
