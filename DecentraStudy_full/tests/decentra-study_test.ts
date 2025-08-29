import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from "https://deno.land/x/clarinet@v1.0.2/index.ts";

Clarinet.test({
  name: "decentra-study: add-note and enforce one-vote-per-user",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const wallet_1 = accounts.get("wallet_1")!;
    const wallet_2 = accounts.get("wallet_2")!;

    // wallet_1 adds a note
    let block = chain.mineBlock([
      Tx.contractCall(
        "decentra-study",
        "add-note",
        [
          types.ascii("Test Note Title"),
          types.ascii("A short description of the test note."),
          types.ascii("QmTestIpfsHash123")
        ],
        wallet_1.address
      )
    ]);

    // extract returned value (should be ok and return id = u1)
    block.receipts[0].result.expectOk().expectUint(1);

    // wallet_2 likes the note (vote true)
    block = chain.mineBlock([
      Tx.contractCall(
        "decentra-study",
        "vote-note",
        [types.uint(1), types.bool(true)],
        wallet_2.address
      )
    ]);
    block.receipts[0].result.expectOk();

    // wallet_2 tries to vote again on same note -> should error u100
    block = chain.mineBlock([
      Tx.contractCall(
        "decentra-study",
        "vote-note",
        [types.uint(1), types.bool(false)],
        wallet_2.address
      )
    ]);
    block.receipts[0].result.expectErr().expectUint(100);
  }
});