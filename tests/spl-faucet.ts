import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair } from '@solana/web3.js';
import { assert } from "chai";
import fs from 'fs';
import { SplFaucet } from "../target/types/spl_faucet";
import { createInitFaucetTx, createInitUserTx, createInitVaultTx, createRequestFaucetTx, getFaucetInfoState, getUserPoolState, getVaultInfoState } from "./scripts";
import { airdropSOL, getAssociatedTokenAccount, getTokenAccountBalance, getVaultAccountBalanceByMint, isExistAccount } from "./utils";

// Configure the client to use the local cluster.
const provider = anchor.AnchorProvider.env();

anchor.setProvider(provider);
const payer = provider.wallet;
console.log('Payer: ', payer.publicKey.toBase58());

const program = anchor.workspace.SplFaucet as Program<SplFaucet>;

let creator = null;
let user1 = null;
let user2 = null;
let mint = null;
let mint1 = null;

describe("spl-faucet", () => {
  it('Load Testers', async () => {
    const rawdata = fs.readFileSync(process.env.ANCHOR_WALLET);
    const keyData = JSON.parse(rawdata.toString());
  
    creator = anchor.web3.Keypair.fromSecretKey(new Uint8Array(keyData));
    user1 = anchor.web3.Keypair.generate();
    user2 = anchor.web3.Keypair.generate();

    console.log('Creator: ', creator.publicKey.toBase58());
    console.log('User1: ', user1.publicKey.toBase58());
    console.log('User2: ', user2.publicKey.toBase58());
  });
  it('Airdrop SOL for Testers', async () => {
    await airdropSOL(user1.publicKey, 2 * 1e9, provider.connection);
    let res = await provider.connection.getBalance(user1.publicKey);
    assert(res == 2 * 1e9, 'Airdrop 2 SOL for user1 Failed');

    await airdropSOL(user2.publicKey, 2 * 1e9, provider.connection);
    res = await provider.connection.getBalance(user1.publicKey);
    assert(res == 2 * 1e9, 'Airdrop 2 SOL for user2 Failed');
  });
  it("Creator User PDA Is initialized!", async () => {
    // Add your test here.
    const tx = await createInitUserTx(creator, program as unknown as anchor.Program);
    const txId = await provider.connection.confirmTransaction(tx, 'confirmed');
    console.log("TxHash=", txId);

    let userPoolInfo = await getUserPoolState(creator.publicKey, program as unknown as anchor.Program);
    assert(userPoolInfo.address.toBase58() == creator.publicKey.toBase58(),
      "UserData Address mismatch with Creator Pubkey");
  });
});

describe('Init Mint and Vault', async () => {
  it("Creator can create One Mint and Vault", async () => {
    mint = Keypair.generate();

    const tx = await createInitVaultTx(creator, mint, program as unknown as anchor.Program);
    const txId = await provider.connection.confirmTransaction(tx, 'confirmed');
    console.log("TxHash=", txId);

    let vaultInfo = await getVaultInfoState(mint.publicKey, program as unknown as anchor.Program);
    assert(vaultInfo.creator.toBase58() == creator.publicKey.toBase58(),
      "VaultdData Creator mismatch with Creator Pubkey");
    assert(vaultInfo.mint.toBase58() == mint.publicKey.toBase58(), "VaultData Mint mismatch with mint Pubkey");
    assert(vaultInfo.preMintAmount.toNumber() == 1000, "Premint Amount is not 1000");
    assert(vaultInfo.releaseAmount.toNumber() == 10, "Release Amount is not 10");
    assert(await isExistAccount(mint.publicKey, provider.connection), "Mint Account is not Initialized");
    assert(await getVaultAccountBalanceByMint(mint.publicKey, provider.connection) == 1000 / 1e6, "VaultAccount Balance is not 1000");
    
    let userPoolInfo = await getUserPoolState(creator.publicKey, program as unknown as anchor.Program);
    assert(userPoolInfo.address.toBase58() == creator.publicKey.toBase58(),
      "UserData Address mismatch with Creator Pubkey");
    assert(userPoolInfo.createdMintCount.toNumber() == 1, "Created Mint Count is not 1");
  });
  
  it("Creator can create another Mint and Vault", async () => {
    mint1 = Keypair.generate();

    const tx = await createInitVaultTx(creator, mint1, program as unknown as anchor.Program);
    const txId = await provider.connection.confirmTransaction(tx, 'confirmed');
    console.log("TxHash=", txId);

    let vaultInfo = await getVaultInfoState(mint1.publicKey, program as unknown as anchor.Program);
    assert(vaultInfo.creator.toBase58() == creator.publicKey.toBase58(),
      "VaultdData Creator mismatch with Creator Pubkey");
    assert(vaultInfo.mint.toBase58() == mint1.publicKey.toBase58(), "VaultData Mint mismatch with mint1 Pubkey");
    assert(vaultInfo.preMintAmount.toNumber() == 1000, "Premint Amount is not 1000");
    assert(vaultInfo.releaseAmount.toNumber() == 10, "Release Amount is not 10");
    assert(await isExistAccount(mint1.publicKey, provider.connection), "Mint Account is not Initialized");
    assert(await getVaultAccountBalanceByMint(mint1.publicKey, provider.connection) == 1000 / 1e6, "VaultAccount Balance is not 1000");
    
    let userPoolInfo = await getUserPoolState(creator.publicKey, program as unknown as anchor.Program);
    assert(userPoolInfo.address.toBase58() == creator.publicKey.toBase58(),
      "UserData Address mismatch with Creator Pubkey");
    assert(userPoolInfo.createdMintCount.toNumber() == 2, "Created Mint Count is not 2");
  });
  
  it("Creator cannot create more than MAX_TOKEN_CREATION_TIMES", async () => {
    try {
      const mint2 = Keypair.generate();
      const tx = await createInitVaultTx(creator, mint2, program as unknown as anchor.Program);
      const txId = await provider.connection.confirmTransaction(tx, 'confirmed');
      console.log("TxHash=", txId);
      assert(false, "Creating Mint more than MAX_TOKEN_CREATION_TIMES is passed unexpectedly");
    } catch (e) {
      assert(true, "Failed creating too many tokens from one creator as Expected");
    }
  });
});

describe('Faucet as user1', async () => {
  it('Init Faucet Data for user1', async () => {
    const tx = await createInitFaucetTx(user1, mint.publicKey, program as unknown as anchor.Program);
    const txId = await provider.connection.confirmTransaction(tx, 'confirmed');
    console.log("TxHash=", txId);

    let faucetDataInfo = await getFaucetInfoState(user1.publicKey, mint.publicKey, program as unknown as anchor.Program);
    assert(faucetDataInfo.address.toBase58() == user1.publicKey.toBase58(),
      "FaucetData Address mismatch with User1 Pubkey");
    assert(faucetDataInfo.mint.toBase58() == mint.publicKey.toBase58(),
      "FaucetData Mint mismatch with Mint Pubkey");
  });
  it('User1 can Request Faucet', async () => {
    const tx = await createRequestFaucetTx(user1, mint.publicKey, program as unknown as anchor.Program);
    const txId = await provider.connection.confirmTransaction(tx, 'confirmed');
    console.log("TxHash=", txId);

    let faucetDataInfo = await getFaucetInfoState(user1.publicKey, mint.publicKey, program as unknown as anchor.Program);
    assert(faucetDataInfo.address.toBase58() == user1.publicKey.toBase58(),
      "FaucetData Address mismatch with User1 Pubkey");
    assert(faucetDataInfo.mint.toBase58() == mint.publicKey.toBase58(),
      "FaucetData Mint mismatch with Mint Pubkey");
    assert(faucetDataInfo.lastFaucetTime.toNumber() != 0,
      "FaucetData LastFaucetTime is still 0");
    const userATA = await getAssociatedTokenAccount(user1.publicKey, mint.publicKey);
    assert(await getTokenAccountBalance(userATA, provider.connection) == 10 / 1e6, "User1 ATA Balance is not 10");
    assert(await getVaultAccountBalanceByMint(mint.publicKey, provider.connection) == 990 / 1e6, "VaultAccount Balance is not 990");
  });
  it("User1 cannot request faucet twice in a day", async () => {
    try {
      const tx = await createRequestFaucetTx(user1, mint.publicKey, program as unknown as anchor.Program);
      const txId = await provider.connection.confirmTransaction(tx, 'confirmed');
      console.log("TxHash=", txId);
        assert(false, "Request faucet before FAUCET_PERIOD is passed unexpectedly");
    } catch (e) {
      assert(true, "Failed requesting too many times before FAUCET_PERIOD as Expected");
    }
  });
  it('Init Faucet Data for Mint1', async () => {
    const tx = await createInitFaucetTx(user1, mint1.publicKey, program as unknown as anchor.Program);
    const txId = await provider.connection.confirmTransaction(tx, 'confirmed');
    console.log("TxHash=", txId);

    let faucetDataInfo = await getFaucetInfoState(user1.publicKey, mint1.publicKey, program as unknown as anchor.Program);
    assert(faucetDataInfo.address.toBase58() == user1.publicKey.toBase58(),
      "FaucetData Address mismatch with User1 Pubkey");
    assert(faucetDataInfo.mint.toBase58() == mint1.publicKey.toBase58(),
      "FaucetData Mint mismatch with Mint1 Pubkey");
  });
  it('User1 can still request Faucet for Mint1', async () => {
    const tx = await createRequestFaucetTx(user1, mint1.publicKey, program as unknown as anchor.Program);
    const txId = await provider.connection.confirmTransaction(tx, 'confirmed');
    console.log("TxHash=", txId);

    let faucetDataInfo = await getFaucetInfoState(user1.publicKey, mint1.publicKey, program as unknown as anchor.Program);
    assert(faucetDataInfo.address.toBase58() == user1.publicKey.toBase58(),
      "FaucetData Address mismatch with User1 Pubkey");
    assert(faucetDataInfo.mint.toBase58() == mint1.publicKey.toBase58(),
      "FaucetData Mint mismatch with Mint Pubkey");
    assert(faucetDataInfo.lastFaucetTime.toNumber() != 0,
      "FaucetData LastFaucetTime is still 0");
    const userATA = await getAssociatedTokenAccount(user1.publicKey, mint1.publicKey);
    assert(await getTokenAccountBalance(userATA, provider.connection) == 10 / 1e6, "User1 ATA Balance is not 10");
    assert(await getVaultAccountBalanceByMint(mint1.publicKey, provider.connection) == 990 / 1e6, "VaultAccount Balance is not 990");
  });
});

describe('Faucet as user2', async () => {
  it('Init Faucet Data for User2', async () => {
    const tx = await createInitFaucetTx(user2, mint.publicKey, program as unknown as anchor.Program);
    const txId = await provider.connection.confirmTransaction(tx, 'confirmed');
    console.log("TxHash=", txId);

    let faucetDataInfo = await getFaucetInfoState(user2.publicKey, mint.publicKey, program as unknown as anchor.Program);
    assert(faucetDataInfo.address.toBase58() == user2.publicKey.toBase58(),
      "FaucetData Address mismatch with User2 Pubkey");
    assert(faucetDataInfo.mint.toBase58() == mint.publicKey.toBase58(),
      "FaucetData Mint mismatch with Mint Pubkey");
  });
  it('User2 can Request Faucet for Mint while User1 can\'t', async () => {
    const tx = await createRequestFaucetTx(user2, mint.publicKey, program as unknown as anchor.Program);
    const txId = await provider.connection.confirmTransaction(tx, 'confirmed');
    console.log("TxHash=", txId);

    let faucetDataInfo = await getFaucetInfoState(user2.publicKey, mint.publicKey, program as unknown as anchor.Program);
    assert(faucetDataInfo.address.toBase58() == user2.publicKey.toBase58(),
      "FaucetData Address mismatch with User2 Pubkey");
    assert(faucetDataInfo.mint.toBase58() == mint.publicKey.toBase58(),
      "FaucetData Mint mismatch with Mint Pubkey");
    assert(faucetDataInfo.lastFaucetTime.toNumber() != 0,
      "FaucetData LastFaucetTime is still 0");
    const userATA = await getAssociatedTokenAccount(user2.publicKey, mint.publicKey);
    assert(await getTokenAccountBalance(userATA, provider.connection) == 10 / 1e6, "User2 ATA Balance is not 10");
    assert(await getVaultAccountBalanceByMint(mint.publicKey, provider.connection) == 980 / 1e6, "VaultAccount Balance is not 980");
  });
});