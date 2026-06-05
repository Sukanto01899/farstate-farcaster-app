// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract ExclusiveDrop is Ownable, ReentrancyGuard, Pausable, EIP712 {
    using ECDSA for bytes32;

    uint256 public MAX_FIDEPOCH;
    uint256 public MAX_CLAIM;
    address public signerAddress;
    uint256 public fidEpoch;

    mapping (uint256 => bool) public claimedFid;
    mapping (uint256 => bool) public usedNonce;
    uint256[] public userFids;

    // EIP-712 struct
    // bind user + fid + nonce + deadline
    bytes32 public constant CLAIM_TYPEHASH =
        keccak256("Claim(address user,uint256 fid,uint256 nonce,uint256 deadline)");

    constructor(
        address initialOwner,
        address _signerAddress
    )
        Ownable(initialOwner)
        EIP712("ExclusiveDrop", "1")
    {
        signerAddress = _signerAddress;
        MAX_FIDEPOCH = 500;
        MAX_CLAIM = 1_000_000_000_000_000_000_000;
    }

    function setSignerAddress(address _newSigner) external onlyOwner {
        signerAddress = _newSigner;
    }

    function setClaimAmount(uint256 _max_claim) external onlyOwner {
        MAX_CLAIM = _max_claim;
    }

    function setMaxUserClaim(uint256 _max_user) external onlyOwner {
        MAX_FIDEPOCH = _max_user;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _resetGiveaway();
        _unpause();
    }

    function claimDrop(
        uint256 fid,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        require(block.timestamp <= deadline, "Signature expired");
        require(!usedNonce[nonce], "Nonce already used");

        require(MAX_CLAIM > 0, "Amount is low!");
        require(fidEpoch < MAX_FIDEPOCH, "All claimed!");
        require(!claimedFid[fid], "User already claimed!");

        require(address(this).balance >= MAX_CLAIM, "Insufficient contract balance");

        bytes32 structHash = keccak256(
            abi.encode(
                CLAIM_TYPEHASH,
                msg.sender,
                fid,
                nonce,
                deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address recoveredSigner = ECDSA.recover(digest, signature);
        require(recoveredSigner == signerAddress, "Invalid signer");

        usedNonce[nonce] = true;
        claimedFid[fid] = true;
        userFids.push(fid);
        fidEpoch++;

        (bool sent, ) = payable(msg.sender).call{value: MAX_CLAIM}("");
        require(sent, "Native transfer failed");
    }

    function withdraw(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid address");
        require(address(this).balance >= amount, "Insufficient balance");

        (bool sent, ) = payable(to).call{value: amount}("");
        require(sent, "Withdraw failed");
    }

    function withdrawAll(address to) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid address");

        uint256 balance = address(this).balance;
        (bool sent, ) = payable(to).call{value: balance}("");
        require(sent, "Withdraw failed");
    }

    function _resetGiveaway() private {
        uint256 totalFids = userFids.length;
        for (uint256 i = 0; i < totalFids; i++) {
            delete claimedFid[userFids[i]];
        }
        delete userFids;
        fidEpoch = 0;
    }

    receive() external payable {}
}
