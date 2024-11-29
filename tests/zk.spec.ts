import * as web3 from "@solana/web3.js";
import * as snarkjs from "snarkjs";
import path from "path";
import { buildBn128, utils } from "ffjavascript";
const { unstringifyBigInts } = utils;

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaZkProgram } from "./../target/types/solana_zk_program";

const wasmPath = path.join("./circuits", "Multiplier.wasm");
const zkeyPath = path.join("./circuits", "Multiplier_final.zkey");

const PROGRAM_ID = new web3.PublicKey("6HBK3kVHi4og1cNQmNKWb39TmJK92bwY3KfYyH8gXM8p");
const ACCOUNT_TO_QUERY = new web3.PublicKey("511wHA3Q7KV4rNL2WN3LY1t9DCNn5nYVujTU3RgQuHZS");
const connection = new web3.Connection(web3.clusterApiUrl('devnet'), "confirmed");
const wallet = web3.Keypair.generate();

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


async function main() {
  // solana provider & wallet
  const url = web3.clusterApiUrl("devnet");
  console.log("solana url: ", url);
  const connection = new web3.Connection(url, "confirmed");
  let secretKey = Uint8Array.from([234, 212, 57, 137, 35, 17, 232, 92, 120, 194, 143, 102, 216, 107, 48, 229, 155, 18, 246, 139, 38, 132, 236, 183, 25, 228, 86, 109, 124, 165, 211, 146, 23, 45, 150, 153, 8, 189, 1, 79, 184, 11, 125, 231, 105, 235, 59, 26, 41, 206, 213, 116, 40, 183, 164, 59, 78, 149, 216, 16, 213, 29, 179, 178]);
  let keypair = web3.Keypair.fromSecretKey(secretKey);
  const wallet = new anchor.Wallet(keypair);
  console.log("solana payer address: ", wallet.publicKey.toBase58());
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  // Generate proof using snarkjs
  let input = { "a": 3, "b": 4 };
  let { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);

  let curve = await buildBn128();
  let proofProc = unstringifyBigInts(proof);
  publicSignals = unstringifyBigInts(publicSignals);

  let pi_a = g1Uncompressed(curve, proofProc.pi_a);
  pi_a = reverseEndianness(pi_a)
  pi_a = await negateAndSerializeG1(curve, pi_a);
  let pi_a_0_u8_array = Array.from(pi_a);
  console.log(pi_a_0_u8_array);

  const pi_b = g2Uncompressed(curve, proofProc.pi_b);
  let pi_b_0_u8_array = Array.from(pi_b);
  console.log(pi_b_0_u8_array.slice(0, 64));
  console.log(pi_b_0_u8_array.slice(64, 128));

  const pi_c = g1Uncompressed(curve, proofProc.pi_c);
  let pi_c_0_u8_array = Array.from(pi_c);
  console.log(pi_c_0_u8_array);

  // Prepare transaction to send proof to the Solana program
  let program = anchor.workspace.SolanaZkProgram as Program<SolanaZkProgram>;

  // Assuming publicSignals has only one element
  const publicSignalsBuffer = to32ByteBuffer(BigInt(publicSignals[0]));
  let public_signal_0_u8_array = Array.from(publicSignalsBuffer);
  console.log(public_signal_0_u8_array);

  let s = [];
  for (let index = 0; index < publicSignalsBuffer.length; index++) {
    const element = publicSignalsBuffer[index];
    s.push(element)

  }

  // transaction
  const tx = await program.methods
    .zkVerify({
      proofA: [...pi_a],
      proofB: [...pi_b],
      proofC: [...pi_c],
      publicInputs: [[...publicSignalsBuffer]],
    })
    .accounts({
    })
    .signers([wallet.payer])
    .preInstructions([
      anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
        units: 1400000,
      })
    ])
    .rpc();
  console.log("transaction signature", tx);

  // Fetch and assert the result
  // const ctxRes = await getRes(PROGRAM_ID);
  // expect(ctxRes).not.to.equal(0); // Replace with your expected result
}

function to32ByteBuffer(bigInt) {
  const hexString = bigInt.toString(16).padStart(64, '0'); // Pad to 64 hex characters (32 bytes)
  const buffer = Buffer.from(hexString, "hex");
  return buffer;
}

function g1Uncompressed(curve, p1Raw) {
  let p1 = curve.G1.fromObject(p1Raw);

  let buff = new Uint8Array(64); // 64 bytes for G1 uncompressed
  curve.G1.toRprUncompressed(buff, 0, p1);

  return Buffer.from(buff);
}

// Function to negate G1 element
function negateG1(curve, buffer) {
  let p1 = curve.G1.fromRprUncompressed(buffer, 0);
  let negatedP1 = curve.G1.neg(p1);
  let negatedBuffer = new Uint8Array(64);
  curve.G1.toRprUncompressed(negatedBuffer, 0, negatedP1);
  return Buffer.from(negatedBuffer);
}

// Function to reverse endianness of a buffer
function reverseEndianness(buffer) {
  return Buffer.from(buffer.reverse());
}

async function negateAndSerializeG1(curve, reversedP1Uncompressed) {
  if (!reversedP1Uncompressed || !(reversedP1Uncompressed instanceof Uint8Array || Buffer.isBuffer(reversedP1Uncompressed))) {
    console.error('Invalid input to negateAndSerializeG1:', reversedP1Uncompressed);
    throw new Error('Invalid input to negateAndSerializeG1');
  }
  // Negate the G1 point
  let p1 = curve.G1.toAffine(curve.G1.fromRprUncompressed(reversedP1Uncompressed, 0));
  let negatedP1 = curve.G1.neg(p1);

  // Serialize the negated point
  // The serialization method depends on your specific library
  let serializedNegatedP1 = new Uint8Array(64); // 32 bytes for x and 32 bytes for y
  curve.G1.toRprUncompressed(serializedNegatedP1, 0, negatedP1);
  // curve.G1.toRprUncompressed(serializedNegatedP1, 32, negatedP1.y);
  console.log(serializedNegatedP1)

  // Change endianness if necessary
  let proof_a = reverseEndianness(serializedNegatedP1);

  return proof_a;
}

function g2Uncompressed(curve, p2Raw) {
  let p2 = curve.G2.fromObject(p2Raw);

  let buff = new Uint8Array(128); // 128 bytes for G2 uncompressed
  curve.G2.toRprUncompressed(buff, 0, p2);

  return Buffer.from(buff);
}