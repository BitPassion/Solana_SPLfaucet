import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
    PublicKey,
    Connection,
    Keypair,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    Transaction,
} from '@solana/web3.js';
import {
    MARKETPLACE_PROGRAM_ID,
    USER_DATA_SEED,
    UserData,
    VAULT_AUTHORITY_SEED,
    VaultData,
    FAUCET_SEED,
    FaucetData,
} from './types';
import {
    getAssociatedTokenAccount,
    getATokenAccountsNeedCreate,
    isExistAccount,
} from './utils';

export const getUserPoolState = async (
    userAddress: PublicKey,
    program: anchor.Program,
): Promise<UserData | null> => {
    if (!userAddress) return null;

    const [userPool, _] = await PublicKey.findProgramAddress(
        [Buffer.from(USER_DATA_SEED), userAddress.toBuffer()],
        MARKETPLACE_PROGRAM_ID,
    );
    console.log('User Data PDA: ', userPool.toBase58());
    try {
        let poolState = await program.account.userData.fetch(userPool);
        return poolState as unknown as UserData;
    } catch {
        return null;
    }
}

export const getVaultInfoState = async (
    mint: PublicKey,
    program: anchor.Program,
): Promise<VaultData | null> => {
    if (!mint) return null;

    const [vaultInfo, _] = await PublicKey.findProgramAddress(
        [Buffer.from(VAULT_AUTHORITY_SEED), mint.toBuffer()],
        MARKETPLACE_PROGRAM_ID,
    );
    console.log('Vault Data PDA: ', vaultInfo.toBase58());
    try {
        let poolState = await program.account.vaultData.fetch(vaultInfo);
        return poolState as unknown as VaultData;
    } catch {
        return null;
    }
}

export const getFaucetInfoState = async (
    owner: PublicKey,
    mint: PublicKey,
    program: anchor.Program,
): Promise<FaucetData | null> => {
    if (!mint) return null;

    const [faucetInfo, _] = await PublicKey.findProgramAddress(
        [Buffer.from(FAUCET_SEED), owner.toBuffer(), mint.toBuffer()],
        MARKETPLACE_PROGRAM_ID,
    );
    console.log('Faucet Data PDA: ', faucetInfo.toBase58());
    try {
        let poolState = await program.account.faucetData.fetch(faucetInfo);
        return poolState as unknown as FaucetData;
    } catch {
        return null;
    }
}

export const createInitUserTx = async (
    userAddress: Keypair,
    program: anchor.Program,
) => {
    const [userPool, user_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(USER_DATA_SEED), userAddress.publicKey.toBuffer()],
        MARKETPLACE_PROGRAM_ID,
    );
    
    console.log('==>initializing user pool', userPool.toBase58());
    const txId = await program.rpc.initUserPool(user_bump, {
        accounts: {
            owner: userAddress.publicKey,
            userPool,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [userAddress],
    });

    return txId;
}

export const createInitVaultTx = async (
    userAddress: Keypair,
    mint: Keypair,
    program: anchor.Program,
) => {
    const [userPool, user_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(USER_DATA_SEED), userAddress.publicKey.toBuffer()],
        MARKETPLACE_PROGRAM_ID,
    );
    
    const [vault, vault_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(VAULT_AUTHORITY_SEED), mint.publicKey.toBuffer()],
        MARKETPLACE_PROGRAM_ID,
    );
    
    const vaultTokenAccount = await getAssociatedTokenAccount(vault, mint.publicKey);

    console.log('==>initializing mint & vault', userPool.toBase58(), mint.publicKey.toBase58());
    const txId = await program.rpc.initMintAndVault(
        user_bump, vault_bump,
        new anchor.BN(6), new anchor.BN(1000), new anchor.BN(10), {
        accounts: {
            creator: userAddress.publicKey,
            userPool,
            vaultData: vault,
            mint: mint.publicKey,
            vaultTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [userAddress, mint],
    });

    return txId;
}

export const createInitFaucetTx = async (
    userAddress: Keypair,
    mint: PublicKey,
    program: anchor.Program,
) => {
    const [faucetData, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(FAUCET_SEED), userAddress.publicKey.toBuffer(), mint.toBuffer()],
        MARKETPLACE_PROGRAM_ID,
    );
    
    console.log('==>initializing faucet data', faucetData.toBase58());
    const txId = await program.rpc.initFaucetData(bump, {
        accounts: {
            owner: userAddress.publicKey,
            faucetInfo: faucetData,
            mint,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [userAddress],
    });

    return txId;
}

export const createRequestFaucetTx = async (
    userAddress: Keypair,
    mint: PublicKey,
    program: anchor.Program,
) => {
    
    const [vault, vault_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(VAULT_AUTHORITY_SEED), mint.toBuffer()],
        MARKETPLACE_PROGRAM_ID,
    );
    
    const [faucetData, faucet_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(FAUCET_SEED), userAddress.publicKey.toBuffer(), mint.toBuffer()],
        MARKETPLACE_PROGRAM_ID,
    );
    const vaultTokenAccount = await getAssociatedTokenAccount(vault, mint);
    const userTokenAccount = await getAssociatedTokenAccount(userAddress.publicKey, mint);

    console.log('==> request faucet', faucetData.toBase58(), mint.toBase58());
    const txId = await program.rpc.requestTokens(
        vault_bump, faucet_bump, {
        accounts: {
            payer: userAddress.publicKey,
            faucetData,
            vaultData: vault,
            mint: mint,
            vaultTokenAccount,
            userTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [userAddress],
    });

    return txId;
}
