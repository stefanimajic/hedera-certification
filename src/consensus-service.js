const { Client, PrivateKey, TopicCreateTransaction, TopicMessageSubmitTransaction, AccountId, Hbar } = require("@hashgraph/sdk");

// Account 1
const account1 = PrivateKey.fromString("302e020100300506032b657004220420dba18dbca438373688db1db6a63728f8a98122f7fe94240cb46611f6f2b467f6")
const account1Id = "0.0.4567993"

// Account 2
const account2 = PrivateKey.fromString("302e020100300506032b65700422042033113f88ffc4506d659d4a162b3c23292904dd7d7a0a79a60c7c7a7b8d158510")
const account2Id = "0.0.4567994"

// Account 3
const account3 = PrivateKey.fromString("302e020100300506032b6570042204205a9652bb9deff4f456bdb0e9fd9e5eca05a136ee76c254103730ed3bfa0d8418")
const account3Id = "0.0.4567995"

const client = Client.forTestnet()
    .setOperator(account1Id, account1)
    .setDefaultMaxTransactionFee(new Hbar(10));

const client2 = Client.forTestnet()
    .setOperator(account2Id, account2)
    .setDefaultMaxTransactionFee(new Hbar(10));

const client3 = Client.forTestnet()
    .setOperator(account3Id, account3)
    .setDefaultMaxTransactionFee(new Hbar(10));

async function createTopic() {
    let txResponse = await new TopicCreateTransaction()
        .setSubmitKey(account1.publicKey)
        .setSubmitKey(account2.publicKey)
        .execute(client);

    let receipt = await txResponse.getReceipt(client);
    return receipt.topicId.toString()
}

async function send_message(topicId, client) {
    const message = new Date().toISOString();

    const response = await new TopicMessageSubmitTransaction({
        topicId,
        message
    }).execute(client);

    let receipt = await response.getReceipt(client);
    console.log(`\nSent message to topic: ${topicId}, message: ${message}`);
    return receipt.status.toString()
}

async function main() {
    let topicId = await createTopic();
    console.log(`Created topic with id: ${topicId}`)
    console.log(`Look at topic messages: https://hashscan.io/testnet/topic/${topicId}`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await send_message(topicId, client3).catch((error) => console.log(`Err: ${error}`));
    await send_message(topicId, client2)
    process.exit()
}

main();