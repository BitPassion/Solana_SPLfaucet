use anchor_lang::prelude::*;

#[error_code]
pub enum FaucetError {
    #[msg("Uninitialized Account")]
    Uninitialized,
    #[msg("Invalid Owner Of User Data")]
    UserDataOwnerMismatch,
    #[msg("Instruction Parameter is Invalid")]
    InvalidParamInput,
    #[msg("Creator Can Create Only Two Mints Maximum")]
    CreateMintTimesExcced,
    #[msg("Another Token is already Exist with the Mint")]
    AlreadyCreatedMint,
    #[msg("Token Mint is not Owned by Token Program")]
    InvalidMint,
    #[msg("Invalid ATA of Vault Account")]
    InvalidVaultTokenAccount,
    #[msg("Invalid ATA of User")]
    InvalidUserTokenAccount,
    #[msg("Invalid Owner Of Faucet Data")]
    FaucetDataOwnerMismatch,
    #[msg("Invalid Mint Of Faucet Data")]
    FaucetDataMintMismatch,
    #[msg("Invalid Mint Of Vault Data")]
    VaultDataMintMismatch,
    #[msg("Too Many Faucet Request From Same User")]
    TooManyFaucetRequest,
}