const { PrivateKey, Client, TokenCreateTransaction, Hbar, TokenType, TokenSupplyType, TokenAssociateTransaction, TransferTransaction, TokenPauseTransaction, TokenUnpauseTransaction, CustomRoyaltyFee, CustomFixedFee, TokenMintTransaction } = require("@hashgraph/sdk");

// Account 1
const account1 = PrivateKey.fromString("302e020100300506032b657004220420dba18dbca438373688db1db6a63728f8a98122f7fe94240cb46611f6f2b467f6")
const account1Id = "0.0.4567993"

// Account 2
const account2 = PrivateKey.fromString("302e020100300506032b65700422042033113f88ffc4506d659d4a162b3c23292904dd7d7a0a79a60c7c7a7b8d158510")
const account2Id = "0.0.4567994"

// Account 3
const account3 = PrivateKey.fromString("302e020100300506032b6570042204205a9652bb9deff4f456bdb0e9fd9e5eca05a136ee76c254103730ed3bfa0d8418")
const account3Id = "0.0.4567995"


const client = Client.forTestnet();
client.setOperator(account1Id, account1);
client.setDefaultMaxTransactionFee(new Hbar(100));

async function createToken() {
    const customFee = new CustomRoyaltyFee({
        feeCollectorAccountId: account2Id,
        fallbackFee: new CustomFixedFee().setHbarAmount(new Hbar(200)),
        numerator: 10,
        denominator: 100
    })

    const tx = await new TokenCreateTransaction()
        .setTokenName("Stefani Token")
        .setTokenSymbol("SCT")
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setInitialSupply(0)
        .setMaxSupply(5)
        .setDecimals(0)
        .setTreasuryAccountId(account1Id)
        .setAdminKey(account1)
        .setPauseKey(account1)
        .setSupplyKey(account2)
        .setCustomFees([customFee])
        .freezeWith(client)
        .sign(account1);

    const txSubmit = await tx.execute(client);
    const receipt = await txSubmit.getReceipt(client);
    console.log(`Created token: ${receipt.tokenId}`);
    return receipt.tokenId.toString();
}

async function allowRecieve(tokenId, accountId, accountKey) {
    const tx = await new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(accountKey);

    const txSubmit = await tx.execute(client);
    return await txSubmit.getReceipt(client)
}

async function mintToken(tokenId) {
    const receipts = [];

    for await (const iterator of Array.apply(null, Array(5)).map((x, i) => i)) {
        const mintTx = new TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata([Buffer.from([`NFT ${iterator}`])])
            .freezeWith(client);

        const mintTxSign = await mintTx.sign(account2);
        const mintTxSubmit = await mintTxSign.execute(client);
        const mintRx = await mintTxSubmit.getReceipt(client);

        receipts.push(mintRx);
    }

    return receipts;
}

async function transferTokens(tokenId){
    const txId = await new TransferTransaction()
        .addNftTransfer(tokenId, 2, account1Id, account3Id)
        .execute(client);

    return (await txId.getReceipt(client))
}

async function main() {
    let tokenId = await createToken();
    
    // Allow account3 and account4 to recive token
    await allowRecieve(tokenId, account3Id, account3);

     await mintToken(tokenId);
    const tx = await transferTokens(tokenId);
    console.log(tx)

    process.exit()
}

main()