use anchor_lang::prelude::*;
use groth16_solana::groth16::{Groth16Verifier, Groth16Verifyingkey};

declare_id!("6HBK3kVHi4og1cNQmNKWb39TmJK92bwY3KfYyH8gXM8p");

#[program]
pub mod solana_zk_program {
    use super::*;

    pub fn zk_verify(ctx: Context<ZKProof>, args: ZKProofArgs) -> Result<()> {
        ZKProof::verify(ctx, args)
    }
}

const NR_PUBLIC_INPUTS: usize = 1;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ZKProofArgs {
    pub proof_a: [u8; 64],
    pub proof_b: [u8; 128],
    pub proof_c: [u8; 64],
    pub public_inputs: [[u8; 32]; NR_PUBLIC_INPUTS],
}

#[derive(Accounts)]
#[instruction(args: ZKProofArgs)]
pub struct ZKProof {}

impl ZKProof {
    pub fn verify(ctx: Context<Self>, args: ZKProofArgs) -> Result<()> {
        msg!("verify");

        let mut verifier = Groth16Verifier::new(
            &args.proof_a,
            &args.proof_b,
            &args.proof_c,
            &args.public_inputs,
            &VERIFYINGKEY,
        )
        .map_err(|_| ProgramError::Custom(0))?; // Use a custom error code

        let result = verifier.verify();
        match result {
            Ok(true) => msg!("Verification succeeded"),
            Ok(false) => msg!("Verification failed"),
            Err(e) => msg!("Verification error: {:?}", e),
        }
        Ok(())
    }
}

pub const VERIFYINGKEY: Groth16Verifyingkey = Groth16Verifyingkey {
    nr_pubinputs: 2,

    vk_alpha_g1: [
        38, 234, 35, 23, 155, 134, 149, 57, 11, 225, 154, 111, 19, 176, 32, 58, 143, 211, 131, 1,
        125, 242, 117, 179, 19, 25, 4, 85, 243, 36, 93, 219, 46, 249, 225, 211, 134, 251, 55, 139,
        38, 22, 88, 103, 117, 40, 131, 19, 246, 137, 252, 240, 243, 204, 187, 217, 26, 30, 117, 70,
        137, 5, 153, 123,
    ],

    vk_beta_g2: [
        37, 92, 178, 209, 129, 34, 143, 222, 243, 183, 148, 29, 143, 72, 156, 209, 244, 153, 197,
        28, 203, 103, 41, 15, 26, 158, 116, 156, 228, 98, 20, 190, 30, 255, 228, 111, 92, 210, 43,
        73, 240, 27, 35, 192, 134, 126, 223, 11, 107, 48, 234, 180, 53, 20, 88, 212, 156, 92, 52,
        239, 86, 42, 88, 168, 30, 115, 44, 207, 208, 188, 251, 36, 227, 77, 208, 162, 87, 73, 207,
        250, 221, 11, 173, 237, 137, 27, 241, 13, 108, 247, 217, 133, 109, 250, 126, 68, 17, 21,
        37, 82, 60, 209, 145, 67, 166, 69, 150, 71, 180, 173, 115, 146, 232, 45, 83, 83, 204, 222,
        149, 9, 51, 211, 236, 97, 193, 108, 117, 206,
    ],

    vk_gamme_g2: [
        25, 142, 147, 147, 146, 13, 72, 58, 114, 96, 191, 183, 49, 251, 93, 37, 241, 170, 73, 51,
        53, 169, 231, 18, 151, 228, 133, 183, 174, 243, 18, 194, 24, 0, 222, 239, 18, 31, 30, 118,
        66, 106, 0, 102, 94, 92, 68, 121, 103, 67, 34, 212, 247, 94, 218, 221, 70, 222, 189, 92,
        217, 146, 246, 237, 9, 6, 137, 208, 88, 95, 240, 117, 236, 158, 153, 173, 105, 12, 51, 149,
        188, 75, 49, 51, 112, 179, 142, 243, 85, 172, 218, 220, 209, 34, 151, 91, 18, 200, 94, 165,
        219, 140, 109, 235, 74, 171, 113, 128, 141, 203, 64, 143, 227, 209, 231, 105, 12, 67, 211,
        123, 76, 230, 204, 1, 102, 250, 125, 170,
    ],

    vk_delta_g2: [
        9, 97, 179, 188, 86, 234, 54, 64, 136, 88, 82, 23, 5, 129, 235, 153, 189, 32, 102, 113,
        161, 88, 102, 120, 236, 56, 186, 7, 91, 154, 130, 29, 28, 169, 245, 79, 140, 129, 94, 211,
        38, 189, 101, 57, 249, 20, 214, 20, 80, 91, 174, 153, 96, 98, 227, 118, 5, 170, 127, 14,
        10, 38, 202, 43, 42, 68, 205, 42, 197, 0, 216, 75, 158, 159, 109, 167, 175, 243, 133, 148,
        247, 129, 147, 154, 149, 51, 201, 255, 108, 14, 81, 76, 238, 184, 245, 52, 2, 248, 178, 55,
        210, 101, 23, 41, 238, 27, 145, 160, 186, 138, 221, 64, 11, 127, 191, 222, 163, 89, 62, 87,
        116, 209, 235, 105, 147, 108, 38, 120,
    ],

    vk_ic: &[
        [
            35, 244, 247, 124, 151, 128, 179, 161, 70, 68, 123, 234, 141, 23, 217, 254, 200, 151,
            109, 146, 176, 56, 126, 199, 242, 204, 240, 13, 104, 55, 104, 12, 45, 186, 156, 163,
            97, 235, 216, 221, 81, 220, 39, 241, 180, 242, 168, 14, 15, 123, 229, 109, 237, 107,
            237, 7, 123, 195, 107, 17, 186, 235, 209, 72,
        ],
        [
            25, 5, 158, 27, 177, 87, 107, 213, 167, 19, 151, 229, 62, 42, 181, 85, 13, 191, 155, 1,
            54, 137, 142, 22, 107, 58, 58, 244, 170, 119, 20, 190, 3, 76, 14, 86, 159, 6, 90, 124,
            129, 26, 200, 144, 195, 207, 29, 253, 246, 44, 106, 86, 207, 50, 185, 119, 138, 95, 63,
            219, 111, 35, 51, 90,
        ],
    ],
};
