export type SplFaucet = {
  "version": "0.1.0",
  "name": "spl_faucet",
  "instructions": [
    {
      "name": "initUserPool",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initMintAndVault",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userBump",
          "type": "u8"
        },
        {
          "name": "vaultBump",
          "type": "u8"
        },
        {
          "name": "tokenDecimal",
          "type": "u8"
        },
        {
          "name": "mintAmount",
          "type": "u64"
        },
        {
          "name": "faucetAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initFaucetData",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "faucetInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "requestTokens",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "faucetData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vaultBump",
          "type": "u8"
        },
        {
          "name": "faucetBump",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "vaultData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "preMintAmount",
            "type": "u64"
          },
          {
            "name": "releaseAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "createdMintCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "faucetData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "lastFaucetTime",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "FaucetError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Uninitialized"
          },
          {
            "name": "UserDataOwnerMismatch"
          },
          {
            "name": "InvalidParamInput"
          },
          {
            "name": "CreateMintTimesExcced"
          },
          {
            "name": "AlreadyCreatedMint"
          },
          {
            "name": "InvalidMint"
          },
          {
            "name": "InvalidVaultTokenAccount"
          },
          {
            "name": "InvalidUserTokenAccount"
          },
          {
            "name": "FaucetDataOwnerMismatch"
          },
          {
            "name": "FaucetDataMintMismatch"
          },
          {
            "name": "VaultDataMintMismatch"
          },
          {
            "name": "TooManyFaucetRequest"
          }
        ]
      }
    }
  ]
};

export const IDL: SplFaucet = {
  "version": "0.1.0",
  "name": "spl_faucet",
  "instructions": [
    {
      "name": "initUserPool",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initMintAndVault",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userBump",
          "type": "u8"
        },
        {
          "name": "vaultBump",
          "type": "u8"
        },
        {
          "name": "tokenDecimal",
          "type": "u8"
        },
        {
          "name": "mintAmount",
          "type": "u64"
        },
        {
          "name": "faucetAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initFaucetData",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "faucetInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "requestTokens",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "faucetData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vaultBump",
          "type": "u8"
        },
        {
          "name": "faucetBump",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "vaultData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "preMintAmount",
            "type": "u64"
          },
          {
            "name": "releaseAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "createdMintCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "faucetData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "lastFaucetTime",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "FaucetError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Uninitialized"
          },
          {
            "name": "UserDataOwnerMismatch"
          },
          {
            "name": "InvalidParamInput"
          },
          {
            "name": "CreateMintTimesExcced"
          },
          {
            "name": "AlreadyCreatedMint"
          },
          {
            "name": "InvalidMint"
          },
          {
            "name": "InvalidVaultTokenAccount"
          },
          {
            "name": "InvalidUserTokenAccount"
          },
          {
            "name": "FaucetDataOwnerMismatch"
          },
          {
            "name": "FaucetDataMintMismatch"
          },
          {
            "name": "VaultDataMintMismatch"
          },
          {
            "name": "TooManyFaucetRequest"
          }
        ]
      }
    }
  ]
};
