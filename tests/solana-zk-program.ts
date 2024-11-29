import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaZkProgram } from "../target/types/solana_zk_program";

describe("solana-zk-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaZkProgram as Program<SolanaZkProgram>;

  it("Is initialized!", async () => {
    // Add your test here.
    //const tx = await program.methods.zkVerify().rpc();
    //console.log("Your transaction signature", tx);
  });
});
