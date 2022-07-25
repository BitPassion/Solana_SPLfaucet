use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct VaultData {
    // 8 + 80
    pub mint: Pubkey,           // 32
    pub creator: Pubkey,        // 32
    pub pre_mint_amount: u64,   // 8
    pub release_amount: u64,    // 8
}

#[account]
#[derive(Default)]
pub struct UserData {
    // 8 + 40
    pub address: Pubkey,            // 32
    pub created_mint_count: u64,    // 8
}

#[account]
#[derive(Default)]
pub struct FaucetData {
    // 8 + 72
    pub address: Pubkey,        // 32
    pub mint: Pubkey,           // 32
    pub last_faucet_time: i64,  // 8
}
