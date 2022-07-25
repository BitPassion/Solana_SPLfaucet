use anchor_lang::{
    prelude::*,
};
use solana_program::program::{invoke};
use solana_program::{
    system_instruction,
};
use anchor_spl::{
    token::{
        self,
        Token,
        TokenAccount,
        Transfer,
        MintTo,
        Mint,
        InitializeMint,
    },
    associated_token::{self, Create, AssociatedToken},
};

pub mod account;
pub mod error;
pub mod constants;

use account::*;
use error::*;
use constants::*;

declare_id!("2QvXAQFJJJBWWY7PrTxFU8MPcnEDQ1gy75w8fgo9j111");

#[program]
pub mod spl_faucet {
    use super::*;

    pub fn init_user_pool(ctx: Context<InitUserPool>, _bump: u8) -> Result<()> {
        let user_pool = &mut ctx.accounts.user_pool;
        user_pool.address = ctx.accounts.owner.key();
        Ok(())
    }
    
    pub fn init_mint_and_vault(
        ctx: Context<InitVault>,
        _user_bump: u8,
        vault_bump: u8,
        token_decimal: u8,
        mint_amount: u64,
        faucet_amount: u64,
    ) -> Result<()> {
        let user_pool = &mut ctx.accounts.user_pool;
        let vault_info = &mut ctx.accounts.vault_data;
        require!(ctx.accounts.creator.key().eq(&user_pool.address), FaucetError::UserDataOwnerMismatch);
        require!(user_pool.created_mint_count < 2, FaucetError::CreateMintTimesExcced);
        user_pool.created_mint_count += 1;

        let mint = &mut &ctx.accounts.mint;
        vault_info.creator = user_pool.address;
        vault_info.mint = mint.key();
        vault_info.pre_mint_amount = mint_amount;
        vault_info.release_amount = faucet_amount;

        let rent = &mut &ctx.accounts.rent;
        let token_program = &mut &ctx.accounts.token_program;
        let system_program = &mut &ctx.accounts.system_program;
        let seeds = &[VAULT_AUTHORITY_SEED.as_bytes(), mint.key.as_ref(), &[vault_bump]];
        let signer = &[&seeds[..]];

        require!(!ctx.accounts.mint.owner.eq(&Token::id()), FaucetError::AlreadyCreatedMint);
        
        let vault_token_account = &mut &ctx.accounts.vault_token_account;
        let (vault_ata, _) = Pubkey::find_program_address(
            &[
                vault_info.key().to_bytes().as_ref(),
                Token::id().to_bytes().as_ref(),
                mint.key().to_bytes().as_ref(),
            ],
            &associated_token::ID,
        );
        msg!("Vault ATA: {:?}", vault_ata);
        require!(vault_token_account.key().eq(&vault_ata), FaucetError::InvalidVaultTokenAccount);

        let size: u64 = Mint::LEN as u64;
        let required_lamports = rent
        .minimum_balance(size as usize)
        .max(1)
        .saturating_sub(mint.lamports());
        invoke(
            &system_instruction::create_account(
                ctx.accounts.creator.key, 
                mint.key, required_lamports, size, token_program.key),
            &[
                ctx.accounts.creator.to_account_info().clone(),
                mint.to_account_info().clone(),
                system_program.to_account_info().clone(),
                token_program.to_account_info().clone(),
                rent.to_account_info().clone(),
            ],
        )?;

        let cpi_accounts = InitializeMint {
            mint: mint.to_account_info().clone(),
            rent: rent.to_account_info().clone(),
        };
        token::initialize_mint(
            CpiContext::new_with_signer(token_program.clone().to_account_info(), cpi_accounts, signer),
            token_decimal,
            &vault_info.key(),
            None,
        )?;
        
        let cpi_accounts = Create {
            payer: ctx.accounts.creator.to_account_info().clone(),
            associated_token: ctx.accounts.vault_token_account.to_account_info().clone(),
            authority: vault_info.to_account_info().clone(),
            mint: mint.to_account_info().clone(),
            system_program: system_program.to_account_info().clone(),
            token_program: token_program.to_account_info().clone(),
            rent: rent.to_account_info().clone(),
        };
        associated_token::create(
            CpiContext::new(ctx.accounts.associated_token_program.to_account_info().clone(), cpi_accounts),
        )?;

        let cpi_accounts = MintTo {
            mint: mint.to_account_info().clone(),
            to: ctx.accounts.vault_token_account.to_account_info().clone(),
            authority: vault_info.to_account_info().clone(),
        };
        token::mint_to(
            CpiContext::new_with_signer(token_program.to_account_info().clone(), cpi_accounts, signer),
            mint_amount,
        )?;

        Ok(())
    }
    
    pub fn init_faucet_data(ctx: Context<InitFaucetData>, _bump: u8) -> Result<()> {
        let faucet_data = &mut ctx.accounts.faucet_info;
        faucet_data.address = ctx.accounts.owner.key();
        faucet_data.mint = ctx.accounts.mint.key();
        Ok(())
    }
    
    pub fn request_tokens(
        ctx: Context<RequestToken>,
        vault_bump: u8,
        _faucet_bump: u8,
    ) -> Result<()> {
        let faucet_data = &mut ctx.accounts.faucet_data;
        let vault_info = &mut ctx.accounts.vault_data;
        let mint = &mut ctx.accounts.mint;
        require!(mint.owner.eq(&Token::id()), FaucetError::InvalidMint);
        require!(ctx.accounts.payer.key().eq(&faucet_data.address), FaucetError::FaucetDataOwnerMismatch);
        require!(mint.key().eq(&faucet_data.mint), FaucetError::FaucetDataMintMismatch);
        require!(mint.key().eq(&vault_info.mint), FaucetError::VaultDataMintMismatch);
        
        let timestamp = Clock::get()?.unix_timestamp;
        msg!("Faucet Date: {}", timestamp);
        require!(faucet_data.last_faucet_time + FAUCET_PERIOD <= timestamp, FaucetError::TooManyFaucetRequest);
        faucet_data.last_faucet_time = timestamp;


        let vault_token_account = &mut &ctx.accounts.vault_token_account;
        let user_token_account = &mut &ctx.accounts.user_token_account;
        let (user_ata, _) = Pubkey::find_program_address(
            &[
                ctx.accounts.payer.key().to_bytes().as_ref(),
                Token::id().to_bytes().as_ref(),
                mint.key().to_bytes().as_ref(),
            ],
            &associated_token::ID,
        );
        msg!("User ATA: {:?}", user_ata);
        require!(user_token_account.key().eq(&user_ata), FaucetError::InvalidUserTokenAccount);
        
        let rent = &mut &ctx.accounts.rent;
        let token_program = &mut &ctx.accounts.token_program;

        if !user_token_account.owner.eq(&Token::id()) {
            let cpi_accounts = Create {
                payer: ctx.accounts.payer.to_account_info().clone(),
                associated_token: ctx.accounts.user_token_account.to_account_info().clone(),
                authority: ctx.accounts.payer.to_account_info().clone(),
                mint: mint.to_account_info().clone(),
                system_program: ctx.accounts.system_program.to_account_info().clone(),
                token_program: token_program.to_account_info().clone(),
                rent: rent.to_account_info().clone(),
            };
            associated_token::create(
                CpiContext::new(ctx.accounts.associated_token_program.to_account_info().clone(), cpi_accounts),
            )?;
        }

        let cpi_accounts = Transfer {
            from: vault_token_account.to_account_info().clone(),
            to: user_token_account.to_account_info().clone(),
            authority: vault_info.to_account_info().clone(),
        };

        let seeds = &[VAULT_AUTHORITY_SEED.as_bytes(), mint.key.as_ref(), &[vault_bump]];

        token::transfer(
            CpiContext::new_with_signer(token_program.to_account_info().clone(), cpi_accounts, &[&seeds[..]]),
            vault_info.release_amount,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitUserPool<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        seeds = [USER_DATA_SEED.as_ref(), owner.key().as_ref()],
        bump,
        space = 8 + 40,
        payer = owner
    )]
    pub user_pool: Account<'info, UserData>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitVault<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        mut,
        seeds = [USER_DATA_SEED.as_ref(), creator.key().as_ref()],
        bump,
    )]
    pub user_pool: Account<'info, UserData>,
    #[account(
        init,
        seeds = [VAULT_AUTHORITY_SEED.as_ref(), mint.key().as_ref()],
        bump,
        space = 8 + 80,
        payer = creator
    )]
    pub vault_data: Account<'info, VaultData>,
    #[account(
        mut,
    )]
    /// CHECK: This is not dangerous because will create token mint too
    pub mint: Signer<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because will create token ata of vault PDA too
    pub vault_token_account: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitFaucetData<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        seeds = [FAUCET_SEED.as_ref(), owner.key().as_ref(), mint.key().as_ref()],
        bump,
        space = 8 + 72,
        payer = owner
    )]
    pub faucet_info: Account<'info, FaucetData>,
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct RequestToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        mut,
        seeds = [FAUCET_SEED.as_ref(), payer.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub faucet_data: Account<'info, FaucetData>,

    #[account(
        mut,
        seeds = [VAULT_AUTHORITY_SEED.as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub vault_data: Account<'info, VaultData>,

    /// CHECK: This is not dangerous because will check in processors
    pub mint: AccountInfo<'info>,

    #[account(
        mut,
        constraint = vault_token_account.mint == mint.key(),
        constraint = vault_token_account.owner == vault_data.key(),
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
    )]
    /// CHECK: This is not dangerous because will create token ata of vault PDA too
    pub user_token_account: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}