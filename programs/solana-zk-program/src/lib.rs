use anchor_lang::prelude::*;

declare_id!("3qpBrBRTWCSKZHqUYgfNsGDgM8DDqk6TEniq8w6EyjJB");

#[program]
pub mod solana_zk_program {
    use super::*;

    pub fn zk_verify(ctx: Context<ZKProof>, args: ZKProofArgs) -> Result<()> {
        ZKProof::verify(ctx, args)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ZKProofArgs {}

#[derive(Accounts)]
#[instruction(args: ZKProofArgs)]
pub struct ZKProof {}

impl ZKProof {
    pub fn verify(ctx: Context<Self>, args: ZKProofArgs) -> Result<()> {
        msg!("verify");
        Ok(())
    }
}
